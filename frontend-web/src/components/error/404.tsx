import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { homeUrl } from "@/routes/urls";

export function Error404() {
  const navigate = useNavigate();

  const handleGoHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(homeUrl);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="div" sx={{ fontWeight: 500 }}>
          404
        </Typography>
        <Typography variant="h5" component="div" sx={{ mt: 2 }}>
          Sorry, the page you visited does not exist.
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={handleGoHome}
      >
        Go Home
      </Button>
    </Container>
  );
}