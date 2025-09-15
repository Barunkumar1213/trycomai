import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { IEmail } from '../models/email.model';

export class GmailService {
  private gmail: any;

  constructor(private oauth2Client: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async listEmails(maxResults: number = 10): Promise<IEmail[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox',
      });

      const messages = response.data.messages || [];
      const emails: IEmail[] = [];

      for (const message of messages) {
        const email = await this.getEmail(message.id);
        if (email) {
          emails.push(email);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error listing emails:', error);
      throw new Error('Failed to fetch emails');
    }
  }

  async getEmail(messageId: string): Promise<IEmail | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.data;
      const headers = this.extractHeaders(message.payload?.headers || []);
      const body = this.extractBody(message.payload);

      return {
        gmailId: message.id,
        threadId: message.threadId,
        subject: headers.subject || '(No subject)',
        from: headers.from || '',
        to: headers.to ? headers.to.split(',').map((email: string) => email.trim()) : [],
        cc: headers.cc ? headers.cc.split(',').map((email: string) => email.trim()) : [],
        body: body,
        snippet: message.snippet || '',
        isRead: !message.labelIds?.includes('UNREAD'),
        isStarred: message.labelIds?.includes('STARRED') || false,
        labels: message.labelIds || [],
        priority: this.determinePriority(message.payload?.headers || []),
        category: this.determineCategory(message.labelIds || []),
        hasAttachments: this.hasAttachments(message.payload),
        receivedAt: new Date(parseInt(message.internalDate || '0')),
        userId: '', // This will be set by the controller
        metadata: {},
      } as IEmail;
    } catch (error) {
      console.error(`Error fetching email ${messageId}:`, error);
      return null;
    }
  }

  async sendEmail(emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<void> {
    try {
      const emailLines = [];
      emailLines.push(`To: ${emailData.to}`);
      emailLines.push(`Subject: ${emailData.subject}`);
      
      if (emailData.cc) {
        emailLines.push(`Cc: ${emailData.cc.join(', ')}`);
      }
      if (emailData.bcc) {
        emailLines.push(`Bcc: ${emailData.bcc.join(', ')}`);
      }
      
      emailLines.push('Content-Type: text/html; charset=utf-8');
      emailLines.push('MIME-Version: 1.0');
      emailLines.push('');
      emailLines.push(emailData.body);

      const email = emailLines.join('\r\n').trim();
      const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private extractHeaders(headers: any[]) {
    return headers.reduce((acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {} as Record<string, string>);
  }

  private extractBody(part: any): string {
    if (part.parts) {
      const htmlPart = part.parts.find((p: any) => p.mimeType === 'text/html');
      const textPart = part.parts.find((p: any) => p.mimeType === 'text/plain');
      
      if (htmlPart) {
        return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
      }
      if (textPart) {
        return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
      
      // If no specific part found, try to extract from all parts
      return part.parts
        .map((p: any) => {
          if (p.body && p.body.data) {
            return Buffer.from(p.body.data, 'base64').toString('utf-8');
          }
          return '';
        })
        .join('\n');
    }
    
    if (part.body && part.body.data) {
      return Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    
    return '';
  }

  private hasAttachments(part: any): boolean {
    if (part.parts) {
      return part.parts.some((p: any) => this.hasAttachments(p));
    }
    return part.filename && part.filename.length > 0 && part.body.attachmentId;
  }

  private determinePriority(headers: any[]): 'low' | 'normal' | 'high' {
    const priorityHeader = headers.find(h => h.name.toLowerCase() === 'importance' || h.name.toLowerCase() === 'x-priority');
    if (!priorityHeader) return 'normal';
    
    const value = priorityHeader.value.toLowerCase();
    if (value.includes('high') || value.includes('1') || value.includes('urgent')) {
      return 'high';
    }
    if (value.includes('low') || value.includes('5')) {
      return 'low';
    }
    return 'normal';
  }

  private determineCategory(labels: string[]): IEmail['category'] {
    const categoryLabels = ['primary', 'social', 'promotions', 'updates', 'forums', 'reservations', 'purchases'];
    const foundCategory = labels.find(label => categoryLabels.includes(label.toLowerCase()));
    return (foundCategory?.toLowerCase() as IEmail['category']) || 'primary';
  }
}
