import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Change to "payment" for one-time payments
      line_items: [
        {
          price: "price_1RsMCe5f4z8LFodpng1OVGfv", // 🚨 REPLACE with your actual Price ID from Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin') || 'http://localhost:3001'}/success`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3001'}/cancel`,
      // Optional: Add customer email and metadata
      // customer_email: 'customer@example.com',
      // metadata: {
      //   userId: 'user_123',
      // },
    });

    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' }, 
      { status: 500 }
    );
  }
} 