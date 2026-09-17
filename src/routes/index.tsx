import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  HardDrive,
  MapPin,
  MemoryStick,
  MessageCircle,
  Microchip,
  MonitorCog,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Category = "cpu" | "motherboard" | "memory" | "gpu" | "storage" | "psu";
type Part = {
  id: string;
  category: Category;
  name: string;
  brand: string;
  code: string;
  price: number;
  stock: number;
  platform?: "AMD" | "Intel";
  socket?: "AM4" | "AM5" | "LGA1700";
  watts?: number;
  detail: string;
};

const categories: { id: Category; label: string; short: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "cpu", label: "Processador", short: "CPU", icon: Cpu },
  { id: "motherboard", label: "Placa-mãe", short: "Placa-mãe", icon: Microchip },
  { id: "memory", label: "Memória", short: "Memória", icon: MemoryStick },
  { id: "gpu", label: "Placa de vídeo", short: "Vídeo", icon: MonitorCog },
  { id: "storage", label: "Armazenamento", short: "SSD", icon: HardDrive },
  { id: "psu", label: "Fonte", short: "Fonte", icon: Zap },
];

const parts: Part[] = [
  { id: "r5600", category: "cpu", name: "Ryzen 5 5600G", brand: "AMD", code: "100-100000252BOX", price: 789.9, stock: 8, platform: "AMD", socket: "AM4", watts: 65, detail: "6 núcleos · vídeo integrado · cooler incluso" },
  { id: "r7600", category: "cpu", name: "Ryzen 5 7600", brand: "AMD", code: "100-100001015BOX", price: 1349.9, stock: 3, platform: "AMD", socket: "AM5", watts: 65, detail: "6 núcleos · DDR5 · vídeo integrado" },
  { id: "i514400", category: "cpu", name: "Core i5-14400F", brand: "Intel", code: "BX8071514400F", price: 1499.9, stock: 5, platform: "Intel", socket: "LGA1700", watts: 148, detail: "10 núcleos · até 4,7 GHz" },
  { id: "b550", category: "motherboard", name: "B550M Pro-VDH WiFi", brand: "MSI", code: "911-7C95-021", price: 749.9, stock: 4, platform: "AMD", socket: "AM4", detail: "mATX · Wi-Fi · 4 slots DDR4" },
  { id: "b650", category: "motherboard", name: "B650M-HDV/M.2", brand: "ASRock", code: "90-MXBLA0-A0UAYZ", price: 899.9, stock: 2, platform: "AMD", socket: "AM5", detail: "mATX · DDR5 · PCIe 4.0" },
  { id: "b760", category: "motherboard", name: "B760M DS3H DDR4", brand: "Gigabyte", code: "B760M-DS3H-D4", price: 849.9, stock: 6, platform: "Intel", socket: "LGA1700", detail: "mATX · DDR4 · 2× M.2" },
  { id: "ram16", category: "memory", name: "Fury Beast 16 GB (2×8)", brand: "Kingston", code: "KF432C16BBK2-16", price: 329.9, stock: 14, detail: "DDR4 · 3200 MHz · dual channel" },
  { id: "ram32", category: "memory", name: "Fury Beast 32 GB (2×16)", brand: "Kingston", code: "KF556C36BBEK2-32", price: 729.9, stock: 5, detail: "DDR5 · 5600 MHz · dual channel" },
  { id: "rx6600", category: "gpu", name: "Radeon RX 6600 Challenger", brand: "ASRock", code: "RX6600-CLD-8G", price: 1599.9, stock: 4, watts: 132, detail: "8 GB GDDR6 · ideal para Full HD" },
  { id: "rtx4060", category: "gpu", name: "GeForce RTX 4060 Ventus 2X", brand: "MSI", code: "RTX4060-V2X-8G", price: 2199.9, stock: 3, watts: 115, detail: "8 GB GDDR6 · DLSS 3" },
  { id: "rtx4070", category: "gpu", name: "GeForce RTX 4070 Super", brand: "Galax", code: "47SOM7MD9PSU", price: 4299.9, stock: 0, watts: 220, detail: "12 GB GDDR6X · sob encomenda" },
  { id: "ssd1", category: "storage", name: "NV2 NVMe 1 TB", brand: "Kingston", code: "SNV2S-1000G", price: 399.9, stock: 18, detail: "PCIe 4.0 · leitura até 3.500 MB/s" },
  { id: "ssd2", category: "storage", name: "SN770 NVMe 2 TB", brand: "WD Black", code: "WDS200T3X0E", price: 899.9, stock: 2, detail: "PCIe 4.0 · leitura até 5.150 MB/s" },
  { id: "psu550", category: "psu", name: "MWE Bronze V2 550 W", brand: "Cooler Master", code: "MPE-5501-ACAAB", price: 389.9, stock: 7, watts: 550, detail: "80 Plus Bronze · PFC ativo" },
  { id: "psu650", category: "psu", name: "CX650 650 W", brand: "Corsair", code: "CP-9020278-BR", price: 529.9, stock: 4, watts: 650, detail: "80 Plus Bronze · 5 anos de garantia" },
  { id: "psu750", category: "psu", name: "Core Reactor II 750 W", brand: "XPG", code: "COREREACTORII750G", price: 749.9, stock: 2, watts: 750, detail: "80 Plus Gold · modular" },
];

