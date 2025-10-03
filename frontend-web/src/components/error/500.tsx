import { homeUrl } from "@/routes/urls";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Error500() {
  const navigate = useNavigate();

  const handleGoHome = () => {
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
          500
        </Typography>
        <Typography variant="h5" component="div" sx={{ mt: 2 }}>
          Sorry, something went wrong.
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