// /src/services/PasswordResetService.js

const crypto = require("crypto");
const redisClient = require("../config/redisClient");
const { AppDataSource } = require("../config/data-source");
const passwordResetRepo = AppDataSource.getRepository("PasswordReset");

const TOKEN_EXPIRATION = 900; // 15 minutos

class PasswordResetService {
  /**
   * Gera um token para reset de senha, salva no MySQL e no Redis.
   * @param {Object} user
   * @returns {Promise<{token: string, resetLink: string}>}
   */
  static async generateResetToken(user) {
    // Remove tokens antigos (opcional)
    await passwordResetRepo.delete({ user });
    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + TOKEN_EXPIRATION * 1000);
    const record = passwordResetRepo.create({
      user,
      password_change_link: token,
      expire_datetime: expire,
    });
    await passwordResetRepo.save(record);
    // Armazena no Redis
    await redisClient.set(`password_reset_token:${token}`, user.id.toString(), { EX: TOKEN_EXPIRATION });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return { token, resetLink };
  }

  /**
   * Verifica e consome um token de reset de senha.
   * @param {string} token
   * @returns {Promise<number|null>} ID do usuário ou null se inválido/expirado
   */
  static async verifyResetToken(token) {
    const redisKey = `password_reset_token:${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return null;
    }
    // Remove o token do Redis
    await redisClient.del(redisKey);
    // Opcional: remover também do MySQL
    await passwordResetRepo.delete({ user: { id: Number(userId) } });
    return Number(userId);
  }
}

module.exports = PasswordResetService;
