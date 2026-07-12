import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CalendarClock, Menu, X } from "lucide-react";
import { whatsappLink, GENERIC_MESSAGE } from "../../lib/whatsapp";

// Links de âncora vivem na home; Coleção é rota própria.
const links = [
  { label: "Início", to: "/", hash: "" },
  { label: "Sobre", to: "/", hash: "#sobre" },
  { label: "Coleção", to: "/colecao", hash: "" },
  { label: "Destaque", to: "/", hash: "#destaque" },
  { label: "Processo", to: "/", hash: "#processo" },
  { label: "Perguntas", to: "/", hash: "#perguntas" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (to: string, hash: string) => {
    setOpen(false);
    if (hash) {
      navigate(to);
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      navigate(to);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-neutral-0/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-12">
        <Link
          to="/"
          className="font-display uppercase tracking-[0.34em] text-neutral-900"
          style={{ fontSize: "20px", fontWeight: 600 }}
          onClick={() => setOpen(false)}
        >
          SELECTCARS
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.to, l.hash)}
              className="uppercase tracking-[0.08em] text-neutral-600 transition-colors hover:text-neutral-900"
              style={{ fontSize: "12px" }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-neutral-0 transition-colors hover:bg-neutral-800"
            style={{ fontSize: "13px" }}
          >
            <CalendarClock size={16} /> Agendar visita
          </a>
        </div>

        <button
          className="text-neutral-900 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-100 bg-neutral-0 lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.to, l.hash)}
                className="rounded-lg px-3 py-3 text-left uppercase tracking-[0.08em] text-neutral-700"
                style={{ fontSize: "13px" }}
              >
                {l.label}
              </button>
            ))}
            <a
              href={whatsappLink(GENERIC_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-neutral-0"
              style={{ fontSize: "13px" }}
            >
              <CalendarClock size={16} /> Agendar visita
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
