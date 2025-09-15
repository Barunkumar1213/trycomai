import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { OAuth2Client } from 'google-auth-library';

export const createEmailRouter = (oauth2Client: OAuth2Client, openAIApiKey: string) => {
  const router = Router();
  const emailController = new EmailController(oauth2Client, openAIApiKey);

  // Middleware to check if user is authenticated
  const authenticate = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Apply authentication middleware to all routes
  router.use(authenticate);

  // GET /emails - Get list of emails
  router.get('/', emailController.getEmails);
  
  // GET /emails/:id - Get a single email by ID
  router.get('/:id', emailController.getEmail);
  
  // POST /emails - Send a new email
  router.post('/', emailController.sendEmail);
  
  // POST /emails/suggest-reply - Generate a suggested reply for an email
  router.post('/suggest-reply', emailController.generateReplySuggestion);
  
  // GET /emails/analyze/:id - Analyze an email for priority and category
  router.get('/analyze/:id', emailController.analyzeEmail);

  return router;
};
