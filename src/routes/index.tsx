import { createFileRoute } from "@tanstack/react-router";
import {
  Armchair,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
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
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Zap,
  Sun,
  Moon,
  History,
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
  // slots = quantos pentes de memoria a placa aceita. So preenchido onde a
  // descricao do WinThor diz; sem valor, o montador nao limita.
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

const parts: Part[] = [
  // Processadores
  {
    id: "w15380",
    category: "cpu",
    name: "Processador AMD AM4 Ryzen 3 3200G OEM",
    brand: "Amd",
    code: "15380",
    pixPrice: 389.9,
    stock: 291,
    platform: "AMD",
    socket: "AM4",
    watts: 65,
    apu: true,
    videoIntegrado: true,
    specs: ["Socket AM4", "Video integrado", "Amd"],
    detail: "PROCESSADOR AMD AM4 RYZEN 3 3200G OEM",
  },
  {
    id: "w17507",
    category: "cpu",
    name: "Processador AMD Ryzen 7 1700 3.0GHZ AM4",
    brand: "Amd",
    code: "17507",
    pixPrice: 429.9,
    stock: 9,
    platform: "AMD",
    socket: "AM4",
    watts: 105,
    specs: ["Socket AM4", "Clock 3.0 GHz", "Amd"],
    detail: "PROCESSADOR AMD RYZEN 7 1700 3.0GHZ AM4",
  },
  {
    id: "w12634",
    category: "cpu",
    name: "Processador AMD Ryzen 3 4100 3.8 AM4",
    brand: "Amd",
    code: "12634",
    pixPrice: 629.9,
    stock: 26,
    platform: "AMD",
    socket: "AM4",
    watts: 65,
    specs: ["Socket AM4", "Amd"],
    detail: "L-PROCESSADOR AMD RYZEN 3 4100 3.8 AM4",
  },
  {
    id: "w15849",
    category: "cpu",
    name: "Processador Ryzen 3 4100 AM4 - Sem BOX",
    brand: "Amd",
    code: "15849",
    pixPrice: 779.9,
    stock: 33,
    platform: "AMD",
    socket: "AM4",
    watts: 65,
    specs: ["Socket AM4", "Amd"],
    detail: "L-PROCESSADOR RYZEN 3 4100 AM4 - SEM BOX",
  },
  {
    id: "w17867",
    category: "cpu",
    name: "Processador Ryzen 5 5500 3.6GH AM4 BOX",
    brand: "Amd",
    code: "17867",
    pixPrice: 799.9,
    stock: 34,
    platform: "AMD",
    socket: "AM4",
    watts: 65,
    specs: ["Socket AM4", "Amd"],
    detail: "L-PROCESSADOR RYZEN 5 5500 3.6GH AM4 BOX",
  },
  {
    id: "w18861",
    category: "cpu",
    name: "Processador Ryzen 7 3700X 3.6GHZ",
    brand: "Amd",
    code: "18861",
    pixPrice: 1159.9,
    stock: 1,
    platform: "AMD",
    socket: "AM4",
    watts: 105,
    specs: ["Socket AM4", "Clock 3.6 GHz", "Amd"],
    detail: "L-PROCESSADOR RYZEN 7 3700X 3.6GHZ",
  },
  {
    id: "w18599",
    category: "cpu",
    name: "Processador Ryzen 7 5700X 3.4GHZ AM4 OEM",
    brand: "Amd",
    code: "18599",
    pixPrice: 1189.9,
    stock: 14,
    platform: "AMD",
    socket: "AM4",
    watts: 105,
    specs: ["Socket AM4", "Clock 3.4 GHz", "Amd"],
    detail: "PROCESSADOR RYZEN7 5700X 3.4GHZ AM4 OEM",
  },
  {
    id: "w23388",
    category: "cpu",
    name: "Processador Ryzen 7 5700G 4.6GHZ AM4 BOX",
    brand: "Amd",
    code: "23388",
    pixPrice: 1529.9,
    stock: 2,
    platform: "AMD",
    socket: "AM4",
    watts: 105,
    apu: true,
    videoIntegrado: true,
    specs: ["Socket AM4", "Video integrado", "Clock 4.6 GHz"],
    detail: "L-PROCESSADOR RYZEN7 5700G 4.6GHZAM4 BOX",
  },
  {
    id: "w13281",
    category: "cpu",
    name: "Processador AMD Ryzen 7 5800X 3.8GHZ",
    brand: "Amd",
    code: "13281",
    pixPrice: 1779.9,
    stock: 1,
    platform: "AMD",
    socket: "AM4",
    watts: 105,
    specs: ["Socket AM4", "Clock 3.8 GHz", "Amd"],
    detail: "PROCESSADOR AMD RYZEN 7 5800X 3.8GHZ",
  },
  // Placas-mae
  {
    id: "w13164",
    category: "motherboard",
    name: "Placa Mae Desk 1155 G-H61/K Knup (2xddr3",
    brand: "Knup",
    code: "13164",
    pixPrice: 129.9,
    stock: 4,
    platform: "Intel",
    socket: "LGA1155",
    specs: ["Socket LGA1155", "Knup"],
    detail: "PLACA MAE DESK 1155 G-H61/K KNUP (2XDDR3",
  },
  {
    id: "w21561",
    category: "motherboard",
    name: "Placa Mae H61 LGA1155 DDR3 Hayom Plm2300",
    brand: "Hayom",
    code: "21561",
    pixPrice: 129.9,
    stock: 191,
    platform: "Intel",
    socket: "LGA1155",
    memType: "DDR3",
    slots: 2,
    specs: ["Socket LGA1155", "Memoria DDR3", "Hayom"],
    detail: "PLACA MAE H61 LGA1155 DDR3 HAYOM PLM2300",
  },
  {
    id: "w19679",
    category: "motherboard",
    name: "Placa Mae B75 LGA1155 DDR3 Hayom Plm2301",
    brand: "Hayom",
    code: "19679",
    pixPrice: 149.9,
    stock: 15,
    platform: "Intel",
    socket: "LGA1155",
    memType: "DDR3",
    specs: ["Socket LGA1155", "Memoria DDR3", "Hayom"],
    detail: "PLACA MAE B75 LGA1155 DDR3 HAYOM PLM2301",
  },
  {
    id: "w25492",
    category: "motherboard",
    name: "Placa Mae H61-m2pro 1155 Diamond Clanm",
    brand: "Haoquing",
    code: "25492",
    pixPrice: 149.9,
    stock: 501,
    platform: "Intel",
    socket: "LGA1155",
    specs: ["Socket LGA1155", "Haoquing"],
    detail: "PLACA MAE H61-M2PRO 1155 DIAMOND CLANM",
  },
  {
    id: "w25779",
    category: "motherboard",
    name: "Placa Mae LGA1155 Delta-h61m2k H61",
    brand: "Delta",
    code: "25779",
    pixPrice: 149.9,
    stock: 340,
    platform: "Intel",
    socket: "LGA1155",
    specs: ["Socket LGA1155", "Delta"],
    detail: "PLACA MAE LGA1155 DELTA-H61M2K H61",
  },
  {
    id: "w12405",
    category: "motherboard",
    name: "Placa Mae G-H81/M Desk Knup DDR3 Lga 115",
    brand: "Knup",
    code: "12405",
    pixPrice: 159.9,
    stock: 3,
    platform: "Intel",
    socket: "LGA1150",
    memType: "DDR3",
    specs: ["Socket LGA1150", "Memoria DDR3", "Knup"],
    detail: "PLACA MAE G-H81/M DESK KNUP DDR3 LGA 115",
  },
  {
    id: "w25764",
    category: "motherboard",
    name: "Placa Mae Delta LGA1150 H81",
    brand: "Delta",
    code: "25764",
    pixPrice: 169.9,
    stock: 20,
    platform: "Intel",
    socket: "LGA1150",
    specs: ["Socket LGA1150", "Delta"],
    detail: "S-PLACA MAE DELTA LGA1150 H81",
  },
  {
    id: "w25780",
    category: "motherboard",
    name: "Placa Mae LGA1150 Delta-h81m2k H81",
    brand: "Delta",
    code: "25780",
    pixPrice: 169.9,
    stock: 103,
    platform: "Intel",
    socket: "LGA1150",
    specs: ["Socket LGA1150", "Delta"],
    detail: "PLACA MAE LGA1150 DELTA-H81M2K H81",
  },
  {
    id: "w13656",
    category: "motherboard",
    name: "Placa Mae H81m.2-tg DDR3 LGA1150",
    brand: "Brazil Pc",
    code: "13656",
    pixPrice: 179.9,
    stock: 3,
    platform: "Intel",
    socket: "LGA1150",
    memType: "DDR3",
    specs: ["Socket LGA1150", "Memoria DDR3", "Brazil Pc"],
    detail: "PLACA MAE H81M.2-TG DDR3 LGA1150",
  },
  {
    id: "w11414",
    category: "motherboard",
    name: "Placa Mae Hm55-nt DDR3 LGA1156",
    brand: "Sem marca",
    code: "11414",
    pixPrice: 189.9,
    stock: 19,
    platform: "Intel",
    socket: "LGA1156",
    memType: "DDR3",
    specs: ["Socket LGA1156", "Memoria DDR3"],
    detail: "PLACA MAE HM55-NT DDR3 LGA1156",
  },
  {
    id: "w26062",
    category: "motherboard",
    name: "Placa Mae Delta Gaming X79-mkii",
    brand: "Delta",
    code: "26062",
    pixPrice: 229.9,
    stock: 880,
    specs: ["Delta"],
    detail: "PLACA MAE DELTA GAMING X79-MKII",
  },
  {
    id: "w20838",
    category: "motherboard",
    name: "Placa Mae Vxmbb250 M.2 LGA1151 DDR4",
    brand: "Duex",
    code: "20838",
    pixPrice: 299.9,
    stock: 260,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Duex"],
    detail: "PLACA MAE VXMBB250 M.2 LGA1151 DDR4",
  },
  {
    id: "w17705",
    category: "motherboard",
    name: "Placa Mae A320 Mainboard Haoquing",
    brand: "Haoquing",
    code: "17705",
    pixPrice: 339.9,
    stock: 60,
    platform: "AMD",
    socket: "AM4",
    specs: ["Socket AM4", "Haoquing"],
    detail: "PLACA MAE A320 MAINBOARD HAOQUING",
  },
  {
    id: "w20430",
    category: "motherboard",
    name: "Placa Mae Vxpro Vxmbh110 LGA1151 DDR4",
    brand: "Duex",
    code: "20430",
    pixPrice: 339.9,
    stock: 1,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Duex"],
    detail: "PLACA MAE VXPRO VXMBH110 LGA1151 DDR4",
  },
  {
    id: "w22333",
    category: "motherboard",
    name: "Placa Mae H310 LGA1151 M2 Delta-h310m2k",
    brand: "Delta",
    code: "22333",
    pixPrice: 349.9,
    stock: 1388,
    platform: "Intel",
    socket: "LGA1151",
    specs: ["Socket LGA1151", "Delta"],
    detail: "PLACA MAE H310 LGA1151 M2 DELTA-H310M2K",
  },
  {
    id: "w12375",
    category: "motherboard",
    name: "Placa Mae G-A520 Desk DDR4 AM4",
    brand: "Revenger",
    code: "12375",
    pixPrice: 359.9,
    stock: 30,
    platform: "AMD",
    socket: "AM4",
    memType: "DDR4",
    specs: ["Socket AM4", "Memoria DDR4", "Revenger"],
    detail: "PLACA MAE G-A520 DESK DDR4 AM4",
  },
  {
    id: "w13525",
    category: "motherboard",
    name: "Placa Mae Dx H110ZG Duex DDR4 LGA1151",
    brand: "Intel",
    code: "13525",
    pixPrice: 359.9,
    stock: 9,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Intel"],
    detail: "PLACA MAE DX H110ZG DUEX DDR4 LGA1151",
  },
  {
    id: "w15334",
    category: "motherboard",
    name: "Placa Mae Desk 1151 DDR4 G-B250 Knup",
    brand: "Revenger",
    code: "15334",
    pixPrice: 359.9,
    stock: 20,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Revenger"],
    detail: "S-PLACA MAE DESK 1151 DDR4 G-B250 KNUP",
  },
  {
    id: "w21563",
    category: "motherboard",
    name: "Placa Mae Dxmbh110s M2 LGA1151 DDR4 Duex",
    brand: "Duex",
    code: "21563",
    pixPrice: 359.9,
    stock: 35,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Duex"],
    detail: "PLACA MAE DXMBH110S M2 LGA1151 DDR4 DUEX",
  },
  {
    id: "w15479",
    category: "motherboard",
    name: "Placa Mae Bpc-h310/b250m.2-tg Bpc DDR4",
    brand: "Bpc",
    code: "15479",
    pixPrice: 369.9,
    stock: 1,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Bpc"],
    detail: "PLACA MAE BPC-H310/B250M.2-TG BPC DDR4",
  },
  {
    id: "w17412",
    category: "motherboard",
    name: "Placa Mae G-H310 LGA1151 Revenger",
    brand: "Revenger",
    code: "17412",
    pixPrice: 389.9,
    stock: 20,
    platform: "Intel",
    socket: "LGA1151",
    specs: ["Socket LGA1151", "Revenger"],
    detail: "PLACA MAE G-H310 LGA1151 REVENGER",
  },
  {
    id: "w13715",
    category: "motherboard",
    name: "Placa Mae G-H470 Revenger DDR4 LGA1200",
    brand: "Revenger",
    code: "13715",
    pixPrice: 399.9,
    stock: 3,
    platform: "Intel",
    socket: "LGA1200",
    memType: "DDR4",
    specs: ["Socket LGA1200", "Memoria DDR4", "Revenger"],
    detail: "PLACA MAE G-H470 REVENGER DDR4 LGA1200",
  },
  {
    id: "w18314",
    category: "motherboard",
    name: "Placa Mae Lga 1200 G-H511 Revenger",
    brand: "Revenger",
    code: "18314",
    pixPrice: 429.9,
    stock: 20,
    platform: "Intel",
    socket: "LGA1200",
    specs: ["Socket LGA1200", "Revenger"],
    detail: "S-PLACA MAE  LGA 1200 G-H511 REVENGER",
  },
  {
    id: "w18308",
    category: "motherboard",
    name: "Placa Mae Lga 1200 DDR4 G-H511 Revenger",
    brand: "Revenger",
    code: "18308",
    pixPrice: 439.9,
    stock: 2,
    platform: "Intel",
    socket: "LGA1200",
    memType: "DDR4",
    specs: ["Socket LGA1200", "Memoria DDR4", "Revenger"],
    detail: "PLACA MAE  LGA 1200 DDR4 G-H511 REVENGER",
  },
  {
    id: "w19577",
    category: "motherboard",
    name: "Placa Mae Delta-a520m2k AM4",
    brand: "Delta",
    code: "19577",
    pixPrice: 449.9,
    stock: 9,
    platform: "AMD",
    socket: "AM4",
    specs: ["Socket AM4", "Delta"],
    detail: "PLACA MAE DELTA-A520M2K AM4",
  },
  {
    id: "w14224",
    category: "motherboard",
    name: "Placa Mae G-H610 Revenger DDR4 LGA1700",
    brand: "Revenger",
    code: "14224",
    pixPrice: 469.9,
    stock: 33,
    platform: "Intel",
    socket: "LGA1700",
    memType: "DDR4",
    specs: ["Socket LGA1700", "Memoria DDR4", "Revenger"],
    detail: "PLACA MAE G-H610 REVENGER DDR4 LGA1700",
  },
  {
    id: "w19632",
    category: "motherboard",
    name: "Placa Mae Delta H510M2K",
    brand: "Delta",
    code: "19632",
    pixPrice: 479.9,
    stock: 20,
    platform: "Intel",
    socket: "LGA1200",
    specs: ["Socket LGA1200", "Delta"],
    detail: "PLACA MAE DELTA H510M2K",
  },
  {
    id: "w26090",
    category: "motherboard",
    name: "Placa Mae Delta H510M2K",
    brand: "Delta",
    code: "26090",
    pixPrice: 479.9,
    stock: 160,
    platform: "Intel",
    socket: "LGA1200",
    specs: ["Socket LGA1200", "Delta"],
    detail: "L-PLACA MAE DELTA H510M2K",
  },
  {
    id: "w11439",
    category: "motherboard",
    name: "Placa Mae G-H510 DDR4 Lga 1200",
    brand: "Knup",
    code: "11439",
    pixPrice: 489.9,
    stock: 1,
    platform: "Intel",
    socket: "LGA1200",
    memType: "DDR4",
    specs: ["Socket LGA1200", "Memoria DDR4", "Knup"],
    detail: "PLACA MAE G-H510 DDR4 LGA 1200",
  },
  {
    id: "w10491",
    category: "motherboard",
    name: "Placa Mae H310MHP S1151 Biostar DDR4 Lga",
    brand: "Biostar",
    code: "10491",
    pixPrice: 499.9,
    stock: 2,
    platform: "Intel",
    socket: "LGA1151",
    memType: "DDR4",
    specs: ["Socket LGA1151", "Memoria DDR4", "Biostar"],
    detail: "PLACA MAE H310MHP S1151 BIOSTAR DDR4 LGA",
  },
  {
    id: "w18884",
    category: "motherboard",
    name: "Placa Mae H610 Revenger DDR4 LGA1700",
    brand: "Revenger",
    code: "18884",
    pixPrice: 499.9,
    stock: 23,
    platform: "Intel",
    socket: "LGA1700",
    memType: "DDR4",
    specs: ["Socket LGA1700", "Memoria DDR4", "Revenger"],
    detail: "L-PLACA MAE H610 REVENGER DDR4 LGA1700",
  },
  {
    id: "w20491",
    category: "motherboard",
    name: "Placa Mae Bpc-h510pm.2-g LGA1200",
    brand: "Bpc",
    code: "20491",
    pixPrice: 499.9,
    stock: 9,
    platform: "Intel",
    socket: "LGA1200",
    specs: ["Socket LGA1200", "Bpc"],
    detail: "L-PLACA MAE BPC-H510PM.2-G LGA1200",
  },
  {
    id: "w19941",
    category: "motherboard",
    name: "Placa Mae H610 M.2 SSD Delta-h610m2k",
    brand: "Delta",
    code: "19941",
    pixPrice: 519.9,
    stock: 14,
    platform: "Intel",
    socket: "LGA1700",
    specs: ["Socket LGA1700", "Delta"],
    detail: "L-PLACA MAE H610 M.2 SSD DELTA-H610M2K",
  },
  {
    id: "w21131",
    category: "motherboard",
    name: "Placa Mae Lga 1700 G-B760 Revenger",
    brand: "Revenger",
    code: "21131",
    pixPrice: 579.9,
    stock: 14,
    platform: "Intel",
    socket: "LGA1700",
    specs: ["Socket LGA1700", "Revenger"],
    detail: "L-PLACA MAE  LGA 1700 G-B760 REVENGER",
  },
  {
    id: "w18307",
    category: "motherboard",
    name: "Placa Mae Lga 1700 G-B760 Revenger",
    brand: "Revenger",
    code: "18307",
    pixPrice: 589.9,
    stock: 17,
    platform: "Intel",
    socket: "LGA1700",
    specs: ["Socket LGA1700", "Revenger"],
    detail: "PLACA MAE  LGA 1700 G-B760 REVENGER",
  },
  {
    id: "w19486",
    category: "motherboard",
    name: "Placa Mae B450M-A DDR4 Angthumb",
    brand: "Binario",
    code: "19486",
    pixPrice: 629.9,
    stock: 1,
    platform: "AMD",
    socket: "AM4",
    memType: "DDR4",
    specs: ["Socket AM4", "Memoria DDR4", "Binario"],
    detail: "L-PLACA MAE B450M-A DDR4 ANGTHUMB",
  },
  {
    id: "w13927",
    category: "motherboard",
    name: "Placa Mae c/ Processador I7 G11800H DDR4",
    brand: "Knup",
    code: "13927",
    pixPrice: 1579.9,
    stock: 3,
    memType: "DDR4",
    specs: ["Memoria DDR4", "Knup"],
    detail: "PLACA MAE C/ PROCESSADOR I7 G11800H DDR4",
  },
  {
    id: "w16472",
    category: "motherboard",
    name: "Placa Mae c/ Processador I7 G10870H DDR4",
    brand: "Knup",
    code: "16472",
    pixPrice: 1579.9,
    stock: 17,
    memType: "DDR4",
    specs: ["Memoria DDR4", "Knup"],
    detail: "PLACA MAE C/ PROCESSADOR I7 G10870H DDR4",
  },
  {
    id: "w19978",
    category: "motherboard",
    name: "Placa Mae c/ Processador I5 G11500H DDR4",
    brand: "Knup",
    code: "19978",
    pixPrice: 1579.9,
    stock: 9,
    memType: "DDR4",
    specs: ["Memoria DDR4", "Knup"],
    detail: "PLACA MAE C/ PROCESSADOR I5 G11500H DDR4",
  },
  {
    id: "w19367",
    category: "motherboard",
    name: "Placa Mae 9mx87eg7-00-g11 X870 Eagle",
    brand: "Gigabyte",
    code: "19367",
    pixPrice: 2379.9,
    stock: 13,
    specs: ["Gigabyte"],
    detail: "E-PLACA MAE 9MX87EG7-00-G11 X870 EAGLE",
  },
  // Memorias
  {
    id: "w9388",
    category: "memory",
    name: "Memoria PC 4GB DDR4 Smart 2133MHZ",
    brand: "Smart",
    code: "9388",
    pixPrice: 79.9,
    stock: 17,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2133 MHz"],
    detail: "MEMORIA PC 4GB DDR4 SMART 2133MHZ",
  },
  {
    id: "w16642",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Axpro 3200MHZ",
    brand: "Axpro",
    code: "16642",
    pixPrice: 99.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "3200 MHz"],
    detail: "MEMORIA PC 8GB DDR4 AXPRO 3200MHZ",
  },
  {
    id: "w17211",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Kgt 2400MHZ",
    brand: "Kingston",
    code: "17211",
    pixPrice: 99.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "2400 MHz"],
    detail: "MEMORIA PC 8GB DDR4 KGT 2400MHZ",
  },
  {
    id: "w20959",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Hyperx 2400MHZ",
    brand: "Hyperx",
    code: "20959",
    pixPrice: 99.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "2400 MHz"],
    detail: "MEMORIA PC 8GB DDR4 HYPERX 2400MHZ",
  },
  {
    id: "w17849",
    category: "memory",
    name: "Memoria PC 8GB DDR3 Clanm 1600MHZ",
    brand: "Clainm",
    code: "17849",
    pixPrice: 109.9,
    stock: 8,
    memType: "DDR3",
    ramGB: 8,
    specs: ["8.0 GB", "DDR3", "1600 MHz"],
    detail: "MEMORIA PC 8GB DDR3 CLANM 1600MHZ",
  },
  {
    id: "w8173",
    category: "memory",
    name: "Memoria PC 8GB DDR3 1600MHZ OEM",
    brand: "Sem marca",
    code: "8173",
    pixPrice: 159.9,
    stock: 482,
    memType: "DDR3",
    ramGB: 8,
    specs: ["8.0 GB", "DDR3", "1600 MHz"],
    detail: "MEMORIA PC 8GB DDR3 1600MHZ OEM",
  },
  {
    id: "w19932",
    category: "memory",
    name: "Memoria PC 8GB DDR3 1600 MHZ Prodrive",
    brand: "Prodrive",
    code: "19932",
    pixPrice: 159.9,
    stock: 253,
    memType: "DDR3",
    ramGB: 8,
    specs: ["8.0 GB", "DDR3", "1600 MHz"],
    detail: "MEMORIA PC 8GB DDR3 1600 MHZ PRODRIVE",
  },
  {
    id: "w19384",
    category: "memory",
    name: "Memoria PC 4GB DDR4 Teikon 2133MHZ",
    brand: "Smart",
    code: "19384",
    pixPrice: 189.9,
    stock: 77,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2133 MHz"],
    detail: "MEMORIA PC 4GB DDR4 TEIKON 2133MHZ",
  },
  {
    id: "w19385",
    category: "memory",
    name: "Memoria PC 4GB DDR4 Goldkey 2400 MHZ",
    brand: "Kingston",
    code: "19385",
    pixPrice: 189.9,
    stock: 71,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2400 MHz"],
    detail: "MEMORIA PC 4GB DDR4 GOLDKEY 2400 MHZ",
  },
  {
    id: "w19685",
    category: "memory",
    name: "Memoria PC 8GB DDR3 1600 MHZ Ara-1608p",
    brand: "Aitek",
    code: "19685",
    pixPrice: 189.9,
    stock: 79,
    memType: "DDR3",
    ramGB: 8,
    specs: ["8.0 GB", "DDR3", "1600 MHz"],
    detail: "S-MEMORIA PC 8GB DDR3 1600 MHZ ARA-1608P",
  },
  {
    id: "w19871",
    category: "memory",
    name: "Memoria PC 4GB DDR4 Adata 2400MHZ",
    brand: "Adata ",
    code: "19871",
    pixPrice: 189.9,
    stock: 68,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2400 MHz"],
    detail: "MEMORIA PC 4GB DDR4 ADATA 2400MHZ",
  },
  {
    id: "w20072",
    category: "memory",
    name: "Memoria PC 4GB DDR4 Adata 2133MHZ",
    brand: "Adata ",
    code: "20072",
    pixPrice: 189.9,
    stock: 73,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2133 MHz"],
    detail: "MEMORIA PC 4GB DDR4 ADATA 2133MHZ",
  },
  {
    id: "w9390",
    category: "memory",
    name: "Memoria PC 4GB DDR4 2666MHZ",
    brand: "Smart",
    code: "9390",
    pixPrice: 209.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 4,
    specs: ["4.0 GB", "DDR4", "2666 MHz"],
    detail: "MEMORIA PC 4GB DDR4 2666MHZ",
  },
  {
    id: "w17610",
    category: "memory",
    name: "Memoria PC 16GB DDR4 Kgt 2666MHZ",
    brand: "Kingston",
    code: "17610",
    pixPrice: 229.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 16,
    specs: ["16.0 GB", "DDR4", "2666 MHz"],
    detail: "MEMORIA PC 16GB DDR4 KGT 2666MHZ",
  },
  {
    id: "w7855",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Netcore 2666MHZ",
    brand: "Netcore",
    code: "7855",
    pixPrice: 329.9,
    stock: 119,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "2666 MHz"],
    detail: "MEMORIA PC 8GB DDR4 NETCORE 2666MHZ",
  },
  {
    id: "w1396",
    category: "memory",
    name: "Memoria PC 8GB DDR4 2666 MHZ",
    brand: "Kingston",
    code: "1396",
    pixPrice: 359.9,
    stock: 74,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "2666 MHz"],
    detail: "MEMORIA PC 8GB DDR4 2666 MHZ",
  },
  {
    id: "w16120",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Desk 3200MHZ",
    brand: "Bpc",
    code: "16120",
    pixPrice: 359.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "3200 MHz"],
    detail: "MEMORIA PC 8GB DDR4 DESK 3200MHZ",
  },
  {
    id: "w19145",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Kgt 3200MHZ",
    brand: "Kingston",
    code: "19145",
    pixPrice: 359.9,
    stock: 170,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "3200 MHz"],
    detail: "L-MEMORIA PC 8GB DDR4 KGT 3200MHZ",
  },
  {
    id: "w19865",
    category: "memory",
    name: "Memoria PC 8GB DDR4 3200MHZ Fury",
    brand: "Kingston",
    code: "19865",
    pixPrice: 389.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "3200 MHz"],
    detail: "MEMORIA PC 8GB DDR4 3200MHZ FURY",
  },
  {
    id: "w21336",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Keepdata 2666HZ",
    brand: "Keepdata",
    code: "21336",
    pixPrice: 389.9,
    stock: 50,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "Keepdata"],
    detail: "L-MEMORIA PC 8GB DDR4 KEEPDATA 2666HZ",
  },
  {
    id: "w20049",
    category: "memory",
    name: "Memoria PC 8GB DDR4 Keepdata 2666HZ",
    brand: "Keepdata",
    code: "20049",
    pixPrice: 469.9,
    stock: 235,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "Keepdata"],
    detail: "MEMORIA PC 8GB DDR4 KEEPDATA 2666HZ",
  },
  {
    id: "w18345",
    category: "memory",
    name: "Memoria 8GB DDR4 Hayom 2666 MHZ",
    brand: "Hayom",
    code: "18345",
    pixPrice: 599.9,
    stock: 15,
    memType: "DDR4",
    ramGB: 8,
    specs: ["8.0 GB", "DDR4", "2666 MHz"],
    detail: "MEMORIA 8GB DDR4 HAYOM 2666 MHZ",
  },
  {
    id: "w19346",
    category: "memory",
    name: "Memoria PC 16GB DDR4 Kgt 3200MHZ",
    brand: "Kingston",
    code: "19346",
    pixPrice: 919.9,
    stock: 2,
    memType: "DDR4",
    ramGB: 16,
    specs: ["16.0 GB", "DDR4", "3200 MHz"],
    detail: "L-MEMORIA PC 16GB DDR4 KGT 3200MHZ",
  },
  {
    id: "w15523",
    category: "memory",
    name: "Memoria PC 16GB DDR4 3200MHZ Hyperx Fury",
    brand: "Hyperx",
    code: "15523",
    pixPrice: 990.9,
    stock: 1,
    memType: "DDR4",
    ramGB: 16,
    specs: ["16.0 GB", "DDR4", "3200 MHz"],
    detail: "E-MEMORIAPC 16GB DDR43200MHZ HYPERX FURY",
  },
  {
    id: "w20704",
    category: "memory",
    name: "Memoria PC 16GB DDR5 Adata 6400MHZ Br",
    brand: "Adata ",
    code: "20704",
    pixPrice: 1859.9,
    stock: 4,
    memType: "DDR5",
    ramGB: 16,
    specs: ["16.0 GB", "DDR5", "6400 MHz"],
    detail: "MEMORIA PC 16GB DDR5 ADATA 6400MHZ BR",
  },
  {
    id: "w20707",
    category: "memory",
    name: "Memoria PC 16GB DDR5 Kgt 6400MHZ Pr",
    brand: "Kingston",
    code: "20707",
    pixPrice: 1979.9,
    stock: 12,
    memType: "DDR5",
    ramGB: 16,
    specs: ["16.0 GB", "DDR5", "6400 MHz"],
    detail: "MEMORIA PC 16GB DDR5 KGT 6400MHZ PR",
  },
  // Placas de video
  {
    id: "w17063",
    category: "gpu",
    name: "Placa de Video Geforce G-GT610/2G Reven",
    brand: "Knup",
    code: "17063",
    pixPrice: 209.9,
    stock: 45,
    watts: 30,
    specs: ["~30.0 W de consumo", "Knup"],
    detail: "PLACA DE VIDEO GEFORCE G-GT610/2G  REVEN",
  },
  {
    id: "w17103",
    category: "gpu",
    name: "Placa de Video NVIDIA Geforce GT730/4G",
    brand: "Nvidia",
    code: "17103",
    pixPrice: 309.9,
    stock: 100,
    watts: 50,
    specs: ["~50.0 W de consumo", "Nvidia"],
    detail: "S-PLACA DE VIDEO NVIDIA GEFORCE GT730/4G",
  },
  {
    id: "w21635",
    category: "gpu",
    name: "Placa de Video NVIDIA Geforce GT730/4GB",
    brand: "Knup",
    code: "21635",
    pixPrice: 369.9,
    stock: 35,
    watts: 50,
    specs: ["4 GB de video", "~50.0 W de consumo", "Knup"],
    detail: "L-PLACA DEVIDEO NVIDIA GEFORCE GT730/4GB",
  },
  {
    id: "w19296",
    category: "gpu",
    name: "Placa de Video 4GB DDR5 GT740/4G Aitek",
    brand: "Aitek",
    code: "19296",
    pixPrice: 529.9,
    stock: 15,
    watts: 65,
    specs: ["4 GB de video", "~65.0 W de consumo", "Aitek"],
    detail: "PLACA DE VIDEO 4GB DDR5 GT740/4G AITEK",
  },
  {
    id: "w20485",
    category: "gpu",
    name: "Placa de Video 4GB DDR5 G-GTX750TI",
    brand: "Revenger",
    code: "20485",
    pixPrice: 719.9,
    stock: 7,
    watts: 60,
    specs: ["4 GB de video", "~60.0 W de consumo", "Revenger"],
    detail: "L-PLACA DE VIDEO 4GB DDR5 G-GTX750TI",
  },
  {
    id: "w19209",
    category: "gpu",
    name: "Placa de Video 4GB DDR5 Delta-rx560",
    brand: "Aitek",
    code: "19209",
    pixPrice: 799.9,
    stock: 10,
    watts: 80,
    specs: ["4 GB de video", "~80.0 W de consumo", "Aitek"],
    detail: "L-PLACA DE VIDEO 4GB DDR5 DELTA-RX560",
  },
  {
    id: "w20957",
    category: "gpu",
    name: "Placa de Video 4GB DDR5 GTX1050TI",
    brand: "Nvidia",
    code: "20957",
    pixPrice: 1019.9,
    stock: 15,
    watts: 75,
    specs: ["4 GB de video", "~75.0 W de consumo", "Nvidia"],
    detail: "PLACA DE VIDEO 4GB DDR5 GTX1050TI",
  },
  {
    id: "w20166",
    category: "gpu",
    name: "Placa de Video 8GB DDR5 Delta-rx580",
    brand: "Delta",
    code: "20166",
    pixPrice: 1189.9,
    stock: 1,
    watts: 185,
    specs: ["8 GB de video", "~185.0 W de consumo", "Delta"],
    detail: "L-PLACA DE VIDEO 8GB DDR5 DELTA-RX580",
  },
  // Armazenamento
  {
    id: "w25878",
    category: "storage",
    name: "SSD Pro-ultra Rapido 120GB Flashdrive",
    brand: "Flash Drive",
    code: "25878",
    pixPrice: 149.9,
    stock: 40,
    specs: ["120 GB", "Flash Drive"],
    detail: "SSD PRO-ULTRA RAPIDO 120GB FLASHDRIVE",
  },
  {
    id: "w26047",
    category: "storage",
    name: "SSD M.2 NVME 256GB Pny Cs1031 OEM",
    brand: "Pny",
    code: "26047",
    pixPrice: 159.9,
    stock: 1,
    specs: ["256 GB", "NVMe M.2", "Pny"],
    detail: "SSD M.2 NVME 256GB PNY CS1031 OEM",
  },
  {
    id: "w26064",
    category: "storage",
    name: "SSD M2 NVME Cl4-8d256 256GB OEM",
    brand: "Sem marca",
    code: "26064",
    pixPrice: 169.9,
    stock: 2,
    specs: ["256 GB", "NVMe M.2"],
    detail: "SSD M2  NVME CL4-8D256 256GB OEM",
  },
  {
    id: "w26065",
    category: "storage",
    name: "SSD M2 NVME Bc901 256GB Hana OEM",
    brand: "Hana Eletronics",
    code: "26065",
    pixPrice: 169.9,
    stock: 1,
    specs: ["256 GB", "NVMe M.2", "Hana Eletronics"],
    detail: "SSD M2  NVME BC901 256GB HANA OEM",
  },
  {
    id: "w26067",
    category: "storage",
    name: "Mini SSD M2nvmecl1-4d256 256GB Ssstc OEM",
    brand: "Solid State Storage Technology Corporati",
    code: "26067",
    pixPrice: 169.9,
    stock: 6,
    specs: ["256 GB", "NVMe M.2", "Solid State Storage Technology Corporati"],
    detail: "MINI SSD M2NVMECL1-4D256 256GB SSSTC OEM",
  },
  {
    id: "w26068",
    category: "storage",
    name: "Mini SSD M2 SATA 00up651 256GB OEM",
    brand: "Sem Marca",
    code: "26068",
    pixPrice: 169.9,
    stock: 5,
    specs: ["256 GB", "SATA", "Sem Marca"],
    detail: "MINI SSD M2 SATA 00UP651 256GB OEM",
  },
  {
    id: "w10731",
    category: "storage",
    name: "HD SSD 120GB Masterdrive",
    brand: "Masterdrive",
    code: "10731",
    pixPrice: 179.9,
    stock: 13,
    specs: ["120 GB", "Masterdrive"],
    detail: "HD SSD 120GB MASTERDRIVE",
  },
  {
    id: "w26063",
    category: "storage",
    name: "SSD M.2 2280 PCIE 256GB Gen3 Adata OEM",
    brand: "Adata ",
    code: "26063",
    pixPrice: 209.9,
    stock: 1,
    specs: ["256 GB", "Adata "],
    detail: "SSD M.2 2280 PCIE 256GB GEN3 ADATA OEM",
  },
  {
    id: "w21550",
    category: "storage",
    name: "SSD 240GB SATA 3.0 Masterdrive",
    brand: "Masterdrive",
    code: "21550",
    pixPrice: 239.9,
    stock: 291,
    specs: ["240 GB", "SATA", "Masterdrive"],
    detail: "L-SSD 240GB SATA 3.0 MASTERDRIVE",
  },
  {
    id: "w25877",
    category: "storage",
    name: "SSD Pro-ultra Rapido 240 GB Flashdrive",
    brand: "Flash Drive",
    code: "25877",
    pixPrice: 239.9,
    stock: 41,
    specs: ["240 GB", "Flash Drive"],
    detail: "SSD PRO-ULTRA RAPIDO 240 GB FLASHDRIVE",
  },
  {
    id: "w26166",
    category: "storage",
    name: "SSD SATA 3 Gamer Black 256GB Cartelado",
    brand: "Gamer Black",
    code: "26166",
    pixPrice: 249.9,
    stock: 64,
    specs: ["256 GB", "SATA", "Gamer Black"],
    detail: "SSD SATA 3 GAMER BLACK 256GB CARTELADO",
  },
  {
    id: "w19336",
    category: "storage",
    name: "SSD M2 256GB NVME PCIE Gen3x4 Keepdata",
    brand: "Keepdata",
    code: "19336",
    pixPrice: 349.9,
    stock: 2,
    specs: ["256 GB", "NVMe M.2", "Keepdata"],
    detail: "L-SSD M2 256GB NVME PCIE GEN3X4 KEEPDATA",
  },
  {
    id: "w21655",
    category: "storage",
    name: "SSD NVME 256GB Kgt",
    brand: "Kingston",
    code: "21655",
    pixPrice: 399.9,
    stock: 97,
    specs: ["256 GB", "NVMe M.2", "Kingston"],
    detail: "L-SSD NVME 256GB KGT",
  },
  {
    id: "w15316",
    category: "storage",
    name: "SSD 240GB Sata3 2.5 Burst Elite Patriot",
    brand: "Patriot",
    code: "15316",
    pixPrice: 449.9,
    stock: 1,
    specs: ["240 GB", "SATA", "Patriot"],
    detail: "SSD 240GB SATA3 2.5 BURST ELITE PATRIOT",
  },
  {
    id: "w26049",
    category: "storage",
    name: "SSD NVME 512GB M.2 PCIE 4.0 Hawking OEM",
    brand: "Hawquing",
    code: "26049",
    pixPrice: 449.9,
    stock: 2,
    specs: ["512 GB", "NVMe M.2", "Hawquing"],
    detail: "SSD NVME 512GB M.2  PCIE 4.0 HAWKING OEM",
  },
  {
    id: "w25940",
    category: "storage",
    name: "SSD Pro-ultra Rapido 480GB Flashdrive",
    brand: "Flash Drive",
    code: "25940",
    pixPrice: 469.9,
    stock: 201,
    specs: ["480 GB", "Flash Drive"],
    detail: "SSD PRO-ULTRA RAPIDO 480GB FLASHDRIVE",
  },
  {
    id: "w3251",
    category: "storage",
    name: "SSD SATA 240GB A400",
    brand: "Kingston",
    code: "3251",
    pixPrice: 479.9,
    stock: 19,
    specs: ["240 GB", "SATA", "Kingston"],
    detail: "SSD SATA 240GB A400",
  },
  {
    id: "w10733",
    category: "storage",
    name: "HD SSD 480GB Masterdrive",
    brand: "Masterdrive",
    code: "10733",
    pixPrice: 479.9,
    stock: 204,
    specs: ["480 GB", "Masterdrive"],
    detail: "HD SSD 480GB MASTERDRIVE",
  },
  {
    id: "w19332",
    category: "storage",
    name: 'SSD 512GB 3.5" 550mb/s Markvision',
    brand: "Markvision ",
    code: "19332",
    pixPrice: 489.9,
    stock: 32,
    specs: ["512 GB", "Markvision "],
    detail: 'L-SSD 512GB 3.5" 550MB/S MARKVISION',
  },
  {
    id: "w19334",
    category: "storage",
    name: "SSD 512GB Onex X-ssd-512",
    brand: "Markvision ",
    code: "19334",
    pixPrice: 489.9,
    stock: 11,
    specs: ["512 GB", "Markvision "],
    detail: "L-SSD 512GB ONEX X-SSD-512",
  },
  {
    id: "w21521",
    category: "storage",
    name: "SSD 480GB SATA 3 Crucial",
    brand: "Crucial",
    code: "21521",
    pixPrice: 529.9,
    stock: 270,
    specs: ["480 GB", "SATA", "Crucial"],
    detail: "L-SSD 480GB SATA 3 CRUCIAL",
  },
  {
    id: "w21321",
    category: "storage",
    name: "SSD NVME Nv1 M.2 512GB",
    brand: "Binario",
    code: "21321",
    pixPrice: 599.9,
    stock: 5,
    specs: ["512 GB", "NVMe M.2", "Binario"],
    detail: "S-SSD NVME NV1 M.2 512GB",
  },
  {
    id: "w19149",
    category: "storage",
    name: "SSD M2 512GB NVME PCIE Gen3x4 Keepdata",
    brand: "Keepdata",
    code: "19149",
    pixPrice: 639.9,
    stock: 3,
    specs: ["512 GB", "NVMe M.2", "Keepdata"],
    detail: "L-SSD M2 512GB NVME PCIE GEN3X4 KEEPDATA",
  },
  {
    id: "w16874",
    category: "storage",
    name: "SSD 500GB M.2 2280 NVME Nm610 Pro Lexar",
    brand: "Lexar",
    code: "16874",
    pixPrice: 679.9,
    stock: 26,
    specs: ["500 GB", "NVMe M.2", "Lexar"],
    detail: "SSD 500GB M.2 2280 NVME NM610 PRO LEXAR",
  },
  {
    id: "w14103",
    category: "storage",
    name: "SSD NVME M.2 Nv3 500GB PCIE 4.0 Kingston",
    brand: "Kingston",
    code: "14103",
    pixPrice: 869.9,
    stock: 1,
    specs: ["500 GB", "NVMe M.2", "Kingston"],
    detail: "SSD NVME M.2 NV3 500GB PCIE 4.0 KINGSTON",
  },
  {
    id: "w26124",
    category: "storage",
    name: "SSD M.2 NVME Wd Green Sn350 1TB",
    brand: "Western Digital",
    code: "26124",
    pixPrice: 1319.9,
    stock: 4,
    specs: ["1 TB", "NVMe M.2", "Western Digital"],
    detail: "L-SSD M.2 NVME WD GREEN SN350 1TB",
  },
  // Fontes
  {
    id: "w20155",
    category: "psu",
    name: "Fonte ATX Vx Pro 230W Vx230se",
    brand: "Duex",
    code: "20155",
    pixPrice: 39.9,
    stock: 11,
    watts: 230,
    specs: ["230.0 W", "Duex"],
    detail: "FONTE ATX VX PRO 230W VX230SE",
  },
  {
    id: "w10774",
    category: "psu",
    name: "Fonte ATX 200W Px300dng 110/220v K-mex S",
    brand: "K-Mex",
    code: "10774",
    pixPrice: 59.9,
    stock: 22,
    watts: 200,
    specs: ["200.0 W", "K-Mex"],
    detail: "FONTE ATX 200W PX300DNG 110/220V K-MEX S",
  },
  {
    id: "w11096",
    category: "psu",
    name: "Fonte Real 500W 20+4 Pinos Hdw-004 Fonen",
    brand: "Knup",
    code: "11096",
    pixPrice: 89.9,
    stock: 1,
    watts: 500,
    specs: ["500.0 W", "Knup"],
    detail: "FONTE REAL 500W 20+4 PINOS HDW-004 FONEN",
  },
  {
    id: "w19686",
    category: "psu",
    name: "Fonte LED Power 300W Df-300w-24v",
    brand: "Rohs",
    code: "19686",
    pixPrice: 89.9,
    stock: 1,
    watts: 300,
    specs: ["300.0 W", "Rohs"],
    detail: "FONTE LED POWER 300W DF-300W-24V",
  },
  {
    id: "w15708",
    category: "psu",
    name: "Fonte Tfx 350W 110v/220v Kp-cb202",
    brand: "Knup",
    code: "15708",
    pixPrice: 99.9,
    stock: 3,
    watts: 350,
    specs: ["350.0 W", "Knup"],
    detail: "FONTE TFX 350W 110V/220V KP-CB202",
  },
  {
    id: "w16999",
    category: "psu",
    name: "Fonte Afx Slim 350W Bivolt Kp-cb203",
    brand: "Knup",
    code: "16999",
    pixPrice: 99.9,
    stock: 2,
    watts: 350,
    specs: ["350.0 W", "Knup"],
    detail: "FONTE AFX SLIM 350W BIVOLT KP-CB203",
  },
  {
    id: "w17555",
    category: "psu",
    name: "Fonte ATX 400W Bpc-427v1.0 24 Pinos OEM",
    brand: "Tronos",
    code: "17555",
    pixPrice: 99.9,
    stock: 1,
    watts: 400,
    specs: ["400.0 W", "Tronos"],
    detail: "FONTE ATX 400W BPC-427V1.0 24 PINOS OEM",
  },
  {
    id: "w19069",
    category: "psu",
    name: "Fonte ATX 500W Bpc/5350b-m 24pinos BOX",
    brand: "Tronos",
    code: "19069",
    pixPrice: 99.9,
    stock: 108,
    watts: 500,
    specs: ["500.0 W", "Tronos"],
    detail: "L-FONTE ATX 500W BPC/5350B-M 24PINOS BOX",
  },
  {
    id: "w21062",
    category: "psu",
    name: "Fonte para PC 500W Delta-ef500",
    brand: "Delta",
    code: "21062",
    pixPrice: 139.9,
    stock: 59,
    watts: 500,
    specs: ["500.0 W", "Delta"],
    detail: "L-FONTE PARA PC  500W DELTA-EF500",
  },
  {
    id: "w15884",
    category: "psu",
    name: "Fonte ATX 500W para PC Ft-500",
    brand: "F3",
    code: "15884",
    pixPrice: 179.9,
    stock: 1,
    watts: 500,
    specs: ["500.0 W", "F3"],
    detail: "FONTE ATX 500W PARA PC FT-500",
  },
  {
    id: "w15154",
    category: "psu",
    name: "Fonte Ez8828c Eztfx 300W 80 Plus Bronze",
    brand: "K-Mex",
    code: "15154",
    pixPrice: 209.9,
    stock: 14,
    watts: 300,
    specs: ["300.0 W", "Selo 80 Plus", "K-Mex"],
    detail: "FONTE EZ8828C EZTFX 300W 80 PLUS BRONZE",
  },
  {
    id: "w13097",
    category: "psu",
    name: "Fonte Real 550W Fo-max01 80plus",
    brand: "Knup",
    code: "13097",
    pixPrice: 259.9,
    stock: 6,
    watts: 550,
    specs: ["550.0 W", "Selo 80 Plus", "Knup"],
    detail: "FONTE REAL 550W FO-MAX01 80PLUS",
  },
  {
    id: "w19942",
    category: "psu",
    name: "Fonte 650W 80plus Bronze Delta-f650",
    brand: "Delta",
    code: "19942",
    pixPrice: 259.9,
    stock: 18,
    watts: 650,
    specs: ["650.0 W", "Selo 80 Plus", "Delta"],
    detail: "L-FONTE 650W 80PLUS BRONZE DELTA-F650",
  },
  {
    id: "w13098",
    category: "psu",
    name: "Fonte Gamer 650W Fo-max02 80plus Bronze",
    brand: "Knup",
    code: "13098",
    pixPrice: 309.9,
    stock: 4,
    watts: 650,
    specs: ["650.0 W", "Selo 80 Plus", "Knup"],
    detail: "FONTE GAMER 650W FO-MAX02 80PLUS BRONZE",
  },
  {
    id: "w21080",
    category: "psu",
    name: "Fonte ATX 750W Plus Bronze Fo-max03",
    brand: "Revenger",
    code: "21080",
    pixPrice: 319.9,
    stock: 10,
    watts: 750,
    specs: ["750.0 W", "Revenger"],
    detail: "L-FONTE ATX 750W PLUS BRONZE FO-MAX03",
  },
  {
    id: "w20854",
    category: "psu",
    name: "Fonte ATX 650W 80 Plus Gold Fo-max07",
    brand: "Revenger",
    code: "20854",
    pixPrice: 399.9,
    stock: 3,
    watts: 650,
    specs: ["650.0 W", "Selo 80 Plus", "Revenger"],
    detail: "FONTE ATX 650W 80 PLUS GOLD FO-MAX07",
  },
  // Coolers
  {
    id: "w1067",
    category: "cooler",
    name: "Cooler Fan 8x8 Dx-8c 80MM Dex C/conector",
    brand: "Dex",
    code: "1067",
    pixPrice: 12.9,
    stock: 63,
    specs: ["Dex"],
    detail: "COOLER FAN 8X8 DX-8C 80MM DEX C/CONECTOR",
  },
  {
    id: "w13986",
    category: "cooler",
    name: "Cooler G-VR300 Knup",
    brand: "Knup",
    code: "13986",
    pixPrice: 19.9,
    stock: 1,
    specs: ["Knup"],
    detail: "COOLER G-VR300 KNUP",
  },
  {
    id: "w15397",
    category: "cooler",
    name: "Cooler para Processador INTEL",
    brand: "Brazil Pc",
    code: "15397",
    pixPrice: 19.9,
    stock: 3,
    specs: ["Brazil Pc"],
    detail: "COOLER PARA PROCESSADOR INTEL",
  },
  {
    id: "w17041",
    category: "cooler",
    name: "Cooler Duex 115X Dx C1",
    brand: "Knup",
    code: "17041",
    pixPrice: 19.9,
    stock: 4266,
    specs: ["Knup"],
    detail: "COOLER DUEX 115X DX C1",
  },
  {
    id: "w20830",
    category: "cooler",
    name: "Cooler p/ Processador INTEL Akfan D85",
    brand: "Intel",
    code: "20830",
    pixPrice: 19.9,
    stock: 92,
    specs: ["Intel"],
    detail: "COOLER P/ PROCESSADOR INTEL AKFAN D85",
  },
  {
    id: "w18225",
    category: "cooler",
    name: "Cooler RGB 120MM Delta-c1261p",
    brand: "Delta",
    code: "18225",
    pixPrice: 29.9,
    stock: 7,
    specs: ["Delta"],
    detail: "COOLER RGB 120MM  DELTA-C1261P",
  },
  {
    id: "w18226",
    category: "cooler",
    name: "Cooler RGB 120MM Delta-c1261b",
    brand: "Delta",
    code: "18226",
    pixPrice: 29.9,
    stock: 37,
    specs: ["Delta"],
    detail: "COOLER RGB 120MM  DELTA-C1261B",
  },
  {
    id: "w15507",
    category: "cooler",
    name: "Cooler G-VR348 Knup Universal",
    brand: "Knup",
    code: "15507",
    pixPrice: 39.9,
    stock: 50,
    specs: ["Knup"],
    detail: "COOLER G-VR348 KNUP UNIVERSAL",
  },
  {
    id: "w21122",
    category: "cooler",
    name: "Cooler RGB 120MM Delta-c0107",
    brand: "Delta",
    code: "21122",
    pixPrice: 39.9,
    stock: 1,
    specs: ["Delta"],
    detail: "COOLER RGB 120MM  DELTA-C0107",
  },
  {
    id: "w20990",
    category: "cooler",
    name: "Cooler G-VR357 Knup Universal",
    brand: "Knup",
    code: "20990",
    pixPrice: 79.9,
    stock: 9,
    specs: ["Knup"],
    detail: "COOLER G-VR357 KNUP UNIVERSAL",
  },
  {
    id: "w17230",
    category: "cooler",
    name: "Fan Cooler G-VR352K P/gabinete",
    brand: "Knup",
    code: "17230",
    pixPrice: 109.9,
    stock: 7,
    specs: ["Knup"],
    detail: "FAN COOLER G-VR352K P/GABINETE",
  },
  {
    id: "w19721",
    category: "cooler",
    name: "Cooler RGB 180W Delta-c4218",
    brand: "Delta",
    code: "19721",
    pixPrice: 109.9,
    stock: 19,
    specs: ["Delta"],
    detail: "COOLER RGB 180W  DELTA-C4218",
  },
  {
    id: "w25904",
    category: "cooler",
    name: "KIT Cooler RGB 120MM Delta-c1263b",
    brand: "Delta",
    code: "25904",
    pixPrice: 139.9,
    stock: 1,
    specs: ["Delta"],
    detail: "KIT COOLER RGB 120MM  DELTA-C1263B",
  },
  {
    id: "w20951",
    category: "cooler",
    name: "Cooler RGB 200W Delta-c6220",
    brand: "Delta",
    code: "20951",
    pixPrice: 159.9,
    stock: 19,
    specs: ["Delta"],
    detail: "COOLER RGB 200W  DELTA-C6220",
  },
  {
    id: "w6074",
    category: "cooler",
    name: "KIT Ventilacao c/ 02 Coolers 12V Padrao",
    brand: "Knup",
    code: "6074",
    pixPrice: 249.9,
    stock: 11,
    specs: ["Knup"],
    detail: "KIT VENTILACAO C/ 02 COOLERS 12V PADRAO",
  },
  // Gabinetes
  {
    id: "w21476",
    category: "case",
    name: "Gabinete Matx Bpc-n114matx M255 C/fonte",
    brand: "Bpc",
    code: "21476",
    pixPrice: 109.9,
    stock: 20,
    specs: ["Bpc"],
    detail: "GABINETE MATX BPC-N114MATX M255 C/FONTE",
  },
  {
    id: "w21562",
    category: "case",
    name: "Gabinete Gb1751 Hayom+fonte 230W Vxpro",
    brand: "Hayom",
    code: "21562",
    pixPrice: 109.9,
    stock: 1,
    specs: ["Hayom"],
    detail: "GABINETE GB1751 HAYOM+FONTE 230W VXPRO",
  },
  {
    id: "w19308",
    category: "case",
    name: "Gabinete Matx Bpc-n110matx- Bm255 C/fo",
    brand: "Bpc",
    code: "19308",
    pixPrice: 119.9,
    stock: 29,
    specs: ["Bpc"],
    detail: "L-GABINETE MATX BPC-N110MATX- BM255 C/FO",
  },
  {
    id: "w21577",
    category: "case",
    name: "Gabinete Gamer c/ 3 Fans Gb1727 Hayom",
    brand: "Hayom",
    code: "21577",
    pixPrice: 169.9,
    stock: 23,
    specs: ["Hayom"],
    detail: "L-GABINETE GAMER C/ 3 FANS  GB1727 HAYOM",
  },
  {
    id: "w19087",
    category: "case",
    name: "Gabinete Gamer Gb1710 com 3 Fans Hayom",
    brand: "Hayom",
    code: "19087",
    pixPrice: 259.9,
    stock: 3,
    specs: ["Hayom"],
    detail: "S-GABINETE GAMER GB1710 COM 3 FANS HAYOM",
  },
  {
    id: "w13549",
    category: "case",
    name: "Gabinete ATX Cx-2d67 S/fonte Preto",
    brand: "K-Mex",
    code: "13549",
    pixPrice: 299.9,
    stock: 22,
    specs: ["K-Mex"],
    detail: "GABINETE ATX CX-2D67 S/FONTE PRETO",
  },
  {
    id: "w18824",
    category: "case",
    name: "Gabinete Slim Matx Tfx Q5M Sff C/fonte",
    brand: "K-Mex",
    code: "18824",
    pixPrice: 359.9,
    stock: 111,
    specs: ["K-Mex"],
    detail: "L-GABINETE SLIM MATX TFX Q5M SFF C/FONTE",
  },
  {
    id: "w19001",
    category: "case",
    name: "Gabinete Gamer c/ 5 Fans D-matx11",
    brand: "Grasep",
    code: "19001",
    pixPrice: 439.9,
    stock: 1,
    specs: ["Grasep"],
    detail: "GABINETE GAMER C/ 5 FANS D-MATX11",
  },
  {
    id: "w18998",
    category: "case",
    name: "Gabinete Gamer c/ 7 Fans D-atx08",
    brand: "Grasep",
    code: "18998",
    pixPrice: 529.9,
    stock: 1,
    specs: ["Grasep"],
    detail: "GABINETE GAMER C/ 7 FANS D-ATX08",
  },
  {
    id: "w18999",
    category: "case",
    name: "Gabinete Gamer c/ 7 Fans D-atx09",
    brand: "Grasep",
    code: "18999",
    pixPrice: 549.9,
    stock: 1,
    specs: ["Grasep"],
    detail: "GABINETE GAMER C/ 7 FANS D-ATX09",
  },
  {
    id: "w19324",
    category: "case",
    name: "Gabinete Gamer 4 Fans D-matx05",
    brand: "Grasep",
    code: "19324",
    pixPrice: 589.9,
    stock: 1,
    specs: ["Grasep"],
    detail: "GABINETE GAMER 4 FANS D-MATX05",
  },
  {
    id: "w19002",
    category: "case",
    name: "Gabinete Gamer c/ 6 Fans D-atx12",
    brand: "Grasep",
    code: "19002",
    pixPrice: 609.9,
    stock: 1,
    specs: ["Grasep"],
    detail: "GABINETE GAMER C/ 6 FANS D-ATX12",
  },
  // Monitores
  {
    id: "w1203",
    category: "monitor",
    name: "Switch de Monitor Kvm 2 Portas Sem Os Ca",
    brand: "Sem marca",
    code: "1203",
    pixPrice: 39.9,
    stock: 40,
    specs: ["Consulte especificacoes"],
    detail: "SWITCH DE MONITOR KVM 2 PORTAS SEM OS CA",
  },
  {
    id: "w1216",
    category: "monitor",
    name: "Switch de Monitor Kvm 4 Portas Sem Os Ca",
    brand: "Sem marca",
    code: "1216",
    pixPrice: 59.9,
    stock: 46,
    specs: ["Consulte especificacoes"],
    detail: "SWITCH DE MONITOR KVM 4 PORTAS SEM OS CA",
  },
  {
    id: "w19669",
    category: "monitor",
    name: "Luminaria de LED para Monitor Ald-ac3065",
    brand: "Aitek",
    code: "19669",
    pixPrice: 89.9,
    stock: 13,
    specs: ["Aitek"],
    detail: "LUMINARIA DE LED PARA MONITOR ALD-AC3065",
  },
  {
    id: "w14884",
    category: "monitor",
    name: "Coluna Pedestal para Monitor D-zj01-1",
    brand: "Pix ",
    code: "14884",
    pixPrice: 99.9,
    stock: 15,
    specs: ["Pix "],
    detail: "COLUNA PEDESTAL PARA MONITOR D-ZJ01-1",
  },
  {
    id: "w10883",
    category: "monitor",
    name: 'Monitor LED 19" Mnbox D-mn002 Preto e',
    brand: "Mnbox",
    code: "10883",
    pixPrice: 199.9,
    stock: 4,
    specs: ["19 polegadas", "Mnbox"],
    detail: 'S- MONITOR LED 19" MNBOX D-MN002 PRETO E',
  },
  {
    id: "w5335",
    category: "monitor",
    name: 'Monitor LED 19" Bpc-19we02-b Preto',
    brand: "Brazil Pc",
    code: "5335",
    pixPrice: 209.9,
    stock: 75,
    specs: ["19 polegadas", "Brazil Pc"],
    detail: 'MONITOR LED 19" BPC-19WE02-B PRETO',
  },
  {
    id: "w14075",
    category: "monitor",
    name: 'Monitor LED 19" Tronos Trs-hk19wy Preto',
    brand: "Tronos",
    code: "14075",
    pixPrice: 209.9,
    stock: 1183,
    specs: ["19 polegadas", "Tronos"],
    detail: 'MONITOR LED 19" TRONOS TRS-HK19WY PRETO',
  },
  {
    id: "w14282",
    category: "monitor",
    name: "Monitor LED 19tronos Trs-hk19wy Preto",
    brand: "Tronos",
    code: "14282",
    pixPrice: 209.9,
    stock: 70,
    specs: ["Tronos"],
    detail: "S-MONITOR LED 19TRONOS TRS-HK19WY PRETO",
  },
  {
    id: "w13828",
    category: "monitor",
    name: 'Monitor LED 20" Trs-20wv 75HZ Preto',
    brand: "Tronos",
    code: "13828",
    pixPrice: 229.9,
    stock: 11,
    specs: ["20 polegadas", "Tronos"],
    detail: 'MONITOR LED 20" TRS-20WV 75HZ PRETO',
  },
  {
    id: "w17531",
    category: "monitor",
    name: 'Monitor LED 20" IPS 75HZ Axpro Ax-20',
    brand: "Axpro",
    code: "17531",
    pixPrice: 239.9,
    stock: 124,
    specs: ["20 polegadas", "Axpro"],
    detail: 'MONITOR LED 20" IPS 75HZ AXPRO AX-20',
  },
  {
    id: "w14293",
    category: "monitor",
    name: 'Monitor LED 19" Enterprise 19epr-bv',
    brand: "Enterprise Corp",
    code: "14293",
    pixPrice: 269.9,
    stock: 1,
    specs: ["19 polegadas", "Enterprise Corp"],
    detail: 'BH-MONITOR LED 19" ENTERPRISE 19EPR-BV',
  },
  {
    id: "w16042",
    category: "monitor",
    name: "Monitor 19 TN - 60HZ - 5-8ms - Axpro",
    brand: "Axpro",
    code: "16042",
    pixPrice: 269.9,
    stock: 38,
    specs: ["Axpro"],
    detail: "MONITOR 19 TN - 60HZ - 5-8MS - AXPRO",
  },
  {
    id: "w18904",
    category: "monitor",
    name: 'Monitor LED 22" IPS 75HZ Axpro Ax-22',
    brand: "Axpro",
    code: "18904",
    pixPrice: 279.9,
    stock: 37,
    specs: ["22 polegadas", "Axpro"],
    detail: 'L-MONITOR LED 22" IPS 75HZ AXPRO AX-22',
  },
  {
    id: "w17292",
    category: "monitor",
    name: 'Monitor LED 22" Vga+hdmi Vx220x Vxpro',
    brand: "Duex",
    code: "17292",
    pixPrice: 289.9,
    stock: 3,
    specs: ["22 polegadas", "Duex"],
    detail: 'MONITOR LED 22" VGA+HDMI VX220X VXPRO',
  },
  {
    id: "w22099",
    category: "monitor",
    name: 'Monitor LED 23" 23epr-75 Fhd Enterprise',
    brand: "Vx Pro",
    code: "22099",
    pixPrice: 319.9,
    stock: 3,
    specs: ["23 polegadas", "Vx Pro"],
    detail: 'MONITOR LED 23" 23EPR-75 FHD ENTERPRISE',
  },
  {
    id: "w16043",
    category: "monitor",
    name: "Monitor 21,5 TN - 60HZ - 5-8ms - Axpro",
    brand: "Binario",
    code: "16043",
    pixPrice: 329.9,
    stock: 19,
    specs: ["Binario"],
    detail: "MONITOR 21,5 TN - 60HZ - 5-8MS - AXPRO",
  },
  {
    id: "w19306",
    category: "monitor",
    name: 'Monitor LED 24" IPS 75HZ Axpro Ax-24',
    brand: "Axpro",
    code: "19306",
    pixPrice: 329.9,
    stock: 32,
    specs: ["24 polegadas", "Axpro"],
    detail: 'L-MONITOR LED 24" IPS 75HZ AXPRO AX-24',
  },
  {
    id: "w17467",
    category: "monitor",
    name: 'Monitor LED 22" Hq22 Slim 75HZ Haoquing',
    brand: "Uniarch",
    code: "17467",
    pixPrice: 339.9,
    stock: 1,
    specs: ["22 polegadas", "Uniarch"],
    detail: 'MONITOR LED 22" HQ22 SLIM 75HZ HAOQUING',
  },
  {
    id: "w16044",
    category: "monitor",
    name: "Monitor 23 TN - 60HZ - 5-8ms - Axpro",
    brand: "Binario",
    code: "16044",
    pixPrice: 349.9,
    stock: 1,
    specs: ["Binario"],
    detail: "MONITOR 23 TN - 60HZ - 5-8MS - AXPRO",
  },
  {
    id: "w16844",
    category: "monitor",
    name: 'Monitor LED 24" Bpc-24wr-75 Preto',
    brand: "Brazil Pc",
    code: "16844",
    pixPrice: 359.9,
    stock: 173,
    specs: ["24 polegadas", "Brazil Pc"],
    detail: 'MONITOR LED 24" BPC-24WR-75 PRETO',
  },
  {
    id: "w9936",
    category: "monitor",
    name: 'Monitor LED 23" 23WR-75 Fhd VGA HDMI Pr',
    brand: "Brazil Pc",
    code: "9936",
    pixPrice: 499.9,
    stock: 7,
    specs: ["23 polegadas", "Brazil Pc"],
    detail: 'MONITOR LED 23" 23WR-75 FHD VGA HDMI PR',
  },
  {
    id: "w18829",
    category: "monitor",
    name: 'Monitor LED 21.5" Aoc LED 22b30hm23',
    brand: "Aoc",
    code: "18829",
    pixPrice: 659.9,
    stock: 24,
    specs: ["Aoc"],
    detail: 'L-MONITOR LED 21.5" AOC LED 22B30HM23',
  },
  {
    id: "w25894",
    category: "monitor",
    name: 'Monitor Curvo Gamer 23.8" Delta-m2410ac',
    brand: "Aitek",
    code: "25894",
    pixPrice: 659.9,
    stock: 5,
    specs: ["Aitek"],
    detail: 'MONITOR CURVO GAMER 23.8"  DELTA-M2410AC',
  },
  {
    id: "w16851",
    category: "monitor",
    name: 'Monitor 19,5" HD Lg com Tela de Cristal',
    brand: "Lg",
    code: "16851",
    pixPrice: 719.9,
    stock: 1,
    specs: ["Lg"],
    detail: 'MONITOR 19,5" HD LG COM TELA DE CRISTAL',
  },
  {
    id: "w20584",
    category: "monitor",
    name: 'Monitor LED 24" Ips100hz Giratorio Axpro',
    brand: "Axpro",
    code: "20584",
    pixPrice: 759.9,
    stock: 1694,
    specs: ["24 polegadas", "Axpro"],
    detail: 'MONITOR LED 24" IPS100HZ GIRATORIO AXPRO',
  },
  {
    id: "w17443",
    category: "monitor",
    name: 'Monitor LED 21,5" Bpc22sadp-100 Fhd Pr',
    brand: "Brazil Pc",
    code: "17443",
    pixPrice: 789.9,
    stock: 24,
    specs: ["Brazil Pc"],
    detail: 'MONITOR LED 21,5" BPC22SADP-100 FHD PR',
  },
  {
    id: "w17001",
    category: "monitor",
    name: 'Monitor LED 23.8" Bpc24sadp-75 Frameless',
    brand: "Bpc",
    code: "17001",
    pixPrice: 869.9,
    stock: 18,
    specs: ["Bpc"],
    detail: 'MONITOR LED 23.8" BPC24SADP-75 FRAMELESS',
  },
  {
    id: "w17277",
    category: "monitor",
    name: 'Monitor LED 24.5" D-245g/100h',
    brand: "Grasep",
    code: "17277",
    pixPrice: 869.9,
    stock: 1,
    specs: ["Grasep"],
    detail: 'MONITOR LED 24.5"  D-245G/100H',
  },
  {
    id: "w25801",
    category: "monitor",
    name: 'Monitor LED 27" Vga/hdmi D-270/100h',
    brand: "Grasep",
    code: "25801",
    pixPrice: 909.9,
    stock: 1,
    specs: ["27 polegadas", "Grasep"],
    detail: 'MONITOR LED 27" VGA/HDMI D-270/100H',
  },
  {
    id: "w18048",
    category: "monitor",
    name: 'Monitor Gamer 27" 2K 100HZ Delta-m2710ra',
    brand: "Aitek",
    code: "18048",
    pixPrice: 1029.9,
    stock: 2,
    specs: ["27 polegadas", "Aitek"],
    detail: 'MONITOR GAMER 27" 2K 100HZ DELTA-M2710RA',
  },
  {
    id: "w14974",
    category: "monitor",
    name: 'Monitor LED 27" 27WFY-75XE 60HZ Bpc',
    brand: "Brazil Pc",
    code: "14974",
    pixPrice: 1109.9,
    stock: 1,
    specs: ["27 polegadas", "Brazil Pc"],
    detail: 'MONITOR LED 27" 27WFY-75XE 60HZ BPC',
  },
  {
    id: "w11890",
    category: "monitor",
    name: 'Monitor LED 23.8" Lg 24bl550j Pos Full H',
    brand: "Lg",
    code: "11890",
    pixPrice: 1239.9,
    stock: 8,
    specs: ["Lg"],
    detail: 'MONITOR LED 23.8" LG 24BL550J POS FULL H',
  },
  {
    id: "w26008",
    category: "monitor",
    name: 'Monitor LED 27" IPS Ac/dc D-270s/180h',
    brand: "Grasep",
    code: "26008",
    pixPrice: 1509.9,
    stock: 1,
    specs: ["27 polegadas", "Grasep"],
    detail: 'MONITOR LED 27" IPS AC/DC D-270S/180H',
  },
  {
    id: "w17954",
    category: "monitor",
    name: "Delta-m3220a Pro Monitor Gamer 32P",
    brand: "Aitek",
    code: "17954",
    pixPrice: 1629.9,
    stock: 2,
    specs: ["32 polegadas", "Aitek"],
    detail: "DELTA-M3220A PRO MONITOR GAMER 32P",
  },
  {
    id: "w17953",
    category: "monitor",
    name: "Delta-m3240a Pro Monitor 75HZ Gamer 32P",
    brand: "Aitek",
    code: "17953",
    pixPrice: 1919.9,
    stock: 3,
    specs: ["32 polegadas", "Aitek"],
    detail: "DELTA-M3240A PRO MONITOR 75HZ GAMER 32P",
  },
  {
    id: "w17952",
    category: "monitor",
    name: "Delta-m3820auc Pro Monitor Gamer 38P",
    brand: "Aitek",
    code: "17952",
    pixPrice: 2439.9,
    stock: 1,
    specs: ["38 polegadas", "Aitek"],
    detail: "DELTA-M3820AUC PRO MONITOR GAMER 38P",
  },
  {
    id: "w17951",
    category: "monitor",
    name: "Monitor Gamer 49P Delta-m4922auc Pro",
    brand: "Aitek",
    code: "17951",
    pixPrice: 4529.9,
    stock: 2,
    specs: ["49 polegadas", "Aitek"],
    detail: "MONITOR GAMER 49P DELTA-M4922AUC PRO",
  },
  // Teclados
  {
    id: "w14565",
    category: "keyboard",
    name: "Teclado USB Padrao com Fio Kb110 Duex",
    brand: "C3 Tech",
    code: "14565",
    pixPrice: 19.9,
    stock: 1,
    specs: ["C3 Tech"],
    detail: "TECLADO USB PADRAO COM FIO KB110 DUEX",
  },
  {
    id: "w16270",
    category: "keyboard",
    name: "Teclado Office USB Fio Santana 015-0041",
    brand: "Santana",
    code: "16270",
    pixPrice: 19.9,
    stock: 40,
    specs: ["Santana"],
    detail: "TECLADO OFFICE USB FIO SANTANA 015-0041",
  },
  {
    id: "w16592",
    category: "keyboard",
    name: "Teclado com Fio USB 5VDC Abnt2 Kp-te148",
    brand: "Knup",
    code: "16592",
    pixPrice: 22.9,
    stock: 4,
    specs: ["Knup"],
    detail: "TECLADO COM FIO USB 5VDC ABNT2 KP-TE148",
  },
  {
    id: "w13271",
    category: "keyboard",
    name: "KIT Teclado/mouse C/fio Office Kc-500 5+",
    brand: "Santana",
    code: "13271",
    pixPrice: 29.9,
    stock: 13,
    specs: ["Santana"],
    detail: "KIT TECLADO/MOUSE C/FIO OFFICE KC-500 5+",
  },
  {
    id: "w13675",
    category: "keyboard",
    name: "Teclado Basico USB Tf100 Tc193 Mult",
    brand: "Multilaser",
    code: "13675",
    pixPrice: 29.9,
    stock: 1,
    specs: ["Multilaser"],
    detail: "TECLADO BASICO USB TF100 TC193 MULT",
  },
  {
    id: "w18063",
    category: "keyboard",
    name: "Teclado Sem Fio Kp-2048",
    brand: "Knup",
    code: "18063",
    pixPrice: 29.9,
    stock: 14,
    specs: ["Knup"],
    detail: "TECLADO SEM FIO KP-2048",
  },
  {
    id: "w18724",
    category: "keyboard",
    name: "KIT Teclado e Mouse C/fio Kapbom Ka-670",
    brand: "Kap Bom",
    code: "18724",
    pixPrice: 29.9,
    stock: 28,
    specs: ["Kap Bom"],
    detail: "KIT TECLADO E MOUSE C/FIO KAPBOM KA-670",
  },
  {
    id: "w18725",
    category: "keyboard",
    name: "Teclado C/fio Abnt2 Kapbom Ka-691",
    brand: "Kap Bom",
    code: "18725",
    pixPrice: 29.9,
    stock: 480,
    specs: ["Kap Bom"],
    detail: "TECLADO C/FIO ABNT2 KAPBOM KA-691",
  },
  {
    id: "w26171",
    category: "keyboard",
    name: "Teclado Multimidia Keyboard-km-3928",
    brand: "Ninja",
    code: "26171",
    pixPrice: 29.9,
    stock: 262,
    specs: ["Ninja"],
    detail: "L-TECLADO MULTIMIDIA KEYBOARD-KM-3928",
  },
  {
    id: "w16425",
    category: "keyboard",
    name: "Combo Wireless 2.4GHZ Offi Mouse/teclado",
    brand: "Santana",
    code: "16425",
    pixPrice: 39.9,
    stock: 20,
    specs: ["Santana"],
    detail: "COMBO WIRELESS 2.4GHZ OFFI MOUSE/TECLADO",
  },
  {
    id: "w18831",
    category: "keyboard",
    name: "Teclado Multimidia Km3928u",
    brand: "Ninja",
    code: "18831",
    pixPrice: 39.9,
    stock: 182,
    specs: ["Ninja"],
    detail: "L-TECLADO MULTIMIDIA KM3928U",
  },
  {
    id: "w19608",
    category: "keyboard",
    name: "Teclado Gamer Single Hand Kp-te133",
    brand: "Knup",
    code: "19608",
    pixPrice: 39.9,
    stock: 1,
    specs: ["Knup"],
    detail: "TECLADO GAMER SINGLE HAND KP-TE133",
  },
  {
    id: "w17895",
    category: "keyboard",
    name: "KIT Teclado Emouse S Fio Haoqing Hq-1633",
    brand: "Haoquing",
    code: "17895",
    pixPrice: 49.9,
    stock: 2,
    specs: ["Haoquing"],
    detail: "KIT TECLADO EMOUSE S FIO HAOQING HQ-1633",
  },
  {
    id: "w15632",
    category: "keyboard",
    name: "Mini Teclado Sem Fio Bluetooth Kp-te109",
    brand: "Knup",
    code: "15632",
    pixPrice: 59.9,
    stock: 7,
    specs: ["Knup"],
    detail: "MINI TECLADO SEM FIO BLUETOOTH KP-TE109",
  },
  {
    id: "w25371",
    category: "keyboard",
    name: "Teclado Bluetooth Fr-3001",
    brand: "Peining",
    code: "25371",
    pixPrice: 59.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO BLUETOOTH FR-3001",
  },
  {
    id: "w26170",
    category: "keyboard",
    name: "KIT Mouse Mo-236+teclado Km-3928",
    brand: "Ninja",
    code: "26170",
    pixPrice: 59.9,
    stock: 194,
    specs: ["Ninja"],
    detail: "L- KIT MOUSE MO-236+TECLADO KM-3928",
  },
  {
    id: "w24946",
    category: "keyboard",
    name: "KIT Mouse/teclado S/fio 2.4G Pei-fr-3022",
    brand: "Peining",
    code: "24946",
    pixPrice: 79.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT MOUSE/TECLADO S/FIO 2.4G PEI-FR-3022",
  },
  {
    id: "w25362",
    category: "keyboard",
    name: "Teclado Sem Fio Pei-fr-3023",
    brand: "Peining",
    code: "25362",
    pixPrice: 79.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO SEM FIO PEI-FR-3023",
  },
  {
    id: "w25366",
    category: "keyboard",
    name: "KIT de Teclado Sem Fio Pei-fr12",
    brand: "Peining",
    code: "25366",
    pixPrice: 79.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT DE TECLADO SEM FIO PEI-FR12",
  },
  {
    id: "w18371",
    category: "keyboard",
    name: "KIT Teclado e Mouse Gamer Kp-te147",
    brand: "Knup",
    code: "18371",
    pixPrice: 109.9,
    stock: 1,
    specs: ["Knup"],
    detail: "KIT TECLADO E MOUSE GAMER KP-TE147",
  },
  {
    id: "w25358",
    category: "keyboard",
    name: "Teclado Semi Mercanico Pei-fr01",
    brand: "Peining",
    code: "25358",
    pixPrice: 109.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO SEMI MERCANICO PEI-FR01",
  },
  {
    id: "w25361",
    category: "keyboard",
    name: "Teclado Mercanico Pei-fr03",
    brand: "Peining",
    code: "25361",
    pixPrice: 109.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO MERCANICO PEI-FR03",
  },
  {
    id: "w19238",
    category: "keyboard",
    name: "Teclado Gamer com Fio RGB Ate-m8701",
    brand: "Aitek",
    code: "19238",
    pixPrice: 119.9,
    stock: 4,
    specs: ["Aitek"],
    detail: "TECLADO GAMER COM FIO RGB ATE-M8701",
  },
  {
    id: "w25370",
    category: "keyboard",
    name: "KIT de Teclado Sem Fio Pei-fr09",
    brand: "Peining",
    code: "25370",
    pixPrice: 119.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT DE TECLADO SEM FIO PEI-FR09",
  },
  {
    id: "w25376",
    category: "keyboard",
    name: "KIT de Teclado Sem Fio Pei-fr08",
    brand: "Peining",
    code: "25376",
    pixPrice: 119.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT DE TECLADO SEM FIO PEI-FR08",
  },
  {
    id: "w25854",
    category: "keyboard",
    name: "KIT Teclado e Mouse Sem Fio Pei-mk01",
    brand: "Peining",
    code: "25854",
    pixPrice: 119.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT TECLADO E MOUSE SEM FIO PEI-MK01",
  },
  {
    id: "w21624",
    category: "keyboard",
    name: "Teclado Mecanico RGB LED Delta-tm1071",
    brand: "Delta",
    code: "21624",
    pixPrice: 130.9,
    stock: 17,
    specs: ["Delta"],
    detail: "TECLADO MECANICO RGB LED DELTA-TM1071",
  },
  {
    id: "w25368",
    category: "keyboard",
    name: "KIT Teclado Sem Fio Pei-mk02",
    brand: "Peining",
    code: "25368",
    pixPrice: 139.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT TECLADO SEM FIO PEI-MK02",
  },
  {
    id: "w25369",
    category: "keyboard",
    name: "Teclado com Fio Mecanico Pei-fr-3025",
    brand: "Peining",
    code: "25369",
    pixPrice: 139.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO COM FIO MECANICO PEI-FR-3025",
  },
  {
    id: "w21623",
    category: "keyboard",
    name: "Teclado Mecanico RGB LED Delta-tm1111",
    brand: "Delta",
    code: "21623",
    pixPrice: 149.9,
    stock: 8,
    specs: ["Delta"],
    detail: "TECLADO MECANICO RGB LED DELTA-TM1111",
  },
  {
    id: "w25372",
    category: "keyboard",
    name: "KIT de Teclado Sem Fio Pei-fr10",
    brand: "Peining",
    code: "25372",
    pixPrice: 149.9,
    stock: 1,
    specs: ["Peining"],
    detail: "KIT DE TECLADO SEM FIO PEI-FR10",
  },
  {
    id: "w15665",
    category: "keyboard",
    name: "Mini Teclado Dobravel C Touchpad Ims-950",
    brand: "Imenso",
    code: "15665",
    pixPrice: 159.9,
    stock: 4,
    specs: ["Imenso"],
    detail: "MINI TECLADO DOBRAVEL C TOUCHPAD IMS-950",
  },
  {
    id: "w25365",
    category: "keyboard",
    name: "Teclado com Fio Mecanico Pei-fr07",
    brand: "Peining",
    code: "25365",
    pixPrice: 219.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO COM FIO MECANICO PEI-FR07",
  },
  {
    id: "w25375",
    category: "keyboard",
    name: "Teclado com Fio Mecanico Pei-fr06",
    brand: "Peining",
    code: "25375",
    pixPrice: 229.9,
    stock: 1,
    specs: ["Peining"],
    detail: "TECLADO COM FIO MECANICO PEI-FR06",
  },
  // Mouses
  {
    id: "w14566",
    category: "mouse",
    name: "Mouse USB Padrao com Fio M365 Duex",
    brand: "Duex",
    code: "14566",
    pixPrice: 5.9,
    stock: 3546,
    specs: ["Duex"],
    detail: "MOUSE USB PADRAO COM FIO M365 DUEX",
  },
  {
    id: "w16632",
    category: "mouse",
    name: "Mouse USB Office Pr 1000DPI 015-0043 5+",
    brand: "Santana",
    code: "16632",
    pixPrice: 5.9,
    stock: 12175,
    specs: ["Santana"],
    detail: "MOUSE USB OFFICE PR 1000DPI 015-0043 5+",
  },
  {
    id: "w18978",
    category: "mouse",
    name: "Mouse Optico USB com Fio Ka-601 Kapbom",
    brand: "Kap Bom",
    code: "18978",
    pixPrice: 5.9,
    stock: 323,
    specs: ["Kap Bom"],
    detail: "MOUSE OPTICO USB COM FIO KA-601 KAPBOM",
  },
  {
    id: "w18806",
    category: "mouse",
    name: "Mouse 5+gamer Start 2.0 Preto/vermelho",
    brand: "Santana",
    code: "18806",
    pixPrice: 6.9,
    stock: 480,
    specs: ["Santana"],
    detail: "MOUSE 5+GAMER START 2.0 PRETO/VERMELHO",
  },
  {
    id: "w20452",
    category: "mouse",
    name: "Mouse 5+gamer RGB 1200DPI C/fio 015-0086",
    brand: "Santana",
    code: "20452",
    pixPrice: 8.9,
    stock: 3,
    specs: ["Santana"],
    detail: "MOUSE 5+GAMER RGB 1200DPI C/FIO 015-0086",
  },
  {
    id: "w13830",
    category: "mouse",
    name: "Mouse com Fio Multi Mf100 1200DPI",
    brand: "Multilaser",
    code: "13830",
    pixPrice: 9.9,
    stock: 1745,
    specs: ["Multilaser"],
    detail: "MOUSE COM FIO MULTI MF100 1200DPI",
  },
  {
    id: "w19697",
    category: "mouse",
    name: "Mouse Sem Fio USB Office 015-0080",
    brand: "Santana",
    code: "19697",
    pixPrice: 9.9,
    stock: 658,
    specs: ["Santana"],
    detail: "MOUSE SEM FIO USB OFFICE 015-0080",
  },
  {
    id: "w17654",
    category: "mouse",
    name: "Mouse Gamer C/fio 3 Botoes Knup Kp-mu003",
    brand: "Knup",
    code: "17654",
    pixPrice: 11.9,
    stock: 4,
    specs: ["Knup"],
    detail: "MOUSE GAMER C/FIO 3 BOTOES KNUP KP-MU003",
  },
  {
    id: "w11411",
    category: "mouse",
    name: "Mouse Optico Ninja Mo-m236 1200DPI USB",
    brand: "Ninja",
    code: "11411",
    pixPrice: 15.9,
    stock: 60,
    specs: ["Ninja"],
    detail: "MOUSE OPTICO NINJA MO-M236 1200DPI USB",
  },
  {
    id: "w15633",
    category: "mouse",
    name: "Mouse Gamer USB LED Kp-mu013 Knup",
    brand: "Knup",
    code: "15633",
    pixPrice: 19.9,
    stock: 100,
    specs: ["Knup"],
    detail: "MOUSE GAMER USB LED KP-MU013  KNUP",
  },
  {
    id: "w16996",
    category: "mouse",
    name: "Controle Remoto Air Mouse Le-7716",
    brand: "Lelong",
    code: "16996",
    pixPrice: 19.9,
    stock: 93,
    specs: ["Lelong"],
    detail: "CONTROLE REMOTO AIR MOUSE LE-7716",
  },
  {
    id: "w25821",
    category: "mouse",
    name: "Mouse com Fio Pei-jt08",
    brand: "Peining",
    code: "25821",
    pixPrice: 19.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE COM FIO PEI-JT08",
  },
  {
    id: "w12905",
    category: "mouse",
    name: "Mouse Optico Gamer 3200DPI Kp-v4 Knup",
    brand: "Knup",
    code: "12905",
    pixPrice: 29.9,
    stock: 75,
    specs: ["Knup"],
    detail: "MOUSE OPTICO GAMER 3200DPI KP-V4 KNUP",
  },
  {
    id: "w16444",
    category: "mouse",
    name: "Mouse Optico C/fiousb Acer M117 Branco",
    brand: "Acer",
    code: "16444",
    pixPrice: 29.9,
    stock: 20,
    specs: ["Acer"],
    detail: "MOUSE OPTICO C/FIOUSB ACER M117 BRANCO",
  },
  {
    id: "w25264",
    category: "mouse",
    name: "Mouse com Fio Game Peining Pei-me04",
    brand: "Peining",
    code: "25264",
    pixPrice: 29.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE COM FIO GAME PEINING PEI-ME04",
  },
  {
    id: "w25819",
    category: "mouse",
    name: "Mouse com Fio Pei-jt07",
    brand: "Peining",
    code: "25819",
    pixPrice: 29.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE COM FIO PEI-JT07",
  },
  {
    id: "w16739",
    category: "mouse",
    name: "Mouse S/ Fio Bluetooth 2400DPI Kp-mu023",
    brand: "Knup",
    code: "16739",
    pixPrice: 39.9,
    stock: 1,
    specs: ["Knup"],
    detail: "MOUSE S/ FIO BLUETOOTH 2400DPI KP-MU023",
  },
  {
    id: "w17957",
    category: "mouse",
    name: "Mouse Sem Fio Kp-mu029",
    brand: "Knup",
    code: "17957",
    pixPrice: 39.9,
    stock: 45,
    specs: ["Knup"],
    detail: "MOUSE SEM FIO KP-MU029",
  },
  {
    id: "w18186",
    category: "mouse",
    name: "Mouse Gamer Aura Sync 7D Delta-vm7048",
    brand: "Delta",
    code: "18186",
    pixPrice: 39.9,
    stock: 44,
    specs: ["Delta"],
    detail: "MOUSE GAMER AURA SYNC 7D DELTA-VM7048",
  },
  {
    id: "w25267",
    category: "mouse",
    name: "Mouse com Fio Game Peining Pei-me07",
    brand: "Peining",
    code: "25267",
    pixPrice: 49.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE COM FIO GAME PEINING PEI-ME07",
  },
  {
    id: "w17956",
    category: "mouse",
    name: "Mouse Gamer com Fio Kp-mu007",
    brand: "Knup",
    code: "17956",
    pixPrice: 59.9,
    stock: 47,
    specs: ["Knup"],
    detail: "MOUSE GAMER COM FIO KP-MU007",
  },
  {
    id: "w18187",
    category: "mouse",
    name: "Mouse Gamer Aura Sync 9D Delta-vm9128",
    brand: "Delta",
    code: "18187",
    pixPrice: 59.9,
    stock: 74,
    specs: ["Delta"],
    detail: "MOUSE GAMER AURA SYNC 9D DELTA-VM9128",
  },
  {
    id: "w21850",
    category: "mouse",
    name: "Mouse Sem Fio Peining Pei-me12",
    brand: "Peining",
    code: "21850",
    pixPrice: 59.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE SEM FIO PEINING PEI-ME12",
  },
  {
    id: "w25274",
    category: "mouse",
    name: "Mouse Sem Fio Peining Pei-me10",
    brand: "Peining",
    code: "25274",
    pixPrice: 59.9,
    stock: 1,
    specs: ["Peining"],
    detail: "MOUSE SEM FIO PEINING PEI-ME10",
  },
  {
    id: "w16446",
    category: "mouse",
    name: "Mouse Optico com Fio USB Acer Emw130",
    brand: "Acer",
    code: "16446",
    pixPrice: 69.9,
    stock: 55,
    specs: ["Acer"],
    detail: "MOUSE OPTICO COM FIO USB ACER EMW130",
  },
  // Cadeiras
  {
    id: "w19512",
    category: "chair",
    name: "Cadeira Escritorio Smart Fixa",
    brand: "Jgm",
    code: "19512",
    pixPrice: 309.9,
    stock: 1,
    specs: ["Jgm"],
    detail: "CADEIRA ESCRITORIO SMART FIXA",
  },
  {
    id: "w21369",
    category: "chair",
    name: "Conjunto Mesa e Cadeira Oif-7640",
    brand: "Oasis",
    code: "21369",
    pixPrice: 429.9,
    stock: 1,
    specs: ["Oasis"],
    detail: "CONJUNTO MESA E CADEIRA OIF-7640",
  },
  {
    id: "w18391",
    category: "chair",
    name: "Cadeira Escritorio Ergonomica Mcc-p021",
    brand: "Tomate",
    code: "18391",
    pixPrice: 649.9,
    stock: 1,
    specs: ["Tomate"],
    detail: "CADEIRA ESCRITORIO ERGONOMICA MCC-P021",
  },
  {
    id: "w17984",
    category: "chair",
    name: "Cadeira de Balanco Reclinavel Mcc-p025",
    brand: "Tomate",
    code: "17984",
    pixPrice: 689.9,
    stock: 1,
    specs: ["Tomate"],
    detail: "CADEIRA DE BALANCO RECLINAVEL MCC-P025",
  },
];

