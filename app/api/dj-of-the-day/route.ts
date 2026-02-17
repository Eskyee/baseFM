import { NextResponse } from 'next/server';
import { getDJOfTheDay, getTopDJs } from '@/lib/db/dj-stats';

export async function GET() {
  try {
    // Try to get today's featured DJ
    const djOfTheDay = await getDJOfTheDay();

    if (djOfTheDay) {
      return NextResponse.json({ djOfTheDay });
    }

    // If no DJ of the day set, return a random top DJ
    const topDJs = await getTopDJs(5);

    if (topDJs.length > 0) {
      const randomIndex = Math.floor(Math.random() * topDJs.length);
      const dj = topDJs[randomIndex];

      return NextResponse.json({
        djOfTheDay: {
          dj,
          reason: 'Top DJ',
        },
      });
    }

    return NextResponse.json({ djOfTheDay: null });
  } catch (error) {
    console.error('Error fetching DJ of the day:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJ of the day' },
      { status: 500 }
    );
  }
}
