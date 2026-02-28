import { Box, Typography, Avatar, Button } from '@mui/material';
import { useGetCurrentUser } from '../login/api/auth';

export function Account() {
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>
      <Avatar
        src={
          user?.picture
            ? user.picture.replace('=s96-c', '=s200-c')
            : undefined
        }
        sx={{
          width: 100,
          height:100,
          mx: 'auto',
          mb: 2,
        }}
      />
      <Typography variant="h6">Name: {user?.name || 'User'}</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Button variant="contained" color="primary" sx={{ mt: 3 }}>
        Edit Profile
      </Button>
    </Box>
  );
}
export default Account;