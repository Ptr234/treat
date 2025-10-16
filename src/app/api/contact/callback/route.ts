import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'preferredTime'];
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

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
    if (!phoneRegex.test(body.phone.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number',
          message: 'Please provide a valid phone number'
        },
        { status: 400 }
      );
    }

    // Generate callback request ID
    const callbackId = `CB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Parse preferred time
    const preferredTime = new Date(body.preferredTime);
    const now = new Date();
    
    if (preferredTime <= now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid preferred time',
          message: 'Preferred callback time must be in the future'
        },
        { status: 400 }
      );
    }

    // Determine urgency based on time difference
    const timeDifference = preferredTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    let urgency = 'normal';
    if (hoursDifference < 24) urgency = 'high';
    else if (hoursDifference < 72) urgency = 'medium';

    // In a real application, you would:
    // 1. Save callback request to database
    // 2. Add to call center queue
    // 3. Send confirmation SMS
    // 4. Set up calendar reminders
    // 5. Integrate with CRM system

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const callbackData = {
      callbackId,
      status: 'scheduled',
      scheduledAt: new Date().toISOString(),
      preferredTime: preferredTime.toISOString(),
      urgency,
      contact: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        timezone: body.timezone || 'Africa/Kampala'
      },
      purpose: body.purpose || 'General inquiry',
      investmentId: body.investmentId || null,
      notes: body.notes || null,
      estimatedDuration: '15-30 minutes',
      confirmationMethod: body.email ? 'email_and_sms' : 'sms_only'
    };

    return NextResponse.json({
      success: true,
      data: callbackData,
      message: `Callback scheduled successfully. You will receive a call at ${preferredTime.toLocaleString('en-US', { timeZone: 'Africa/Kampala' })} (Kampala time).`
    });

  } catch (error) {
    console.error('Error scheduling callback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule callback',
        message: 'An error occurred while scheduling your callback. Please try again.'
      },
      { status: 500 }
    );
  }
}