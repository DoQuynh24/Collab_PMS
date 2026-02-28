import { Box, Typography } from "@mui/material";
import styles from "./Home.module.scss";
import { useGetCurrentUser } from "../login/api/auth";

export function Home() {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box className={styles.homeContainer}>
      <Typography variant="h3" className={styles.homeTitle}>
        Hi {user?.name}👋🏼
      </Typography>
      <Typography variant="body1" className={styles.homeDesc}>
        Welcome back, nice to see you again!
      </Typography>
    </Box>
  );
}

export default Home;