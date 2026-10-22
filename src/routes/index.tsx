import { createFileRoute } from "@tanstack/react-router";
import {
  Armchair,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  Fan,
  HardDrive,
  Keyboard,
  MapPin,
  MemoryStick,
  MessageCircle,
  Microchip,
  Minus,
  Monitor,
  MonitorCog,
  Mouse,
  AlertTriangle,
  Circle,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Gamepad2,
  ListChecks,
  TrendingUp,
  Trash2,
  Truck,
  UserRound,
  Zap,
  Sun,
  Moon,
  History,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import catalogo from "@/data/catalogo.json";
import {
  fonteNecessaria,
  memoriaDaPlaca,
  memoriasCompativeis,
  socketCompativel,
} from "@/lib/compatibilidade";

type Category =
  | "cpu"
  | "motherboard"
  | "memory"
  | "gpu"
  | "storage"
  | "psu"
  | "cooler"
  | "case"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "chair";
type Part = {
  id: string;
  category: Category;
  name: string;
  brand: string;
  code: string;
  pixPrice: number;
  stock: number;
  platform?: "AMD" | "Intel";
  socket?: "AM4" | "AM5" | "LGA1700" | "LGA1200" | "LGA1151" | "LGA1150" | "LGA1155" | "LGA1156";
  memType?: "DDR3" | "DDR4" | "DDR5";
  // slots = quantos pentes a placa aceita. So preenchido onde a descricao
  // do WinThor diz; sem valor, o montador nao limita.
  slots?: number;
  watts?: number;
  specs: string[];
  detail: string;
  // Caminho da foto real (opcional). Quando o extrator do WinThor rodar,
  // basta apontar /fotos/<codigo>.jpg e jogar as fotos em public/fotos/.
  foto?: string;
  // apu = processador com vídeo integrado que roda jogos leves sem placa.
  apu?: boolean;
  // videoIntegrado = da imagem no monitor sem placa. Todo apu tem, mas nem
  // todo processador com video integrado roda jogos. Ryzen AM4 so tem nos
  // modelos terminados em "G"; os Intel terminados em "F" nao tem.
  videoIntegrado?: boolean;
  // ramGB = capacidade do pente/kit, usada pra estimar desempenho.
  ramGB?: number;
};

// Artigo do titulo da etapa ("Escolha o seu Processador", "Escolha a sua Memoria RAM").
const ARTIGO_CATEGORIA: Record<Category, string> = {
  cpu: "o seu",
  motherboard: "a sua",
  memory: "a sua",
  gpu: "a sua",
  storage: "o seu",
  psu: "a sua",
  cooler: "o seu",
  case: "o seu",
  monitor: "o seu",
  keyboard: "o seu",
  mouse: "o seu",
  chair: "a sua",
};

const categories: {
  id: Category;
  label: string;
  short: string;
  icon: ComponentType<{ className?: string }>;
  // periferico = nao entra na conta de compatibilidade nem trava a montagem
  periferico?: boolean;
  // multi = pode escolher mais de uma peca / mais de uma unidade (memoria, SSD)
  multi?: boolean;
}[] = [
  { id: "cpu", label: "Processador", short: "Processador", icon: Cpu },
  {
    id: "motherboard",
    label: "Placa-mãe",
    short: "Placa-mãe",
    icon: Microchip,
  },
  {
    id: "memory",
    label: "Memória RAM",
    short: "Memória",
    icon: MemoryStick,
    multi: true,
  },
  { id: "gpu", label: "Placa de Vídeo", short: "Vídeo", icon: MonitorCog },
  {
    id: "storage",
    label: "Armazenamento SSD",
    short: "SSD NVMe",
    icon: HardDrive,
    multi: true,
  },
  { id: "psu", label: "Fonte de Alimentação", short: "Fonte", icon: Zap },
  { id: "cooler", label: "Cooler / Water Cooler", short: "Cooler", icon: Fan },
  { id: "case", label: "Gabinete", short: "Gabinete", icon: Box },
  {
    id: "monitor",
    label: "Monitor",
    short: "Monitor",
    icon: Monitor,
    periferico: true,
  },
  {
    id: "keyboard",
    label: "Teclado",
    short: "Teclado",
    icon: Keyboard,
    periferico: true,
  },
  {
    id: "mouse",
    label: "Mouse",
    short: "Mouse",
    icon: Mouse,
    periferico: true,
  },
  {
    id: "chair",
    label: "Cadeira Gamer",
    short: "Cadeira",
    icon: Armchair,
    periferico: true,
  },
];

// Etapas que contam como "montagem completa".
const CATEGORIAS_PECA = categories.filter((item) => !item.periferico);
const isMulti = (cat: Category) => categories.find((item) => item.id === cat)?.multi ?? false;

// Catalogo de pecas: gerado/atualizado por scripts/atualizar_catalogo.py a partir
// da rotina 860 do WinThor. Campos tecnicos e textos editados a mao sao preservados.
const parts = catalogo as Part[];

const presets = [
  {
    name: "Binário Essencial AM4",
    kicker: "Escritório & Estudo",
    pixPrice: 1309.4,
    note: "Ryzen com vídeo integrado Vega. Roda o dia a dia, pacote Office e jogos leves sem precisar de placa de vídeo.",
    ids: ["w15380", "w12375", "w19384", "w26330", "w19069", "w19308"],
  },
  {
    name: "Binário Arena 1050 Ti",
    kicker: "Mais Equilibrado da Loja",
    pixPrice: 2789.3,
    note: "Ryzen 5 de 6 núcleos com GTX 1050 Ti. O melhor custo-benefício com o que está disponível hoje em Varginha.",
    ids: ["w17867", "w12375", "w19384", "w20957", "w26330", "w19069", "w21577"],
    featured: true,
  },
  {
    name: "Binário Studio RX 560",
    kicker: "Trabalho Pesado & Criação",
    pixPrice: 2579.3,
    note: "Ryzen 7 de 8 núcleos com SSD de 480 GB. Focado em quem edita, renderiza ou trabalha com muitas abas e programas abertos.",
    ids: ["w17507", "w12375", "w19384", "w19209", "w21521", "w19069", "w21577"],
  },
];

// ATENCAO: montadas a partir das pecas que existem no catalogo da 860,
// porque as specs antigas citavam RX 6600 / RTX 4060 / DDR5, que a loja
// nao tem. Os precos sao a soma das pecas.
// >>> CONFERIR com o que esta montado de verdade na bancada. <<<
const stockMachines = [
  {
    id: "BN-1048",
    name: "Binário Start Home & Office",
    spec: "Ryzen 3 3200G · 8 GB DDR4 · SSD 240 GB · Fonte 500W",
    ids: ["w15380", "w12375", "w19145", "w25877", "w19069", "w21476"],
    pixPrice: 1559.4,
    tone: "Pronta entrega em Varginha",
  },
  {
    id: "BN-1051",
    name: "Binário Arena GTX 1050 Ti",
    spec: "Ryzen 5 5500 · GTX 1050 Ti 4GB · 8 GB DDR4 · SSD 480 GB",
    ids: ["w17867", "w12375", "w19145", "w20957", "w25940", "w21062", "w21577"],
    pixPrice: 3319.3,
    tone: "Pronta entrega em Varginha",
  },
  {
    id: "BN-1053",
    name: "Binário Studio RX 580",
    spec: "Ryzen 7 5700X · RX 580 8GB · 8 GB DDR4 · SSD 480 GB",
    ids: ["w18599", "w19577", "w19145", "w20166", "w25940", "w19942", "w19087"],
    pixPrice: 4179.3,
    tone: "Última unidade no estoque",
  },
];

// Modelos para empresas e orgaos publicos, tirados das configuracoes mais
// pedidas nos orcamentos de licitacao de 2026 (planilha da equipe de
// licitacao). Custo, margem, fornecedor e orgao NAO entram aqui: o site e
// publico. O Windows nao esta no catalogo, entao entra como "a cotar" e o
// vendedor completa o preco.
type ModeloEmpresa = {
  name: string;
  kicker: string;
  note: string;
  pecas: Record<string, number>;
  cotar: Omit<Cotacao, "id">[];
};

const modelosEmpresa: ModeloEmpresa[] = [
  {
    name: "Escritório Intel i3",
    kicker: "Atendimento e recepção",
    note: "Core i3 de 12ª geração com SSD e monitor de 22 polegadas. Dá conta de navegador, sistema da prefeitura e pacote Office.",
    pecas: {
      w19326: 1,
      w14224: 1,
      w19145: 1,
      w21550: 1,
      w19069: 1,
      w19308: 1,
      w18904: 1,
      w13271: 1,
    },
    cotar: [{ categoria: "outro", descricao: "Windows 11 Pro 64 bits" }],
  },
  {
    name: "Administrativo Intel i5",
    kicker: "O mais pedido nas licitações",
    note: "Core i5 com 16 GB de memória e SSD NVMe. É a configuração que mais aparece nos editais de 2026.",
    pecas: {
      w23315: 1,
      w18884: 1,
      w19145: 2,
      w16874: 1,
      w19069: 1,
      w19308: 1,
      w18904: 1,
      w13271: 1,
    },
    cotar: [{ categoria: "outro", descricao: "Windows 11 Pro 64 bits" }],
  },
  {
    name: "Desempenho Intel i7",
    kicker: "Projetos, engenharia e saúde",
    note: "Core i7 com placa B760, 16 GB, SSD NVMe e monitor de 24 polegadas, para planilhas pesadas, CAD leve e sistemas de imagem.",
    pecas: {
      w18634: 1,
      w18307: 1,
      w19145: 2,
      w16874: 1,
      w13097: 1,
      w19308: 1,
      w19306: 1,
      w13271: 1,
    },
    cotar: [{ categoria: "outro", descricao: "Windows 11 Pro 64 bits" }],
  },
  {
    name: "Escritório AMD Ryzen 7",
    kicker: "Opção AMD",
    note: "Ryzen 7 5700G com vídeo integrado, 16 GB e SSD de 480 GB, sem precisar de placa de vídeo.",
    pecas: {
      w23388: 1,
      w12375: 1,
      w19145: 2,
      w21521: 1,
      w19069: 1,
      w19308: 1,
      w18904: 1,
      w13271: 1,
    },
    cotar: [{ categoria: "outro", descricao: "Windows 11 Pro 64 bits" }],
  },
  {
    name: "Econômico DDR3",
    kicker: "Menor preço por máquina",
    note: "Placa H81 com 8 GB DDR3 e SSD, para pregão de menor preço com processador de 4ª geração.",
    pecas: {
      w8869: 1,
      w13656: 1,
      w19685: 1,
      w21550: 1,
      w19069: 1,
      w19308: 1,
      w14075: 1,
      w13271: 1,
    },
    cotar: [{ categoria: "outro", descricao: "Windows 10 Pro 64 bits" }],
  },
];

// ---------------------------------------------------------------------
// CONTATOS
// Os numeros foram informados com 8 digitos (ex: 9131-9886). Celular no
// Brasil tem 9, entao o "9" inicial foi acrescentado aqui.
// >>> TESTAR CADA BOTAO ANTES DE SUBIR PRA PRODUCAO. <<<
// ---------------------------------------------------------------------
type Vendedor = { nome: string; numero: string };

const VENDEDORES: Vendedor[] = [
  { nome: "Thiago Moseli", numero: "5535991319886" },
  { nome: "Isaac", numero: "5535991836566" },
  { nome: "Osmar", numero: "5535984559330" },
  { nome: "Patrícia", numero: "5535999463434" },
  { nome: "Yhan", numero: "5535999432108" },
];

// Quem recebe a lista de separacao de pecas.
// Galeria de montagens feitas na loja. AGORA são fotos de exemplo —
// troque por fotos reais das montagens da Binário quando tiver.
const MONTAGENS = [
  {
    foto: "/fotos/montagem-1.jpg",
    titulo: "Setup Gamer Branco RGB",
    desc: "Ryzen 5 + RX 6600, cable management caprichado.",
  },
  {
    foto: "/fotos/montagem-2.jpg",
    titulo: "Arena AM5 High-FPS",
    desc: "Fluxo de ar em malha e iluminação sincronizada.",
  },
  {
    foto: "/fotos/montagem-3.jpg",
    titulo: "Estação de Trabalho",
    desc: "Foco em silêncio e organização para o dia a dia.",
  },
];

const CONTATOS_TI: Vendedor[] = [
  { nome: "Estoque Binário", numero: "5535997082738" },
  { nome: "Suporte T.I.", numero: "5535998998455" },
];

const VENDEDOR_STORAGE_KEY = "binario:vendedor";
const CLIENTE_FLAG = "__cliente__";
// Guarda o orçamento em andamento no navegador, pra quem sair no meio e
// voltar depois (ou fechar a aba sem querer) encontrar tudo do jeito que deixou.
const BUILD_STORAGE_KEY = "binario:orcamento-salvo";
const TEMA_STORAGE_KEY = "binario:tema";
// Guarda os últimos orçamentos enviados pro WhatsApp, pra quem operou o
// computador achar de novo sem precisar rolar a conversa no celular.
const HISTORICO_STORAGE_KEY = "binario:historico-orcamentos";
const HISTORICO_MAX = 5;

// Peça que o cliente pediu e a loja não tem em estoque.
type Cotacao = { id: string; categoria: Category | "outro"; descricao: string };

// Um orçamento já enviado — guardado pra reabrir depois.
type HistoricoItem = {
  id: string;
  data: number;
  vendedor: string;
  itens: {
    id: string;
    name: string;
    code: string;
    category: Category;
    qty: number;
    pixPrice: number;
  }[];
  cotacoes: Cotacao[];
  observacao: string;
  totalPix: number;
};

// Logo clara (texto branco) para fundos escuros; escura para fundos claros.
const LOGO_LIGHT = "/logo-binario.png";
const LOGO_DARK = "/logo-binario-dark.png";

// ---------------------------------------------------------------------
// DESEMPENHO ESTIMADO (1080p, gráficos altos). Valores APROXIMADOS pra dar
// uma noção ao cliente — não são benchmark oficial. Ajuste à vontade.
// A chave é o id da GPU; "apu" é o vídeo integrado do Ryzen 5 5600G.
// ---------------------------------------------------------------------
const JOGOS = ["Valorant", "CS2", "Fortnite", "GTA V", "EA FC 25", "Cyberpunk 2077"];
const FPS_MAX = 400;
// Estimativa em 1080p, graficos altos. A chave e o id da peca no catalogo.
// "apu" e o video integrado dos Ryzen "G".
// >>> NUMEROS ESTIMADOS: conferir antes de prometer pro cliente. GPU fora
// da lista simplesmente nao mostra estimativa. <<<
const FPS_POR_GPU: Record<string, number[]> = {
  apu: [70, 75, 45, 50, 60, 22],
  w17063: [25, 20, 0, 0, 20, 0], // GT 610 2GB
  w17103: [45, 35, 20, 22, 35, 0], // GT 730 4GB
  w21635: [45, 35, 20, 22, 35, 0], // GT 730 4GB
  w19296: [50, 40, 25, 28, 40, 0], // GT 740 4GB
  w20485: [90, 75, 45, 45, 65, 0], // GTX 750 Ti 4GB
  w19209: [100, 85, 50, 50, 75, 20], // RX 560 4GB
  w20957: [120, 95, 60, 60, 90, 25], // GTX 1050 Ti 4GB
  w20166: [160, 130, 80, 85, 120, 35], // RX 580 8GB
};

// Os 3 jogos que viram badge no card da build.
const JOGOS_DESTAQUE = [0, 1, 5]; // Valorant, CS2, Cyberpunk

// Resolve os ids de uma build pronta nas pecas do catalogo e reaproveita a
// mesma estimativa de FPS do montador, pra ficha e montador baterem.
function resumoDaBuild(ids: string[]) {
  const pecas = ids
    .map((id) => parts.find((p) => p.id === id))
    .filter((p): p is Part => Boolean(p));
  const gpu = pecas.find((p) => p.category === "gpu");
  const cpu = pecas.find((p) => p.category === "cpu");
  const fpsPerfil = gpu ? FPS_POR_GPU[gpu.id] : cpu?.apu ? FPS_POR_GPU["apu"] : undefined;
  return {
    pecas,
    fpsPerfil,
    fpsFonte: gpu ? gpu.name : cpu?.apu ? "Vídeo integrado" : "",
  };
}

type NivelTrabalho = { nome: string; nota: 0 | 1 | 2 | 3; obs: string };

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Montador de PC | Binário Tecnologia, Varginha-MG",
      },
      {
        name: "description",
        content:
          "Monte seu computador com as peças em estoque na Binário Tecnologia, em Varginha. O montador confere a compatibilidade e calcula a fonte.",
      },
      { property: "og:title", content: "Montador de PC Binário Tecnologia" },
      {
        property: "og:description",
        content:
          "Escolha suas peças de computador com montagem profissional, testes de 24h e atendimento em Varginha-MG.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<Category>("cpu");
  const [detalhePeca, setDetalhePeca] = useState<Part | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [fichasPreset, setFichasPreset] = useState(false);
  const [fichasEstoque, setFichasEstoque] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [precoFaixa, setPrecoFaixa] = useState<
    "todos" | "ate500" | "500a1000" | "1000a2000" | "acima2000"
  >("todos");
  const [platform, setPlatform] = useState<"all" | "AMD" | "Intel">("all");
  const [copied, setCopied] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  // Vendedor que esta operando o site. Fica salvo no navegador daquele
  // computador/celular, entao cada vendedor escolhe o nome dele uma vez so.
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  // Cliente final montando sozinho (nao e vendedor). Nesse caso o botao de
  // separacao pro T.I. some — separar peca e coisa interna da loja.
  const [ehCliente, setEhCliente] = useState(false);
  // Depois de identificar quem pediu, abre a janela de destinos do T.I.
  const [tiAberto, setTiAberto] = useState(false);
  // Pecas que o cliente pediu e a loja nao tem em estoque — vao como "a cotar".
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [cotacaoCategoria, setCotacaoCategoria] = useState<Category | "outro" | "">("");
  const [cotacaoDescricao, setCotacaoDescricao] = useState("");
  const [cotacaoErro, setCotacaoErro] = useState("");
  // Observacao livre do cliente/vendedor (ex: "cliente quer gabinete branco",
  // "já tem teclado, não precisa cotar"). Vai junto no orçamento e no T.I.
  const [observacao, setObservacao] = useState("");
  // O que a janela de vendedores vai fazer quando escolherem um nome.
  const [sellerIntent, setSellerIntent] = useState<
    | { kind: "orcamento" }
    | { kind: "montada"; machineId: string }
    | { kind: "identificar" }
    | { kind: "trocar" }
    | { kind: "obrigatorio" }
    | null
  >(null);
  // Avisa o cliente/vendedor que o orçamento foi recuperado de uma visita
  // anterior, pra não ficar sem entender de onde vieram as peças já marcadas.
  const [orcamentoRestaurado, setOrcamentoRestaurado] = useState(false);
  // Modo escuro: começa claro no servidor (evita piscar) e ajusta no
  // primeiro efeito, lendo o que a pessoa escolheu da última vez.
  const [temaEscuro, setTemaEscuro] = useState(false);
  // Últimos orçamentos enviados pro WhatsApp (fica só neste navegador).
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [historicoAberto, setHistoricoAberto] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORICO_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistorico(parsed.slice(0, HISTORICO_MAX) as HistoricoItem[]);
        }
      }
    } catch {
      // navegador sem storage ou histórico corrompido — segue vazio
    }
  }, []);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(TEMA_STORAGE_KEY);
      const escuro = salvo
        ? salvo === "dark"
        : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      if (escuro) setTemaEscuro(true);
    } catch {
      // navegador sem storage/matchMedia — segue no modo claro
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    try {
      window.localStorage.setItem(TEMA_STORAGE_KEY, temaEscuro ? "dark" : "light");
    } catch {
      // navegador sem storage — a preferência só vale pra essa visita
    }
  }, [temaEscuro]);

  useEffect(() => {
    const ids = new URLSearchParams(window.location.search).get("pc")?.split(",") ?? [];
    const restored = Object.fromEntries(
      ids.filter((id) => parts.some((part) => part.id === id)).map((id) => [id, 1]),
    );
    const rawObs = new URLSearchParams(window.location.search).get("obs");
    if (rawObs) setObservacao(decodeURIComponent(rawObs).slice(0, 400));
    const rawCot = new URLSearchParams(window.location.search).get("cot");
    let restoredCot: Cotacao[] = [];
    if (rawCot) {
      try {
        const parsed: unknown = JSON.parse(decodeURIComponent(rawCot));
        if (Array.isArray(parsed)) {
          restoredCot = parsed
            .filter(
              (item): item is { c: string; d: string } =>
                !!item && typeof item === "object" && "c" in item && "d" in item,
            )
            .map((item, i) => ({
              id: `cot-url-${i}`,
              categoria: item.c as Category | "outro",
              descricao: String(item.d).slice(0, 200),
            }));
          setCotacoes(restoredCot);
        }
      } catch {
        // link com parametro estragado — ignora as cotacoes
      }
    }
    if (Object.keys(restored).length || restoredCot.length) {
      setSelected(restored);
      setReviewMode(true);
    } else {
      // sem link compartilhado: tenta recuperar o orçamento salvo localmente
      try {
        const rawBuild = window.localStorage.getItem(BUILD_STORAGE_KEY);
        if (rawBuild) {
          const parsed: unknown = JSON.parse(rawBuild);
          if (parsed && typeof parsed === "object") {
            const obj = parsed as {
              selected?: Record<string, number>;
              cotacoes?: Cotacao[];
              observacao?: string;
            };
            const validSelected = Object.fromEntries(
              Object.entries(obj.selected ?? {}).filter(
                ([id, qtd]) =>
                  parts.some((part) => part.id === id) && typeof qtd === "number" && qtd > 0,
              ),
            );
            const validCot = Array.isArray(obj.cotacoes) ? obj.cotacoes : [];
            const validObs = typeof obj.observacao === "string" ? obj.observacao.slice(0, 400) : "";
            if (Object.keys(validSelected).length || validCot.length || validObs) {
              setSelected(validSelected);
              setCotacoes(validCot);
              if (validObs) setObservacao(validObs);
              setOrcamentoRestaurado(true);
            }
          }
        }
      } catch {
        // orçamento salvo corrompido ou navegador sem storage — ignora
      }
    }
    let temIdentidade = false;
    try {
      const saved = window.localStorage.getItem(VENDEDOR_STORAGE_KEY);
      if (saved === CLIENTE_FLAG) {
        setEhCliente(true);
        temIdentidade = true;
      } else {
        const match = VENDEDORES.find((item) => item.nome === saved);
        if (match) {
          setVendedor(match);
          temIdentidade = true;
        }
      }
    } catch {
      // navegador sem storage (aba anonima, etc) — segue sem operador salvo
    }
    // Ninguém pode esquecer de se identificar: sem link compartilhado e sem
    // vendedor/cliente salvo, a janela abre sozinha e não deixa fechar sem
    // escolher (evita mandar coisa pro T.I. sem saber quem pediu).
    const linkCompartilhado = Object.keys(restored).length > 0 || restoredCot.length > 0;
    if (!temIdentidade && !linkCompartilhado) {
      setSellerIntent({ kind: "obrigatorio" });
    }
  }, []);

  // Salva o orçamento em andamento a cada mudança, exceto no modo resumo
  // (link compartilhado) — ali quem está vendo não é dono da montagem.
  useEffect(() => {
    if (reviewMode) return;
    try {
      if (!Object.keys(selected).length && !cotacoes.length && !observacao.trim()) {
        window.localStorage.removeItem(BUILD_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(
        BUILD_STORAGE_KEY,
        JSON.stringify({ selected, cotacoes, observacao }),
      );
    } catch {
      // navegador sem storage (aba anonima, etc) — segue sem salvar
    }
  }, [selected, cotacoes, observacao, reviewMode]);

  function escolherVendedor(item: Vendedor) {
    setVendedor(item);
    setEhCliente(false);
    try {
      window.localStorage.setItem(VENDEDOR_STORAGE_KEY, item.nome);
    } catch {
      // ignora
    }
  }

  function escolherCliente() {
    setVendedor(null);
    setEhCliente(true);
    try {
      window.localStorage.setItem(VENDEDOR_STORAGE_KEY, CLIENTE_FLAG);
    } catch {
      // ignora
    }
    setSellerIntent(null);
  }

  // A categoria é obrigatória de propósito: sem ela chega pedido tipo
  // "5600mhz" e ninguém sabe se é memória, fonte ou processador.
  function addCotacao() {
    if (!cotacaoCategoria) {
      setCotacaoErro("Escolha de que tipo é a peça.");
      return;
    }
    const descricao = cotacaoDescricao.trim();
    if (descricao.length < 3) {
      setCotacaoErro("Descreva a peça que o cliente quer.");
      return;
    }
    setCotacoes((current) => [
      ...current,
      { id: `cot-${Date.now()}`, categoria: cotacaoCategoria, descricao },
    ]);
    setCotacaoCategoria("");
    setCotacaoDescricao("");
    setCotacaoErro("");
  }

  function removeCotacao(id: string) {
    setCotacoes((current) => current.filter((item) => item.id !== id));
  }

  function rotuloCotacao(item: Cotacao) {
    if (item.categoria === "outro") return "Outro";
    return categories.find((cat) => cat.id === item.categoria)?.label ?? "Outro";
  }

  // Linhas "a cotar" que entram no WhatsApp, no PDF e no pedido pro T.I.
  const linhasCotacao = cotacoes.map(
    (item) => `• [A COTAR] ${rotuloCotacao(item)}: ${item.descricao}`,
  );

  const chosen = useMemo(() => parts.filter((part) => selected[part.id]), [selected]);
  const totalPix = chosen.reduce((sum, part) => sum + part.pixPrice * (selected[part.id] ?? 0), 0);
  // Preco de venda do WinThor (PCTABPR.PVENDA), sem desconto de PIX por ora.
  const totalCard = totalPix;

  const cpu = chosen.find((part) => part.category === "cpu");
  const gpu = chosen.find((part) => part.category === "gpu");
  const psu = chosen.find((part) => part.category === "psu");
  const mobo = chosen.find((part) => part.category === "motherboard");
  const rams = chosen.filter((part) => part.category === "memory");
  // Pentes ja escolhidos x slots da placa. Placa sem o dado nao limita.
  const slotsDaPlaca = mobo?.slots;
  const pentesUsados = rams.reduce((sum, r) => sum + (selected[r.id] ?? 1), 0);
  const slotsCheios = slotsDaPlaca !== undefined && pentesUsados >= slotsDaPlaca;

  const requiredWatts = fonteNecessaria(cpu, gpu);
  const currentPsuWatts = psu?.watts ?? 0;
  const powerOk = !requiredWatts || !psu || currentPsuWatts >= requiredWatts;
  const wattsPct =
    requiredWatts && currentPsuWatts
      ? Math.min(100, Math.round((requiredWatts / currentPsuWatts) * 100))
      : 0;

  const socketOk = socketCompativel(cpu, mobo);
  const boardMemType = memoriaDaPlaca(mobo, cpu);
  const ramOk = memoriasCompativeis(boardMemType, rams);

  // ----- Checklist de compatibilidade -----
  type Check = { estado: "ok" | "warn" | "pending"; texto: string };
  const checks: Check[] = [
    !cpu || !mobo
      ? { estado: "pending", texto: "Processador e placa-mãe" }
      : socketOk
        ? { estado: "ok", texto: `Socket ${cpu.socket} compatível` }
        : { estado: "warn", texto: "Socket da placa não bate com a CPU" },
    !boardMemType || !rams.length
      ? { estado: "pending", texto: "Memória compatível" }
      : !ramOk
        ? { estado: "warn", texto: `Troque a memória para ${boardMemType}` }
        : slotsDaPlaca !== undefined
          ? {
              estado: "ok",
              texto: `Memória ${boardMemType}, ${pentesUsados} de ${slotsDaPlaca} slots`,
            }
          : { estado: "ok", texto: `Memória ${boardMemType} compatível` },
    !cpu
      ? { estado: "pending", texto: "Saída de vídeo" }
      : gpu
        ? { estado: "ok", texto: `Vídeo pela ${gpu.name}` }
        : cpu.videoIntegrado
          ? { estado: "ok", texto: "Vídeo integrado no processador" }
          : {
              estado: "warn",
              texto: "Processador sem vídeo integrado, precisa de placa",
            },
    !requiredWatts
      ? { estado: "pending", texto: "Fonte adequada ao consumo" }
      : !psu
        ? {
            estado: "pending",
            texto: `Escolha uma fonte de ${requiredWatts}W+`,
          }
        : powerOk
          ? { estado: "ok", texto: `Fonte de ${psu.watts}W dá conta` }
          : { estado: "warn", texto: `Fonte fraca (mín. ${requiredWatts}W)` },
  ];
  const tudoOk = checks.every((c) => c.estado === "ok");

  // ----- "Falta pouco" -----
  const ESSENCIAIS: Category[] = ["cpu", "motherboard", "memory", "storage", "psu", "case"];
  const faltando = ESSENCIAIS.filter((id) => !chosen.some((p) => p.category === id));
  const faltandoLabels = faltando.map((id) => categories.find((c) => c.id === id)?.short ?? id);
  // Peças da máquina (não periféricos) que ainda não foram escolhidas.
  // Peca marcada "a cotar" ja tem dono: nao aparece como pendente.
  const pendentes = categories.filter(
    (c) =>
      !c.periferico &&
      !chosen.some((p) => p.category === c.id) &&
      !cotacoes.some((item) => item.categoria === c.id),
  );

  // ----- Sugestão de upgrade -----
  // Pra categoria de escolha única (memória/SSD ficam de fora, são multi),
  // acha a próxima peça mais cara da mesma categoria que ainda é compatível
  // e sugere só quando a diferença de preço é pequena ("por mais R$X...").
  function upgradeSugerido(part: Part): Part | null {
    if (isMulti(part.category)) return null;
    const candidatos = parts
      .filter((candidato) => {
        if (candidato.category !== part.category) return false;
        if (candidato.id === part.id) return false;
        if (candidato.stock === 0) return false;
        if (candidato.pixPrice <= part.pixPrice) return false;
        if (part.category === "motherboard" && cpu?.socket && candidato.socket !== cpu.socket)
          return false;
        if (part.category === "cpu" && mobo?.socket && candidato.socket !== mobo.socket)
          return false;
        if (
          part.category === "psu" &&
          requiredWatts &&
          candidato.watts !== undefined &&
          candidato.watts < requiredWatts
        )
          return false;
        return true;
      })
      .sort((a, b) => a.pixPrice - b.pixPrice);
    const proximo = candidatos[0];
    if (!proximo) return null;
    const diff = proximo.pixPrice - part.pixPrice;
    const limite = Math.min(400, Math.max(150, part.pixPrice * 0.25));
    return diff <= limite ? proximo : null;
  }

  const upgradeAtivo = (() => {
    const partAtual = chosen.find((part) => part.category === active);
    if (!partAtual) return null;
    const sugestao = upgradeSugerido(partAtual);
    return sugestao ? { atual: partAtual, sugestao } : null;
  })();

  const completed = CATEGORIAS_PECA.filter((category) =>
    chosen.some((part) => part.category === category.id),
  ).length;

  // ----- Desempenho estimado da montagem atual -----
  const ramTotal = rams.reduce((sum, r) => sum + (r.ramGB ?? 0) * (selected[r.id] ?? 1), 0);
  const fpsPerfil = gpu ? FPS_POR_GPU[gpu.id] : cpu?.apu ? FPS_POR_GPU["apu"] : undefined;
  const fpsFonte = gpu ? gpu.name : cpu?.apu ? "Vídeo integrado (Vega)" : "";
  const temDesempenho = Boolean(cpu || gpu);

  const trabalho: NivelTrabalho[] = [
    {
      nome: "Escritório & estudos",
      nota: cpu ? 3 : 0,
      obs: "Excel, navegador, sistema, emissão de nota",
    },
    {
      nome: "Edição de foto e vídeo",
      nota: !cpu ? 0 : ramTotal >= 16 ? (gpu ? 3 : 2) : 1,
      obs: "Photoshop, Premiere, CapCut",
    },
    {
      nome: "Render 3D, live e stream",
      nota: !cpu ? 0 : !gpu ? 1 : ramTotal >= 32 ? 3 : ramTotal >= 16 ? 2 : 1,
      obs: "Blender, OBS, transmissão",
    },
  ];

  const visibleParts = parts.filter((part) => {
    if (part.category !== active) return false;
    if (part.stock === 0) return false;
    if (platform !== "all" && part.platform && part.platform !== platform) return false;
    if (active === "motherboard" && cpu?.socket && part.socket !== cpu.socket) return false;
    if (active === "memory" && boardMemType && part.memType && part.memType !== boardMemType)
      return false;
    if (active === "psu" && requiredWatts && (part.watts ?? 0) < requiredWatts) return false;
    if (precoFaixa === "ate500" && part.pixPrice > 500) return false;
    if (precoFaixa === "500a1000" && (part.pixPrice < 500 || part.pixPrice > 1000)) return false;
    if (precoFaixa === "1000a2000" && (part.pixPrice < 1000 || part.pixPrice > 2000)) return false;
    if (precoFaixa === "acima2000" && part.pixPrice < 2000) return false;
    return `${part.name} ${part.brand} ${part.code} ${part.specs.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function selectPart(part: Part) {
    if (part.category === "memory" && slotsCheios) return;
    const multi = isMulti(part.category);
    setSelected((current) => {
      const next = { ...current };
      if (!multi) {
        // categoria de escolha unica: troca a peca da mesma categoria
        for (const selectedPart of parts)
          if (selectedPart.category === part.category) delete next[selectedPart.id];
        next[part.id] = 1;
      } else {
        // memoria / SSD: soma uma unidade, permitindo varios itens juntos
        next[part.id] = (next[part.id] ?? 0) + 1;
      }
      return next;
    });
    // so avanca sozinho nas etapas de escolha unica; em multi o vendedor
    // decide quando terminou e clica em "Proxima etapa".
    if (!multi) {
      const index = categories.findIndex((category) => category.id === part.category);
      const nextCategory = categories[index + 1];
      if (nextCategory) setActive(nextCategory.id);
    }
  }

  function mudarQtd(id: string, delta: number) {
    // Memoria nao pode passar do numero de slots da placa escolhida.
    const peca = parts.find((p) => p.id === id);
    if (delta > 0 && peca?.category === "memory" && slotsCheios) return;
    setSelected((current) => {
      const next = { ...current };
      const q = (next[id] ?? 0) + delta;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  }

  function moveStep(offset: -1 | 1) {
    const currentIndex = categories.findIndex((item) => item.id === active);
    const target = categories[Math.max(0, Math.min(categories.length - 1, currentIndex + offset))];
    if (target) setActive(target.id);
  }

  // Ficha que abre dentro do card: o que vem na maquina e como ela roda.
  function fichaDaBuild(ids: string[]) {
    const { pecas, fpsPerfil, fpsFonte } = resumoDaBuild(ids);
    return (
      <div className="build-ficha">
        <h4>O que vem nessa máquina</h4>
        <ul className="build-ficha-pecas">
          {pecas.map((peca) => (
            <li key={peca.id}>
              <span className="build-ficha-cat">
                {categories.find((c) => c.id === peca.category)?.label ?? peca.category}
              </span>
              <span className="build-ficha-nome">{peca.name}</span>
            </li>
          ))}
        </ul>
        {fpsPerfil && (
          <>
            <h4>
              Como roda nos jogos <small>({fpsFonte})</small>
            </h4>
            <div className="build-ficha-fps">
              {JOGOS.map((jogo, i) => {
                const fps = fpsPerfil[i] ?? 0;
                const pct = Math.min(100, (fps / FPS_MAX) * 100);
                const cor =
                  fps >= 120
                    ? "var(--status-ok)"
                    : fps >= 60
                      ? "var(--status-alerta)"
                      : "var(--status-erro)";
                return (
                  <div key={jogo} className="build-ficha-fps-row">
                    <span>{jogo}</span>
                    <div className="build-ficha-fps-track">
                      <div
                        className="build-ficha-fps-fill"
                        style={{ width: `${pct}%`, backgroundColor: cor }}
                      />
                    </div>
                    <strong className="mono">{fps || "-"}</strong>
                  </div>
                );
              })}
            </div>
            <p className="build-ficha-nota">
              Estimativa em 1080p com gráficos altos. Não é benchmark oficial.
            </p>
          </>
        )}
      </div>
    );
  }

  function loadPreset(ids: string[]) {
    setSelected(Object.fromEntries(ids.map((id) => [id, 1])));
    document.querySelector("#montador")?.scrollIntoView({ behavior: "smooth" });
  }

  function loadModelo(modelo: ModeloEmpresa) {
    setSelected({ ...modelo.pecas });
    setCotacoes(modelo.cotar.map((item, i) => ({ ...item, id: `cot-${Date.now()}-${i}` })));
    document.querySelector("#montador")?.scrollIntoView({ behavior: "smooth" });
  }

  async function copiarTexto(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Fallback para quando o clipboard nao esta disponivel (aba sem foco,
      // permissao negada, ou site aberto por IP em vez de localhost/https).
      try {
        const area = document.createElement("textarea");
        area.value = texto;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    }
  }

  async function shareBuild() {
    const url = new URL(window.location.href);
    url.searchParams.set("pc", chosen.map((part) => part.id).join(","));
    if (cotacoes.length) {
      url.searchParams.set(
        "cot",
        encodeURIComponent(
          JSON.stringify(cotacoes.map((item) => ({ c: item.categoria, d: item.descricao }))),
        ),
      );
    } else {
      url.searchParams.delete("cot");
    }
    if (observacao.trim()) {
      url.searchParams.set("obs", encodeURIComponent(observacao.trim()));
    } else {
      url.searchParams.delete("obs");
    }
    const ok = await copiarTexto(url.toString());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      window.prompt("Não consegui copiar sozinho. Copie o link abaixo:", url.toString());
    }
  }

  function editBuild() {
    const url = new URL(window.location.href);
    url.searchParams.delete("pc");
    url.searchParams.delete("cot");
    url.searchParams.delete("obs");
    window.history.replaceState({}, "", url.pathname + url.search);
    setReviewMode(false);
  }

  // ---- PDF do orcamento -------------------------------------------------
  // O bloco .print-budget ja existe pra impressao; aqui ele vira imagem e
  // entra num PDF A4, pra poder ser anexado no WhatsApp.
  async function gerarPdf(): Promise<File | null> {
    const alvo = printRef.current;
    if (!alvo) return null;
    setGerandoPdf(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      // O bloco fica escondido na tela; mostra so pro print e esconde de novo.
      alvo.classList.add("print-budget-capturando");
      const canvas = await html2canvas(alvo, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      alvo.classList.remove("print-budget-capturando");

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const larguraPagina = pdf.internal.pageSize.getWidth();
      const alturaPagina = pdf.internal.pageSize.getHeight();
      const margem = 10;
      const largura = larguraPagina - margem * 2;
      const altura = (canvas.height * largura) / canvas.width;
      const img = canvas.toDataURL("image/jpeg", 0.92);

      // Orcamento longo quebra em varias paginas.
      let restante = altura;
      let posicao = margem;
      pdf.addImage(img, "JPEG", margem, posicao, largura, altura);
      restante -= alturaPagina - margem * 2;
      while (restante > 0) {
        posicao = restante - altura + margem;
        pdf.addPage();
        pdf.addImage(img, "JPEG", margem, posicao, largura, altura);
        restante -= alturaPagina - margem * 2;
      }

      const nome = `orcamento-binario-${new Date().toISOString().slice(0, 10)}.pdf`;
      return new File([pdf.output("blob")], nome, { type: "application/pdf" });
    } catch {
      return null;
    } finally {
      setGerandoPdf(false);
    }
  }

  // Compartilha o PDF. No celular abre o menu do sistema (da pra escolher o
  // WhatsApp e o arquivo vai anexado). No PC o menu nao existe, entao baixa.
  async function compartilharPdf(texto: string) {
    const arquivo = await gerarPdf();
    if (!arquivo) return false;
    const nav = navigator as Navigator & {
      canShare?: (d: { files?: File[] }) => boolean;
    };
    if (nav.share && nav.canShare?.({ files: [arquivo] })) {
      try {
        await nav.share({ files: [arquivo], text: texto });
        return true;
      } catch {
        // usuario fechou o menu: nao baixa por cima
        return false;
      }
    }
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement("a");
    a.href = url;
    a.download = arquivo.name;
    a.click();
    URL.revokeObjectURL(url);
    return false;
  }

  function abrirWhats(numero: string, texto: string) {
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  // Guarda uma cópia do que foi mandado, pra aparecer no histórico depois.
  function registrarHistorico(nomeVendedor: string) {
    if (!chosen.length && !cotacoes.length) return;
    const entry: HistoricoItem = {
      id: `h-${Date.now()}`,
      data: Date.now(),
      vendedor: nomeVendedor,
      itens: chosen.map((part) => ({
        id: part.id,
        name: part.name,
        code: part.code,
        category: part.category,
        qty: selected[part.id] ?? 1,
        pixPrice: part.pixPrice,
      })),
      cotacoes,
      observacao,
      totalPix,
    };
    setHistorico((current) => {
      const next = [entry, ...current].slice(0, HISTORICO_MAX);
      try {
        window.localStorage.setItem(HISTORICO_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // navegador sem storage — o histórico só vale pra essa visita
      }
      return next;
    });
  }

  // Recarrega um orçamento antigo do histórico pro montador atual.
  function carregarHistorico(entry: HistoricoItem) {
    const restoredSel: Record<string, number> = {};
    for (const item of entry.itens) {
      if (parts.some((p) => p.id === item.id)) restoredSel[item.id] = item.qty;
    }
    setSelected(restoredSel);
    setCotacoes(entry.cotacoes ?? []);
    setObservacao(entry.observacao ?? "");
    setHistoricoAberto(false);
  }

  // Orcamento montado peca a peca -> vai pro WhatsApp do vendedor escolhido.
  // Mesmo texto do orcamento, sem destinatario fixo: serve pro PDF que vai
  // pro cliente.
  function textoOrcamento(saudacao: string) {
    const linhas = [
      ...chosen.map((part) => `• [${part.code}] *${part.name}* - ${money.format(part.pixPrice)}`),
      ...linhasCotacao,
    ].join("\n");
    const aviso = cotacoes.length
      ? `\n\n_${cotacoes.length} item(ns) marcado(s) como A COTAR ainda não entram no total._`
      : "";
    const obs = observacao.trim() ? `\n\n*Observação:* ${observacao.trim()}` : "";
    return `${saudacao}\n\n${linhas || "Montagem em andamento."}\n\n*Total*: ${money.format(totalPix)}${aviso}${obs}\n\nMontagem inclusa, feita aqui em Varginha.`;
  }

  // Manda o orcamento em PDF pro cliente. No celular abre o menu do sistema
  // com o arquivo anexado; no PC baixa pra anexar na conversa.
  async function enviarPdfCliente() {
    if (!chosen.length && !cotacoes.length) return;
    const quem = vendedor && !ehCliente ? `, ${vendedor.nome} da Binário` : "";
    const compartilhou = await compartilharPdf(
      textoOrcamento(`Segue o orçamento do seu PC${quem}:`),
    );
    if (!compartilhou) setPdfBaixado(true);
  }

  function enviarOrcamento(item: Vendedor) {
    const linhas = [
      ...chosen.map((part) => `• [${part.code}] *${part.name}* — ${money.format(part.pixPrice)}`),
      ...linhasCotacao,
    ].join("\n");
    const aviso = cotacoes.length
      ? `\n\n_${cotacoes.length} item(ns) marcado(s) como A COTAR ainda não entram no total._`
      : "";
    const obs = observacao.trim() ? `\n\n*Observação:* ${observacao.trim()}` : "";
    const text = `Olá, ${item.nome}! Gostaria de consultar este orçamento de PC:\n\n${linhas || "Ainda estou montando minhas peças."}\n\n*Total*: ${money.format(totalPix)}${aviso}${obs}\n\nMontagem inclusa. Podem verificar disponibilidade em Varginha?`;
    registrarHistorico(item.nome);
    abrirWhats(item.numero, text);
  }

  // Maquina ja montada em estoque -> WhatsApp do vendedor escolhido.
  function enviarMontada(item: Vendedor, machineId: string) {
    const machine = stockMachines.find((m) => m.id === machineId);
    if (!machine) return;
    const text = `Olá, ${item.nome}! Tenho interesse nesta máquina pronta entrega:\n\n*${machine.name}*\nCódigo: ${machine.id}\n${machine.spec}\n\nValor: ${money.format(machine.pixPrice)}\n\nAinda está disponível?`;
    abrirWhats(item.numero, text);
  }

  // Texto da lista de separacao, assinado por quem pediu.
  function textoSeparacao() {
    const list = [
      ...chosen.map((part) => `• [${part.code}] ${part.name} — ${selected[part.id] ?? 1}un`),
      ...linhasCotacao,
    ].join("\n");
    const quem = vendedor?.nome ?? "Vendedor";
    const obs = observacao.trim() ? `\n\n*Observação:* ${observacao.trim()}` : "";
    return `*MONTAGEM PARA O T.I.*\n\nSolicitado por: *${quem}*\nLocal: Loja Varginha\n\n${list}${obs}`;
  }

  // Abre a conversa de UM destino (Estoque ou T.I.). Cada clique = 1 aba, pra
  // o navegador nao bloquear como pop-up (era o motivo de so ir pro Estoque).
  function enviarDestinoTI(contato: Vendedor) {
    abrirWhats(contato.numero, textoSeparacao());
  }

  // Mesma lista, mas levando o PDF junto.
  async function enviarDestinoTIComPdf(contato: Vendedor) {
    const texto = textoSeparacao();
    const compartilhou = await compartilharPdf(texto);
    // Sem menu de compartilhamento (PC): o PDF baixou, abre a conversa pra
    // o vendedor anexar o arquivo que acabou de cair na pasta.
    if (!compartilhou) abrirWhats(contato.numero, texto);
  }

  function sendToTI() {
    if (!chosen.length && !cotacoes.length) return;
    // Cliente nao separa peca — botao nem aparece pra ele, mas por seguranca:
    if (ehCliente) return;
    // Sem vendedor identificado a lista nao sai — o T.I. precisa saber quem pediu.
    if (!vendedor) {
      setSellerIntent({ kind: "identificar" });
      return;
    }
    setTiAberto(true);
  }

  // Uma unica janela de vendedores serve pros tres casos.
  function onEscolherVendedor(item: Vendedor) {
    escolherVendedor(item);
    const intent = sellerIntent;
    setSellerIntent(null);
    if (!intent) return;
    if (intent.kind === "orcamento") enviarOrcamento(item);
    if (intent.kind === "montada") enviarMontada(item, intent.machineId);
    if (intent.kind === "identificar") setTiAberto(true);
  }

  const identificacaoObrigatoria = sellerIntent?.kind === "obrigatorio";

  const sellerDialog = (
    <Dialog
      open={sellerIntent !== null}
      onOpenChange={(open) => {
        // A identificação obrigatória (primeira visita, sem nome salvo) não
        // fecha sozinha — só depois de escolher vendedor ou "sou cliente".
        if (identificacaoObrigatoria) return;
        if (!open) setSellerIntent(null);
      }}
    >
      <DialogContent
        hideCloseButton={identificacaoObrigatoria}
        onInteractOutside={(e) => {
          if (identificacaoObrigatoria) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (identificacaoObrigatoria) e.preventDefault();
        }}
        className="bg-white border-slate-200 text-slate-900 max-w-md shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display text-slate-900">
            {sellerIntent?.kind === "identificar" ||
            sellerIntent?.kind === "trocar" ||
            identificacaoObrigatoria
              ? "Quem está montando?"
              : "Quem vai te atender?"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            {identificacaoObrigatoria
              ? 'Antes de começar, escolha seu nome ou "sou cliente". É assim que o T.I. sabe quem pediu a montagem.'
              : sellerIntent?.kind === "identificar"
                ? "Escolha seu nome para o T.I. e o Estoque saberem quem pediu a separação das peças."
                : sellerIntent?.kind === "trocar"
                  ? "Seu nome fica salvo neste computador e assina os pedidos enviados ao T.I."
                  : "A lista de peças e o orçamento já vão prontos na mensagem."}
          </DialogDescription>
        </DialogHeader>

        {(sellerIntent?.kind === "identificar" ||
          sellerIntent?.kind === "trocar" ||
          identificacaoObrigatoria) && <span className="seller-group-label">Vendedores</span>}

        <div className="seller-grid">
          {VENDEDORES.map((item) => (
            <button key={item.nome} onClick={() => onEscolherVendedor(item)} className="seller-btn">
              <span className="seller-avatar">{item.nome.charAt(0)}</span>
              <span className="seller-name">{item.nome}</span>
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>
          ))}
        </div>

        {(sellerIntent?.kind === "identificar" ||
          sellerIntent?.kind === "trocar" ||
          identificacaoObrigatoria) && (
          <button onClick={escolherCliente} className="seller-cliente-btn">
            <UserRound className="w-4 h-4" />
            <span>Sou cliente (não sou vendedor)</span>
          </button>
        )}
      </DialogContent>
    </Dialog>
  );

  // Janela de destinos da separação: Estoque e Suporte T.I., cada um 1 clique.
  const tiDialog = (
    <Dialog open={tiAberto} onOpenChange={setTiAberto}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display text-slate-900">
            Enviar montagem para separação
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            {vendedor
              ? `Assinado como ${vendedor.nome}. Clique em cada destino para abrir a conversa. O WhatsApp bloqueia se tentar abrir os dois de uma vez.`
              : "Clique em cada destino para abrir a conversa."}
          </DialogDescription>
        </DialogHeader>

        <div className="seller-grid">
          {CONTATOS_TI.map((contato) => (
            <div key={contato.numero} className="destino-linha">
              <button onClick={() => enviarDestinoTI(contato)} className="seller-btn">
                <span className="seller-avatar">
                  <Package className="w-4 h-4" />
                </span>
                <span className="seller-name">{contato.nome}</span>
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>
              <button
                onClick={() => enviarDestinoTIComPdf(contato)}
                className="btn-com-pdf"
                disabled={gerandoPdf}
                title="Abre o compartilhamento com o PDF anexado"
              >
                <Download className="w-3.5 h-3.5" />
                {gerandoPdf ? "Gerando..." : "Com PDF"}
              </button>
            </div>
          ))}
        </div>

        <p className="seller-dica">
          Dica: um grupo do WhatsApp com Estoque + T.I. deixaria isso em um clique só. Se criarem,
          me passa o link do grupo.
        </p>
      </DialogContent>
    </Dialog>
  );

  // Últimos orçamentos enviados — pra reabrir sem precisar remontar do zero.
  const historicoDialog = (
    <Dialog open={historicoAberto} onOpenChange={setHistoricoAberto}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display text-slate-900">
            Últimos orçamentos enviados
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            Os {HISTORICO_MAX} últimos orçamentos mandados pro WhatsApp neste computador. Carregar
            substitui a montagem atual.
          </DialogDescription>
        </DialogHeader>

        {historico.length === 0 ? (
          <p className="history-empty">Nenhum orçamento enviado ainda por aqui.</p>
        ) : (
          <div className="history-list">
            {historico.map((entry) => (
              <div key={entry.id} className="history-card">
                <div className="history-card-head">
                  <strong>{entry.vendedor}</strong>
                  <span>
                    {new Date(entry.data).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="history-card-itens">
                  {entry.itens.length
                    ? entry.itens
                        .map((item) => `${item.name}${item.qty > 1 ? ` (${item.qty}x)` : ""}`)
                        .join(" · ")
                    : "Só itens a cotar"}
                  {entry.cotacoes.length > 0 && ` · ${entry.cotacoes.length} a cotar`}
                </div>
                <div className="history-card-foot">
                  <span className="history-card-total">{money.format(entry.totalPix)}</span>
                  <button onClick={() => carregarHistorico(entry)}>Carregar de novo</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Bloco que sai no PDF / impressao. Fica escondido na tela.
  const printBudget = (
    <div className="print-budget" ref={printRef}>
      <div className="print-budget-head">
        <img src={LOGO_DARK} alt="Binário Tecnologia" />
        <div>
          <strong>Orçamento de Montagem de PC</strong>
          <span>Binário Tecnologia · Varginha - MG · Montagem inclusa</span>
        </div>
      </div>
      <table className="print-budget-table">
        <thead>
          <tr>
            <th></th>
            <th>Código</th>
            <th>Peça</th>
            <th>Qtd</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {chosen.map((part) => (
            <tr key={part.id}>
              <td className="print-thumb-cell">
                {part.foto ? <img src={part.foto} alt="" className="print-thumb" /> : null}
              </td>
              <td className="mono">{part.code}</td>
              <td>{part.name}</td>
              <td>{selected[part.id] ?? 1}</td>
              <td>{money.format(part.pixPrice)}</td>
            </tr>
          ))}
          {cotacoes.map((item) => (
            <tr key={item.id}>
              <td className="print-thumb-cell"></td>
              <td className="mono">A COTAR</td>
              <td>
                {rotuloCotacao(item)}: {item.descricao}
              </td>
              <td>1</td>
              <td>sob consulta</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="print-budget-total">
        <span>
          Total: <strong>{money.format(totalPix)}</strong>
        </span>
      </div>
      <p className="print-budget-note">
        Valores sujeitos a confirmação de estoque. Peças separadas pelo código informado acima.
        {cotacoes.length > 0 &&
          " Itens marcados como A COTAR não estão em estoque e não entram no total."}
      </p>
      {observacao.trim() && (
        <p className="print-budget-obs">
          <strong>Observação:</strong> {observacao}
        </p>
      )}
    </div>
  );

  const budgetSummary = (
    <>
      <div className="summary-items-list">
        {categories.map((category) => {
          const itens = chosen.filter((item) => item.category === category.id);
          const CategoryIcon = category.icon;

          // Categoria sem peça some daqui; as obrigatórias que faltam
          // aparecem juntas no bloco "Falta escolher" logo abaixo.
          if (!itens.length) return null;

          return itens.map((part) => {
            const qtd = selected[part.id] ?? 1;
            return (
              <div
                key={part.id}
                onClick={() => !reviewMode && setActive(category.id)}
                className={
                  reviewMode
                    ? "summary-item-row px-2"
                    : "summary-item-row cursor-pointer hover:bg-slate-50 px-2 rounded transition-colors"
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CategoryIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="summary-item-label">
                    <small>
                      {category.short}
                      {qtd > 1 ? ` · ${qtd}x` : ""}
                    </small>
                    <strong>{part.name}</strong>
                    <em className="summary-item-code">Cód. {part.code}</em>
                  </div>
                </div>
                <span className="summary-item-price">{money.format(part.pixPrice * qtd)}</span>
              </div>
            );
          });
        })}

        {!reviewMode && pendentes.length > 0 && (
          <div className="falta-escolher">
            <small>{chosen.length ? "Falta escolher" : "Comece pelo processador"}</small>
            <div className="falta-escolher-lista">
              {pendentes.map((category) => {
                const Icon = category.icon;
                return (
                  <button key={category.id} type="button" onClick={() => setActive(category.id)}>
                    <Icon className="w-3.5 h-3.5" />
                    {category.short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {cotacoes.map((item) => (
          <div key={item.id} className="summary-item-row px-2">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="summary-item-label">
                <small>{rotuloCotacao(item)} · a cotar</small>
                <strong>{item.descricao}</strong>
              </div>
            </div>
            {!reviewMode && (
              <button
                onClick={() => removeCotacao(item.id)}
                className="text-slate-400 hover:text-red-500 shrink-0"
                title="Remover cotação"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {cotacoes.length > 0 && (
        <p className="cotacao-aviso">
          {cotacoes.length === 1 ? "1 item" : `${cotacoes.length} itens`} sob encomenda — o valor
          entra depois que o vendedor cotar com o fornecedor.
        </p>
      )}

      {/* Observação livre — pedido especial do cliente, cor do gabinete, etc. */}
      {reviewMode ? (
        observacao.trim() && (
          <div className="obs-box">
            <Pencil className="w-4 h-4" />
            <div>
              <strong>Observação</strong>
              <p>{observacao}</p>
            </div>
          </div>
        )
      ) : (
        <div className="obs-box obs-box-edit">
          <Pencil className="w-4 h-4" />
          <div>
            <strong>Observação (opcional)</strong>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.slice(0, 400))}
              placeholder="Ex: cliente quer gabinete branco, já tem teclado e mouse, entregar até sexta..."
              rows={2}
              maxLength={400}
            />
          </div>
        </div>
      )}

      {/* Power Watts Progress Meter */}
      <div className="watts-meter-box">
        <div className="watts-header">
          <span className="flex items-center gap-1 text-slate-800">
            <Zap className="w-4 h-4 text-amber-600" /> Fonte recomendada
          </span>
          <span className="font-mono text-slate-800 font-bold">
            {requiredWatts ? `${requiredWatts} W` : "a calcular"}
          </span>
        </div>
        <div className="watts-progress-track">
          <div
            className="watts-progress-fill"
            style={{
              width: `${wattsPct}%`,
              backgroundColor: !powerOk ? "#ef4444" : wattsPct > 80 ? "#d97706" : "#059669",
            }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {!requiredWatts
            ? "Selecione CPU e Placa de Vídeo para calcular a fonte recomendada."
            : !psu
              ? `Recomendação mínima: Fonte de ${requiredWatts} W ou superior.`
              : powerOk
                ? `Fonte de ${psu.watts}W é totalmente adequada para o sistema.`
                : `Atenção: A fonte selecionada (${psu.watts}W) é menor que o recomendado (${requiredWatts}W).`}
        </p>
      </div>

      {/* Checklist de compatibilidade */}
      <div className={`compat-checklist ${tudoOk ? "is-ok" : ""}`}>
        <div className="compat-head">
          <ShieldCheck className="w-4 h-4" />
          <span>{tudoOk ? "Montagem 100% compatível" : "Compatibilidade"}</span>
        </div>
        <ul>
          {checks.map((c, i) => (
            <li key={i} data-estado={c.estado}>
              {c.estado === "ok" ? (
                <Check className="w-3.5 h-3.5" />
              ) : c.estado === "warn" ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              <span>{c.texto}</span>
            </li>
          ))}
        </ul>
      </div>

      {chosen.length > 0 &&
        (faltando.length === 0 ? (
          <div className="falta-pouco is-done">
            <PackageCheck className="w-4 h-4 shrink-0" />
            <span>PC completo. É só finalizar o orçamento aqui embaixo.</span>
          </div>
        ) : faltando.length <= 2 ? (
          <button className="falta-pouco is-near" onClick={() => setActive(faltando[0]!)}>
            <ListChecks className="w-4 h-4 shrink-0" />
            <span>Falta só {faltandoLabels.join(" e ")} para fechar o PC.</span>
          </button>
        ) : null)}
    </>
  );

  // ---------------------------------------------------------------
  // Modo visualizacao: link compartilhado abre direto no orcamento.
  // ---------------------------------------------------------------
  if (reviewMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-foreground">
        <header className="site-header no-print">
          <div className="shell flex h-20 items-center justify-between gap-4">
            <a href="/" className="brand-logo">
              <img
                src={temaEscuro ? LOGO_LIGHT : LOGO_DARK}
                alt="Binário Tecnologia"
                className="brand-logo-img"
              />
            </a>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setTemaEscuro((v) => !v)}
                title={temaEscuro ? "Modo claro" : "Modo escuro"}
                aria-label={temaEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
              >
                {temaEscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Button
                onClick={() => setSellerIntent({ kind: "orcamento" })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold gap-2 text-xs sm:text-sm px-4 h-10"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Falar com Técnico</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="shell review-wrapper">
          <div className="review-card">
            <div className="review-head no-print">
              <div>
                <span className="review-kicker">Orçamento compartilhado</span>
                <h1>Montagem selecionada</h1>
                <p>Confira as peças abaixo. Montagem inclusa, sem taxa adicional.</p>
              </div>
            </div>

            {budgetSummary}

            <div className="pricing-summary-box">
              <div className="pix-total-block">
                <span>Total</span>
                <strong>{money.format(totalPix)}</strong>
              </div>

              <button
                disabled={!chosen.length && !cotacoes.length}
                onClick={() => setSellerIntent({ kind: "orcamento" })}
                className="btn-whatsapp-checkout no-print"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Finalizar no WhatsApp</span>
              </button>

              <button
                disabled={(!chosen.length && !cotacoes.length) || gerandoPdf}
                onClick={enviarPdfCliente}
                className="btn-pdf-cliente no-print"
              >
                <Download className="w-4 h-4" />
                <span>{gerandoPdf ? "Gerando PDF..." : "Enviar PDF pro cliente"}</span>
              </button>

              {pdfBaixado && (
                <p className="pdf-dica no-print">
                  PDF baixado. Abra a conversa do cliente no WhatsApp e anexe o arquivo. No celular
                  ele vai anexado sozinho.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 no-print">
                <Button
                  variant="outline"
                  onClick={editBuild}
                  className="btn-tema-outline text-xs h-9"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar montagem
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="btn-tema-outline text-xs h-9"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> PDF / Imprimir
                </Button>
              </div>

              {!ehCliente && (
                <button
                  disabled={!chosen.length && !cotacoes.length}
                  onClick={sendToTI}
                  className="btn-send-ti no-print"
                >
                  <Package className="w-4 h-4" />
                  <span>Enviar montagem para o T.I.</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {printBudget}

        {sellerDialog}
        {tiDialog}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Retail Header */}
      <header className="site-header no-print">
        <div className="shell flex h-20 items-center justify-between gap-4">
          <a href="#inicio" className="brand-logo">
            <img
              src={temaEscuro ? LOGO_LIGHT : LOGO_DARK}
              alt="Binário Tecnologia"
              className="brand-logo-img"
            />
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#montador" className="hover:text-blue-600 transition-colors">
              Montador de PC
            </a>
            <a href="#prontas" className="hover:text-blue-600 transition-colors">
              PCs recomendados
            </a>
            <a href="#estoque" className="hover:text-blue-600 transition-colors">
              Pronta entrega
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTemaEscuro((v) => !v)}
              title={temaEscuro ? "Modo claro" : "Modo escuro"}
              aria-label={temaEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {temaEscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!ehCliente && (
              <button
                type="button"
                className="history-btn"
                onClick={() => setHistoricoAberto(true)}
                title="Últimos orçamentos enviados"
                aria-label="Ver histórico de orçamentos enviados"
              >
                <History className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSellerIntent({ kind: "trocar" })}
              className="vendedor-chip"
              data-vazio={!vendedor && !ehCliente}
              title="Quem está montando"
            >
              <span className="vendedor-chip-avatar">
                {vendedor ? vendedor.nome.charAt(0) : <UserRound className="w-3.5 h-3.5" />}
              </span>
              <span className="vendedor-chip-texto">
                <small>{ehCliente ? "Montando" : "Vendedor"}</small>
                <strong>{vendedor ? vendedor.nome : ehCliente ? "Cliente" : "Escolher"}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>
            <Button
              onClick={() => setSellerIntent({ kind: "orcamento" })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold gap-2 text-xs sm:text-sm px-4 h-10 shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Falar com vendedor</span>
              <span className="sm:hidden">Falar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Banner */}
        <section id="inicio" className="hero-banner no-print">
          <div className="shell hero-grid">
            <div className="hero-headline">
              <h1>Monte seu PC com as peças que temos na loja</h1>
              <p>
                Escolha peça por peça e o montador avisa quando alguma não encaixa. Todo PC montado
                na Binário sai com{" "}
                <strong>cabos organizados, BIOS atualizada e 24 horas de teste</strong>.
              </p>
              <div className="hero-proof-pills">
                <span className="hero-pill">
                  <Check className="w-4 h-4 text-emerald-600" /> O montador confere a
                  compatibilidade
                </span>
                <span className="hero-pill">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1 ano de garantia na loja
                </span>
                <span className="hero-pill">
                  <Truck className="w-4 h-4 text-emerald-600" /> Retirada em Varginha
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Builder Section */}
        <section id="montador" className="builder-layout no-print">
          <div className="shell">
            {/* Step Category Rail */}
            <div className="step-rail-container" role="tablist" aria-label="Categorias de peças">
              {categories.map((category) => {
                const done = chosen.some((part) => part.category === category.id);
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    role="tab"
                    aria-selected={active === category.id}
                    data-done={done}
                    data-periferico={category.periferico}
                    className="category-tab-btn"
                    onClick={() => setActive(category.id)}
                  >
                    <span className="tab-icone">
                      <Icon className="w-4 h-4" />
                      {done && (
                        <span className="tab-feito" aria-label="escolhido">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </span>
                    <span>{category.short}</span>
                  </button>
                );
              })}
            </div>

            <div className="progresso-montagem" aria-live="polite">
              <div className="progresso-trilho">
                <span
                  style={{
                    width: `${((ESSENCIAIS.length - faltando.length) / ESSENCIAIS.length) * 100}%`,
                  }}
                />
              </div>
              <span className="progresso-texto">
                {faltando.length === 0
                  ? "Peças essenciais escolhidas"
                  : `${ESSENCIAIS.length - faltando.length} de ${ESSENCIAIS.length} peças essenciais`}
              </span>
            </div>

            {/* Main Builder Catalog & Summary Grid */}
            <div className="main-builder-grid">
              {/* Catalog Column */}
              <div className="catalog-card">
                <div className="catalog-header">
                  <div>
                    <h2>
                      Escolha {ARTIGO_CATEGORIA[active]}{" "}
                      {categories.find((item) => item.id === active)?.label}
                    </h2>
                    <span>Exibindo peças compatíveis em estoque na loja</span>
                  </div>
                  <span className="catalog-step-pill">
                    Etapa {categories.findIndex((item) => item.id === active) + 1} de{" "}
                    {categories.length}
                  </span>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                  <div className="search-input-wrapper">
                    <Search />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por modelo, marca (ex: Ryzen, RTX, Kingston)..."
                    />
                  </div>
                  {/* AMD/Intel so faz sentido onde a peca depende da plataforma. */}
                  {(active === "cpu" || active === "motherboard") && (
                    <div className="platform-segmented" aria-label="Filtrar por fabricante">
                      <button aria-pressed={platform === "all"} onClick={() => setPlatform("all")}>
                        Todas
                      </button>
                      <button aria-pressed={platform === "AMD"} onClick={() => setPlatform("AMD")}>
                        AMD
                      </button>
                      <button
                        aria-pressed={platform === "Intel"}
                        onClick={() => setPlatform("Intel")}
                      >
                        Intel
                      </button>
                    </div>
                  )}
                  <select
                    className="preco-filtro-select"
                    aria-label="Filtrar por faixa de preço"
                    value={precoFaixa}
                    onChange={(e) => setPrecoFaixa(e.target.value as typeof precoFaixa)}
                  >
                    <option value="todos">Qualquer preço</option>
                    <option value="ate500">Até R$ 500</option>
                    <option value="500a1000">R$ 500 a R$ 1.000</option>
                    <option value="1000a2000">R$ 1.000 a R$ 2.000</option>
                    <option value="acima2000">Acima de R$ 2.000</option>
                  </select>
                </div>

                {/* Sugestão de upgrade — só quando a diferença de preço é pequena */}
                {upgradeAtivo && (
                  <div className="upgrade-box">
                    <TrendingUp className="w-4 h-4" />
                    <div>
                      <strong>
                        Por mais{" "}
                        {money.format(upgradeAtivo.sugestao.pixPrice - upgradeAtivo.atual.pixPrice)}
                        , leve o {upgradeAtivo.sugestao.name}
                      </strong>
                      <span>{upgradeAtivo.sugestao.specs.slice(0, 2).join(" · ")}</span>
                    </div>
                    <button onClick={() => selectPart(upgradeAtivo.sugestao)}>Trocar</button>
                  </div>
                )}

                {/* Product Cards List */}
                <div className="products-list-wrapper">
                  {visibleParts.map((part) => {
                    const qtd = selected[part.id] ?? 0;
                    const chosenPart = qtd > 0;
                    const partMulti = isMulti(part.category);
                    const CategoryIcon =
                      categories.find((cat) => cat.id === part.category)?.icon ?? Cpu;

                    return (
                      <article
                        className="product-item-card"
                        data-selected={chosenPart}
                        key={part.id}
                      >
                        {/* Foto real do produto; se não tiver, mostra o ícone */}
                        <div className="hardware-thumb-box" data-sem-foto={!part.foto}>
                          {part.foto ? (
                            <img
                              src={part.foto}
                              alt={part.name}
                              className="hardware-thumb-img"
                              loading="lazy"
                            />
                          ) : (
                            <>
                              <CategoryIcon />
                              <span className="sem-foto-texto">Sem foto</span>
                            </>
                          )}
                        </div>

                        <h3 className="product-nome">{part.name}</h3>

                        <div className="product-preco">
                          <strong>{money.format(part.pixPrice)}</strong>
                        </div>

                        <div className="product-acao">
                          {partMulti && chosenPart ? (
                            <div className="qty-stepper">
                              <button
                                type="button"
                                aria-label="Diminuir"
                                onClick={() => mudarQtd(part.id, -1)}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="qty-value">{qtd}</span>
                              <button
                                type="button"
                                aria-label="Adicionar mais um"
                                disabled={part.category === "memory" && slotsCheios}
                                onClick={() => mudarQtd(part.id, 1)}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              onClick={() =>
                                chosenPart && !partMulti
                                  ? setSelected((curr) => {
                                      const next = { ...curr };
                                      delete next[part.id];
                                      return next;
                                    })
                                  : selectPart(part)
                              }
                              className={
                                chosenPart && !partMulti
                                  ? "w-full btn-selecionado font-semibold text-xs h-9"
                                  : "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9"
                              }
                            >
                              {chosenPart && !partMulti ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1" /> Selecionado
                                </>
                              ) : (
                                "Adicionar"
                              )}
                            </Button>
                          )}
                          <button
                            type="button"
                            className="product-ver-mais"
                            onClick={() => setDetalhePeca(part)}
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {!visibleParts.length && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-40" />
                      <strong className="text-slate-900 text-base">
                        Nenhum componente encontrado
                      </strong>
                      <span className="text-xs">
                        {active === "psu" && requiredWatts
                          ? `Nenhuma fonte cadastrada atinge os ${requiredWatts} W necessários para esta montagem.`
                          : active === "memory" && boardMemType
                            ? `Nenhuma memória ${boardMemType} em estoque para a placa-mãe escolhida.`
                            : "Tente buscar por outro termo ou ajuste os filtros acima."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pedido de cotação — peça que a loja não tem em estoque */}
                <div className="cotacao-box">
                  <div className="cotacao-head">
                    <Search className="w-4 h-4 text-amber-600" />
                    <div>
                      <strong>Não achou a peça que o cliente quer?</strong>
                      <span>
                        A loja encomenda do fornecedor. Descreva a peça e ela entra no orçamento
                        como <em>a cotar</em>.
                      </span>
                    </div>
                  </div>

                  <div className="cotacao-form">
                    <select
                      value={cotacaoCategoria}
                      onChange={(e) => {
                        setCotacaoCategoria(e.target.value as Category | "outro" | "");
                        setCotacaoErro("");
                      }}
                      className="cotacao-select"
                      aria-label="Tipo da peça"
                    >
                      <option value="">Tipo da peça…</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                      <option value="outro">Outro</option>
                    </select>

                    <input
                      value={cotacaoDescricao}
                      onChange={(e) => {
                        setCotacaoDescricao(e.target.value);
                        setCotacaoErro("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && addCotacao()}
                      maxLength={200}
                      placeholder="Ex: 32GB DDR5 6000MHz Corsair Vengeance"
                      className="cotacao-input"
                      aria-label="Descrição da peça"
                    />

                    <button onClick={addCotacao} className="cotacao-btn">
                      <Plus className="w-4 h-4" />
                      <span>Pedir cotação</span>
                    </button>
                  </div>

                  {cotacaoErro && <span className="cotacao-erro">{cotacaoErro}</span>}
                </div>

                {/* Step Navigation Bar */}
                <div className="flex items-center justify-between gap-2 p-4 bg-slate-50 border-t border-slate-200">
                  <Button
                    variant="outline"
                    disabled={categories[0]?.id === active}
                    onClick={() => moveStep(-1)}
                    className="btn-tema-outline text-xs"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />{" "}
                    <span className="hidden sm:inline">Etapa</span> Anterior
                  </Button>
                  <span className="text-xs font-semibold text-slate-600 text-center">
                    {completed} de {CATEGORIAS_PECA.length} peças
                  </span>
                  <Button
                    disabled={categories[categories.length - 1]?.id === active}
                    onClick={() => moveStep(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    <span className="hidden sm:inline">Próxima etapa</span>
                    <span className="sm:hidden">Próxima</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Sticky Summary Sidebar */}
              <aside className="summary-sidebar-card" id="sua-montagem">
                <div className="summary-sidebar-header">
                  <h3>
                    <PackageCheck className="w-5 h-5 text-emerald-400" />
                    Sua montagem
                  </h3>
                  {(chosen.length > 0 || cotacoes.length > 0) && (
                    <button
                      onClick={() => {
                        setSelected({});
                        setCotacoes([]);
                        setObservacao("");
                        setOrcamentoRestaurado(false);
                      }}
                      className="text-slate-300 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                      title="Limpar seleção"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar</span>
                    </button>
                  )}
                </div>

                {orcamentoRestaurado && (
                  <div className="orcamento-restaurado-aviso">
                    <History className="w-3.5 h-3.5" />
                    <span>Recuperamos seu orçamento salvo. Pode continuar de onde parou.</span>
                    <button onClick={() => setOrcamentoRestaurado(false)} aria-label="Fechar aviso">
                      ×
                    </button>
                  </div>
                )}

                {budgetSummary}

                {/* Pricing Summary Box */}
                <div className="pricing-summary-box">
                  <div className="pix-total-block">
                    <span>Total</span>
                    <strong>{money.format(totalPix)}</strong>
                  </div>

                  <button
                    disabled={!chosen.length && !cotacoes.length}
                    onClick={() => setSellerIntent({ kind: "orcamento" })}
                    className="btn-whatsapp-checkout"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Finalizar no WhatsApp</span>
                  </button>

                  <button
                    disabled={(!chosen.length && !cotacoes.length) || gerandoPdf}
                    onClick={enviarPdfCliente}
                    className="btn-pdf-cliente"
                  >
                    <Download className="w-4 h-4" />
                    <span>{gerandoPdf ? "Gerando PDF..." : "Enviar PDF pro cliente"}</span>
                  </button>

                  {pdfBaixado && (
                    <p className="pdf-dica">
                      PDF baixado. Abra a conversa do cliente e anexe o arquivo. No celular ele vai
                      anexado sozinho.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      variant="outline"
                      disabled={!chosen.length && !cotacoes.length}
                      onClick={shareBuild}
                      className="btn-tema-outline text-xs h-9"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      {copied ? "Copiado!" : "Copiar link"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!chosen.length && !cotacoes.length}
                      onClick={() => window.print()}
                      className="btn-tema-outline text-xs h-9"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> PDF / Imprimir
                    </Button>
                  </div>

                  {!ehCliente && (
                    <button
                      disabled={!chosen.length && !cotacoes.length}
                      onClick={sendToTI}
                      className="btn-send-ti"
                    >
                      <Package className="w-4 h-4" />
                      <span>Enviar montagem para o T.I.</span>
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* No celular o resumo fica lá embaixo; esta barra mantém o total à vista. */}
        {(chosen.length > 0 || cotacoes.length > 0) && (
          <div className="barra-total-celular no-print">
            <div>
              <small>
                {chosen.length === 1 ? "1 peça" : `${chosen.length} peças`}
                {cotacoes.length > 0 && ` + ${cotacoes.length} a cotar`}
              </small>
              <strong>{money.format(totalPix)}</strong>
            </div>
            <a href="#sua-montagem">Ver montagem</a>
          </div>
        )}

        {/* Desempenho estimado da montagem */}
        {temDesempenho && (
          <section className="perf-section no-print">
            <div className="shell">
              <div className="section-title-head">
                <h2>Como esse PC se sai</h2>
                <p>
                  Estimativa em 1080p com gráficos altos, baseada nas peças escolhidas. Valores
                  aproximados para dar uma ideia, não são benchmark oficial.
                </p>
              </div>

              <div className="perf-grid">
                {/* Jogos */}
                <div className="perf-card">
                  <h3>
                    <Gamepad2 className="w-4 h-4 text-blue-600" /> Nos jogos
                  </h3>
                  {fpsPerfil ? (
                    <>
                      <span className="perf-fonte">
                        Rodando com: <strong>{fpsFonte}</strong>
                      </span>
                      <div className="perf-jogos">
                        {JOGOS.map((jogo, i) => {
                          const fps = fpsPerfil[i] ?? 0;
                          const pct = Math.min(100, (fps / FPS_MAX) * 100);
                          const cor = fps >= 120 ? "#059669" : fps >= 60 ? "#d97706" : "#dc2626";
                          return (
                            <div key={jogo} className="perf-jogo-row">
                              <span className="perf-jogo-nome">{jogo}</span>
                              <div className="perf-bar-track">
                                <div
                                  className="perf-bar-fill"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: cor,
                                  }}
                                />
                              </div>
                              <span className="perf-jogo-fps" style={{ color: cor }}>
                                {fps} FPS
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <span className="perf-legenda">
                        <b style={{ color: "#059669" }}>120+</b> muito fluido ·
                        <b style={{ color: "#d97706" }}> 60+</b> joga bem ·
                        <b style={{ color: "#dc2626" }}> abaixo</b> precisa baixar gráficos
                      </span>
                    </>
                  ) : (
                    <p className="perf-vazio">
                      Escolha uma placa de vídeo (ou um processador com vídeo integrado) para ver o
                      desempenho nos jogos.
                    </p>
                  )}
                </div>

                {/* Trabalho */}
                <div className="perf-card">
                  <h3>
                    <MonitorCog className="w-4 h-4 text-blue-600" /> No trabalho
                  </h3>
                  <div className="perf-trabalho">
                    {trabalho.map((t) => (
                      <div key={t.nome} className="perf-trab-row">
                        <div className="perf-trab-info">
                          <strong>{t.nome}</strong>
                          <small>{t.obs}</small>
                        </div>
                        <div className="perf-dots" aria-label={`${t.nota} de 3`}>
                          {[1, 2, 3].map((n) => (
                            <span key={n} className="perf-dot" data-on={n <= t.nota} />
                          ))}
                          <span className="perf-nota-txt">
                            {t.nota === 0
                              ? "—"
                              : t.nota === 1
                                ? "Básico"
                                : t.nota === 2
                                  ? "Bom"
                                  : "Ótimo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ramTotal > 0 && (
                    <span className="perf-fonte">
                      Memória total da montagem: <strong>{ramTotal} GB</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recommended Preset PCs */}
        <section id="prontas" className="presets-section no-print">
          <div className="shell">
            <div className="section-title-head">
              <h2>Configurações recomendadas pelos nossos técnicos</h2>
              <p>
                Modelos montados e testados pela equipe da Binário, incluindo os mais pedidos por
                empresas e órgãos públicos. Você pode carregar uma build e alterar qualquer peça.
              </p>
            </div>

            <div className="presets-cards-grid">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="preset-build-card"
                  data-featured={preset.featured}
                >
                  <span className="preset-kicker">{preset.kicker}</span>
                  <h3>{preset.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3">{preset.note}</p>

                  <div className="preset-fps-badges">
                    {(() => {
                      const { fpsPerfil } = resumoDaBuild(preset.ids);
                      if (!fpsPerfil)
                        return <span className="fps-badge">Sem placa de vídeo dedicada</span>;
                      return JOGOS_DESTAQUE.map((i) => (
                        <span key={i} className="fps-badge">
                          {JOGOS[i]}: {fpsPerfil[i] || "-"} FPS
                        </span>
                      ));
                    })()}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          À vista
                        </span>
                        <strong className="text-2xl font-extrabold text-emerald-700 font-display">
                          {money.format(preset.pixPrice)}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="build-ficha-toggle"
                      aria-expanded={fichasPreset}
                      onClick={() => setFichasPreset((v) => !v)}
                    >
                      {fichasPreset ? "Esconder as peças" : "Ver peças e como roda"}
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          transform: fichasPreset ? "rotate(180deg)" : undefined,
                        }}
                      />
                    </button>

                    {fichasPreset && fichaDaBuild(preset.ids)}

                    <Button
                      onClick={() => loadPreset(preset.ids)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 mt-3"
                    >
                      Usar esta configuração <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
              {modelosEmpresa.map((modelo) => {
                const itens = Object.entries(modelo.pecas).flatMap(([id, qtd]) => {
                  const peca = parts.find((p) => p.id === id);
                  return peca ? [{ peca, qtd }] : [];
                });
                const total = itens.reduce((soma, { peca, qtd }) => soma + peca.pixPrice * qtd, 0);
                return (
                  <div key={modelo.name} className="preset-build-card">
                    <span className="preset-kicker">{modelo.kicker}</span>
                    <h3>{modelo.name}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-3">{modelo.note}</p>

                    <div className="preset-fps-badges">
                      {(() => {
                        const { fpsPerfil } = resumoDaBuild(Object.keys(modelo.pecas));
                        if (!fpsPerfil)
                          return <span className="fps-badge">Sem placa de vídeo dedicada</span>;
                        return JOGOS_DESTAQUE.map((i) => (
                          <span key={i} className="fps-badge">
                            {JOGOS[i]}: {fpsPerfil[i] || "-"} FPS
                          </span>
                        ));
                      })()}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-200">
                      <span className="text-[11px] text-emerald-700 font-bold block">À vista</span>
                      <strong className="text-2xl font-extrabold text-emerald-700 font-display">
                        {money.format(total)}
                      </strong>
                      <small className="modelo-mais-cotar">
                        {modelo.cotar.map((item) => item.descricao).join(", ")} a cotar
                      </small>

                      <button
                        type="button"
                        className="build-ficha-toggle mt-3"
                        aria-expanded={fichasPreset}
                        onClick={() => setFichasPreset((v) => !v)}
                      >
                        {fichasPreset ? "Esconder as peças" : "Ver as peças"}
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ transform: fichasPreset ? "rotate(180deg)" : undefined }}
                        />
                      </button>

                      {fichasPreset && (
                        <ul className="modelo-pecas">
                          {itens.map(({ peca, qtd }) => (
                            <li key={peca.id}>
                              <span>
                                {qtd > 1 ? `${qtd}x ` : ""}
                                {peca.name}
                              </span>
                            </li>
                          ))}
                          {modelo.cotar.map((item) => (
                            <li key={item.descricao} className="modelo-peca-cotar">
                              <span>{item.descricao}</span>
                              <em>a cotar</em>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        onClick={() => loadModelo(modelo)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 mt-3"
                      >
                        Usar esta configuração <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Galeria de montagens — DESATIVADA por enquanto.
            Pra reativar: troque "false" por "true" na linha abaixo. */}
        {/* eslint-disable-next-line no-constant-binary-expression -- interruptor proposital */}
        {false && (
          <section className="galeria-section no-print">
            <div className="shell">
              <div className="section-title-head">
                <h2>Montagens que saíram da nossa bancada</h2>
                <p>
                  Cada PC é montado, testado por 24h e organizado por dentro aqui em Varginha antes
                  de ir pra casa do cliente.
                </p>
              </div>
              <div className="galeria-grid">
                {MONTAGENS.map((m) => (
                  <figure key={m.titulo} className="galeria-card">
                    <img src={m.foto} alt={m.titulo} loading="lazy" />
                    <figcaption>
                      <strong>{m.titulo}</strong>
                      <span>{m.desc}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ready Stock Section */}
        <section id="estoque" className="stock-section no-print">
          <div className="shell">
            <div className="section-title-head">
              <h2>Pronta entrega na loja</h2>
              <p>
                Já saem montados, formatados com Windows de avaliação e prontos para uso imediato.
              </p>
            </div>

            <div className="stock-grid">
              {stockMachines.map((machine) => (
                <div key={machine.id} className="stock-machine-card">
                  <div className="stock-machine-body">
                    <span className="code-badge">Cód. {machine.id}</span>
                    <h3>{machine.name}</h3>
                    <p>{machine.spec}</p>
                    <span className="stock-machine-tone">{machine.tone}</span>

                    <button
                      type="button"
                      className="build-ficha-toggle"
                      aria-expanded={fichasEstoque}
                      onClick={() => setFichasEstoque((v) => !v)}
                    >
                      {fichasEstoque ? "Esconder as peças" : "Ver peças e como roda"}
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          transform: fichasEstoque ? "rotate(180deg)" : undefined,
                        }}
                      />
                    </button>

                    {fichasEstoque && fichaDaBuild(machine.ids)}
                  </div>

                  <div className="stock-machine-foot">
                    <button
                      onClick={() =>
                        setSellerIntent({
                          kind: "montada",
                          machineId: machine.id,
                        })
                      }
                      className="btn-whatsapp-checkout"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                      <span>Comprar pelo WhatsApp</span>
                    </button>
                    <div className="stock-machine-price">
                      <strong>{money.format(machine.pixPrice)}</strong>
                      <span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {printBudget}

      {/* Footer */}
      <footer className="site-footer no-print">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <img src={LOGO_LIGHT} alt="Binário Tecnologia" className="footer-logo-img" />
            <p>
              Distribuidora e assistência técnica em Varginha - MG. Montagem, configuração e
              garantia local para o Sul de Minas.
            </p>
          </div>

          <div className="footer-col">
            <strong>Loja</strong>
            <span className="footer-line">
              <MapPin className="w-3.5 h-3.5" /> Varginha - MG
            </span>
            <span className="footer-line">
              <Truck className="w-3.5 h-3.5" /> Retirada imediata na loja
            </span>
            <span className="footer-line">
              <ShieldCheck className="w-3.5 h-3.5" /> 1 ano de garantia
            </span>
          </div>

          <div className="footer-col">
            <strong>Pagamento</strong>
            <span>Montagem inclusa, sem taxa</span>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} Binário Tecnologia · Desde 1997</span>
          <span>Valores sujeitos a confirmação de estoque com a equipe de vendas.</span>
        </div>
      </footer>

      {/* Ficha tecnica da peca: os dados ja vem do WinThor, so nao eram
          mostrados em lugar nenhum. */}
      <Dialog
        open={Boolean(detalhePeca)}
        onOpenChange={(aberto) => !aberto && setDetalhePeca(null)}
      >
        <DialogContent className="max-w-lg">
          {detalhePeca && (
            <>
              <DialogHeader>
                <DialogTitle>{detalhePeca.name}</DialogTitle>
                <DialogDescription>
                  Cód. {detalhePeca.code} · {detalhePeca.brand}
                </DialogDescription>
              </DialogHeader>

              <div className="peca-foto">
                {detalhePeca.foto ? (
                  <img src={detalhePeca.foto} alt={detalhePeca.name} />
                ) : (
                  (() => {
                    const Icone =
                      categories.find((c) => c.id === detalhePeca.category)?.icon ?? Cpu;
                    return (
                      <>
                        <Icone className="w-10 h-10" />
                        <span>Foto ainda não cadastrada</span>
                      </>
                    );
                  })()
                )}
              </div>

              <dl className="peca-ficha">
                {detalhePeca.socket && (
                  <>
                    <dt>Socket</dt>
                    <dd>{detalhePeca.socket}</dd>
                  </>
                )}
                {detalhePeca.memType && (
                  <>
                    <dt>Memória</dt>
                    <dd>{detalhePeca.memType}</dd>
                  </>
                )}
                {detalhePeca.ramGB !== undefined && (
                  <>
                    <dt>Capacidade</dt>
                    <dd>{detalhePeca.ramGB} GB</dd>
                  </>
                )}
                {detalhePeca.watts !== undefined && (
                  <>
                    <dt>{detalhePeca.category === "psu" ? "Potência" : "Consumo"}</dt>
                    <dd>{detalhePeca.watts} W</dd>
                  </>
                )}
                {detalhePeca.slots !== undefined && (
                  <>
                    <dt>Slots de memória</dt>
                    <dd>{detalhePeca.slots}</dd>
                  </>
                )}
                {detalhePeca.platform && (
                  <>
                    <dt>Plataforma</dt>
                    <dd>{detalhePeca.platform}</dd>
                  </>
                )}
                {detalhePeca.videoIntegrado && (
                  <>
                    <dt>Vídeo</dt>
                    <dd>Integrado no processador</dd>
                  </>
                )}
                <dt>Estoque</dt>
                <dd>Disponível em Varginha</dd>
              </dl>

              {detalhePeca.specs.length > 0 && (
                <div className="peca-specs">
                  {detalhePeca.specs.map((spec, i) => (
                    <span key={i} className="spec-badge">
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              <p className="peca-descricao">{detalhePeca.detail}</p>

              <div className="peca-rodape">
                <strong>{money.format(detalhePeca.pixPrice)}</strong>
                <Button
                  onClick={() => {
                    selectPart(detalhePeca);
                    setDetalhePeca(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Adicionar à montagem
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {sellerDialog}
      {tiDialog}
      {historicoDialog}
    </div>
  );
}
