import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import {
  fonteNecessaria,
  memoriaDaPlaca,
  memoriasCompativeis,
  socketCompativel,
} from "./compatibilidade.ts";

test("fonte: so calcula com processador e placa de video", () => {
  assert.equal(fonteNecessaria({ watts: 65 }, undefined), 0);
  assert.equal(fonteNecessaria(undefined, { watts: 75 }), 0);
});

test("fonte: soma consumo + 220W e arredonda pra cima de 50 em 50", () => {
  // 65 + 75 + 220 = 360 -> 400
  assert.equal(fonteNecessaria({ watts: 65 }, { watts: 75 }), 400);
  // 105 + 185 + 220 = 510 -> 550
  assert.equal(fonteNecessaria({ watts: 105 }, { watts: 185 }), 550);
  // CPU sem watts conta como 65
  assert.equal(fonteNecessaria({}, { watts: 115 }), 400);
});

test("socket: so reprova quando os dois lados tem socket e sao diferentes", () => {
  assert.equal(socketCompativel({ socket: "AM4" }, { socket: "AM4" }), true);
  assert.equal(socketCompativel({ socket: "AM4" }, { socket: "AM5" }), false);
  assert.equal(socketCompativel({ socket: "AM4" }, {}), true);
  assert.equal(socketCompativel(undefined, { socket: "LGA1700" }), true);
});

test("memoria: a placa manda; sem placa, deduz pelo socket do processador", () => {
  assert.equal(memoriaDaPlaca({ memType: "DDR4" }, { socket: "AM5" }), "DDR4");
  assert.equal(memoriaDaPlaca(undefined, { socket: "AM5" }), "DDR5");
  assert.equal(memoriaDaPlaca(undefined, { socket: "AM4" }), "DDR4");
  assert.equal(memoriaDaPlaca(undefined, { socket: "LGA1700" }), undefined);
});

test("memoria: pente de tipo diferente da placa reprova", () => {
  assert.equal(memoriasCompativeis("DDR4", [{ memType: "DDR4" }, {}]), true);
  assert.equal(memoriasCompativeis("DDR4", [{ memType: "DDR5" }]), false);
  assert.equal(memoriasCompativeis(undefined, [{ memType: "DDR5" }]), true);
});

// O catalogo e gerado por script; esses testes pegam erro de extracao antes
// de ir pro ar (link de orcamento quebrado, foto apontando pro nada, etc.).
type Peca = { id: string; code: string; category: string; pixPrice: number; foto?: string };
const catalogo: Peca[] = JSON.parse(
  readFileSync(new URL("../data/catalogo.json", import.meta.url), "utf-8"),
);
const CATEGORIAS = [
  "cpu",
  "motherboard",
  "memory",
  "gpu",
  "storage",
  "psu",
  "cooler",
  "case",
  "monitor",
  "keyboard",
  "mouse",
  "chair",
];

test("catalogo: ids e codigos unicos", () => {
  const ids = new Set(catalogo.map((p) => p.id));
  const codigos = new Set(catalogo.map((p) => p.code));
  assert.equal(ids.size, catalogo.length);
  assert.equal(codigos.size, catalogo.length);
});

test("catalogo: toda peca tem categoria valida e preco", () => {
  for (const p of catalogo) {
    assert.ok(CATEGORIAS.includes(p.category), `${p.id}: categoria ${p.category}`);
    assert.ok(p.pixPrice > 0, `${p.id}: sem preco`);
  }
});

test("catalogo: toda foto apontada existe em public/", () => {
  for (const p of catalogo) {
    if (!p.foto) continue;
    const arquivo = new URL(`../../public${p.foto}`, import.meta.url);
    assert.ok(existsSync(arquivo), `${p.id}: falta ${p.foto}`);
  }
});

test("builds prontas: so usam pecas que existem no catalogo", () => {
  const pagina = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf-8");
  const ids = new Set(catalogo.map((p) => p.id));
  const usados = [...pagina.matchAll(/ids: \[([^\]]*)\]/g)].flatMap((m) =>
    [...(m[1] ?? "").matchAll(/"([^"]+)"/g)].map((x) => x[1] ?? ""),
  );
  assert.ok(usados.length > 0);
  for (const id of usados) assert.ok(ids.has(id), `build usa ${id}, que nao esta no catalogo`);
});

test("modelos de empresa: so usam pecas que existem no catalogo", () => {
  const pagina = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf-8");
  const ids = new Set(catalogo.map((p) => p.id));
  const usados = [...pagina.matchAll(/pecas: \{([^}]*)\}/g)].flatMap((m) =>
    [...(m[1] ?? "").matchAll(/(w\d+):/g)].map((x) => x[1] ?? ""),
  );
  assert.ok(usados.length > 0);
  for (const id of usados) assert.ok(ids.has(id), `modelo usa ${id}, que nao esta no catalogo`);
});
