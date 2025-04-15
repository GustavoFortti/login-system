// pages/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <Box sx={{ p: 3, textAlign: "center", boxShadow: 3, borderRadius: 2, backgroundColor: "background.paper" }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Dashboard!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Esta é uma área protegida da aplicação.
      </Typography>
      <Button variant="contained" onClick={handleLogout}>
        Sair
      </Button>
    </Box>
  );
};

export default Dashboard;
