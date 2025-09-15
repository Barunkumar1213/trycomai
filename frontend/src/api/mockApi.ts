import { v4 as uuidv4 } from 'uuid';
import type { Email } from './emailService';

// Mock email data
const mockEmails: Email[] = [
  {
    id: uuidv4(),
    from: 'john.doe@example.com',
    subject: 'Weekly Team Meeting',
    preview: 'Hi team, just a reminder about our weekly sync tomorrow at 10 AM...',
    time: '10:30 AM',
    read: false,
    starred: true,
    important: true,
    body: 'Hi team,\n\nJust a reminder about our weekly sync tomorrow at 10 AM. Please prepare your updates.\n\nBest regards,\nJohn',
    to: ['team@example.com'],
    cc: ['manager@example.com'],
    bcc: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    from: 'notifications@github.com',
    subject: 'Pull Request: Update README.md',
    preview: 'A new pull request has been opened in your repository...',
    time: 'Yesterday',
    read: true,
    starred: false,
    important: false,
    body: 'A new pull request has been opened in your repository.\n\nTitle: Update README.md\nAuthor: devuser\n\nPlease review the changes.',
    to: ['user@example.com'],
    cc: [],
    bcc: [],
    attachments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Simulate network delay
const simulateNetworkDelay = () => new Promise(resolve => 
  setTimeout(resolve, 300 + Math.random() * 700)
);

const mockApi = {
  // Get all emails
  getEmails: async (): Promise<{ data: Email[]; error: string | null }> => {
    await simulateNetworkDelay();
    return {
      data: [...mockEmails],
      error: null,
    };
  },

  // Get email by ID
  getEmailById: async (id: string): Promise<{ data: Email | null; error: string | null }> => {
    await simulateNetworkDelay();
    const email = mockEmails.find(email => email.id === id);
    
    if (!email) {
      return {
        data: null,
        error: 'Email not found',
      };
    }

    // Mark as read when fetched
    if (!email.read) {
      email.read = true;
      email.updatedAt = new Date().toISOString();
    }

    return {
      data: { ...email },
      error: null,
    };
  },

  // Mark email as read
  markAsRead: async (id: string): Promise<{ data: { success: boolean }; error: string | null }> => {
    await simulateNetworkDelay();
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      email.read = true;
      email.updatedAt = new Date().toISOString();
      return { data: { success: true }, error: null };
    }
    
    return { data: { success: false }, error: 'Email not found' };
  },

  // Toggle star status
  toggleStar: async (id: string): Promise<{ data: { success: boolean }; error: string | null }> => {
    await simulateNetworkDelay();
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      email.starred = !email.starred;
      email.updatedAt = new Date().toISOString();
      return { data: { success: true }, error: null };
    }
    
    return { data: { success: false }, error: 'Email not found' };
  },

  // Toggle important status
  toggleImportant: async (id: string): Promise<{ data: { success: boolean }; error: string | null }> => {
    await simulateNetworkDelay();
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      email.important = !email.important;
      email.updatedAt = new Date().toISOString();
      return { data: { success: true }, error: null };
    }
    
    return { data: { success: false }, error: 'Email not found' };
  },

  // Send email
  sendEmail: async (emailData: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    attachments?: File[];
  }): Promise<{ data: { success: boolean; message: string }; error: string | null }> => {
    await simulateNetworkDelay();
    
    const newEmail: Email = {
      id: uuidv4(),
      from: 'me@example.com', // Current user's email
      subject: emailData.subject,
      preview: emailData.body.substring(0, 100) + (emailData.body.length > 100 ? '...' : ''),
      time: 'Just now',
      read: true,
      starred: false,
      important: false,
      body: emailData.body,
      to: emailData.to,
      cc: emailData.cc || [],
      bcc: emailData.bcc || [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockEmails.unshift(newEmail);
    
    return {
      data: {
        success: true,
        message: 'Email sent successfully',
      },
      error: null,
    };
  },

  // Delete email
  deleteEmail: async (id: string): Promise<{ data: { success: boolean }; error: string | null }> => {
    await simulateNetworkDelay();
    const index = mockEmails.findIndex(email => email.id === id);
    
    if (index !== -1) {
      mockEmails.splice(index, 1);
      return { data: { success: true }, error: null };
    }
    
    return { data: { success: false }, error: 'Email not found' };
  },
};

export default mockApi;
