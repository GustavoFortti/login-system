import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, googleLogin } from "../../services/authService";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const data = await login(credentials); // essa resposta deve vir com os dados do user também
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      navigate("/home");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Erro ao efetuar login.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await googleLogin(idToken);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      navigate("/home");
    } catch (err) {
      console.error("Erro Google Login:", err);
      setError("Erro ao autenticar com Google.");
    }
  };

  const handleGoogleError = () => {
    setError("Erro ao autenticar com Google.");
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
        mt: 8,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>

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
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth>
            Entrar
          </Button>

          <Typography variant="body2" align="center">
            ou
          </Typography>

          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="100%"
            />
          </GoogleOAuthProvider>
        </Stack>
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Não possui conta? <Link to="/register">Registre-se</Link>
        </Typography>
        <Typography variant="body2">
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default Login;
