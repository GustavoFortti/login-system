// pages/public/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    date_of_birth: "",
    family_name: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Erro no registro.");
    }
  };

  return (
    <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: "background.paper" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Registro
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Nome"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Sobrenome"
            type="text"
            name="family_name"
            value={form.family_name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Data de Nascimento"
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth>
            Registrar
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Já possui conta? <Link to="/login">Entrar</Link>
      </Typography>
    </Box>
  );
};

export default Register;
