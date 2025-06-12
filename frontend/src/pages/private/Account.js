import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getUser, updateUser } from "../../services/userService";
import { setUserData } from "../../store/userSlice";
import Header from "../../components/layout/Header";

const Account = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  const [formData, setFormData] = useState({
    name: "",
    family_name: "",
    email: "",
    picture_url: "",
  });

  console.log(formData);

  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUser();
        dispatch(setUserData(data));
        setFormData(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erro ao carregar dados do usuário."
        );
      }
    };

    if (!userData) {
      fetchUserData();
    } else {
      setFormData(userData);
    }
  }, [userData, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const { name, family_name, imageFile } = formData;
  
      const formDataToSend = new FormData();
      formDataToSend.append("name", name);
      formDataToSend.append("family_name", family_name);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      console.log(formDataToSend);
  
      const updated = await updateUser(formDataToSend);
      dispatch(setUserData(updated));
      setEditing(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar dados.");
    }
  };
  
  const handleCancel = () => {
    if (userData) {
      setFormData(userData); // Restaura os dados
    }
    setEditing(false);
    setError("");
  };

  return (
    <Box
      sx={{
        p: 3,
        textAlign: "center",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Header />
      <Typography variant="h4" gutterBottom>
        Minha Conta
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {formData && (
        <Box sx={{ mt: 2 }}>
          <Avatar
            alt={formData.name}
            src={formData.picture_url}
            sx={{ width: 100, height: 100, margin: "0 auto", mb: 2 }}
          />

          <TextField
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!editing}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Sobrenome"
            name="family_name"
            value={formData.family_name}
            onChange={handleChange}
            disabled={!editing}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            disabled
            fullWidth
            margin="normal"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }))
            }
            disabled={!editing}
          />

          {!editing ? (
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
          ) : (
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button variant="contained" onClick={handleSave}>
                Salvar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Account;
