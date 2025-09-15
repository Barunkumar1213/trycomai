import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  InsertPhoto,
} from '@mui/icons-material';

const ComposeEmail = () => {
  const navigate = useNavigate();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) return;
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Email sent:', { to, cc, bcc, subject, body, attachments });
      setIsSending(false);
      navigate('/emails');
    }, 1500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    textAreaRef.current?.focus();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">New Message</Typography>
          <Box>
            <Tooltip title="Discard">
              <IconButton onClick={() => navigate(-1)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            margin="normal"
            required
          />
          
          {showCc && (
            <TextField
              fullWidth
              label="Cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              margin="normal"
            />
          )}
          
          {showBcc && (
            <TextField
              fullWidth
              label="Bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              margin="normal"
            />
          )}
          
          <Box display="flex" gap={1} mt={1} mb={1}>
            <Button
              size="small"
              onClick={() => setShowCc(!showCc)}
              variant="text"
            >
              {showCc ? 'Hide Cc' : 'Cc'}
            </Button>
            <Button
              size="small"
              onClick={() => setShowBcc(!showBcc)}
              variant="text"
            >
              {showBcc ? 'Hide Bcc' : 'Bcc'}
            </Button>
          </Box>
          
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            required
          />
          
          <Box
            border={1}
            borderColor="divider"
            borderRadius={1}
            mt={2}
            mb={2}
            sx={{ minHeight: '300px' }}
          >
            <Box
              borderBottom={1}
              borderColor="divider"
              p={1}
              display="flex"
              gap={1}
              flexWrap="wrap"
            >
              <IconButton size="small" onClick={() => formatText('bold')} title="Bold">
                <FormatBold fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => formatText('italic')} title="Italic">
                <FormatItalic fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => formatText('underline')} title="Underline">
                <FormatUnderlined fontSize="small" />
              </IconButton>
              <Divider orientation="vertical" flexItem />
              <IconButton size="small" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                <FormatListBulleted fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => formatText('insertOrderedList')} title="Numbered List">
                <FormatListNumbered fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => formatText('createLink', prompt('Enter URL:'))} title="Insert Link">
                <Link fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => formatText('insertImage', prompt('Image URL:'))} title="Insert Image">
                <InsertPhoto fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={10}
              variant="standard"
              InputProps={{ disableUnderline: true, style: { padding: '8px' } }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              inputRef={textAreaRef}
              style={{ minHeight: '250px' }}
            />
          </Box>
          
          {attachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${formatFileSize(file.size)})`}
                    onDelete={() => removeAttachment(index)}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                    sx={{ maxWidth: '100%' }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                multiple
              />
              <Button
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Attach File
              </Button>
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              disabled={isSending || !to || !subject}
            >
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ComposeEmail;