import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  useTheme,
  Collapse,
  Chip,
  Avatar,
  ListItemText,
  ListItemIcon,
  Menu,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  InsertLink as InsertLinkIcon,
  InsertPhoto as InsertPhotoIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
  Code as CodeIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  FormatColorText as FormatColorTextIcon,
  FormatSize as FormatSizeIcon,
  InsertEmoticon as InsertEmoticonIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Mock data for contacts
const fetchContacts = async (query: string = '') => {
  // In a real app, this would be an API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const contacts = [
    { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS' },
    { id: '3', name: 'Team', email: 'team@company.com', avatar: 'T' },
    { id: '4', name: 'Support', email: 'support@company.com', avatar: 'S' },
  ];
  
  if (!query) return contacts;
  
  const queryLower = query.toLowerCase();
  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(queryLower) ||
      contact.email.toLowerCase().includes(queryLower)
  );
};

// Mock send email function
const sendEmail = async (emailData: any) => {
  // In a real app, this would be an API call
  console.log('Sending email:', emailData);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true };
};

interface EmailComposeProps {
  onClose?: () => void;
  initialValues?: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
    replyToId?: string;
    forwardFromId?: string;
  };
}

const EmailCompose: React.FC<EmailComposeProps> = ({ onClose, initialValues }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for form fields
  const [to, setTo] = useState<string[]>(initialValues?.to || []);
  const [cc, setCc] = useState<string[]>(initialValues?.cc || []);
  const [bcc, setBcc] = useState<string[]>(initialValues?.bcc || []);
  const [subject, setSubject] = useState(initialValues?.subject || '');
  const [body, setBody] = useState(initialValues?.body || '');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [isSending, setIsSending] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Query for contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery(
    ['contacts', searchQuery],
    () => fetchContacts(searchQuery),
    { enabled: searchQuery.length > 0 }
  );
  
  // Mutation for sending email
  const sendEmailMutation = useMutation(sendEmail, {
    onSuccess: () => {
      // Invalidate queries to refresh the email list
      queryClient.invalidateQueries(['emails']);
      
      // Show success message or navigate away
      if (onClose) {
        onClose();
      } else {
        navigate('/emails');
      }
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      // Show error message
    },
    onSettled: () => {
      setIsSending(false);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (to.length === 0) {
      // Show error - at least one recipient is required
      return;
    }
    
    setIsSending(true);
    
    const emailData = {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments: attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };
    
    sendEmailMutation.mutate(emailData);
  };
  
  // Handle adding a recipient
  const handleAddRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) return;
    
    const emailList = type === 'to' ? to : type === 'cc' ? cc : bcc;
    const setter = type === 'to' ? setTo : type === 'cc' ? setCc : setBcc;
    
    if (!emailList.includes(emailTrimmed)) {
      setter([...emailList, emailTrimmed]);
    }
    
    setSearchQuery('');
  };
  
  // Handle removing a recipient
  const handleRemoveRecipient = (type: 'to' | 'cc' | 'bcc', emailToRemove: string) => {
    const setter = type === 'to' ? setTo : type === 'cc' ? setCc : setBcc;
    setter((prev) => prev.filter((email) => email !== emailToRemove));
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Quill modules for the rich text editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1">
          {initialValues?.replyToId ? 'Reply' : initialValues?.forwardFromId ? 'Forward' : 'New Message'}
        </Typography>
        <Box>
          <Tooltip title={isExpanded ? 'Minimize' : 'Maximize'}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: 'inherit' }}
            >
              {isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={onClose || (() => navigate(-1))}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 2 }}>
            {/* To field */}
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
              <Typography sx={{ width: 80, pt: 1.5, flexShrink: 0 }}>To:</Typography>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {to.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      onDelete={() => handleRemoveRecipient('to', email)}
                      sx={{ maxWidth: '100%' }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={to.length === 0 ? 'Recipients' : ''}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ '& .MuiInputBase-root': { flexWrap: 'wrap' } }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient('to', searchQuery);
                    } else if (e.key === 'Backspace' && searchQuery === '' && to.length > 0) {
                      // Remove last recipient on backspace when search is empty
                      setTo(to.slice(0, -1));
                    }
                  }}
                  onBlur={() => {
                    if (searchQuery) {
                      handleAddRecipient('to', searchQuery);
                    }
                  }}
                />
                {searchQuery && contacts.length > 0 && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      zIndex: 1300,
                      mt: 0.5,
                      width: '100%',
                      maxWidth: 600,
                      maxHeight: 300,
                      overflow: 'auto',
                    }}
                  >
                    {contacts.map((contact) => (
                      <MenuItem
                        key={contact.id}
                        onClick={() => {
                          handleAddRecipient('to', contact.email);
                        }}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {contact.avatar}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={contact.name}
                          secondary={contact.email}
                          primaryTypographyProps={{ noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </MenuItem>
                    ))}
                  </Paper>
                )}
              </Box>
            </Box>
            
            {/* Cc field */}
            <Collapse in={showCc} timeout="auto" unmountOnExit>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                <Typography sx={{ width: 80, pt: 1.5, flexShrink: 0 }}>Cc:</Typography>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {cc.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => handleRemoveRecipient('cc', email)}
                        sx={{ maxWidth: '100%' }}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder={cc.length === 0 ? 'Cc' : ''}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient('cc', searchQuery);
                      }
                    }}
                    onBlur={() => {
                      if (searchQuery) {
                        handleAddRecipient('cc', searchQuery);
                      }
                    }}
                  />
                </Box>
              </Box>
            </Collapse>
            
            {/* Bcc field */}
            <Collapse in={showBcc} timeout="auto" unmountOnExit>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                <Typography sx={{ width: 80, pt: 1.5, flexShrink: 0 }}>Bcc:</Typography>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {bcc.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => handleRemoveRecipient('bcc', email)}
                        sx={{ maxWidth: '100%' }}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder={bcc.length === 0 ? 'Bcc' : ''}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient('bcc', searchQuery);
                      }
                    }}
                    onBlur={() => {
                      if (searchQuery) {
                        handleAddRecipient('bcc', searchQuery);
                      }
                    }}
                  />
                </Box>
              </Box>
            </Collapse>
            
            {/* Cc/Bcc toggle buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
              <Button
                size="small"
                onClick={() => setShowCc(!showCc)}
                sx={{ minWidth: 'auto', p: 0.5, mr: 1, fontSize: '0.75rem' }}
              >
                {showCc ? 'Hide Cc' : 'Cc'}
              </Button>
              <Button
                size="small"
                onClick={() => setShowBcc(!showBcc)}
                sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
              >
                {showBcc ? 'Hide Bcc' : 'Bcc'}
              </Button>
            </Box>
            
            {/* Subject field */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ width: 80, flexShrink: 0 }}>Subject:</Typography>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Box>
            
            {/* Email body editor */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
              {/* Formatting toolbar */}
              <Box
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  p: 0.5,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                }}
              >
                <Tooltip title="Bold">
                  <IconButton size="small">
                    <FormatBoldIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Italic">
                  <IconButton size="small">
                    <FormatItalicIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Underline">
                  <IconButton size="small">
                    <FormatUnderlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Bulleted list">
                  <IconButton size="small">
                    <FormatListBulletedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Numbered list">
                  <IconButton size="small">
                    <FormatListNumberedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Insert link">
                  <IconButton size="small">
                    <InsertLinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Insert image">
                  <IconButton size="small">
                    <InsertPhotoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Box flexGrow={1} />
                <Tooltip title="More options">
                  <IconButton
                    size="small"
                    onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Additional formatting toolbar */}
              <Collapse in={showFormattingToolbar} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    p: 0.5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Text color">
                    <IconButton size="small">
                      <FormatColorTextIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Font size">
                    <IconButton size="small">
                      <FormatSizeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Quote">
                    <IconButton size="small">
                      <FormatQuoteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Code">
                    <IconButton size="small">
                      <CodeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Align left">
                    <IconButton size="small">
                      <FormatAlignLeftIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Align center">
                    <IconButton size="small">
                      <FormatAlignCenterIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Align right">
                    <IconButton size="small">
                      <FormatAlignRightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Emoji">
                    <IconButton size="small">
                      <InsertEmoticonIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
              
              {/* Rich text editor */}
              <Box sx={{ minHeight: 300, p: 2 }}>
                <ReactQuill
                  theme="snow"
                  value={body}
                  onChange={setBody}
                  modules={modules}
                  formats={formats}
                  placeholder="Compose your email here..."
                  style={{ height: '100%', border: 'none' }}
                />
              </Box>
            </Box>
            
            {/* Attachments */}
            {attachments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Attachments ({attachments.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            ({formatFileSize(file.size)})
                          </Typography>
                        </Box>
                      }
                      onDelete={() => handleRemoveAttachment(index)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={isSending || to.length === 0}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  multiple
                />
                <Tooltip title="Attach files">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    sx={{ ml: 1 }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button
                variant="outlined"
                onClick={onClose || (() => navigate(-1))}
                disabled={isSending}
              >
                Discard
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default EmailCompose;
