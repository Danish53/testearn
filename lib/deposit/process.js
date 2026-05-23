import { connectDB } from "@/lib/mongodb";
import {
  MIN_CONFIRMATIONS,
  MIN_DEPOSIT_USDT,
} from "@/lib/deposit/constants";
import { getBep20UsdtBalance } from "@/lib/deposit/bep20-balance";
import { detectWrongBep20Sends } from "@/lib/deposit/detect-wrong-sends";
import { parseBep20DepositTx } from "@/lib/deposit/parse-bep20-tx";
import { scanBep20Deposits } from "@/lib/deposit/scan-bep20";
import { scanTrc20Deposits } from "@/lib/deposit/scan-trc20";
import {
  listWalletAlertsForUser,
  upsertWalletAlert,
} from "@/lib/deposit/wallet-alerts";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

async function upsertAndCredit(user, incoming) {
  let deposit = await Deposit.findOne({
    network: incoming.network,
    txHash: incoming.txHash,
  });

  const belowMin = incoming.amount < MIN_DEPOSIT_USDT;
  const confirmed =
    incoming.confirmations >= MIN_CONFIRMATIONS || incoming.network === "trc20";

  if (!deposit) {
    deposit = await Deposit.create({
      userId: user._id,
      network: incoming.network,
      txHash: incoming.txHash,
      fromAddress: incoming.fromAddress,
      toAddress: incoming.toAddress,
      amount: incoming.amount,
      confirmations: incoming.confirmations,
      blockTime: incoming.blockTime,
      status: belowMin ? "below_minimum" : confirmed ? "confirmed" : "pending",
    });
  } else if (
    deposit.status === "credited" ||
    deposit.status === "below_minimum" ||
    deposit.status === "failed"
  ) {
    return { deposit, credited: false };
  } else {
    deposit.confirmations = incoming.confirmations;
    deposit.lastCheckedAt = new Date();
    if (belowMin) deposit.status = "below_minimum";
    else if (confirmed) deposit.status = "confirmed";
    else deposit.status = "pending";
    await deposit.save();
  }

  if (belowMin) {
    await upsertWalletAlert(user._id, {
      network: incoming.network,
      alertType: "below_minimum",
      txHash: incoming.txHash,
      assetSymbol: "USDT",
      amount: incoming.amount,
      message: `You sent $${incoming.amount.toFixed(2)} USDT — minimum deposit is $${MIN_DEPOSIT_USDT}. Send more USDT to reach the minimum.`,
    });
    return { deposit, credited: false };
  }

  if (deposit.status === "credited") {
    return { deposit, credited: false };
  }

  if (!confirmed) {
    return { deposit, credited: false };
  }

  user.balance = (user.balance || 0) + incoming.amount;
  user.totalDeposited = (user.totalDeposited || 0) + incoming.amount;
  await user.save();

  deposit.status = "credited";
  deposit.creditedAt = new Date();
  await deposit.save();

  return { deposit, credited: true, amount: incoming.amount };
}

/** Scan TRC20 + BEP20 for user wallet addresses and credit new deposits. */
export async function processUserDeposits(user, options = {}) {
  await connectDB();

  const trc20 = user.wallet?.trc20Address || "";
  const bep20 = user.wallet?.bep20Address || "";
  const txHash = String(options.txHash || "").trim();
  const txNetwork = options.network || "bep20";

  let txHint = null;
  let wrongAsset = null;

  const fullLookback = Number(process.env.BEP20_BLOCK_LOOKBACK) || 86400;

  const [trcIncoming, bepIncoming] = await Promise.all([
    scanTrc20Deposits(trc20),
    scanBep20Deposits(bep20, {
      lookbackBlocks: txHash ? fullLookback : undefined,
    }),
  ]);

  let incoming = [...trcIncoming, ...bepIncoming];

  if (txHash && txNetwork === "bep20" && bep20) {
    const parsed = await parseBep20DepositTx(txHash, bep20);
    if (parsed.wrongAsset) {
      wrongAsset = parsed.wrongAsset;
      txHint = parsed.message;
      await upsertWalletAlert(user._id, {
        network: "bep20",
        alertType: "wrong_bnb",
        txHash,
        assetSymbol: "BNB",
        amount: parsed.bnbAmount ?? 0,
        message: parsed.message,
      });
    } else if (parsed.ok) {
      incoming = [
        parsed.incoming,
        ...incoming.filter((i) => i.txHash.toLowerCase() !== txHash.toLowerCase()),
      ];
    } else if (parsed.message) {
      txHint = parsed.message;
    }
  }
  const results = [];
  let totalCredited = 0;
  let creditedCount = 0;

  if (!(await User.findById(user._id))) {
    return { incoming: 0, creditedCount: 0, totalCredited: 0, deposits: [] };
  }

  for (const item of incoming) {
    const freshUser = await User.findById(user._id);
    if (!freshUser) break;
    const { deposit, credited, amount } = await upsertAndCredit(freshUser, item);
    results.push(deposit);
    if (credited) {
      creditedCount += 1;
      totalCredited += amount;
    }
  }

  const updatedUser = await User.findById(user._id);

  let bep20UsdtOnChain = null;
  if (bep20) {
    try {
      bep20UsdtOnChain = await getBep20UsdtBalance(bep20);
    } catch {
      /* optional diagnostic */
    }
    try {
      const wrong = await detectWrongBep20Sends(bep20);
      for (const a of wrong) {
        await upsertWalletAlert(user._id, a);
      }
    } catch (err) {
      console.warn("detectWrongBep20Sends:", err.message);
    }

    if (
      bep20UsdtOnChain > 0 &&
      bepIncoming.length === 0 &&
      !txHash &&
      creditedCount === 0
    ) {
      const minNote =
        bep20UsdtOnChain < MIN_DEPOSIT_USDT
          ? ` Minimum deposit is $${MIN_DEPOSIT_USDT} USDT — your on-chain $${bep20UsdtOnChain.toFixed(2)} will show as below minimum.`
          : "";
      await upsertWalletAlert(user._id, {
        network: "bep20",
        alertType: "wrong_token",
        txHash: `balance-${bep20.slice(0, 10).toLowerCase()}`,
        assetSymbol: "USDT",
        amount: bep20UsdtOnChain,
        message: `We detect $${bep20UsdtOnChain.toFixed(2)} USDT on your BEP20 address on BSC, but auto-scan could not load the transfer (add BSCSCAN_API_KEY or paste tx hash from BscScan → Token Transfers).${minNote}`,
      });
      // if (!txHint) {
      //   txHint = `On-chain balance: $${bep20UsdtOnChain.toFixed(2)} USDT detected.${minNote} Paste transaction hash and tap Scan, or add BSCSCAN_API_KEY in server env.`;
      // }
    }
  }

  const alerts = await listWalletAlertsForUser(user._id);

  return {
    incoming: incoming.length,
    trc20Found: trcIncoming.length,
    bep20Found: bepIncoming.length,
    bep20UsdtOnChain,
    creditedCount,
    totalCredited,
    balance: updatedUser?.balance ?? 0,
    deposits: results.slice(0, 10),
    scannedAt: new Date().toISOString(),
    txHint,
    wrongAsset,
    alerts,
  };
}
