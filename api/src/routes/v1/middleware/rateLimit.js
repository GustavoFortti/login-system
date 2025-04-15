const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Limite por IP
  message: "Muitas tentativas de login. Tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: "Muitos registros recentes. Tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3,
  message: "Limite de envio de recuperação excedido. Tente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotAllLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50,
  message: "Limite de envio de recuperação excedido. Tente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  forgotAllLimiter
};
