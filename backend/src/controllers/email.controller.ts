import { Request, Response } from 'express';
import { GmailService } from '../services/gmail.service';
import { AIService } from '../services/ai.service';
import { OAuth2Client } from 'google-auth-library';
import { IEmail } from '../models/email.model';
import Email from '../models/email.model';

export class EmailController {
  private gmailService: GmailService;
  private aiService: AIService;

  constructor(oauth2Client: OAuth2Client, openAIApiKey: string) {
    this.gmailService = new GmailService(oauth2Client);
    this.aiService = new AIService(openAIApiKey);
  }

  public getEmails = async (req: Request, res: Response) => {
    try {
      const { limit = 10, page = 1 } = req.query;
      const userId = req.user?.id; // Assuming you have authentication middleware that adds user to request
      
      // Check if we should fetch from Gmail or use cached data
      const shouldRefresh = req.query.refresh === 'true';
      
      let emails: IEmail[] = [];
      
      if (shouldRefresh) {
        // Fetch fresh emails from Gmail
        const gmailEmails = await this.gmailService.listEmails(Number(limit));
        
        // Save to database
        for (const email of gmailEmails) {
          email.userId = userId;
          await Email.findOneAndUpdate(
            { gmailId: email.gmailId, userId },
            email,
            { upsert: true, new: true }
          );
        }
        
        emails = gmailEmails;
      } else {
        // Get emails from database with pagination
        const skip = (Number(page) - 1) * Number(limit);
        emails = await Email.find({ userId })
          .sort({ receivedAt: -1 })
          .skip(skip)
          .limit(Number(limit));
      }
      
      // Analyze priority and category for each email if not already set
      for (const email of emails) {
        if (!email.priority || !email.category) {
          const analysis = await this.aiService.analyzeEmailPriority(email);
          email.priority = analysis.priority;
          email.category = analysis.category as any;
          await email.save();
        }
      }
      
      res.json(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  };

  public getEmail = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Try to get from database first
      let email = await Email.findOne({ gmailId: id, userId });
      
      // If not found in DB or force refresh, fetch from Gmail
      if (!email || req.query.refresh === 'true') {
        const gmailEmail = await this.gmailService.getEmail(id);
        if (!gmailEmail) {
          return res.status(404).json({ error: 'Email not found' });
        }
        
        gmailEmail.userId = userId;
        email = await Email.findOneAndUpdate(
          { gmailId: id, userId },
          gmailEmail,
          { upsert: true, new: true }
        );
      }
      
      res.json(email);
    } catch (error) {
      console.error('Error fetching email:', error);
      res.status(500).json({ error: 'Failed to fetch email' });
    }
  };

  public sendEmail = async (req: Request, res: Response) => {
    try {
      const { to, subject, body, cc, bcc } = req.body;
      const from = req.user?.email; // Assuming user email is available in the request
      
      if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      await this.gmailService.sendEmail({
        to,
        subject,
        body,
        cc,
        bcc,
      });
      
      // Save sent email to database
      const email = new Email({
        gmailId: `draft-${Date.now()}`, // Gmail will assign a real ID when sent
        threadId: `thread-${Date.now()}`,
        subject,
        from,
        to: Array.isArray(to) ? to : [to],
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
        body,
        snippet: body.substring(0, 200),
        isRead: true,
        isStarred: false,
        labels: ['SENT'],
        priority: 'normal',
        category: 'primary',
        hasAttachments: false,
        receivedAt: new Date(),
        userId: req.user?.id,
      });
      
      await email.save();
      
      res.status(201).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  };

  public generateReplySuggestion = async (req: Request, res: Response) => {
    try {
      const { emailId, context } = req.body;
      const userId = req.user?.id;
      
      // Get the email
      const email = await Email.findOne({ gmailId: emailId, userId });
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      // Generate reply suggestion
      const suggestion = await this.aiService.generateReplySuggestion(email, context);
      
      res.json(suggestion);
    } catch (error) {
      console.error('Error generating reply suggestion:', error);
      res.status(500).json({ error: 'Failed to generate reply suggestion' });
    }
  };

  public analyzeEmail = async (req: Request, res: Response) => {
    try {
      const { emailId } = req.params;
      const userId = req.user?.id;
      
      // Get the email
      const email = await Email.findOne({ gmailId: emailId, userId });
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      // Analyze email
      const analysis = await this.aiService.analyzeEmailPriority(email);
      
      // Update email with analysis
      email.priority = analysis.priority;
      email.category = analysis.category as any;
      await email.save();
      
      res.json({
        ...analysis,
        emailId: email._id,
      });
    } catch (error) {
      console.error('Error analyzing email:', error);
      res.status(500).json({ error: 'Failed to analyze email' });
    }
  };
}
