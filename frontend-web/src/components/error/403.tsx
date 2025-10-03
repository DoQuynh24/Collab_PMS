import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ECUSS_APP_URL } from "@/constant/config";

const Error403: React.FC = () => {
  const handleRedirect = () => {
    window.location.href = ECUSS_APP_URL;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 500 }}>
        403
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
        Sorry, you are not authorized to access this page.
      </Typography>
      <Button variant="contained" onClick={handleRedirect}>
        Back to Login
      </Button>
    </Box>
  );
};

export default Error403;