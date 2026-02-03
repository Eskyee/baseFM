// Server-side Onchain Minter for Base
// Mints ERC-20, ERC-721, and ERC-1155 tokens

import { createWalletClient, http, encodeFunctionData, parseAbi } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import type { OnchainPerk } from '@/lib/shopify/config';
import { publicClient } from '@/lib/viem/client';

// Server signer private key (MUST be kept secret)
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY as `0x${string}` | undefined;

// Get minter account and wallet client
function getMinterAccount(): PrivateKeyAccount {
  if (!MINTER_PRIVATE_KEY) {
    throw new Error('MINTER_PRIVATE_KEY is not configured');
  }
  return privateKeyToAccount(MINTER_PRIVATE_KEY);
}

function getWalletClient(account: PrivateKeyAccount) {
  return createWalletClient({
    account,
    chain: base,
    transport: http(),
  });
}

export interface MintResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// ABI fragments for minting
const MINT_ABIS = {
  ERC20: parseAbi([
    'function mint(address to, uint256 amount) external',
    'function transfer(address to, uint256 amount) external returns (bool)',
  ]),
  ERC721: parseAbi([
    'function mint(address to) external returns (uint256)',
    'function safeMint(address to) external returns (uint256)',
    'function mintTo(address to) external returns (uint256)',
  ]),
  ERC1155: parseAbi([
    'function mint(address to, uint256 id, uint256 amount, bytes data) external',
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
  ]),
};

// Mint a perk to a wallet address
export async function mintPerk(
  toAddress: `0x${string}`,
  perk: OnchainPerk
): Promise<MintResult> {
  console.log(`Minting ${perk.type} perk to ${toAddress}...`);

  try {
    const account = getMinterAccount();
    const walletClient = getWalletClient(account);
    let txHash: `0x${string}`;

    switch (perk.type) {
      case 'ERC20':
        txHash = await mintERC20(walletClient, account, toAddress, perk.contractAddress, perk.amount!);
        break;
      case 'ERC721':
        txHash = await mintERC721(walletClient, account, toAddress, perk.contractAddress);
        break;
      case 'ERC1155':
        txHash = await mintERC1155(
          walletClient,
          account,
          toAddress,
          perk.contractAddress,
          perk.tokenId!,
          perk.amount || BigInt(1)
        );
        break;
      default:
        throw new Error(`Unknown perk type: ${perk.type}`);
    }

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === 'reverted') {
      return {
        success: false,
        txHash,
        error: 'Transaction reverted',
      };
    }

    console.log(`Minted ${perk.type} perk, tx: ${txHash}`);
    return { success: true, txHash };
  } catch (error) {
    console.error(`Failed to mint ${perk.type} perk:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mint ERC-20 tokens
async function mintERC20(
  walletClient: ReturnType<typeof getWalletClient>,
  account: PrivateKeyAccount,
  to: `0x${string}`,
  contractAddress: `0x${string}`,
  amount: bigint
): Promise<`0x${string}`> {
  // Try mint function first
  try {
    const data = encodeFunctionData({
      abi: MINT_ABIS.ERC20,
      functionName: 'mint',
      args: [to, amount],
    });

    return await walletClient.sendTransaction({
      to: contractAddress,
      data,
      account,
      chain: base,
    });
  } catch {
    // Fallback to transfer (if minter holds tokens)
    const data = encodeFunctionData({
      abi: MINT_ABIS.ERC20,
      functionName: 'transfer',
      args: [to, amount],
    });

    return await walletClient.sendTransaction({
      to: contractAddress,
      data,
      account,
      chain: base,
    });
  }
}

// Mint ERC-721 NFT
async function mintERC721(
  walletClient: ReturnType<typeof getWalletClient>,
  account: PrivateKeyAccount,
  to: `0x${string}`,
  contractAddress: `0x${string}`
): Promise<`0x${string}`> {
  // Try different mint function signatures
  const mintFunctions = ['mint', 'safeMint', 'mintTo'];

  for (const funcName of mintFunctions) {
    try {
      const data = encodeFunctionData({
        abi: MINT_ABIS.ERC721,
        functionName: funcName as 'mint' | 'safeMint' | 'mintTo',
        args: [to],
      });

      return await walletClient.sendTransaction({
        to: contractAddress,
        data,
        account,
        chain: base,
      });
    } catch {
      continue;
    }
  }

  throw new Error('No compatible mint function found on ERC-721 contract');
}

// Mint ERC-1155 token
async function mintERC1155(
  walletClient: ReturnType<typeof getWalletClient>,
  account: PrivateKeyAccount,
  to: `0x${string}`,
  contractAddress: `0x${string}`,
  tokenId: bigint,
  amount: bigint
): Promise<`0x${string}`> {
  const data = encodeFunctionData({
    abi: MINT_ABIS.ERC1155,
    functionName: 'mint',
    args: [to, tokenId, amount, '0x'],
  });

  return await walletClient.sendTransaction({
    to: contractAddress,
    data,
    account,
    chain: base,
  });
}

// Check if wallet owns a specific NFT/token
export async function checkOwnership(
  walletAddress: `0x${string}`,
  contractAddress: `0x${string}`,
  tokenType: 'ERC20' | 'ERC721' | 'ERC1155',
  tokenId?: bigint
): Promise<bigint> {
  const balanceAbi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
    'function balanceOf(address owner, uint256 id) view returns (uint256)',
  ]);

  if (tokenType === 'ERC1155' && tokenId !== undefined) {
    return await publicClient.readContract({
      address: contractAddress,
      abi: balanceAbi,
      functionName: 'balanceOf',
      args: [walletAddress, tokenId],
    }) as bigint;
  }

  return await publicClient.readContract({
    address: contractAddress,
    abi: balanceAbi,
    functionName: 'balanceOf',
    args: [walletAddress],
  }) as bigint;
}
