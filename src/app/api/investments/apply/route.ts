import { NextRequest, NextResponse } from 'next/server';
import { getAllInvestmentsWithContacts } from '../../../../data/investments/optimized';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'investmentId',
      'investorType',
      'experience',
      'investmentGoal',
      'investmentAmount',
      'timeHorizon',
      'riskTolerance',
      'primarySector',
      'name',
      'email',
      'phone',
      'nationality',
      'capitalSource',
      'timeframe'
    ];

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

    // Validate investment exists
    const investments = getAllInvestmentsWithContacts();
    const investment = investments.find(inv => inv.id === body.investmentId);
    
    if (!investment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Investment not found',
          message: 'The specified investment opportunity does not exist'
        },
        { status: 404 }
      );
    }

    // Generate application ID and reference number
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const referenceNumber = `REF-${investment.sector.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Simulate application processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Notify relevant agencies
    // 4. Generate PDF application
    // 5. Integrate with government systems

    // Simulate success response
    const applicationData = {
      applicationId,
      referenceNumber,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      investment: {
        id: investment.id,
        title: investment.title,
        category: investment.category,
        contactAgency: investment.contact.agency
      },
      applicant: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        nationality: body.nationality,
        investorType: body.investorType
      },
      investmentDetails: {
        amount: body.investmentAmount,
        timeHorizon: body.timeHorizon,
        primarySector: body.primarySector,
        riskTolerance: body.riskTolerance
      },
      nextSteps: [
        'Application review by investment team (2-3 business days)',
        'Initial screening and due diligence',
        'Contact from relevant government agency',
        'Detailed investment consultation',
        'Documentation and legal requirements',
        'Final approval and project initiation'
      ],
      estimatedProcessingTime: '5-10 business days',
      contactInfo: {
        agency: investment.contact.agency,
        email: investment.contact.email,
        phone: investment.contact.phone
      }
    };

    return NextResponse.json({
      success: true,
      data: applicationData,
      message: 'Investment application submitted successfully'
    });

  } catch (error) {
    console.error('Error processing investment application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Application processing failed',
        message: 'An error occurred while processing your investment application. Please try again.'
      },
      { status: 500 }
    );
  }
}