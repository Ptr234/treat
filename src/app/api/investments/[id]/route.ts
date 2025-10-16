import { NextRequest, NextResponse } from 'next/server';
import { getAllInvestmentsWithContacts } from '../../../../data/investments/optimized';
import { getAllComprehensiveInvestmentsWithContacts } from '../../../../data/investments/comprehensive';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const comprehensive = searchParams.get('comprehensive') === 'true';

    // Get investments data
    const investments = comprehensive 
      ? getAllComprehensiveInvestmentsWithContacts()
      : getAllInvestmentsWithContacts();

    // Find the specific investment
    const resolvedParams = await params;
    const investment = investments.find(inv => inv.id === resolvedParams.id);

    if (!investment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Investment not found',
          message: `Investment with ID ${resolvedParams.id} does not exist`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: investment
    });

  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch investment',
        message: 'An error occurred while retrieving the investment opportunity'
      },
      { status: 500 }
    );
  }
}