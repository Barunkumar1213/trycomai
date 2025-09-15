import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  Checkbox,
  Toolbar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Star as StarFilledIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Mock data - replace with actual API calls
const fetchEmails = async (folder = 'inbox') => {
  // In a real app, this would be an API call with pagination, filtering, etc.
  return {
    data: [
      {
        id: '1',
        from: 'john@example.com',
        to: 'me@example.com',
        subject: 'Meeting Tomorrow',
        preview: 'Hi there, just a reminder about our meeting tomorrow at 2 PM.',
        date: new Date(),
        read: false,
        starred: false,
        labels: ['work'],
        folder,
      },
      {
        id: '2',
        from: 'team@company.com',
        to: 'me@example.com',
        subject: 'Weekly Update',
        preview: 'Here is your weekly update on the project progress...',
        date: new Date(Date.now() - 86400000), // Yesterday
        read: true,
        starred: true,
        labels: ['updates'],
        folder,
      },
      {
        id: '3',
        from: 'notifications@github.com',
        to: 'me@example.com',
        subject: 'Pull Request: Feature/user-authentication',
        preview: 'A new pull request has been opened in your repository...',
        date: new Date(Date.now() - 172800000), // 2 days ago
        read: true,
        starred: false,
        labels: ['github', 'work'],
        folder,
      },
    ],
    total: 3,
    unread: 1,
  };
};

interface EmailListProps {
  folder?: string;
  onSelectEmail?: (emailId: string) => void;
  selectedEmailId?: string | null;
}

const EmailList: React.FC<EmailListProps> = ({ folder = 'inbox', onSelectEmail, selectedEmailId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data, isLoading, isError, refetch } = useQuery(
    ['emails', folder],
    () => fetchEmails(folder),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleEmailClick = (emailId: string) => {
    if (onSelectEmail) {
      onSelectEmail(emailId);
    } else {
      navigate(`/emails/${emailId}`);
    }
  };

  const handleSelectEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedEmails((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedEmails(data?.data?.map((email: any) => email.id) || []);
    } else {
      setSelectedEmails([]);
    }
  };

  const handleStarEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Toggle star status - in a real app, this would be an API call
    console.log('Toggle star for email:', emailId);
  };

  const handleDeleteSelected = () => {
    // Delete selected emails - in a real app, this would be an API call
    console.log('Delete emails:', selectedEmails);
    setSelectedEmails([]);
  };

  const handleMarkAsRead = (read: boolean) => {
    // Mark as read/unread - in a real app, this would be an API call
    console.log('Mark as', read ? 'read' : 'unread', 'emails:', selectedEmails);
    setSelectedEmails([]);
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
      <Box textAlign="center" p={3}>
        <Typography color="error">Failed to load emails. Please try again.</Typography>
        <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  const emails = data?.data || [];
  const unreadCount = data?.unread || 0;

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', minHeight: '64px !important' }}>
        <Box display="flex" alignItems="center" width="100%">
          <Checkbox
            indeterminate={selectedEmails.length > 0 && selectedEmails.length < emails.length}
            checked={emails.length > 0 && selectedEmails.length === emails.length}
            onChange={handleSelectAll}
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
          
          {selectedEmails.length > 0 ? (
            <Box display="flex" alignItems="center" flexGrow={1}>
              <Tooltip title="Delete">
                <IconButton onClick={handleDeleteSelected} size="large">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mark as read">
                <IconButton onClick={() => handleMarkAsRead(true)} size="large">
                  <MarkEmailReadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mark as unread">
                <IconButton onClick={() => handleMarkAsRead(false)} size="large">
                  <MarkEmailUnreadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Archive">
                <IconButton size="large">
                  <ArchiveIcon />
                </IconButton>
              </Tooltip>
              <Box flexGrow={1} />
              <Typography variant="body2" color="text.secondary">
                {selectedEmails.length} selected
              </Typography>
            </Box>
          ) : (
            <>
              <Box flexGrow={1}>
                <TextField
                  size="small"
                  placeholder="Search in emails"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300, maxWidth: '100%' }}
                />
              </Box>
              <IconButton onClick={() => refetch()} size="large">
                <RefreshIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>

      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {emails.length === 0 ? (
          <Box textAlign="center" p={4}>
            <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No emails in this folder
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate('/emails/compose')}
            >
              Compose New Email
            </Button>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {emails.map((email: any, index: number) => (
              <React.Fragment key={email.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' },
                    bgcolor: selectedEmailId === email.id ? 'action.selected' : 'inherit',
                  }}
                  onClick={() => handleEmailClick(email.id)}
                  secondaryAction={
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {format(new Date(email.date), 'MMM d')}
                      </Typography>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarEmail(email.id, e);
                        }}
                      >
                        {email.starred ? (
                          <StarFilledIcon color="warning" />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                  }
                >
                  <Checkbox
                    checked={selectedEmails.includes(email.id)}
                    onClick={(e) => handleSelectEmail(email.id, e)}
                    onChange={() => {}} // Required for controlled component
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: email.read ? 'transparent' : 'primary.main',
                        color: email.read ? 'text.primary' : 'primary.contrastText',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {email.read ? (
                        email.from.charAt(0).toUpperCase()
                      ) : (
                        <EmailIcon fontSize="small" />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          component="span"
                          variant="subtitle2"
                          color="text.primary"
                          sx={{
                            fontWeight: email.read ? 'normal' : 'bold',
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {email.from}
                        </Typography>
                        {email.labels?.map((label: string) => (
                          <Box
                            key={label}
                            sx={{
                              bgcolor: 'grey.200',
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              mr: 0.5,
                            }}
                          >
                            {label}
                          </Box>
                        ))}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline-block',
                            fontWeight: email.read ? 'normal' : 'bold',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {email.subject}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {email.preview}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{
                      sx: { display: 'flex', alignItems: 'center' },
                    }}
                    sx={{ my: 0 }}
                  />
                </ListItem>
                {index < emails.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default EmailList;
