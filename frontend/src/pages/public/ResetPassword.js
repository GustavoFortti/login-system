// pages/public/ResetPassword.js
import React, { useState } from "react";
import { resetPassword } from "../../services/authService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tokenFromURL = queryParams.get("token");

  const [form, setForm] = useState({
    token: tokenFromURL || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      await resetPassword({ token: form.token, newPassword: form.newPassword });
      setMessage("Senha atualizada com sucesso!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar senha.");
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
        maxWidth: 400,
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Redefinir Senha
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {!form.token && (
            <TextField
              label="Token"
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
              fullWidth
            />
          )}
          <TextField
            label="Nova Senha"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Confirmar Nova Senha"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth>
            Redefinir Senha
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        <Link to="/login">Voltar ao login</Link>
      </Typography>
    </Box>
  );
};

export default ResetPassword;