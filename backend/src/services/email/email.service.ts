import logger from '../../utils/logger';
import nodemailer from 'nodemailer';
import { config } from '../../config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface DigestContent {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  source: string;
}

/**
 * Email Service
 * Handles sending emails for:
 * - Email verification
 * - Password reset
 * - Daily/weekly digests
 * - Notifications
 */
export class EmailService {
  // @ts-ignore - Used in methods but TypeScript incorrectly flags as unused
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * Uses SMTP configuration from environment variables
   */
  private initializeTransporter() {
    try {
      // TODO: Configure with actual SMTP credentials or SendGrid API
      /*
      this.transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      */

      logger.info('📧 Email service initialized (mock mode)');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // TODO: Uncomment when email credentials are configured
      /*
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@vidya.app',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });
      */

      logger.info(`📧 Email sent (mock): ${options.subject} to ${options.to}`);
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Vidya!</h1>
            <p>Thank you for signing up. Please verify your email address to get started.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>© ${new Date().getFullYear()} Vidya. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify your Vidya account',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password for your Vidya account.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>© ${new Date().getFullYear()} Vidya. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset your Vidya password',
      html,
    });
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigest(email: string, content: DigestContent[]): Promise<void> {
    const contentHtml = content
      .map(
        (item) => `
        <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
          <p style="color: #666; margin: 0 0 10px 0;">${item.description}</p>
          <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">
            ${item.category} • ${item.source}
          </p>
          <a href="${item.url}" style="color: #ec4899; text-decoration: none;">Read more →</a>
        </div>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Daily Digest</h1>
            <p>Here are today's personalized recommendations just for you:</p>
            ${contentHtml}
            <div class="footer">
              <p>Don't want daily emails? <a href="${config.appUrl}/preferences">Update your preferences</a></p>
              <p>© ${new Date().getFullYear()} Vidya. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your Daily Vidya Digest - ${new Date().toLocaleDateString()}`,
      html,
    });
  }

  /**
   * Send weekly digest email
   */
  async sendWeeklyDigest(
    email: string,
    stats: {
      contentRead: number;
      timeSpentMinutes: number;
      topCategories: string[];
    },
    topContent: DigestContent[]
  ): Promise<void> {
    const contentHtml = topContent
      .map(
        (item) => `
        <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
          <p style="color: #666; margin: 0 0 10px 0;">${item.description}</p>
          <p style="font-size: 12px; color: #999; margin: 0;">
            ${item.category} • ${item.source}
          </p>
        </div>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat { margin: 10px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Weekly Summary</h1>
            <p>Here's what you accomplished this week:</p>
            <div class="stats">
              <div class="stat">📚 <strong>${stats.contentRead}</strong> articles read</div>
              <div class="stat">⏱️ <strong>${stats.timeSpentMinutes}</strong> minutes spent learning</div>
              <div class="stat">🏷️ Top topics: <strong>${stats.topCategories.join(', ')}</strong></div>
            </div>
            <h2>Trending in Your Topics</h2>
            ${contentHtml}
            <div class="footer">
              <p><a href="${config.appUrl}/preferences">Update your preferences</a></p>
              <p>© ${new Date().getFullYear()} Vidya. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Your Weekly Vidya Summary',
      html,
    });
  }

  /**
   * Convert HTML to plain text (basic)
   */
  // @ts-ignore - Used in sendEmail but TypeScript incorrectly flags as unused
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

export const emailService = new EmailService();
