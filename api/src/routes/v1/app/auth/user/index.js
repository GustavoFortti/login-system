const express = require("express");
const authenticateToken = require("../../../middleware/auth");
const { AppDataSource } = require("../../../../../config/data-source");
const UserService = require("../../../../../services/UserService");

const multer = require("multer");
const axios = require("axios");
const fs = require("fs").promises;
const upload = multer({ dest: "uploads/" });

const router = express.Router();
const userRepo = AppDataSource.getRepository("User");

/**
 * Rota: GET /api/v1/app/auth/user/show
 * Retorna os dados do usuário autenticado.
 */
router.get("/show", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Retorna apenas os campos desejados
    const { name, family_name, picture_url, email, date_of_birth } = user;
    res.json({ name, family_name, picture_url, email, date_of_birth });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * Rota: PUT /api/v1/app/auth/user/update
 * Atualiza os dados do usuário autenticado (name, family_name, picture_url).
 */
router.put("/update", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, family_name } = req.body;
    const image = req.file;

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    if (name !== undefined) user.name = name.trim().replace(/\s+/g, ' ');
    if (family_name !== undefined) user.family_name = family_name.trim().replace(/\s+/g, ' ');

    if (image) {
      try {
        const buffer = await fs.readFile(image.path);
        const base64Image = buffer.toString("base64");
    
        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", null, {
          params: {
            key: process.env.IMGBB_API_KEY,
            image: base64Image,
          },
          timeout: 10000, // timeout de segurança de 10s
        });

        console.log(imgbbResponse.data);
    
        if (!imgbbResponse.data || !imgbbResponse.data.data || !imgbbResponse.data.data.url) {
          console.error("Resposta inesperada do ImgBB:", imgbbResponse.data);
          return res.status(502).json({ message: "Falha ao processar imagem no ImgBB." });
        }
    
        user.picture_url = imgbbResponse.data.data.url;
      } catch (uploadError) {
        console.error("Erro ao enviar imagem ao ImgBB:", uploadError?.response?.data || uploadError.message);
        return res.status(502).json({ message: "Erro ao enviar imagem para o serviço de imagem." });
      } finally {
        // Sempre remove o arquivo temporário, mesmo com erro
        try {
          await fs.unlink(image.path);
        } catch (cleanupError) {
          console.warn("Falha ao remover arquivo temporário:", cleanupError.message);
        }
      }
    }

    await userRepo.save(user);
    await UserService.updateUserCache(user);

    res.json({
      name: user.name,
      family_name: user.family_name,
      picture_url: user.picture_url,
      email: user.email,
    });
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

module.exports = router;
