import nodemailer from 'nodemailer';
import crypto from 'crypto';

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        secure: true
      });
    } else {
      // Development mode - use mock transporter
      return nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendVerificationEmail(email, verificationCode, type = 'registration') {
    // Add timeout for email sending
    const sendWithTimeout = (promise, timeout = 10000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout')), timeout)
        )
      ]);
    };

    const subject = type === 'registration' 
      ? 'Verify your OneStopCentre account'
      : 'Your login verification code';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OneStopCentre Uganda</h1>
          </div>
          <div class="content">
            <h2>${type === 'registration' ? 'Welcome!' : 'Sign In Verification'}</h2>
            <p>
              ${type === 'registration' 
                ? 'Thank you for registering with OneStopCentre Uganda. To complete your registration, please use the verification code below:'
                : 'You requested to sign in to your OneStopCentre account. Please use the verification code below:'}
            </p>
            <div class="code-box">
              <div class="code">${verificationCode}</div>
            </div>
            <p><strong>Important:</strong> This verification code will expire in 10 minutes for your security.</p>
            <p>If you didn't request this ${type === 'registration' ? 'registration' : 'sign in'}, please ignore this email.</p>
            <div class="footer">
              <p>&copy; 2024 OneStopCentre Uganda. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      OneStopCentre Uganda - ${subject}
      
      ${type === 'registration' 
        ? 'Thank you for registering with OneStopCentre Uganda. To complete your registration, please use the verification code below:'
        : 'You requested to sign in to your OneStopCentre account. Please use the verification code below:'}
      
      Verification Code: ${verificationCode}
      
      Important: This verification code will expire in 10 minutes for your security.
      
      If you didn't request this ${type === 'registration' ? 'registration' : 'sign in'}, please ignore this email.
      
      © 2024 OneStopCentre Uganda. All rights reserved.
      This is an automated message, please do not reply to this email.
    `;

    try {
      const emailPromise = this.transporter.sendMail({
        from: `"OneStopCentre Uganda" <${process.env.EMAIL_USER || 'noreply@onestopcentre.ug'}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      const info = await sendWithTimeout(emailPromise, 8000); // 8 second timeout

      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 [DEV] Email sent:', {
          to: email,
          subject: subject,
          code: verificationCode,
          messageId: info.messageId
        });
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // In development, still return success to avoid blocking registration
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 [DEV] Mock email sent (actual sending failed):', {
          to: email,
          code: verificationCode,
          error: error.message
        });
        return { success: true, messageId: 'mock-' + Date.now() };
      }
      
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to OneStopCentre Uganda!';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .cta { background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OneStopCentre Uganda</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${firstName}!</h2>
            <p>Your OneStopCentre Uganda account has been successfully verified and activated.</p>
            <p>You now have access to:</p>
            <ul>
              <li>Business registration services</li>
              <li>Investment opportunities</li>
              <li>Government agency directory</li>
              <li>Professional support tools</li>
              <li>Tax calculators and more</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'https://oscdigitaltool.com'}" class="cta">Start Exploring</a>
            <div class="footer">
              <p>&copy; 2024 OneStopCentre Uganda. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"OneStopCentre Uganda" <${process.env.EMAIL_USER || 'noreply@onestopcentre.ug'}>`,
        to: email,
        subject: subject,
        html: htmlContent
      });
      
      return { success: true };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return { success: false };
    }
  }
}

export default new EmailService();