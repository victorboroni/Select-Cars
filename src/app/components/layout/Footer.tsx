import { Link } from "react-router";
import { whatsappLink, GENERIC_MESSAGE } from "../../lib/whatsapp";

const columns = [
  { title: "Navegação", links: ["Coleção", "Marcas", "Serviços", "Sobre", "Contato"] },
  {
    title: "Serviços",
    links: [
      "Sourcing internacional",
      "Consignação premium",
      "Gestão de coleção",
      "Financiamento e seguro",
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span
              className="font-display uppercase tracking-[0.3em] text-neutral-900"
              style={{ fontSize: "22px", fontWeight: 600 }}
            >
              SELECTCARS
            </span>
            <p className="mt-4 max-w-xs text-neutral-600" style={{ fontSize: "14px" }}>
              Curadoria de automóveis premium para o colecionador exigente.
              Atemporal. Discreta. Inconfundível.
            </p>
            <p className="mt-3 text-neutral-400" style={{ fontSize: "13px" }}>
              São Paulo · Brasil
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "12px" }}>
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/colecao"
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                      style={{ fontSize: "14px" }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "12px" }}>
              Contato
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-neutral-600" style={{ fontSize: "14px" }}>
              <li>+55 11 0000-0000</li>
              <li>contato@selectcars.com.br</li>
              <li>Endereço enviado no agendamento</li>
            </ul>
            <div className="mt-4 flex gap-4 text-neutral-600" style={{ fontSize: "13px" }}>
              <span>Instagram</span>
              <span>LinkedIn</span>
              <a href={whatsappLink(GENERIC_MESSAGE)} target="_blank" rel="noreferrer" className="hover:text-neutral-900">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-neutral-400 md:flex-row md:items-center md:justify-between" style={{ fontSize: "12px" }}>
          <span>© 2026 SELECTCARS — Todos os direitos reservados</span>
          <div className="flex gap-6">
            <span>Política de privacidade</span>
            <span>Termos de uso</span>
            <span>Cookies</span>
            <Link to="/admin" className="hover:text-neutral-900">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
