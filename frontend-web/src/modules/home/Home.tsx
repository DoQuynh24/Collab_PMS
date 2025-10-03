import { Box, Typography } from "@mui/material";
import styles from "./Home.module.scss";

export function Home() {

  return (
    <Box className={styles.homeContainer}>
      <Typography variant="h3" className={styles.homeTitle}>
        Hi👋🏼
      </Typography>
      <Typography variant="body1" className={styles.homeDesc}>
        Welcome back, nice to see you again!
      </Typography>
    </Box>
  );
}

export default Home;