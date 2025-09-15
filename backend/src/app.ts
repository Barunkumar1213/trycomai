import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from './config/database';
import { createEmailRouter } from './routes/email.routes';
import { createCalendarRouter } from './routes/calendar.routes';
import { createAuthRouter } from './routes/auth.routes';

// Load environment variables
dotenv.config({ path: '.env' });

class App {
  public app: Application;
  private oauth2Client: OAuth2Client = new OAuth2Client();

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeOAuth2Client();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Enable CORS
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeOAuth2Client(): void {
    // Initialize OAuth2 client for Google APIs
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // API routes
    this.app.use('/api/auth', createAuthRouter());
    
    this.app.use(
      '/api/emails',
      // auth, // Uncomment to protect email routes
      createEmailRouter(this.oauth2Client, process.env.OPENAI_API_KEY || '')
    );

    this.app.use(
      '/api/calendar',
      // auth, // Uncomment to protect calendar routes
      createCalendarRouter(this.oauth2Client)
    );

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  private initializeErrorHandling(): void {
    // Error handling middleware
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      
      res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });
  }

  public async start(port: number): Promise<void> {
    try {
      // Connect to database
      await connectDB();
      
      // Start the server
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

export default App;
