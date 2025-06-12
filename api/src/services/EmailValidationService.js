// /src/services/EmailValidationService.js

const crypto = require("crypto");
const redisClient = require("../config/redisClient");
const { AppDataSource } = require("../config/data-source");
const emailValidationRepo = AppDataSource.getRepository("EmailValidation");

const TOKEN_EXPIRATION = 86400; // 24 horas

class EmailValidationService {
  /**
   * Gera um token de verificação, salva no MySQL e no Redis.
   * @param {Object} user
   * @returns {Promise<{token: string, verificationLink: string}>}
   */
  static async generateValidationToken(user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + TOKEN_EXPIRATION * 1000);
    const emailValidation = emailValidationRepo.create({
      user,
      email_change_link: token,
      expire_datetime: expire,
    });
    await emailValidationRepo.save(emailValidation);
    // Armazena no Redis (apenas o ID do usuário)
    await redisClient.set(`email_validation_token:${token}`, user.id.toString(), { EX: TOKEN_EXPIRATION });
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return { token, verificationLink };
  }

  /**
   * Verifica e consome um token de verificação.
   * @param {string} token
   * @returns {Promise<number|null>} ID do usuário ou null se inválido/expirado
   */
  static async verifyToken(token) {
    const redisKey = `email_validation_token:${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return null;
    }
    // Remova o token do Redis
    await redisClient.del(redisKey);
    // Opcional: remover também do MySQL
    const record = await emailValidationRepo.findOne({ where: { email_change_link: token } });
    if (record) {
      await emailValidationRepo.remove(record);
    }
    return Number(userId);
  }
}

module.exports = EmailValidationService;
