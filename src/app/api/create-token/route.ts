import { NextResponse } from "next/server";
import { z } from "zod";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const schema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1).max(8),
  decimals: z.number().int().min(0).max(30).default(18),
  premint: z.string().regex(/^\d+$/).default("0"),
  premintTo: z.string().startsWith("0x").length(42),
});

const FACTORY_ABI = [
  {
    type: "function",
    name: "create",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name_", type: "string" },
      { name: "symbol_", type: "string" },
      { name: "decimals_", type: "uint8" },
      { name: "premint_", type: "uint256" },
      { name: "premintTo_", type: "address" },
    ],
    outputs: [{ type: "address", name: "token" }],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, symbol, decimals, premint, premintTo } = schema.parse(body);

    const account = privateKeyToAccount(
      process.env.MINTER_PRIVATE_KEY as `0x${string}`
    );
    const chain = defineChain({
      id: Number(process.env.CHAIN_ID),
      name: "World Chain Sepolia Testnet",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: [process.env.RPC_URL!] },
      },
    });

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(process.env.RPC_URL!),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.RPC_URL!),
    });

    const txHash = await walletClient.writeContract({
      address: process.env.FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "create",
      args: [
        name,
        symbol,
        decimals,
        BigInt(premint),
        premintTo as `0x${string}`,
      ],
    });

    // Wait for transaction to be mined and get the receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Extract the token address from the logs
    const tokenAddress = receipt.logs[0]?.address;

    return NextResponse.json({
      txHash,
      tokenAddress: tokenAddress || null,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
