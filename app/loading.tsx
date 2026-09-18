export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#05060a]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4655]" />
      <p className="stat-num text-sm tracking-[0.4em] text-[#ff4655]">A CARREGAR</p>
    </div>
  );
}
