import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const REFERRAL_REWARD_RAVE = 500; // RAVE reward for successful referral

// GET /api/account/referral - Get referral code and stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    // Check if user has a referral code
    const { data: existingCode } = await supabase
      .from('agent_referrals')
      .select('*')
      .eq('referrer_wallet', walletAddress.toLowerCase())
      .single();

    if (existingCode) {
      // Get referral stats
      const { count: totalReferrals } = await supabase
        .from('agent_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_wallet', walletAddress.toLowerCase())
        .not('referred_wallet', 'is', null);

      const { data: rewardSum } = await supabase
        .from('agent_referrals')
        .select('reward_rave')
        .eq('referrer_wallet', walletAddress.toLowerCase())
        .eq('reward_claimed', true);

      const totalRewards = rewardSum?.reduce((sum, r) => sum + (r.reward_rave || 0), 0) || 0;

      return NextResponse.json({
        code: existingCode.code,
        referralUrl: `https://basefm.space/?ref=${existingCode.code}`,
        stats: {
          totalReferrals: totalReferrals || 0,
          totalRewardsEarned: totalRewards,
          rewardPerReferral: REFERRAL_REWARD_RAVE,
        },
      });
    }

    // Generate new referral code
    const code = `RAF${randomBytes(4).toString('hex').toUpperCase()}`;

    const { error } = await supabase
      .from('agent_referrals')
      .insert({
        referrer_wallet: walletAddress.toLowerCase(),
        code,
      });

    if (error) {
      // Table might not exist yet, return placeholder
      return NextResponse.json({
        code: null,
        message: 'Referral system coming soon',
        rewardPerReferral: REFERRAL_REWARD_RAVE,
      });
    }

    return NextResponse.json({
      code,
      referralUrl: `https://basefm.space/?ref=${code}`,
      stats: {
        totalReferrals: 0,
        totalRewardsEarned: 0,
        rewardPerReferral: REFERRAL_REWARD_RAVE,
      },
    });
  } catch (error) {
    console.error('Error fetching referral:', error);
    // Return graceful response if referral table doesn't exist
    return NextResponse.json({
      code: null,
      message: 'Referral system coming soon',
      rewardPerReferral: REFERRAL_REWARD_RAVE,
    });
  }
}

// POST /api/account/referral - Apply a referral code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, referralCode } = body;

    if (!walletAddress || !referralCode) {
      return NextResponse.json(
        { error: 'Wallet address and referral code required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Find the referral code
    const { data: referral } = await supabase
      .from('agent_referrals')
      .select('*')
      .eq('code', referralCode.toUpperCase())
      .single();

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if user already used a referral
    const { data: existingReferral } = await supabase
      .from('agent_referrals')
      .select('*')
      .eq('referred_wallet', walletAddress.toLowerCase())
      .single();

    if (existingReferral) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Can't refer yourself
    if (referral.referrer_wallet === walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Record the referral
    await supabase
      .from('agent_referrals')
      .insert({
        referrer_wallet: referral.referrer_wallet,
        referred_wallet: walletAddress.toLowerCase(),
        code: referralCode.toUpperCase(),
        reward_rave: REFERRAL_REWARD_RAVE,
      });

    return NextResponse.json({
      success: true,
      message: `Referral applied! Both you and the referrer will receive ${REFERRAL_REWARD_RAVE} RAVE when you create an agent.`,
      reward: REFERRAL_REWARD_RAVE,
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}
