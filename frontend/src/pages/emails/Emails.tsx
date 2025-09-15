import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  ListItem,
  Divider,
  IconButton,
  Checkbox,
  Toolbar,
  Alert,
  CircularProgress,
  useTheme,
  Button,
} from '@mui/material';
import {
  StarBorder as StarBorderIcon,
  Star as StarFilledIcon,
  LabelImportant as LabelImportantIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../components/common/Notification';
import useEmailService from '../../api/emailService';


const Emails = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const emailService = useEmailService();
  
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([]);

  // Fetch emails with proper error handling
  const { 
    data: emails = [], 
    isLoading, 
    refetch,
    isError 
  } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data, error } = await emailService.getEmails();
      if (error) throw new Error(error);
      return data || [];
    },
    retry: 1,
  });

  // Handle errors with notification
  useEffect(() => {
    if (isError) {
      showNotification(
        'Failed to load emails. Please try again.',
        'error'
      );
    }
  }, [isError, showNotification]);

  const handleEmailClick = (emailId: string) => {
    navigate(`/emails/${emailId}`);
  };

  const toggleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedEmails(prev => 
      prev.length === emails.length ? [] : emails.map(email => email.id)
    );
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      showNotification('Emails refreshed', 'success');
    } catch (err) {
      showNotification('Failed to refresh emails', 'error');
    }
  };

  const handleToggleStar = async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await emailService.toggleStar(emailId);
      if (error) throw error;
      await refetch();
    } catch (err) {
      showNotification('Failed to update email', 'error');
    }
  };

  const handleToggleImportant = async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await emailService.toggleImportant(emailId);
      if (error) throw error;
      await refetch();
    } catch (err) {
      showNotification('Failed to update email', 'error');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          }
        >
          Failed to load emails. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Checkbox
          checked={emails.length > 0 && selectedEmails.length === emails.length}
          indeterminate={selectedEmails.length > 0 && selectedEmails.length < emails.length}
          onChange={toggleSelectAll}
        />
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Toolbar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {emails.map((email) => (
          <React.Fragment key={email.id}>
            <ListItem 
              button 
              selected={selectedEmails.includes(email.id)}
              sx={{
                bgcolor: email.read ? 'action.hover' : 'background.paper',
                '&:hover': {
                  boxShadow: 1,
                },
              }}
            >
              <Checkbox
                checked={selectedEmails.includes(email.id)}
                onChange={() => toggleSelectEmail(email.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <IconButton onClick={(e) => handleToggleStar(email.id, e)}>
                {email.starred ? (
                  <StarFilledIcon color="warning" />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
              <IconButton onClick={(e) => handleToggleImportant(email.id, e)}>
                {email.important ? (
                  <LabelImportantIcon color="warning" />
                ) : (
                  <LabelImportantIcon />
                )}
              </IconButton>
              <Box 
                onClick={() => handleEmailClick(email.id)}
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  cursor: 'pointer',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{
                    fontWeight: email.read ? 'normal' : 'bold',
                    minWidth: '200px',
                    mr: 2,
                  }}
                >
                  {email.from}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    noWrap
                    sx={{
                      fontWeight: email.read ? 'normal' : 'bold',
                    }}
                  >
                    {email.subject}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      - {email.preview}
                    </Typography>
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  {email.time}
                </Typography>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
        {emails.length === 0 && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="200px"
            textAlign="center"
            p={3}
          >
            <EmailIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No emails found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Your inbox is empty or you don't have permission to view these emails.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Emails;
