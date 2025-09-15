import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Email as EmailIcon,
  Event as EventIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Mock data - replace with actual API calls
const fetchRecentEmails = async (token: string) => {
  const response = await fetch('http://localhost:5000/api/emails', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchUpcomingEvents = async (token: string) => {
  const response = await fetch('http://localhost:5000/api/calendar/events', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  // Fetch recent emails and upcoming events
  const { data: emails, isLoading: isLoadingEmails } = useQuery({
    queryKey: ['recentEmails'],
    queryFn: () => fetchRecentEmails(token || ''),
    enabled: isAuthenticated && !!token,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => fetchUpcomingEvents(token || ''),
    enabled: isAuthenticated && !!token,
  });

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Please log in to view the dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name || 'User'}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Quick Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">Unread Emails</Typography>
                  <Typography variant="h6">
                    {isLoadingEmails ? <CircularProgress size={20} /> : emails?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">Upcoming Events</Typography>
                  <Typography variant="h6">
                    {isLoadingEvents ? <CircularProgress size={20} /> : events?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Emails */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Emails</Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/emails')}
              >
                View All
              </Button>
            </Box>
            <List>
              {isLoadingEmails ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : emails?.length > 0 ? (
                emails.slice(0, 5).map((email: any) => (
                  <React.Fragment key={email.id}>
                    <ListItem 
                      button 
                      onClick={() => navigate(`/emails/${email.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={email.subject}
                        secondary={`From: ${email.from} - ${format(new Date(email.date), 'MMM d, yyyy')}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  No recent emails
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Events</Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/calendar')}
              >
                View All
              </Button>
            </Box>
            <List>
              {isLoadingEvents ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : events?.length > 0 ? (
                events.slice(0, 5).map((event: any) => (
                  <React.Fragment key={event.id}>
                    <ListItem button>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={event.title}
                        secondary={`${format(new Date(event.start), 'MMM d, yyyy h:mm a')} - ${format(new Date(event.end), 'h:mm a')}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  No upcoming events
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
