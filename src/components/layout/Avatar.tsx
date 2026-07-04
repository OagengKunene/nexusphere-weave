type Props = { name: string; hue?: number; size?: number };

export function Avatar({ name, hue = 120, size = 40 }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="shrink-0 grid place-items-center font-display"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: `oklch(0.32 0.08 ${hue})`,
        color: `oklch(0.96 0.06 ${hue})`,
        fontSize: size * 0.42,
        border: "1px solid oklch(0.45 0.09 " + hue + " / 0.6)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
