# 📦 Testes de Rotas - API Gift List

Este documento contém comandos `curl` para testar as rotas de autenticação e recuperação de senha da API.

> Base URL: `http://localhost:3001/api/v1/app/login`

---

## 📝 1. Registrar usuário

```bash
curl -X POST http://localhost:3001/api/v1/app/login/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "password": "*Aa123456",
    "date_of_birth": "1990-01-01",
    "last_location": "São Paulo"
  }'
```

## 🔐 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/app/login/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "*Aa123456"
  }'
```

## 📧 3. Gerar código de recuperação de senha

```bash
curl -X POST http://localhost:3001/api/v1/app/login/lost-password/create-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com"
  }'
```

## 🔁 4. Resetar senha

```bash
curl -X POST http://localhost:3001/api/v1/app/login/lost-password/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "newPassword": "novaSenha123"
  }'
```

## ✅ 5. Login com nova senha

```bash
curl -X POST http://localhost:3001/api/v1/app/login/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "novaSenha123"
  }'
```

