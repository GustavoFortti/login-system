// /src/services/UserService.js

const { AppDataSource } = require("../config/data-source");
const redisClient = require("../config/redisClient");
const userRepo = AppDataSource.getRepository("User");

const CACHE_EXPIRATION = 3600; // 1 hora

class UserService {
  /**
   * Busca usuário no cache ou no MySQL e atualiza o cache.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async getUserByEmail(email) {
    const cacheKey = `user:${email}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const user = await userRepo.findOneBy({ email });
    if (user) {
      await redisClient.set(cacheKey, JSON.stringify(user), { EX: CACHE_EXPIRATION });
    }
    return user;
  }

  /**
   * Salva um novo usuário e atualiza o cache.
   * @param {Object} userData
   * @returns {Promise<Object>} usuário salvo
   */
  static async saveUser(userData) {
    const user = userRepo.create(userData);
    const savedUser = await userRepo.save(user);
    const cacheKey = `user:${savedUser.email}`;
    await redisClient.set(cacheKey, JSON.stringify(savedUser), { EX: CACHE_EXPIRATION });
    return savedUser;
  }

  /**
   * Atualiza o cache do usuário.
   * @param {Object} user
   */
  static async updateUserCache(user) {
    const cacheKey = `user:${user.email}`;
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: CACHE_EXPIRATION });
  }
}

module.exports = UserService;