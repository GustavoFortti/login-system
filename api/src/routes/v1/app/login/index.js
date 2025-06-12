// /src/routes/v1/app/login/index.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const { AppDataSource } = require("../../../../config/data-source");

// Serviços de negócio e infraestrutura
const UserService = require("../../../../services/UserService");
const EmailValidationService = require("../../../../services/EmailValidationService");
const PasswordResetService = require("../../../../services/PasswordResetService");

const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  forgotAllLimiter
} = require("../../middleware/rateLimit");

const SALT_ROUNDS = 10;
const ACCESS_EXPIRATION = "15m";
const REFRESH_EXPIRATION = "7d";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configuração do transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true para porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Rota: POST /google-login
 * Realiza o login via Google. Se o usuário não existir, é criado.
 */
router.post("/google-login", forgotAllLimiter, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "Google token is required." });
  }

  try {
    // Verifica e decodifica o token do Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, email_verified, given_name, family_name, picture, locale } = payload;
    
    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified by Google." });
    }

    const cleanName = (given_name ?? "").trim().replace(/\s+/g, " ");
    const cleanFamilyName = (family_name ?? "").trim().replace(/\s+/g, " ");
    
    console.log("log");
    console.log(picture);
    // Busca usuário via serviço (verifica cache e MySQL)
    let user = await UserService.getUserByEmail(email);
    if (!user) {
      // Cria novo usuário se não existir
      user = await UserService.saveUser({
        email,
        name: cleanName ?? "",
        family_name: cleanFamilyName ?? "",
        picture_url: picture,
        last_location: locale ?? "",
        password: "", // senha vazia para conta do Google
        is_google_account: true,
        valid_user: true,
        creation_date: new Date().toISOString(),
      });
    }

    console.log(user);

    // Gera tokens JWT
    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });

    // Atualiza o refresh_token no banco e no cache
    user.refresh_token = refreshToken;
    await AppDataSource.getRepository("User").save(user);
    await UserService.updateUserCache(user);

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(401).json({ message: "Invalid Google token." });
  }
});

/**
 * Rota: POST /register
 * Registra um novo usuário e envia e-mail de verificação.
 */
router.post("/register", registerLimiter, async (req, res) => {
  const { name, family_name, email, password, date_of_birth, last_location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  // Verifica se já existe usuário com esse email
  const existingUser = await UserService.getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const creation_date = new Date().toISOString();

  const cleanName = (name ?? "").trim().replace(/\s+/g, " ");
  const cleanFamilyName = (family_name ?? "").trim().replace(/\s+/g, " ");

  // Cria e salva o usuário usando o serviço
  const newUser = await UserService.saveUser({
    name: cleanName,
    family_name: cleanFamilyName,
    email,
    password: hashedPassword,
    valid_user: false,
    date_of_birth,
    creation_date,
    last_location,
  });

  // Gera token de verificação usando o serviço
  const { verificationLink } = await EmailValidationService.generateValidationToken(newUser);

  // Envia o email de verificação
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Confirm your email",
    html: `
      <p>Welcome ${name},</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }

  res.status(201).json({ message: "Registration successful. Check your email to confirm your account." });
});

/**
 * Rota: POST /verify-email
 * Confirma o e-mail do usuário utilizando o token enviado.
 */
router.post("/verify-email", forgotAllLimiter, async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  // Verifica o token via serviço; retorna o ID do usuário se válido
  const userId = await EmailValidationService.verifyToken(token);
  if (!userId) {
    return res.status(404).json({ message: "Invalid or expired token." });
  }

  // Atualiza o usuário para valid_user = true
  const userRepo = AppDataSource.getRepository("User");
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  user.valid_user = true;
  await userRepo.save(user);
  await UserService.updateUserCache(user);

  res.json({ message: "Email confirmed successfully." });
});

/**
 * Rota: POST /sign-in
 * Realiza login com e-mail e senha.
 */
router.post("/sign-in", loginLimiter, async (req, res) => {
  console.log("object");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  
  const user = await UserService.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  
  // Se a conta for de Google, pode exigir tratamento específico
  if (!user.is_google_account && !user.valid_user) {
    return res.status(403).json({ message: "Please confirm your email before signing in." });
  }
  
  const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });

  user.refresh_token = refreshToken;
  await AppDataSource.getRepository("User").save(user);
  await UserService.updateUserCache(user);

  res.json({ accessToken, refreshToken });
});

/**
 * Rota: POST /refresh-token
 * Renova o access token utilizando o refresh token.
 */
router.post("/refresh-token", forgotAllLimiter, async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required." });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: payload.id });
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Expired or invalid refresh token." });
  }
});

/**
 * Rota: POST /lost-password/request-reset
 * Gera e envia token para reset de senha.
 */
router.post("/lost-password/request-reset", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  const userRepo = AppDataSource.getRepository("User");
  const user = await userRepo.findOneBy({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Gera token para reset de senha via serviço
  const { resetLink } = await PasswordResetService.generateResetToken(user);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the following link to reset your password: ${resetLink}. The link expires in 15 minutes.`,
    html: `<p>You requested a password reset.</p>
           <p>Click the following link to reset your password:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>The link expires in 15 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email." });
  }
});

/**
 * Rota: POST /lost-password/reset-password
 * Reseta a senha do usuário validando o token.
 */
router.post("/lost-password/reset-password", forgotAllLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  // Verifica o token via serviço para obter o ID do usuário
  const userId = await PasswordResetService.verifyResetToken(token);
  if (!userId) {
    return res.status(404).json({ message: "Invalid or expired token." });
  }

  const userRepo = AppDataSource.getRepository("User");
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = hashed;
  await userRepo.save(user);
  await UserService.updateUserCache(user);

  res.json({ message: "Password updated successfully." });
});

module.exports = router;