const presets = [
  {
    name: "Binário Essencial AM4",
    kicker: "Escritório & Estudo",
    pixPrice: 1104.49,
    cardPrice: 1299.4,
    fps: ["Valorant: 60+ FPS", "CS2: 50+ FPS", "Sem placa de vídeo"],
    note: "Ryzen com vídeo integrado Vega — roda o dia a dia, pacote Office e jogos leves sem precisar de placa dedicada. Todas as peças em estoque na loja.",
    ids: ["w15380", "w12375", "w19384", "w25878", "w19069", "w21476"],
  },
  {
    name: "Binário Arena 1050 Ti",
    kicker: "Mais Equilibrado da Loja",
    pixPrice: 2370.91,
    cardPrice: 2789.3,
    fps: ["Valorant: 140+ FPS", "CS2: 120+ FPS", "Fortnite: 70+ FPS"],
    note: "Ryzen 5 de 6 núcleos com GTX 1050 Ti. O melhor custo-benefício com o que está disponível hoje em Varginha.",
    ids: ["w17867", "w12375", "w19384", "w20957", "w25878", "w19069", "w21577"],
    featured: true,
  },
  {
    name: "Binário Studio RX 560",
    kicker: "Trabalho Pesado & Criação",
    pixPrice: 2726.4,
    cardPrice: 3207.5,
    fps: ["Edição de vídeo", "Render 3D leve", "Multitarefa pesada"],
    note: "Ryzen 7 de 8 núcleos com SSD NVMe de 480 GB. Focado em quem edita, renderiza ou trabalha com muitas abas e programas abertos.",
    ids: ["w18599", "w12375", "w19384", "w19209", "w25940", "w19069", "w21577"],
  },
];

