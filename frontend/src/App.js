import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  IconButton,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/login/VerifyEmail";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [mode, setMode] = useState("dark");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: {
                  main: "#1976d2",
                },
                background: {
                  default: "#f4f6f8",
                  paper: "#ffffff",
                },
              }
            : {
                primary: {
                  main: "#90caf9",
                },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: "bold",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {/* Botão de alternância no topo */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<h2>Página não encontrada</h2>} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
