import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 120,
            color: 'error.main',
            mb: 3,
          }}
        />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          The requested URL was not found on this server. You may have mistyped the
          address or the page may have been moved.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            size="large"
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PageNotFound;
