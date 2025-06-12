
# 🔐 Sistema de Autenticação Completo

Este é um sistema completo de autenticação e gerenciamento de usuários, utilizando as tecnologias **React**, **Node.js**, **MySQL**, e **Redis**, com suporte a:

- Login com e-mail/senha
- Login com Google
- Verificação de e-mail
- Recuperação e redefinição de senha
- Refresh de token

---

## 📂 Tecnologias Utilizadas

- **Front-end:** React
- **Back-end:** Node.js (Express)
- **Banco de Dados:** MySQL
- **Cache / Token store:** Redis
- **Autenticação:** JWT (com Refresh Token)
- **OAuth:** Google Login

---

## 📁 Estrutura de Diretórios

### Front-End

- `Landing Page`
- `Login`
- `Register`
- `Reset Password`
- `Verify Email`
- `Lost Password`
- `ApiClient.js`

### Back-End

- `routes/`
- `controllers/`
- `services/`
- `models/`
- `middlewares/`
- `config/redis.js`, `config/mysql.js`

---

## 🔗 Endpoints da API

### 🔑 Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/app/login/sign-in` | Login com e-mail e senha |
| POST | `/api/v1/app/login/google-login` | Login com conta do Google |
| POST | `/api/v1/app/login/refresh-token` | Renovação de token (refresh token) |
| POST | `/api/v1/app/login/register` | Registro de novo usuário |

### 🔁 Recuperação de Senha
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/app/login/lost-password/request-reset` | Enviar e-mail com link de redefinição |
| POST | `/api/v1/app/login/lost-password/reset-password` | Redefinir senha com link enviado |

### 📩 Verificação de E-mail
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/app/login/verify-email` | Verificação de e-mail (código/link) |

---

## 🧱 Estrutura do Banco de Dados

### Tabela: `users`
| Campo | Tipo |
|-------|------|
| id | chave primária |
| name | string |
| email | string |
| password | string (criptografada) |
| valid_user | boolean |
| date_of_birth | string |
| creation_date | string |
| last_location | string |

### Tabela: `email_validation`
| Campo | Tipo |
|-------|------|
| id | chave primária |
| user_id | chave estrangeira |
| expire_datetime | datetime |
| email_change_link | string |

### Tabela: `password_reset`
| Campo | Tipo |
|-------|------|
| id | chave primária |
| user_id | chave estrangeira |
| expire_datetime | datetime |
| password_change_link | string |

---

## 🚀 Como Executar

1. Clone este repositório
2. Configure os arquivos `.env` para o backend (incluindo as chaves JWT e Google OAuth)
3. Rode o backend:
```bash
cd backend
npm install
npm start
```
4. Rode o frontend:
```bash
cd frontend
npm install
npm start
```
5. Certifique-se de que MySQL e Redis estão ativos e configurados corretamente

---

## ✅ Funcionalidades Extras

- Criptografia de senha com `bcrypt`
- Armazenamento de refresh tokens no Redis
- Validação de expiração de links de e-mail
- Middleware de autenticação com JWT
- Controle de sessões de múltiplos dispositivos
