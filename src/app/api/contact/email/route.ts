import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: `The following fields are required: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Generate inquiry ID
    const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // In a real application, you would:
    // 1. Send email using a service like SendGrid, Mailgun, or AWS SES
    // 2. Save inquiry to database
    // 3. Send auto-reply to sender
    // 4. Notify relevant team members

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For now, we'll simulate the email being sent
    const emailData = {
      inquiryId,
      status: 'sent',
      sentAt: new Date().toISOString(),
      from: body.email,
      to: 'investments@onestopcentre.ug',
      subject: body.subject,
      category: body.category || 'general',
      priority: body.investmentId ? 'high' : 'normal',
      autoReplyEnabled: true,
      expectedResponseTime: '24-48 hours'
    };

    return NextResponse.json({
      success: true,
      data: emailData,
      message: 'Email sent successfully. You will receive a response within 24-48 hours.'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        message: 'An error occurred while sending your message. Please try again.'
      },
      { status: 500 }
    );
  }
}