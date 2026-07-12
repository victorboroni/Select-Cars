import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  EyeOff,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { VehicleCard } from "../components/VehicleCard";
import { VehicleDrawer } from "../components/VehicleDrawer";
import { SectionHeading } from "../components/ui-primitives/SectionHeading";
import { SpecBadge } from "../components/ui-primitives/SpecBadge";
import { formatBRL, Vehicle } from "../data/vehicles";
import { useVehicles } from "../store/VehiclesContext";
import { whatsappLink, GENERIC_MESSAGE, vehicleMessage } from "../lib/whatsapp";

const brands = ["Porsche", "Ferrari", "Lamborghini", "Aston Martin", "Bentley", "McLaren"];

const principles = [
  {
    icon: ShieldCheck,
    title: "Procedência",
    text: "Cada veículo é rastreado desde o primeiro proprietário. Documentação completa, histórico de manutenção e laudo técnico independente.",
  },
  {
    icon: Sparkles,
    title: "Curadoria",
    text: "Selecionamos menos de 5% dos carros que avaliamos. O que entra no showroom precisa ter algo além de preço alto.",
  },
  {
    icon: EyeOff,
    title: "Discrição",
    text: "Atendimento privado, agendado, sem vitrine de rua. O processo de compra é tão exclusivo quanto o carro.",
  },
];

const steps = [
  { n: "01", title: "Conversa inicial", text: "Entendimento do perfil, preferências e uso pretendido do cliente." },
  { n: "02", title: "Curadoria personalizada", text: "Apresentamos opções do estoque ou buscamos no mercado interno e internacional o carro exato que você procura." },
  { n: "03", title: "Inspeção e documentação", text: "Laudo técnico independente, verificação de procedência e regularização documental completa." },
  { n: "04", title: "Entrega", text: "Entrega assistida, com toda a documentação e histórico organizados." },
];

const testimonials = [
  { quote: "Procurei um Porsche específico por dois anos antes de chegar à SELECTCARS. Em três semanas encontraram a unidade certa, na cor certa, com o histórico certo.", who: "R. M., Empresário · São Paulo" },
  { quote: "O que mais me impressionou foi a discrição. Comprei dois carros e em nenhum momento me senti um número. O processo é silencioso, preciso e respeita o seu tempo.", who: "C. A., Investidor · Rio de Janeiro" },
  { quote: "Já tive experiências ruins comprando importados. Aqui foi diferente desde o primeiro contato. Tratam o carro como peça, não como estoque.", who: "F. L., Colecionador · Belo Horizonte" },
];

const faqs = [
  {
    q: "Como funciona o processo de compra na SELECTCARS?",
    a: "Tudo começa com uma conversa privada para entender seu perfil e o uso pretendido. A partir daí, apresentamos opções do estoque atual, buscamos no mercado interno e internacional o carro exato, e conduzimos todo o processo: laudo técnico, documentação, transferência e entrega.",
  },
  { q: "Vocês fazem importação de modelos específicos?", a: "Sim. Fazemos procura ativa no mercado europeu, americano e asiático, com importação completa e documentação regularizada." },
  { q: "Como funciona a consignação?", a: "Cuidamos da apresentação editorial do seu carro, avaliação com laudo independente e acesso a uma rede de compradores verificados, sem exposição em vitrine." },
  { q: "Posso financiar a compra?", a: "Sim. Estruturamos financiamento e seguro sob medida como parte da nossa gestão de patrimônio." },
  { q: "Vocês entregam fora de São Paulo?", a: "Sim. Realizamos entrega assistida em todo o Brasil, sempre por agendamento." },
];