const stockMachines = [
  {
    id: "BN-1048",
    name: "Binário Start Home & Office",
    spec: "Ryzen 5 5600G · 16 GB DDR4 · SSD 1 TB NVMe · Fonte 550W",
    pixPrice: 2711.5,
    tone: "Pronta entrega em Varginha",
  },
  {
    id: "BN-1051",
    name: "Binário Arena Gamer RX",
    spec: "Ryzen 5 5600 · RX 6600 8GB · 16 GB DDR4 · SSD 1 TB NVMe",
    pixPrice: 4241.5,
    tone: "Última unidade no estoque",
  },
  {
    id: "BN-1053",
    name: "Binário Studio RTX DLSS 3",
    spec: "Core i5 14400F · RTX 4060 8GB · 32 GB DDR5 · SSD 1 TB",
    pixPrice: 5856.5,
    tone: "Pronta entrega em Varginha",
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
// >>> NUMEROS ESTIMADOS: conferir com teste real antes de prometer pro
// cliente. GPU que nao estiver aqui simplesmente nao mostra estimativa. <<<
const FPS_POR_GPU: Record<string, number[]> = {
  apu: [70, 75, 45, 50, 60, 22],
  w17063: [25, 20, 0, 0, 20, 0], // GT 610 2GB: video basico, nao e de jogo
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
        title: "Monte seu PC Gamer Sob Medida | Binário Tecnologia Varginha-MG",
      },
      {
        name: "description",
        content:
          "Monte seu computador com garantia de compatibilidade, preço especial no PIX e suporte técnico especializado em Varginha.",
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
  const totalCard = totalPix / 0.85;
  const installmentVal = totalCard / 10;
  const pixSavings = totalCard - totalPix;

  const cpu = chosen.find((part) => part.category === "cpu");
  const gpu = chosen.find((part) => part.category === "gpu");
  const psu = chosen.find((part) => part.category === "psu");
  const mobo = chosen.find((part) => part.category === "motherboard");
  const rams = chosen.filter((part) => part.category === "memory");
  // Pentes ja escolhidos x slots da placa. Placa sem o dado nao limita.
  const slotsDaPlaca = mobo?.slots;
  const pentesUsados = rams.reduce((sum, r) => sum + (selected[r.id] ?? 1), 0);
  const slotsCheios = slotsDaPlaca !== undefined && pentesUsados >= slotsDaPlaca;

  const requiredWatts =
    cpu && gpu ? Math.ceil(((cpu.watts ?? 65) + (gpu.watts ?? 0) + 220) / 50) * 50 : 0;
  const currentPsuWatts = psu?.watts ?? 0;
  const powerOk = !requiredWatts || !psu || currentPsuWatts >= requiredWatts;
  const wattsPct =
    requiredWatts && currentPsuWatts
      ? Math.min(100, Math.round((requiredWatts / currentPsuWatts) * 100))
      : 0;

  const socketOk = !cpu?.socket || !mobo?.socket || cpu.socket === mobo.socket;

  // O tipo de memoria e ditado pela placa-mae. Enquanto ela nao for escolhida,
  // deduzimos pelo socket do processador (AM4 -> DDR4, AM5 -> DDR5).
  const boardMemType: "DDR3" | "DDR4" | "DDR5" | undefined =
    mobo?.memType ?? (cpu?.socket === "AM5" ? "DDR5" : cpu?.socket === "AM4" ? "DDR4" : undefined);
  const ramOk = !boardMemType || rams.every((r) => !r.memType || r.memType === boardMemType);

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
  function enviarOrcamento(item: Vendedor) {
    const linhas = [
      ...chosen.map(
        (part) => `• [${part.code}] *${part.name}* — ${money.format(part.pixPrice)} (PIX)`,
      ),
      ...linhasCotacao,
    ].join("\n");
    const aviso = cotacoes.length
      ? `\n\n_${cotacoes.length} item(ns) marcado(s) como A COTAR ainda não entram no total._`
      : "";
    const obs = observacao.trim() ? `\n\n*Observação:* ${observacao.trim()}` : "";
    const text = `Olá, ${item.nome}! Gostaria de consultar este orçamento de PC:\n\n${linhas || "Ainda estou montando minhas peças."}\n\n*Total no PIX (com 15% OFF)*: ${money.format(totalPix)}\n*Parcelado*: 10x de ${money.format(installmentVal)}${aviso}${obs}\n\nMontagem inclusa. Podem verificar disponibilidade em Varginha?`;
    registrarHistorico(item.nome);
    abrirWhats(item.numero, text);
  }

  // Maquina ja montada em estoque -> WhatsApp do vendedor escolhido.
  function enviarMontada(item: Vendedor, machineId: string) {
    const machine = stockMachines.find((m) => m.id === machineId);
    if (!machine) return;
    const text = `Olá, ${item.nome}! Tenho interesse nesta máquina pronta entrega:\n\n*${machine.name}*\nCódigo: ${machine.id}\n${machine.spec}\n\nValor no PIX: ${money.format(machine.pixPrice)}\n\nAinda está disponível?`;
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
              ? 'Antes de começar, escolha seu nome (ou "sou cliente") — isso identifica quem pediu a montagem quando a lista for pro T.I.'
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
              ? `Assinado como ${vendedor.nome}. Clique em cada destino para abrir a conversa — o WhatsApp bloqueia se tentar abrir os dois de uma vez.`
              : "Clique em cada destino para abrir a conversa."}
          </DialogDescription>
        </DialogHeader>

        <div className="seller-grid">
          {CONTATOS_TI.map((contato) => (
            <button
              key={contato.numero}
              onClick={() => enviarDestinoTI(contato)}
              className="seller-btn"
            >
              <span className="seller-avatar">
                <Package className="w-4 h-4" />
              </span>
              <span className="seller-name">{contato.nome}</span>
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>
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
    <div className="print-budget">
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
            <th>Valor PIX</th>
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
          Total no PIX: <strong>{money.format(totalPix)}</strong>
        </span>
        <span>ou 10x de {money.format(installmentVal)}</span>
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

          // Categoria sem peça: no modo resumo e nos periféricos, some.
          // Nas peças obrigatórias, mostra uma linha "clique para escolher".
          if (!itens.length) {
            if (reviewMode || category.periferico) return null;
            return (
              <div
                key={category.id}
                onClick={() => setActive(category.id)}
                className="summary-item-row cursor-pointer hover:bg-slate-50 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CategoryIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="summary-item-label">
                    <small>{category.short}</small>
                    <strong>Clique para escolher</strong>
                  </div>
                </div>
              </div>
            );
          }

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
                  <span className="summary-item-thumb">
                    {part.foto ? (
                      <img src={part.foto} alt="" loading="lazy" />
                    ) : (
                      <CategoryIcon className="w-4 h-4" />
                    )}
                  </span>
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
            <Zap className="w-4 h-4 text-amber-600" /> Consumo Estimado
          </span>
          <span className="font-mono text-slate-800 font-bold">
            {requiredWatts ? `${requiredWatts} W` : "Sem cálculo"}
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
            <span>PC completo! É só finalizar o orçamento aqui embaixo.</span>
          </div>
        ) : faltando.length <= 2 ? (
          <button className="falta-pouco is-near" onClick={() => setActive(faltando[0]!)}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Falta só {faltandoLabels.join(" e ")} pra fechar seu PC!</span>
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
                <span>Total no PIX (com 15% OFF)</span>
                <strong>{money.format(totalPix)}</strong>
                {pixSavings > 0 && (
                  <span className="pix-savings-pill">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Você economiza{" "}
                    {money.format(pixSavings)} no PIX
                  </span>
                )}
              </div>

              <div className="credit-total-line">
                ou em até <strong>10x de {money.format(installmentVal)}</strong> sem juros
              </div>

              <button
                disabled={!chosen.length && !cotacoes.length}
                onClick={() => setSellerIntent({ kind: "orcamento" })}
                className="btn-whatsapp-checkout no-print"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Finalizar no WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-3 no-print">
                <Button
                  variant="outline"
                  onClick={editBuild}
                  className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs h-9"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar montagem
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs h-9"
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
              PCs Recomendados
            </a>
            <a href="#estoque" className="hover:text-blue-600 transition-colors">
              Pronta Entrega
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
              <span className="hidden sm:inline">Falar com Vendedor</span>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MONTAGEM DE ALTA PERFORMANCE EM VARGINHA</span>
              </div>
              <h1>Monte seu PC Gamer ou de Trabalho Sob Medida</h1>
              <p>
                Escolha os componentes ideais para a sua necessidade. Todas as máquinas montadas na
                Binário saem da loja com
                <strong>
                  {" "}
                  cabos organizados, BIOS atualizada gratuitamente e 24h de teste de estresse
                </strong>
                .
              </p>
              <div className="hero-proof-pills">
                <span className="hero-pill">
                  <Check className="w-4 h-4 text-emerald-600" /> Compatibilidade 100% Garantida
                </span>
                <span className="hero-pill">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1 Ano de Garantia Local
                </span>
                <span className="hero-pill">
                  <Truck className="w-4 h-4 text-emerald-600" /> Retirada Imediata em Varginha
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
              {categories.map((category, index) => {
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
                    <span className="tab-status-icon">
                      {done ? <Check className="w-3.5 h-3.5" /> : String(index + 1)}
                    </span>
                    <Icon className="w-4 h-4" />
                    <span>{category.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Builder Catalog & Summary Grid */}
            <div className="main-builder-grid">
              {/* Catalog Column */}
              <div className="catalog-card">
                <div className="catalog-header">
                  <div>
                    <h2>Escolha o seu {categories.find((item) => item.id === active)?.label}</h2>
                    <span>Exibindo peças compatíveis em estoque na loja</span>
                  </div>
                  <span className="catalog-step-pill">
                    ETAPA {categories.findIndex((item) => item.id === active) + 1} DE{" "}
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
                    <Sparkles className="w-4 h-4" />
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
                        <div className="hardware-thumb-box">
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
                              <span className="hardware-thumb-badge">{part.brand}</span>
                            </>
                          )}
                        </div>

                        {/* Hardware Details */}
                        <div className="product-info-col">
                          <div className="product-brand-tags">
                            <span className="brand-badge">{part.brand}</span>
                            <span className="code-badge">Cód. {part.code}</span>
                            {part.socket && (
                              <span className="spec-badge">Socket {part.socket}</span>
                            )}
                            {part.memType && <span className="spec-badge">{part.memType}</span>}
                            {part.platform && <span className="spec-badge">{part.platform}</span>}
                            {part.watts && <span className="spec-badge">{part.watts}W TDP</span>}
                          </div>
                          <h3>{part.name}</h3>
                          <p>{part.detail}</p>
                          <div className="flex flex-wrap gap-1.5 my-1.5">
                            {part.specs.map((spec, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                          <span className="stock-status-tag">Disponível em Varginha</span>
                          <button
                            type="button"
                            className="product-ver-mais"
                            onClick={() => setDetalhePeca(part)}
                          >
                            Ver detalhes
                          </button>
                        </div>

                        {/* Price & Action */}
                        <div className="product-price-col">
                          <div className="pix-price-highlight">
                            <strong>{money.format(part.pixPrice)}</strong>
                            <span className="pix-badge-small">15% OFF NO PIX</span>
                          </div>
                          <span className="credit-price-small">
                            ou 10x de {money.format(part.pixPrice / 0.85 / 10)}
                          </span>

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
                                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs h-9 px-4"
                                  : "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shadow-md shadow-blue-600/20"
                              }
                            >
                              {chosenPart && !partMulti ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1" /> Selecionado
                                </>
                              ) : (
                                <>
                                  {partMulti ? "Adicionar" : "Adicionar"}{" "}
                                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
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
                    className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
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
                    <span className="hidden sm:inline">Próxima Etapa</span>
                    <span className="sm:hidden">Próxima</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Sticky Summary Sidebar */}
              <aside className="summary-sidebar-card">
                <div className="summary-sidebar-header">
                  <h3>
                    <PackageCheck className="w-5 h-5 text-emerald-400" />
                    Sua Montagem
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
                    <Sparkles className="w-3.5 h-3.5" />
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
                    <span>Total no PIX (com 15% OFF)</span>
                    <strong>{money.format(totalPix)}</strong>
                    {pixSavings > 0 && (
                      <span className="pix-savings-pill">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Você economiza{" "}
                        {money.format(pixSavings)} no PIX
                      </span>
                    )}
                  </div>

                  <div className="credit-total-line">
                    ou em até <strong>10x de {money.format(installmentVal)}</strong> sem juros
                  </div>

                  <button
                    disabled={!chosen.length && !cotacoes.length}
                    onClick={() => setSellerIntent({ kind: "orcamento" })}
                    className="btn-whatsapp-checkout"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Finalizar no WhatsApp</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      variant="outline"
                      disabled={!chosen.length && !cotacoes.length}
                      onClick={shareBuild}
                      className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs h-9"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      {copied ? "Copiado!" : "Copiar Link"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!chosen.length && !cotacoes.length}
                      onClick={() => window.print()}
                      className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs h-9"
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

        {/* Desempenho estimado da montagem */}
        {temDesempenho && (
          <section className="perf-section no-print">
            <div className="shell">
              <div className="section-title-head">
                <h2>Como esse PC se sai</h2>
                <p>
                  Estimativa em 1080p com gráficos altos, baseada nas peças escolhidas. Valores
                  aproximados para dar uma ideia — não são benchmark oficial.
                </p>
              </div>

              <div className="perf-grid">
                {/* Jogos */}
                <div className="perf-card">
                  <h3>
                    <Sparkles className="w-4 h-4 text-blue-600" /> Nos jogos
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
              <h2>Configurações Recomendadas pelos Nossos Técnicos</h2>
              <p>
                Modelos montados e testados pela equipe da Binário. Você pode carregar uma build e
                alterar qualquer peça.
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
                        <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                          À vista no PIX
                        </span>
                        <strong className="text-2xl font-extrabold text-emerald-700 font-display">
                          {money.format(preset.pixPrice)}
                        </strong>
                      </div>
                      <span className="text-xs text-slate-500">
                        ou 10x de {money.format(preset.cardPrice / 10)}
                      </span>
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
                      Carregar esta Build no Montador <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
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
              <h2>Computadores Pronta Entrega na Loja em Varginha</h2>
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
                      <span>no PIX</span>
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
            <span>PIX à vista com desconto</span>
            <span>Cartão em até 10x sem juros</span>
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
                <div>
                  <strong>{money.format(detalhePeca.pixPrice)}</strong>
                  <span>à vista no PIX</span>
                </div>
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
