"use client";

import Image from "next/image";

export default function DepositQrCode({ address, networkLabel }) {
  if (!address) {
    return (
      <div className="mx-auto flex aspect-square w-full max-w-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center text-xs text-slate-500">
        Verify account to show QR
      </div>
    );
  }

  const src = `/api/deposit/qr?text=${encodeURIComponent(address)}`;

  return (
    <div className="mx-auto flex w-full max-w-[240px] flex-col items-center lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white p-2 shadow-lg ring-1 ring-solar-accent/20">
        <Image
          src={src}
          alt={`USDT ${networkLabel} deposit QR`}
          width={220}
          height={220}
          unoptimized
          className="aspect-square h-auto w-full max-w-[220px]"
        />
      </div>
      <p className="mt-2 px-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
        Scan with Trust Wallet · Binance · MetaMask
      </p>
    </div>
  );
}
