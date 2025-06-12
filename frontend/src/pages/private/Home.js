import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { getUser } from "../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../store/userSlice";
import Header from "../../components/layout/Header";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUser();
        dispatch(setUserData(data));
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar dados do usuário.");
      }
    };

    if (!userData) {
      fetchUserData(); // Só busca se ainda não tiver no Redux
    }
  }, [userData, dispatch]);

  return (
    <Box sx={{ p: 3, textAlign: "center", boxShadow: 3, borderRadius: 2, backgroundColor: "background.paper" }}>
      <Header />
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Home!
      </Typography>

      {userData && (
        <Box sx={{ mt: 2 }}>
          <h1>Olá, {userData.name}</h1>
          <p>Email: {userData.email}</p>
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="body1" gutterBottom>
        Esta é uma área protegida da aplicação.
      </Typography>

      <Button variant="outlined" onClick={handleLogout} sx={{ mt: 2 }}>
        Sair
      </Button>
    </Box>
  );
};

export default Home;
