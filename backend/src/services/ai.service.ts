import OpenAI from 'openai';
import { IEmail } from '../models/email.model';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateReplySuggestion(email: IEmail, context?: string): Promise<{suggestion: string; tone: 'professional' | 'friendly' | 'formal' | 'casual'}> {
    try {
      const prompt = this.buildPrompt(email, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI email assistant that helps users write better email responses. Generate a concise and appropriate email reply based on the context provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || 'I will get back to you soon with more details.';
      
      // Extract tone from the response or determine it based on content
      const tone = this.determineTone(content);
      
      return {
        suggestion: content,
        tone
      };
    } catch (error) {
      console.error('Error generating reply suggestion:', error);
      return {
        suggestion: 'Thank you for your email. I will get back to you soon with more details.',
        tone: 'professional'
      };
    }
  }

  async analyzeEmailPriority(email: IEmail): Promise<{priority: 'low' | 'normal' | 'high'; category: string; summary: string}> {
    try {
      const prompt = `Analyze the following email and determine its priority (low, normal, high) and category. Also provide a brief summary.

Subject: ${email.subject}
From: ${email.from}
Body: ${email.body.substring(0, 2000)}...

Respond in JSON format: {"priority": "low|normal|high", "category": "work|personal|newsletter|notification|other", "summary": "brief summary"}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes emails to determine their priority, category, and provides a summary.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      
      return {
        priority: result.priority || 'normal',
        category: result.category || 'other',
        summary: result.summary || 'No summary available.'
      };
    } catch (error) {
      console.error('Error analyzing email priority:', error);
      return {
        priority: 'normal',
        category: 'other',
        summary: 'Unable to analyze email content.'
      };
    }
  }

  private buildPrompt(email: IEmail, context?: string): string {
    let prompt = `You received the following email:

From: ${email.from}
Subject: ${email.subject}

${email.body.substring(0, 2000)}`;

    if (context) {
      prompt += `\n\nAdditional context: ${context}`;
    }

    prompt += '\n\nPlease draft a response to this email. ';
    prompt += 'Keep it concise, professional, and address all points mentioned in the email. ';
    prompt += 'If the email contains questions, make sure to answer them. ';
    prompt += 'If it requires specific information you might not have, indicate that you will follow up with the details.';

    return prompt;
  }

  private determineTone(content: string): 'professional' | 'friendly' | 'formal' | 'casual' {
    // Simple heuristic to determine the tone of the response
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('hi') || lowerContent.includes('hello') || lowerContent.includes('hey')) {
      if (lowerContent.includes('!') || lowerContent.includes(':)') || lowerContent.includes(':-)')) {
        return 'friendly';
      }
      return 'professional';
    }
    
    if (lowerContent.includes('dear') || lowerContent.includes('sincerely') || lowerContent.includes('regards')) {
      return 'formal';
    }
    
    if (lowerContent.includes("i'm") || lowerContent.includes("i've") || lowerContent.includes("i'll")) {
      return 'casual';
    }
    
    return 'professional';
  }
}
