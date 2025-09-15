import { useAxios } from '../hooks/useAxios';
import mockApi from './mockApi';

// Types
export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  body?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface EmailListResponse {
  data: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmailResponse {
  data: Email | null;
  error: string | null;
}

const useEmailService = () => {
  const { request } = useAxios();
  const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

  // Get all emails
  const getEmails = async (params?: {
    page?: number;
    limit?: number;
    folder?: string;
    search?: string;
    filter?: 'all' | 'unread' | 'starred' | 'important';
  }) => {
    if (isMock) {
      const { data, error } = await mockApi.getEmails();
      return { data, error };
    }

    const { data, error } = await request<EmailListResponse>({
      url: '/emails',
      method: 'GET',
      params,
    });

    return { data, error };
  };

  // Get email by ID
  const getEmailById = async (id: string) => {
    if (isMock) {
      return mockApi.getEmailById(id);
    }

    const { data, error } = await request<Email>({
      url: `/emails/${id}`,
      method: 'GET',
    });

    return { data, error };
  };

  // Mark email as read
  const markAsRead = async (id: string) => {
    if (isMock) {
      return mockApi.markAsRead(id);
    }

    const { data, error } = await request({
      url: `/emails/${id}/read`,
      method: 'PATCH',
    });

    return { data, error };
  };

  // Toggle star status
  const toggleStar = async (id: string) => {
    if (isMock) {
      return mockApi.toggleStar(id);
    }

    const { data, error } = await request({
      url: `/emails/${id}/star`,
      method: 'PATCH',
    });

    return { data, error };
  };

  // Toggle important status
  const toggleImportant = async (id: string) => {
    if (isMock) {
      return mockApi.toggleImportant(id);
    }

    const { data, error } = await request({
      url: `/emails/${id}/important`,
      method: 'PATCH',
    });

    return { data, error };
  };

  // Send email
  const sendEmail = async (emailData: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    attachments?: File[];
  }) => {
    const formData = new FormData();
    formData.append('to', emailData.to.join(','));
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);
    
    if (emailData.cc) {
      formData.append('cc', emailData.cc.join(','));
    }
    
    if (emailData.bcc) {
      formData.append('bcc', emailData.bcc.join(','));
    }
    
    if (emailData.attachments) {
      emailData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { data: { success: true, message: 'Email sent successfully' }, error: null };
    }

    const { data, error } = await request({
      url: '/emails/send',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { data, error };
  };

  // Delete email
  const deleteEmail = async (id: string) => {
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { success: true, message: 'Email deleted successfully' }, error: null };
    }

    const { data, error } = await request({
      url: `/emails/${id}`,
      method: 'DELETE',
    });

    return { data, error };
  };

  return {
    getEmails,
    getEmailById,
    markAsRead,
    toggleStar,
    toggleImportant,
    sendEmail,
    deleteEmail,
  };
};

export default useEmailService;
