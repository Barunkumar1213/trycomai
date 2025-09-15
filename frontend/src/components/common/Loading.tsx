import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface LoadingProps {
  /**
   * If true, shows the loading indicator
   */
  loading?: boolean;
  
  /**
   * Optional message to display below the loading indicator
   */
  message?: string;
  
  /**
   * Size of the loading spinner
   * @default 40
   */
  size?: number;
  
  /**
   * Color of the loading spinner
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  
  /**
   * If true, centers the loading indicator in the viewport
   * @default true
   */
  fullScreen?: boolean;
  
  /**
   * If true, shows a semi-transparent overlay behind the loading indicator
   * @default false
   */
  withOverlay?: boolean;
  
  /**
   * Additional styles to apply to the container
   */
  sx?: object;
}

/**
 * A customizable loading component that displays a circular progress indicator
 * with an optional message. Can be used as a full-screen overlay or inline.
 */
const Loading = ({
  loading = true,
  message,
  size = 40,
  color = 'primary',
  fullScreen = true,
  withOverlay = false,
  sx = {},
}: LoadingProps) => {
  if (!loading) return null;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400, // Higher than app bar
          backgroundColor: withOverlay ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: withOverlay ? 'blur(3px)' : 'none',
        }),
        ...sx,
      }}
    >
      <Fade in={loading} style={{ transitionDelay: loading ? '200ms' : '0ms' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            borderRadius: 2,
            bgcolor: withOverlay ? 'background.paper' : 'transparent',
            boxShadow: withOverlay ? 3 : 'none',
          }}
        >
          <CircularProgress 
            size={size} 
            color={color} 
            thickness={4}
            sx={{
              mb: message ? 2 : 0,
            }}
          />
          {message && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                mt: 1,
                textAlign: 'center',
                maxWidth: '300px',
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    </Box>
  );

  return content;
};

export default Loading;

/**
 * A full-screen loading component with overlay
 */
export const FullScreenLoading = (props: Omit<LoadingProps, 'fullScreen' | 'withOverlay'>) => (
  <Loading fullScreen withOverlay {...props} />
);

/**
 * An inline loading component
 */
export const InlineLoading = (props: Omit<LoadingProps, 'fullScreen' | 'withOverlay'>) => (
  <Loading fullScreen={false} withOverlay={false} {...props} />
);

/**
 * A loading component with a message
 */
export const LoadingWithMessage = ({
  message = 'Loading...',
  ...props
}: Omit<LoadingProps, 'message'> & { message?: string }) => (
  <Loading message={message} {...props} />
);
