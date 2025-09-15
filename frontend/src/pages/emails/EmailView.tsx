import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Divider,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  StarBorder as StarBorderIcon,
  Star as StarFilledIcon,
  LabelImportant as LabelImportantIcon,
  Attachment as AttachmentIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Mock email data - replace with actual API call
const mockEmail = {
  id: '1',
  from: 'john.doe@example.com',
  fromName: 'John Doe',
  to: 'me@example.com',
  subject: 'Weekly Team Update',
  date: 'Mon, Sep 15, 2025, 2:30 PM',
  body: `Hello team,\n\nI hope this email finds you well. Here are the updates from this week:\n\n1. Project X is on track for the Q4 release\n2. The new design system has been implemented\n3. We have a team meeting scheduled for Friday at 2 PM\n\nBest regards,\nJohn`,
  attachments: [
    { name: 'Q3_Report.pdf', size: 2456789 },
    { name: 'Project_Timeline.xlsx', size: 1876543 },
  ],
  isStarred: true,
  isImportant: true,
  isRead: true,
};

const EmailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState(mockEmail);
  const [isStarred, setIsStarred] = React.useState(email.isStarred);
  const [isImportant, setIsImportant] = React.useState(email.isImportant);

  // In a real app, you would fetch the email by ID here
  // React.useEffect(() => {
  //   const fetchEmail = async () => {
  //     const response = await fetch(`/api/emails/${id}`);
  //     const data = await response.json();
  //     setEmail(data);
  //     setIsStarred(data.isStarred);
  //     setIsImportant(data.isImportant);
  //   };
  //   fetchEmail();
  // }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleReply = () => {
    // Handle reply action
    console.log('Reply to:', email.from);
  };

  const handleReplyAll = () => {
    // Handle reply all action
    console.log('Reply all to:', email.to);
  };

  const handleForward = () => {
    // Handle forward action
    console.log('Forward email:', email.subject);
  };

  const handleDelete = () => {
    // Handle delete action
    console.log('Delete email:', id);
    navigate('/emails');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
    // In a real app, you would update this on the server
    // await updateEmail(id, { isStarred: !isStarred });
  };

  const toggleImportant = () => {
    setIsImportant(!isImportant);
    // In a real app, you would update this on the server
    // await updateEmail(id, { isImportant: !isImportant });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="h2" noWrap>
          {email.subject}
        </Typography>
        <Box flexGrow={1} />
        <Box>
          <Tooltip title={isStarred ? 'Remove star' : 'Add star'}>
            <IconButton onClick={toggleStar}>
              {isStarred ? <StarFilledIcon color="warning" /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isImportant ? 'Not important' : 'Mark as important'}>
            <IconButton onClick={toggleImportant}>
              <LabelImportantIcon color={isImportant ? 'error' : 'inherit'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
          {email.fromName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="medium">
              {email.fromName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              &lt;{email.from}&gt;
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            to me • {email.date}
          </Typography>
        </Box>
      </Box>

      <Box flexGrow={1} mb={3}>
        <Box
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, '<br>') }}
        />
      </Box>

      {email.attachments && email.attachments.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Attachments ({email.attachments.length})
          </Typography>
          <List dense>
            {email.attachments.map((file, index) => (
              <ListItem
                key={index}
                button
                component="a"
                href={`#${file.name}`}
                download
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <AttachmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                  primaryTypographyProps={{
                    noWrap: true,
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                />
                <Button size="small" variant="outlined">
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={1} justifyContent="space-between">
        <Box>
          <Button
            variant="outlined"
            startIcon={<ReplyIcon />}
            onClick={handleReply}
            sx={{ mr: 1 }}
          >
            Reply
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplyAllIcon />}
            onClick={handleReplyAll}
            sx={{ mr: 1 }}
          >
            Reply All
          </Button>
          <Button
            variant="outlined"
            startIcon={<ForwardIcon />}
            onClick={handleForward}
          >
            Forward
          </Button>
        </Box>
        <Box>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmailView;
