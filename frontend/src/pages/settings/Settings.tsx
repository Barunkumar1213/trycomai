import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  Avatar,
  IconButton,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleTimezoneChange = (event: SelectChangeEvent) => {
    setTimezone(event.target.value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Settings saved:', {
      darkMode,
      notifications,
      emailNotifications,
      language,
      timezone,
      hasProfileImage: !!profileImage,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile
        </Typography>
        <Box display="flex" alignItems="center" mb={3}>
          <Box position="relative" mr={3}>
            <Avatar
              src={profileImage || undefined}
              sx={{ width: 80, height: 80 }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Box position="absolute" bottom={0} right={0}>
              {profileImage ? (
                <IconButton
                  color="error"
                  onClick={handleRemoveImage}
                  size="small"
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <CloudUpload fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<CloudUpload />}
              size="small"
            >
              {profileImage ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </Box>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3} mb={3}>
            <TextField label="First Name" fullWidth />
            <TextField label="Last Name" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Phone Number" type="tel" fullWidth />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          
          <FormGroup sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  disabled={!notifications}
                />
              }
              label="Email Notifications"
            />
          </FormGroup>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mb={3}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={handleLanguageChange}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="ja">日本語</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="timezone-select-label">Timezone</InputLabel>
              <Select
                labelId="timezone-select-label"
                value={timezone}
                label="Timezone"
                onChange={handleTimezoneChange}
              >
                <MenuItem value="UTC">UTC (Universal Time Coordinated)</MenuItem>
                <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                <MenuItem value="CET">CET (Central European Time)</MenuItem>
                <MenuItem value="IST">IST (Indian Standard Time)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings;
