import { useState, useEffect, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor, Slide, type SlideProps, type SnackbarCloseReason } from '@mui/material';

type NotificationType = {
  message: string;
  type: AlertColor;
  open: boolean;
  autoHideDuration?: number;
  onClose?: () => void;
};

interface NotificationProps extends Omit<NotificationType, 'open'> {
  open?: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

// Slide transition for the snackbar
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const Notification = ({
  message,
  type = 'info',
  open: externalOpen = false,
  onClose: externalOnClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}: NotificationProps) => {
  const [open, setOpen] = useState(externalOpen);
  const [notification, setNotification] = useState<Omit<NotificationType, 'open'>>({ 
    message: '', 
    type: 'info',
    autoHideDuration: 6000,
  });

  // Update internal state when props change
  useEffect(() => {
    setOpen(externalOpen);
    if (message) {
      setNotification(prev => ({
        ...prev,
        message,
        type,
        autoHideDuration,
      }));
    }
  }, [externalOpen, message, type, autoHideDuration]);

  const handleClose = useCallback((event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  }, [externalOnClose]);

  // Auto-hide the notification after the specified duration
  useEffect(() => {
    if (open && notification.autoHideDuration) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [open, notification.autoHideDuration, handleClose]);

  if (!notification.message) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={notification.autoHideDuration}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={anchorOrigin}
      sx={{
        '& .MuiPaper-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity={notification.type} 
        variant="filled"
        elevation={6}
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            fontWeight: 500,
          },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;

// Hook to use the notification
// Usage: const { showNotification } = useNotification();
// showNotification('Success message', 'success');
export const useNotification = () => {
  const [notification, setNotification] = useState<Omit<NotificationType, 'open'>>({ 
    message: '', 
    type: 'info',
    autoHideDuration: 6000,
  });
  const [open, setOpen] = useState(false);

  const showNotification = useCallback((
    message: string, 
    type: AlertColor = 'info', 
    options: { autoHideDuration?: number } = {}
  ) => {
    setNotification({
      message,
      type,
      autoHideDuration: options.autoHideDuration || 6000,
    });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    showNotification,
    Notification: () => (
      <Notification
        open={open}
        onClose={handleClose}
        {...notification}
      />
    ),
  };
};
