// Regras de compatibilidade do montador, separadas da tela pra poderem ser
// testadas sozinhas (src/lib/compatibilidade.test.ts).

type Memoria = "DDR3" | "DDR4" | "DDR5";

type PecaCompat = {
  socket?: string;
  memType?: Memoria;
  watts?: number;
};

// Consumo estimado da CPU + GPU com folga de 220W pro resto da maquina,
// arredondado pra cima de 50 em 50. Sem CPU e GPU escolhidas, nao calcula.
export function fonteNecessaria(cpu?: PecaCompat, gpu?: PecaCompat): number {
  if (!cpu || !gpu) return 0;
  return Math.ceil(((cpu.watts ?? 65) + (gpu.watts ?? 0) + 220) / 50) * 50;
}

export function socketCompativel(cpu?: PecaCompat, placa?: PecaCompat): boolean {
  return !cpu?.socket || !placa?.socket || cpu.socket === placa.socket;
}

// O tipo de memoria e ditado pela placa-mae. Enquanto ela nao for escolhida,
// deduzimos pelo socket do processador (AM4 -> DDR4, AM5 -> DDR5).
export function memoriaDaPlaca(placa?: PecaCompat, cpu?: PecaCompat): Memoria | undefined {
  if (placa?.memType) return placa.memType;
  if (cpu?.socket === "AM5") return "DDR5";
  if (cpu?.socket === "AM4") return "DDR4";
  return undefined;
}

export function memoriasCompativeis(tipo: Memoria | undefined, pentes: PecaCompat[]): boolean {
  return !tipo || pentes.every((p) => !p.memType || p.memType === tipo);
}
