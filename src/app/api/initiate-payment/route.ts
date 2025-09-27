import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameName, amount, currency } = body;
    
    const uuid = crypto.randomUUID().replace(/-/g, '');

    // TODO: Store the ID field in your database so you can verify the payment later
    // For now, we'll just log the payment details
    console.log('Payment initiated:', {
      id: uuid,
      gameName,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      id: uuid,
      gameName,
      amount,
      currency 
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
