"use client";

export default function ErrorState({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05060a] px-6">
      <p className="stat-num text-2xl text-[#ece8e1]">Algo falhou</p>
      <button
        type="button"
        onClick={reset}
        className="clip-btn bg-[#ff4655] px-5 py-2 text-sm font-semibold text-[#07080c]"
      >
        Tentar outra vez
      </button>
    </div>
  );
}