export function Home() {
  const [active, setActive] = useState<Vehicle | null>(null);
  const { published } = useVehicles();
  const hero = published[0];
  const featured = published[0];
  const preview = published.slice(0, 6);

  if (!hero) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-32 text-center text-neutral-600 md:px-12">
        Nenhum veículo publicado no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-neutral-100 bg-neutral-0">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:px-12 md:py-20 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <SpecBadge>2026 / Edição 01</SpecBadge>
            <p className="max-w-md text-neutral-600" style={{ fontSize: "14px" }}>
              Curadoria de automóveis raros, esportivos e de coleção para quem
              entende a diferença entre possuir e pertencer.
            </p>
            <h1 className="text-neutral-900" style={{ fontSize: "clamp(38px, 5.5vw, 64px)", fontWeight: 600, lineHeight: 1.03, letterSpacing: "-0.02em" }}>
              Carros que não se encontram.
              <br />
              Se reconhecem.
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/colecao"
                className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800"
              >
                Ver coleção <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappLink(GENERIC_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-neutral-900 transition-colors hover:border-neutral-900"
              >
                <MessageCircle size={16} /> Agendar visita
              </a>
            </div>
            <p className="text-neutral-400" style={{ fontSize: "12px" }}>
              +55 11 0000-0000 · São Paulo · Atendimento sob agendamento
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="flex items-center gap-2">
              <SpecBadge className="!bg-neutral-900 !text-neutral-0 !border-neutral-900">RARO</SpecBadge>
              <SpecBadge>2026 · Edição limitada</SpecBadge>
            </div>
            <div className="my-4 aspect-[16/10]">
              <ImageWithFallback src={hero.image} alt={`${hero.brand} ${hero.model}`} className="h-full w-full object-contain" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-neutral-900" style={{ fontSize: "18px", fontWeight: 600 }}>
                  {hero.brand} {hero.model} · {hero.year}
                </p>
                <p className="text-neutral-600" style={{ fontSize: "13px" }}>
                  {hero.color} · {new Intl.NumberFormat("pt-BR").format(hero.km)} km
                </p>
              </div>
              <span className="text-neutral-400" style={{ fontSize: "12px" }}>01 / 04</span>
            </div>
          </div>
        </div>

        {/* Marcas */}
        <div className="border-t border-neutral-100">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 md:px-12">
            {brands.map((b) => (
              <span key={b} className="font-display uppercase tracking-[0.14em] text-neutral-400" style={{ fontSize: "15px" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre ────────────────────────────────────────────── */}
      <section id="sobre" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>01 / Sobre</span>
        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, lineHeight: 1.12 }}>
              Não vendemos carros.
              <br />
              Entregamos exceções.
            </h2>
            <div className="mt-8 flex items-end gap-4">
              <span className="font-display text-neutral-900" style={{ fontSize: "72px", fontWeight: 600, lineHeight: 0.9 }}>5%</span>
              <p className="max-w-[180px] pb-2 text-neutral-600" style={{ fontSize: "13px" }}>
                Percentual de carros avaliados que chegam ao showroom.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5 text-neutral-600" style={{ fontSize: "16px" }}>
            <p>
              A SELECTCARS nasceu da convicção de que um carro extraordinário
              merece um processo à altura. Cada veículo passou por uma seleção
              criteriosa: procedência verificada, histórico documentado, condição
              mecânica e estética dentro de padrões que não admitem concessões.
            </p>
            <p>
              Trabalhamos com um número limitado de unidades por mês. Por escolha.
              Porque atender bem importa mais do que vender muito.
            </p>
            <Link to="/colecao" className="flex items-center gap-2 text-neutral-900" style={{ fontSize: "14px" }}>
              Conheça o processo <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-900">
                  <Icon size={18} />
                </span>
                <h3 className="text-neutral-900" style={{ fontSize: "20px", fontWeight: 600 }}>{p.title}</h3>
                <p className="text-neutral-600" style={{ fontSize: "14px" }}>{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Destaque ─────────────────────────────────────────── */}
      <section id="destaque" className="bg-neutral-50 py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>02 / Em destaque</span>
          <h2 className="mt-6 max-w-2xl text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, lineHeight: 1.12 }}>
            Cada detalhe contado. Cada procedência verificada.
          </h2>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0">
              <span
                className="pointer-events-none absolute inset-x-0 bottom-4 select-none text-center font-display uppercase tracking-[0.12em] text-neutral-100"
                style={{ fontSize: "clamp(48px, 12vw, 110px)", fontWeight: 600, lineHeight: 1 }}
                aria-hidden
              >
                {featured.brand}
              </span>
              <ImageWithFallback src={featured.heroImage ?? featured.image} alt={`${featured.brand} ${featured.model}`} className="relative w-full object-contain p-8" />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-neutral-900" style={{ fontSize: "24px", fontWeight: 600 }}>
                  {featured.brand} {featured.model}
                </h3>
                <p className="mt-1 text-neutral-900" style={{ fontSize: "20px", fontWeight: 500 }}>
                  {formatBRL(featured.price)}
                </p>
              </div>
              <dl className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-neutral-0">
                {[
                  { l: "Motor", v: featured.specs.engine },
                  { l: "Velocidade máxima", v: featured.specs.topSpeed },
                  { l: "Transmissão", v: featured.specs.transmission },
                  { l: "Combustível", v: featured.specs.fuel },
                ].map((r) => (
                  <div key={r.l} className="flex items-start justify-between gap-6 px-5 py-3.5">
                    <dt className="text-neutral-400" style={{ fontSize: "13px" }}>{r.l}</dt>
                    <dd className="text-right text-neutral-900" style={{ fontSize: "13px", fontWeight: 500 }}>{r.v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="grid grid-cols-2 gap-2">
                {featured.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-neutral-800" style={{ fontSize: "13px" }}>
                    <Check size={15} className="shrink-0 text-brand-blue-500" /> {h}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link to="/colecao" className="flex items-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-neutral-900 transition-colors hover:border-neutral-900">
                  Ver coleção completa
                </Link>
                <a href={whatsappLink(vehicleMessage(featured.brand, featured.model))} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800">
                  <MessageCircle size={16} /> Solicitar proposta
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coleção (preview) ────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>03 / Coleção</span>
            <h2 className="mt-4 text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500 }}>
              Disponíveis no showroom.
            </h2>
          </div>
          <Link to="/colecao" className="flex items-center gap-2 text-neutral-900" style={{ fontSize: "14px" }}>
            Ver coleção completa <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onOpen={setActive} />
          ))}
        </div>
      </section>

      {/* ── Processo ─────────────────────────────────────────── */}
      <section id="processo" className="bg-neutral-900 py-24 text-neutral-0">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>05 / O processo</span>
          <h2 className="mt-6 max-w-2xl font-display uppercase tracking-[0.04em]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, lineHeight: 1.1 }}>
            Comprar um carro deveria ser tão refinado quanto dirigi-lo.
          </h2>
          <p className="mt-4 max-w-xl text-neutral-400" style={{ fontSize: "15px" }}>
            Quatro etapas pensadas para entregar previsibilidade, transparência e o
            tempo adequado para cada decisão importante.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-3 border-t border-white/15 pt-6">
                <span className="font-display text-neutral-600" style={{ fontSize: "36px", fontWeight: 600 }}>{s.n}</span>
                <p style={{ fontSize: "16px", fontWeight: 500 }}>{s.title}</p>
                <p className="text-neutral-400" style={{ fontSize: "13px" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ──────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>06 / Clientes</span>
        <h2 className="mt-6 max-w-xl text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, lineHeight: 1.12 }}>
          O que nos define é quem confia em nós.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.who} className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-0 p-8">
              <blockquote className="text-neutral-800" style={{ fontSize: "15px", lineHeight: 1.55 }}>"{t.quote}"</blockquote>
              <figcaption className="mt-auto uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "12px" }}>{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Perguntas ────────────────────────────────────────── */}
      <section id="perguntas" className="bg-neutral-50 py-24">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>Perguntas frequentes</span>
          <h2 className="mt-6 text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500 }}>Antes de agendar.</h2>
          <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-neutral-900 marker:content-none" style={{ fontSize: "16px", fontWeight: 500 }}>
                  {f.q}
                  <span className="text-neutral-400 transition-transform group-open:rotate-45" style={{ fontSize: "22px" }}>+</span>
                </summary>
                <p className="mt-3 text-neutral-600" style={{ fontSize: "15px" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final / Contato ──────────────────────────────── */}
      <section id="contato" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>07 / Próximo passo</span>
        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-neutral-900" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, lineHeight: 1.12 }}>
              Encontre o seu próximo. Ou o que você ainda não sabia que era o seu.
            </h2>
            <p className="mt-6 max-w-lg text-neutral-600" style={{ fontSize: "16px" }}>
              Seja para uma compra específica, uma consignação ou uma conversa sobre
              o que faz sentido para o seu momento — estamos disponíveis. Atendimento
              privado, sob agendamento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink(GENERIC_MESSAGE)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800">
                <MessageCircle size={16} /> Falar com um curador
              </a>
              <Link to="/colecao" className="flex items-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-neutral-900 transition-colors hover:border-neutral-900">
                Ver coleção
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
            <h3 className="text-neutral-900" style={{ fontSize: "20px", fontWeight: 600 }}>Agendar visita ao showroom</h3>
            <p className="mt-2 text-neutral-600" style={{ fontSize: "14px" }}>
              Compartilhe o que você procura pelo WhatsApp. Respondemos no mesmo dia útil.
            </p>
            <a href={whatsappLink(GENERIC_MESSAGE)} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800">
              <MessageCircle size={18} /> Enviar mensagem
            </a>
            <p className="mt-3 text-neutral-400" style={{ fontSize: "12px" }}>
              Resposta em até 1 dia útil · Atendimento confidencial
            </p>
            <dl className="mt-8 flex flex-col gap-4 border-t border-neutral-200 pt-6">
              <div>
                <dt className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>Showroom</dt>
                <dd className="text-neutral-800" style={{ fontSize: "14px" }}>São Paulo, SP — Endereço completo enviado no agendamento</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>Horário</dt>
                <dd className="text-neutral-800" style={{ fontSize: "14px" }}>Seg a sex · 10h–19h · Sábado · 10h–14h (por agendamento)</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>Contato direto</dt>
                <dd className="text-neutral-800" style={{ fontSize: "14px" }}>+55 11 0000-0000 · contato@selectcars.com.br</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <VehicleDrawer vehicle={active} onClose={() => setActive(null)} />
    </div>
  );
}
