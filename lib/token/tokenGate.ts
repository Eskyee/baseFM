import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

const ERC20_ABI = [
  {
    name: 'balanceOf',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ERC721_ABI = [
  {
    name: 'balanceOf',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface TokenCheckResult {
  hasAccess: boolean;
  balance: string;
  requiredAmount: string;
  tokenSymbol?: string;
}

export async function checkERC20Balance(
  tokenAddress: string,
  walletAddress: string,
  requiredAmount: number
): Promise<TokenCheckResult> {
  try {
    const [balance, decimals, symbol] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      }),
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
    ]);

    const requiredAmountWithDecimals = BigInt(requiredAmount) * BigInt(10 ** decimals);
    const hasAccess = balance >= requiredAmountWithDecimals;

    return {
      hasAccess,
      balance: (balance / BigInt(10 ** decimals)).toString(),
      requiredAmount: requiredAmount.toString(),
      tokenSymbol: symbol,
    };
  } catch (error) {
    console.error('Error checking ERC20 balance:', error);
    return {
      hasAccess: false,
      balance: '0',
      requiredAmount: requiredAmount.toString(),
    };
  }
}

export async function checkERC721Balance(
  tokenAddress: string,
  walletAddress: string,
  requiredAmount: number = 1
): Promise<TokenCheckResult> {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    const hasAccess = balance >= BigInt(requiredAmount);

    return {
      hasAccess,
      balance: balance.toString(),
      requiredAmount: requiredAmount.toString(),
    };
  } catch (error) {
    console.error('Error checking ERC721 balance:', error);
    return {
      hasAccess: false,
      balance: '0',
      requiredAmount: requiredAmount.toString(),
    };
  }
}

export async function checkTokenAccess(
  tokenAddress: string,
  walletAddress: string,
  requiredAmount: number,
  tokenType: 'ERC20' | 'ERC721' = 'ERC20'
): Promise<TokenCheckResult> {
  if (tokenType === 'ERC721') {
    return checkERC721Balance(tokenAddress, walletAddress, requiredAmount);
  }
  return checkERC20Balance(tokenAddress, walletAddress, requiredAmount);
}
