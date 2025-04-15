// pages/login/ForgotPassword.js
import React, { useState } from "react";
import { requestResetCode } from "../../services/authService";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await requestResetCode(email);
      setMessage(`Email enviado - ${data.message}`);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar email.");
    }
  };

  return (
    <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: "background.paper" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Recuperar Senha
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
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth>
            Enviar email
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        <Link to="/login">Voltar ao login</Link>
      </Typography>
    </Box>
  );
};

export default ForgotPassword;
