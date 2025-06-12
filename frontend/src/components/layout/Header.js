import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          Painel Privado
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={Link}
            to="/home"
            sx={{ textDecoration: location.pathname === "/home" ? "underline" : "none" }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/account"
            sx={{ textDecoration: location.pathname === "/account" ? "underline" : "none" }}
          >
            Conta
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
