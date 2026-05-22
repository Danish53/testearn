import Image from "next/image";
import { LOGO_PATH, PLATFORM_NAME } from "@/lib/brand";

const SIZE = {
  sm: "h-8 w-8",
  md: "h-9 w-9 sm:h-10 sm:w-10",
  lg: "h-11 w-11",
};

/**
 * Solar Earning logo mark — SVG in /public/logo.svg
 */
export default function BrandMark({
  size = "md",
  className = "",
  priority = false,
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-xl bg-[#071018] ring-1 ring-solar-accent/35 shadow-[0_0_20px_-6px_rgba(31,172,238,0.55)] ${SIZE[size] ?? SIZE.md} ${className}`}
      aria-hidden
    >
      <Image
        src={LOGO_PATH}
        alt=""
        fill
        className="object-cover p-0.5"
        sizes="44px"
        priority={priority}
      />
    </span>
  );
}

export { PLATFORM_NAME };
