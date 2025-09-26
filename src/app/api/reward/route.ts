import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const schema = z.object({
  token: z.string().startsWith("0x").length(42),
  player: z.string().startsWith("0x").length(42),
  amount: z.string().regex(/^\d+(\.\d+)?$/), // human units
  decimals: z.number().int().min(0).max(30).optional(),
});

const ERC20_MINTER_ABI = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, player, amount, decimals } = schema.parse(body);

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

    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.RPC_URL!),
    });
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(process.env.RPC_URL!),
    });

    const dec =
      decimals ??
      (await publicClient.readContract({
        address: token as `0x${string}`,
        abi: ERC20_MINTER_ABI,
        functionName: "decimals",
      }));
    const weiAmount = parseUnits(amount, Number(dec));

    const txHash = await walletClient.writeContract({
      address: token as `0x${string}`,
      abi: ERC20_MINTER_ABI,
      functionName: "mint",
      args: [player as `0x${string}`, weiAmount],
    });

    return NextResponse.json({ txHash });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
