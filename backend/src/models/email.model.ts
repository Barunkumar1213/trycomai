import { Schema, model, Document } from 'mongoose';

export interface IEmail extends Document {
  gmailId: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  snippet: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  priority: 'low' | 'normal' | 'high';
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums' | 'reservations' | 'purchases';
  hasAttachments: boolean;
  receivedAt: Date;
  scheduledAt?: Date;
  userId: Schema.Types.ObjectId;
  metadata: Record<string, any>;
}

const emailSchema = new Schema<IEmail>(
  {
    gmailId: { type: String, required: true, unique: true },
    threadId: { type: String, required: true },
    subject: { type: String, required: true },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    body: { type: String, required: true },
    snippet: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    labels: [{ type: String }],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['primary', 'social', 'promotions', 'updates', 'forums', 'reservations', 'purchases'],
      default: 'primary',
    },
    hasAttachments: { type: Boolean, default: false },
    receivedAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
emailSchema.index({ userId: 1, receivedAt: -1 });
emailSchema.index({ userId: 1, threadId: 1 });
emailSchema.index({ userId: 1, priority: 1 });
emailSchema.index({ userId: 1, category: 1 });

export default model<IEmail>('Email', emailSchema);