const presets = [
  { name: "Essencial 5600G", kicker: "Trabalho e estudo", price: 2799, note: "Rápido no dia a dia, silencioso e pronto para receber placa de vídeo depois.", ids: ["r5600", "b550", "ram16", "ssd1", "psu550"] },
  { name: "Full HD Competitivo", kicker: "O mais procurado", price: 4899, note: "Equilíbrio para Valorant, CS2, Fortnite e lançamentos em Full HD.", ids: ["r5600", "b550", "ram16", "rx6600", "ssd1", "psu550"] },
  { name: "Performance AM5", kicker: "Mais margem para upgrade", price: 7699, note: "Plataforma atual, 32 GB e desempenho forte para jogar e criar.", ids: ["r7600", "b650", "ram32", "rtx4060", "ssd1", "psu650"] },
];

const stockMachines = [
  { id: "BN-1048", name: "Binário Start", spec: "Ryzen 5 · 16 GB · SSD 1 TB", price: 3190, tone: "Pronta entrega" },
  { id: "BN-1051", name: "Binário Arena", spec: "Ryzen 5 · RX 6600 · 16 GB · SSD 1 TB", price: 4990, tone: "Última unidade" },
  { id: "BN-1053", name: "Binário Studio", spec: "Core i5 · RTX 4060 · 32 GB · SSD 1 TB", price: 6890, tone: "Pronta entrega" },
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monte seu PC | Binário Tecnologia" },
      { name: "description", content: "Escolha peças compatíveis, confira o orçamento e fale com a equipe da Binário em Varginha." },
      { property: "og:title", content: "Montador de PC Binário" },
      { property: "og:description", content: "Monte seu computador com peças compatíveis e atendimento local em Varginha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<Category>("cpu");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"all" | "AMD" | "Intel">("all");
  const [sellerOpen, setSellerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ids = new URLSearchParams(window.location.search).get("pc")?.split(",") ?? [];
    const restored = Object.fromEntries(ids.filter((id) => parts.some((part) => part.id === id)).map((id) => [id, 1]));
    if (Object.keys(restored).length) setSelected(restored);
  }, []);

  const chosen = useMemo(() => parts.filter((part) => selected[part.id]), [selected]);
  const total = chosen.reduce((sum, part) => sum + part.price * (selected[part.id] ?? 0), 0);
  const cpu = chosen.find((part) => part.category === "cpu");
  const gpu = chosen.find((part) => part.category === "gpu");
  const psu = chosen.find((part) => part.category === "psu");
  const requiredWatts = cpu && gpu ? Math.ceil(((cpu.watts ?? 65) + (gpu.watts ?? 0) + 170) / 50) * 50 : 0;
  const powerOk = !requiredWatts || !psu || (psu.watts ?? 0) >= requiredWatts;
  const completed = categories.filter((category) => chosen.some((part) => part.category === category.id)).length;

  const visibleParts = parts.filter((part) => {
    if (part.category !== active) return false;
    if (part.stock === 0) return false;
    if (platform !== "all" && part.platform && part.platform !== platform) return false;
    if (active === "motherboard" && cpu?.socket && part.socket !== cpu.socket) return false;
    if (active === "memory" && cpu?.socket === "AM5" && !part.name.includes("32 GB")) return false;
    if (active === "memory" && cpu?.socket && cpu.socket !== "AM5" && part.name.includes("32 GB")) return false;
    return `${part.name} ${part.brand} ${part.code}`.toLowerCase().includes(search.toLowerCase());
  });

  const orderParts = parts.filter((part) => {
    if (part.category !== active || part.stock > 0) return false;
    if (platform !== "all" && part.platform && part.platform !== platform) return false;
    if (active === "motherboard" && cpu?.socket && part.socket !== cpu.socket) return false;
    return `${part.name} ${part.brand} ${part.code}`.toLowerCase().includes(search.toLowerCase());
  });

  function selectPart(part: Part) {
    setSelected((current) => {
      const next = { ...current };
      for (const selectedPart of parts) if (selectedPart.category === part.category) delete next[selectedPart.id];
      next[part.id] = 1;
      return next;
    });
    const index = categories.findIndex((category) => category.id === part.category);
    const nextCategory = categories[index + 1];
    if (nextCategory) setActive(nextCategory.id);
  }

  function moveStep(offset: -1 | 1) {
    const currentIndex = categories.findIndex((item) => item.id === active);
    const target = categories[Math.max(0, Math.min(categories.length - 1, currentIndex + offset))];
    if (target) setActive(target.id);
  }

  function usePreset(ids: string[]) {
    setSelected(Object.fromEntries(ids.map((id) => [id, 1])));
    document.querySelector("#montador")?.scrollIntoView({ behavior: "smooth" });
  }

  async function shareBuild() {
    const url = new URL(window.location.href);
    url.searchParams.set("pc", chosen.map((part) => part.id).join(","));
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function whatsapp(seller: string) {
    const list = chosen.map((part) => `• ${part.name} — ${money.format(part.price)}`).join("\n");
    const text = `Olá, ${seller}! Quero confirmar esta montagem:\n\n${list || "Ainda preciso de ajuda para escolher as peças."}\n\nTotal estimado: ${money.format(total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setSellerOpen(false);
  }

  function requestPart(part?: Part) {
    const item = part ? `${part.name} (${part.code})` : `uma peça da categoria ${categories.find((item) => item.id === active)?.label}`;
    const text = `Olá! Gostaria de consultar uma encomenda de ${item}. Podem verificar disponibilidade, prazo e valor?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="site-header">
        <div className="shell flex min-h-16 items-center gap-5">
          <a className="brand" href="#inicio" aria-label="Binário Tecnologia — início">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span><strong>BINÁRIO</strong><small>Distribuidora & Tecnologia</small></span>
          </a>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            <a href="#montador">Monte seu PC</a><a href="#prontas">Configurações prontas</a><a href="#estoque">Pronta entrega</a>
          </nav>
          <div className="header-location hidden xl:flex"><MapPin /> Varginha, MG</div>
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => setSellerOpen(true)}><MessageCircle /> Falar com vendedor</Button>
        </div>
      </header>

      <main>
        <section id="inicio" className="builder-intro">
          <div className="shell intro-content">
            <div><span>BINÁRIO MONTE SEU PC</span><h1>Monte seu computador</h1><p>Escolha os componentes e acompanhe o valor da sua configuração.</p></div>
            <div className="intro-benefits"><span><ShieldCheck /> Peças compatíveis</span><span><PackageCheck /> Montagem e testes</span><span><Truck /> Retirada em Varginha</span></div>
          </div>
        </section>

        <section id="montador" className="builder-section">
          <div className="shell">
            <div className="step-rail" role="tablist" aria-label="Etapas da montagem">
              {categories.map((category, index) => {
                const done = chosen.some((part) => part.category === category.id);
                const Icon = category.icon;
                return <button key={category.id} role="tab" aria-selected={active === category.id} className="step-button" onClick={() => setActive(category.id)}><span className="step-number">{done ? <Check /> : String(index + 1).padStart(2, "0")}</span><Icon /><span>{category.short}</span></button>;
              })}
            </div>

            <div className="builder-grid">
              <div className="catalog-column">
                <div className="catalog-title"><div><span>ETAPA {categories.findIndex((item) => item.id === active) + 1} DE {categories.length}</span><h3>Escolha seu {categories.find((item) => item.id === active)?.label}</h3></div><span>{visibleParts.length} produtos disponíveis</span></div>
                <div className="filter-bar">
                  <label className="search-field"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, marca ou código" /></label>
                  <div className="segmented" aria-label="Filtrar plataforma"><button aria-pressed={platform === "all"} onClick={() => setPlatform("all")}>Todos</button><button aria-pressed={platform === "AMD"} onClick={() => setPlatform("AMD")}>AMD</button><button aria-pressed={platform === "Intel"} onClick={() => setPlatform("Intel")}>Intel</button></div>
                </div>
                <div className="product-list">
                  {visibleParts.map((part) => {
                    const chosenPart = Boolean(selected[part.id]);
                    const Icon = categories.find((category) => category.id === part.category)?.icon ?? Cpu;
                    return <article className="product-row" data-selected={chosenPart} key={part.id}>
                      <div className="product-icon"><Icon /></div>
                      <div className="product-main"><div className="product-meta"><span>{part.brand}</span><code>{part.code}</code></div><h4>{part.name}</h4><p>{part.detail}</p><span className="stock-ok">Disponível · {part.stock} em estoque</span></div>
                      <div className="product-buy"><strong>{money.format(part.price)}</strong><small>em até 10× sem juros</small><Button variant={chosenPart ? "secondary" : "default"} onClick={() => chosenPart ? setSelected((current) => { const next = { ...current }; delete next[part.id]; return next; }) : selectPart(part)} aria-label={`${chosenPart ? "Remover" : "Escolher"} ${part.name}`}>{chosenPart ? <><Check /> Escolhido</> : <>Escolher <ArrowRight /></>}</Button></div>
                    </article>;
                  })}
                  {!visibleParts.length && <div className="empty-state"><Search /><strong>Nenhuma peça encontrada</strong><span>Tente outro termo ou inclua itens sob encomenda.</span></div>}
                </div>
                <div className="order-panel">
                  <div className="order-panel-head"><div><PackageCheck /><span><strong>Peças sob encomenda</strong><small>Consulte disponibilidade, prazo e valor com nossa equipe.</small></span></div><Button variant="outline" onClick={() => requestPart()}>Pedir outra peça <MessageCircle /></Button></div>
                  {orderParts.map((part) => <article className="order-row" key={part.id}><div className="product-icon"><MonitorCog /></div><div><span>{part.brand} · {part.code}</span><strong>{part.name}</strong><small>{part.detail}</small></div><Button onClick={() => requestPart(part)}>Solicitar cotação</Button></article>)}
                  {!orderParts.length && <p className="order-custom">Não encontrou o modelo desejado? Envie o nome da peça e consultamos com nossos fornecedores.</p>}
                </div>
                <div className="step-navigation"><Button variant="outline" disabled={active === "cpu"} onClick={() => moveStep(-1)}><ChevronLeft /> Anterior</Button><span>{completed} de {categories.length} etapas concluídas</span><Button disabled={active === "psu"} onClick={() => moveStep(1)}>Próxima <ChevronRight /></Button></div>
              </div>

              <aside className="build-summary" aria-label="Resumo da montagem">
                <div className="summary-head"><div><span className="mono">ORÇAMENTO ATUAL</span><h3>Sua montagem</h3></div>{chosen.length > 0 && <Button variant="ghost" size="icon" title="Limpar montagem" onClick={() => setSelected({})}><Trash2 /><span className="sr-only">Limpar montagem</span></Button>}</div>
                <div className="summary-items">
                  {categories.map((category) => {
                    const part = chosen.find((item) => item.category === category.id);
                    const Icon = category.icon;
                    return <button key={category.id} className="summary-item" data-empty={!part} onClick={() => setActive(category.id)}><span className="summary-icon">{part ? <CheckCircle2 /> : <Icon />}</span><span><small>{category.label}</small><strong>{part?.name ?? "Escolher peça"}</strong></span>{part && <b>{money.format(part.price)}</b>}</button>;
                  })}
                </div>
                <div className={`power-note ${powerOk ? "is-ok" : "is-error"}`}><Zap /> <span>{!requiredWatts ? "Escolha processador e vídeo para calcular a fonte." : !psu ? `Consumo estimado: escolha uma fonte de ${requiredWatts} W ou mais.` : powerOk ? `Fonte adequada. Recomendação mínima: ${requiredWatts} W.` : `Fonte insuficiente. Use ${requiredWatts} W ou mais.`}</span></div>
                <div className="summary-total"><span><small>Total estimado</small><strong>{money.format(total)}</strong></span><small>Montagem e testes inclusos</small></div>
                <Button size="lg" className="w-full" disabled={!chosen.length} onClick={() => setSellerOpen(true)}><MessageCircle /> Comprar pelo WhatsApp</Button>
                <div className="summary-actions"><Button variant="outline" onClick={shareBuild} disabled={!chosen.length}>{copied ? <Check /> : <Copy />} {copied ? "Link copiado" : "Copiar link"}</Button><Button variant="outline" onClick={() => window.print()} disabled={!chosen.length}><Download /> PDF</Button></div>
              </aside>
            </div>
          </div>
        </section>

        <section id="prontas" className="preset-section">
          <div className="shell"><div className="section-heading"><div><span className="section-index mono">02 / ATALHOS</span><h2>Comece por uma configuração pronta</h2></div><p>Modelos equilibrados pela nossa equipe. Você ainda pode trocar qualquer peça.</p></div>
            <div className="preset-grid">{presets.map((preset, index) => <article className="preset-card" data-featured={index === 1} key={preset.name}><div className="preset-top"><span className="mono">CONFIG. {String(index + 1).padStart(2, "0")}</span><span>{preset.kicker}</span></div><h3>{preset.name}</h3><p>{preset.note}</p><div className="preset-specs">{preset.ids.slice(0, 4).map((id) => <span key={id}><Check /> {parts.find((part) => part.id === id)?.name}</span>)}</div><div className="preset-price"><span>a partir de</span><strong>{money.format(preset.price)}</strong></div><Button variant={index === 1 ? "default" : "outline"} onClick={() => usePreset(preset.ids)}>Usar como ponto de partida <ArrowRight /></Button></article>)}</div>
          </div>
        </section>

        <section id="estoque" className="stock-section">
          <div className="shell"><div className="section-heading"><div><span className="section-index mono">03 / PRONTA ENTREGA</span><h2>Máquinas montadas na loja</h2></div><p>Já passaram por montagem e testes. Consulte a disponibilidade antes de sair de casa.</p></div>
            <div className="stock-table">{stockMachines.map((machine) => <article key={machine.id}><span className="stock-code mono">{machine.id}</span><div><h3>{machine.name}</h3><p>{machine.spec}</p></div><span className="stock-status">{machine.tone}</span><strong>{money.format(machine.price)}</strong><Button variant="outline" size="sm" onClick={() => setSellerOpen(true)}>Consultar <ArrowRight /></Button></article>)}</div>
          </div>
        </section>
      </main>

      <footer><div className="shell footer-grid"><div className="brand brand-dark"><span className="brand-mark"><span /></span><span><strong>BINÁRIO</strong><small>Distribuidora & Tecnologia</small></span></div><p>Varginha, Minas Gerais<br />Atendimento local</p><p>Preços e estoque demonstrativos.<br />Confirme as condições com um vendedor.</p></div></footer>

      <div className="mobile-cart"><div><small>{chosen.length ? `${chosen.length} peças selecionadas` : "Sua montagem"}</small><strong>{money.format(total)}</strong></div><Button disabled={!chosen.length} onClick={() => setSellerOpen(true)}><ShoppingCart /> Finalizar</Button></div>

      <Dialog open={sellerOpen} onOpenChange={setSellerOpen}>
        <DialogContent className="seller-dialog">
          <DialogHeader><DialogTitle>Quem vai atender você?</DialogTitle><DialogDescription>Escolha um vendedor. Sua montagem já vai pronta na mensagem.</DialogDescription></DialogHeader>
          <div className="seller-list"><button onClick={() => whatsapp("pessoal")}><span>AT</span><strong>Atendimento comercial<small>Orçamentos e pronta entrega</small></strong><MessageCircle /></button><button onClick={() => whatsapp("pessoal do suporte")}><span>ST</span><strong>Suporte técnico<small>Montagem e upgrades</small></strong><MessageCircle /></button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}