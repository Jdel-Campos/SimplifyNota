"use client";

export function Header() {
  return (
    <header className="border-b border-white/40 backdrop-blur sticky top-0 z-20">
      <div className="container-app flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600" />
          <span className="font-semibold">SimplifyNota</span>
        </div>
        <nav className="text-sm text-gray-600">
          <a className="hover:text-gray-900 transition" href="#">
            Documentação
          </a>
        </nav>
      </div>
    </header>
  );
};