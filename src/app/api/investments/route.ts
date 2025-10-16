import { NextRequest, NextResponse } from 'next/server';
import { getAllInvestmentsWithContacts } from '../../../data/investments/optimized';
import { getAllComprehensiveInvestmentsWithContacts } from '../../../data/investments/comprehensive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comprehensive = searchParams.get('comprehensive') === 'true';
    const category = searchParams.get('category');
    const sector = searchParams.get('sector');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get investments data
    let investments = comprehensive 
      ? getAllComprehensiveInvestmentsWithContacts()
      : getAllInvestmentsWithContacts();

    // Apply filters
    if (category && category !== 'all') {
      investments = investments.filter(inv => 
        inv.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (sector && sector !== 'all') {
      investments = investments.filter(inv => 
        inv.sector.toLowerCase().includes(sector.toLowerCase())
      );
    }

    if (priority && priority !== 'all') {
      investments = investments.filter(inv => inv.priority === priority);
    }

    // Apply pagination
    const total = investments.length;
    const paginatedInvestments = investments.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedInvestments,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch investments',
        message: 'An error occurred while retrieving investment opportunities'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields for investment application
    const requiredFields = ['name', 'email', 'phone', 'investmentId', 'investmentAmount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields',
            message: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // In a real application, you would save this to a database
    // For now, we'll just simulate the application submission
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        message: 'Investment application submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error submitting investment application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit application',
        message: 'An error occurred while submitting your investment application'
      },
      { status: 500 }
    );
  }
}