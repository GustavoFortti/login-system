const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const { AppDataSource } = require("../../../../config/data-source");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userRepo = AppDataSource.getRepository("User");
const passwordResetRepo = AppDataSource.getRepository("PasswordReset");
const emailValidationRepo = AppDataSource.getRepository("EmailValidation");

const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  forgotAllLimiter
} = require("../../middleware/rateLimit");

const SALT_ROUNDS = 10;
const ACCESS_EXPIRATION = "15m";
const REFRESH_EXPIRATION = "7d";

// Função para validar senha forte
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

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
 * Descrição: Realiza o login via Google. O token do Google é verificado e,
 * se o e-mail estiver verificado, o usuário é criado (se necessário)
 * e tokens JWT são gerados.
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
    const {
      email,
      email_verified,
      given_name,
      family_name,
      picture,
      locale,
    } = payload;

    // Permite login somente se o e-mail for verificado pelo Google
    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified by Google." });
    }

    // Procura o usuário no banco
    let user = await userRepo.findOneBy({ email });
    // Se não existir, cria um novo usuário com dados do Google
    if (!user) {
      user = userRepo.create({
        email,
        name: given_name || "",
        family_name: family_name || "",
        picture: picture || "",
        last_location: locale || "",
        password: "",
        is_google_account: true,
        valid_user: true, // E-mail considerado válido
        creation_date: new Date().toISOString(),
      });
      await userRepo.save(user);
    }

    // Gera os tokens JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXPIRATION }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRATION }
    );

    user.refresh_token = refreshToken;
    await userRepo.save(user);
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(401).json({ message: "Invalid Google token." });
  }
});

/**
 * Rota: POST /register
 * Descrição: Registra um novo usuário e envia e-mail de verificação.
 */
router.post("/register", registerLimiter, async (req, res) => {
  const { name, email, password, date_of_birth, last_location } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required." });

  if (!validator.isEmail(email))
    return res.status(400).json({ message: "Invalid email format." });

  if (!isStrongPassword(password))
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include upper case, lower case, number, and special character.",
    });

  // Verifica se o e-mail já existe
  const existing = await userRepo.findOneBy({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registered." });

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const creation_date = new Date().toISOString();

  // Cria o usuário com valid_user = false (necessário confirmar e-mail)
  const user = userRepo.create({
    name,
    email,
    password: hashedPassword,
    valid_user: false,
    date_of_birth,
    creation_date,
    last_location,
  });
  await userRepo.save(user);

  // Gera token para verificação de e-mail
  const token = crypto.randomBytes(32).toString("hex");
  const expire = new Date(Date.now() + 1000 * 60 * 60 * 24); // Expira em 24h

  const emailValidation = emailValidationRepo.create({
    user,
    email_change_link: token,
    expire_datetime: expire,
  });
  await emailValidationRepo.save(emailValidation);

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

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
 * Descrição: Confirma o e-mail do usuário usando o token enviado por e-mail.
 */
router.post("/verify-email", forgotAllLimiter, async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ message: "Token is required." });

  const record = await emailValidationRepo.findOne({
    where: { email_change_link: token },
    relations: ["user"],
  });

  if (!record) return res.status(404).json({ message: "Invalid token." });

  if (new Date() > record.expire_datetime)
    return res.status(400).json({ message: "Token expired." });

  const user = record.user;
  user.valid_user = true;
  await userRepo.save(user);
  await emailValidationRepo.remove(record);

  res.json({ message: "Email confirmed successfully." });
});

/**
 * Rota: POST /sign-in
 * Descrição: Realiza login com e-mail e senha, bloqueando se o e-mail não for confirmado.
 */
router.post("/sign-in", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  const user = await userRepo.findOneBy({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials." });
  
  if (!user.is_google_account)
    return res.status(401).json({ message: "Invalid credentials." });
  
  if (!user.valid_user)
    return res.status(403).json({ message: "Please confirm your email before signing in." });

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRATION }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRATION }
  );

  user.refresh_token = refreshToken;
  await userRepo.save(user);
  res.json({ accessToken, refreshToken });
});

/**
 * Rota: POST /refresh-token
 * Descrição: Renova o access token usando o refresh token.
 */
router.post("/refresh-token", forgotAllLimiter, async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required." });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userRepo.findOneBy({ id: payload.id });

    if (!user || user.refresh_token !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token." });

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXPIRATION }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Expired or invalid refresh token." });
  }
});

/**
 * Rota: POST /lost-password/request-reset
 * Descrição: Gera e envia token para reset de senha.
 */
router.post("/lost-password/request-reset", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required." });
  if (!validator.isEmail(email))
    return res.status(400).json({ message: "Invalid email format." });

  const user = await userRepo.findOneBy({ email });
  if (!user)
    return res.status(404).json({ message: "User not found." });

  // Gera token seguro para reset de senha
  const token = crypto.randomBytes(32).toString("hex");
  const expire = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

  const record = passwordResetRepo.create({
    user,
    password_change_link: token,
    expire_datetime: expire,
  });
  await passwordResetRepo.save(record);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the following link to reset your password: ${resetLink}. The link expires in 15 minutes. If you did not request this, please ignore this email.`,
    html: `<p>You requested a password reset.</p>
           <p>Click the following link to reset your password:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>The link expires in 15 minutes. If you did not request this, please ignore this email.</p>`,
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
 * Descrição: Reseta a senha do usuário, validando o token.
 */
router.post("/lost-password/reset-password", forgotAllLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: "Token and new password are required." });
  if (!isStrongPassword(newPassword))
    return res.status(400).json({
      message: "Password must be at least 8 characters long and include upper case, lower case, number, and special character.",
    });

  const record = await passwordResetRepo.findOne({
    where: { password_change_link: token },
    relations: ["user"],
  });
  if (!record)
    return res.status(404).json({ message: "Invalid or expired token." });
  if (new Date() > record.expire_datetime)
    return res.status(400).json({ message: "Token expired." });

  const user = record.user;
  if (!user)
    return res.status(404).json({ message: "User not found." });

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = hashed;
  await userRepo.save(user);
  await passwordResetRepo.remove(record);

  res.json({ message: "Password updated successfully." });
});

module.exports = router;
