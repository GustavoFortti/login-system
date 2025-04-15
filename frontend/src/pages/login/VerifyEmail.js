import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../services/authService";
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("✅ Email verified successfully! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed. Try again later."
        );
      });
  }, [searchParams]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      p={2}
    >
      <Stack spacing={2} width="100%" maxWidth={400}>
        <Typography variant="h5" textAlign="center">
          Email Verification
        </Typography>

        {status === "loading" && (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        )}

        {status !== "loading" && (
          <Alert severity={status === "success" ? "success" : "error"}>
            {message}
          </Alert>
        )}

        {status === "success" && (
          <Button
            variant="contained"
            fullWidth
            component={Link}
            to="/login"
          >
            Go to Login
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default VerifyEmail;
