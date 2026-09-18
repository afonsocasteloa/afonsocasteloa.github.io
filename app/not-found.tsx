export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05060a] px-6">
      <p className="stat-num text-2xl text-[#ece8e1]">Página em falta</p>
      <a href="/" className="clip-btn bg-[#ff4655] px-5 py-2 text-sm font-semibold text-[#07080c]">
        Voltar ao perfil
      </a>
    </div>
  );
}
