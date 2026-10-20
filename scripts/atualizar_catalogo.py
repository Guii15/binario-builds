"""
Atualiza o catalogo do montador (src/data/catalogo.json) a partir do WinThor.

Entrada: o resultado da rotina 860 salvo como .xls/.xlsx, ou o resultado da
consulta scripts/consulta_860.sql exportado em .csv. Colunas usadas:
CODPROD, DESCRICAO, MARCA, PVENDA, ESTOQUE.

Como rodar (na pasta do projeto):
    python scripts/atualizar_catalogo.py produtosPCS.xls
    python scripts/atualizar_catalogo.py resultado.csv --simular   (so mostra o que mudaria)

O que ele faz:
- Peca que ja esta no catalogo: atualiza so preco e estoque. Nome, ficha,
  foto e campos tecnicos editados a mao ficam como estao.
- Peca nova com estoque: entra no catalogo com categoria, socket, memoria,
  watts etc. deduzidos da descricao.
- Peca do catalogo que sumiu da 860: fica com estoque 0 (some da tela, mas
  continua existindo pros links de orcamento antigos nao quebrarem).
- Peca sem foto que ganhou public/fotos/<CODPROD>.jpg: passa a usar a foto.

Para .xls precisa de: pip install pandas xlrd   (.xlsx: pandas openpyxl)
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

from winthor_regras import (
    MAQUINA,
    classifica,
    excluida,
    infere_apu,
    infere_memtype,
    infere_plataforma,
    infere_ram,
    infere_socket,
    infere_watts,
    limpa_descricao,
    titulo,
)

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "src" / "data" / "catalogo.json"
FOTOS = RAIZ / "public" / "fotos"
INDEX = RAIZ / "src" / "routes" / "index.tsx"

# Nomes alternativos que aparecem nas planilhas ja exportadas.
APELIDOS = {
    "DESCRICAO_WINTHOR": "DESCRICAO",
    "PRECO": "PVENDA",
    "PRECO_PIX": "PVENDA",
    "QTEST": "ESTOQUE",
    "QT_DISPONIVEL": "ESTOQUE",
}
OBRIGATORIAS = ["CODPROD", "DESCRICAO", "MARCA", "PVENDA", "ESTOQUE"]


# ----------------------------------------------------------------- leitura ---


def numero(v):
    """Aceita 1234.5, '1234,5', '1.234,50' e vazio."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return None if v != v else float(v)  # v != v pega NaN
    s = str(v).strip()
    if not s:
        return None
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def le_linhas(arquivo: Path):
    ext = arquivo.suffix.lower()
    if ext in (".xls", ".xlsx"):
        try:
            import pandas as pd
        except ImportError:
            sys.exit("Para ler planilha do Excel: pip install pandas xlrd openpyxl")
        linhas = pd.read_excel(arquivo).to_dict("records")
    elif ext == ".csv":
        texto = arquivo.read_text(encoding="utf-8-sig", errors="replace")
        sep = ";" if texto.splitlines()[0].count(";") >= texto.splitlines()[0].count(",") else ","
        linhas = list(csv.DictReader(texto.splitlines(), delimiter=sep))
    else:
        sys.exit(f"Formato nao suportado: {ext} (use .xls, .xlsx ou .csv)")

    saida = []
    for linha in linhas:
        r = {}
        for k, v in linha.items():
            chave = str(k).strip().upper()
            r[APELIDOS.get(chave, chave)] = v
        saida.append(r)
    faltando = [c for c in OBRIGATORIAS if saida and c not in saida[0]]
    if faltando:
        sys.exit(f"Colunas faltando no arquivo: {', '.join(faltando)}")
    return saida


# ------------------------------------------------------------- peca nova ---


def foto_de(codigo: str):
    return f"/fotos/{codigo}.jpg" if (FOTOS / f"{codigo}.jpg").exists() else None


def peca_nova(codigo: str, desc_original: str, marca: str, preco: float, estoque: int):
    desc = limpa_descricao(desc_original)
    cat = classifica(desc)
    if cat is None:
        return None
    socket = infere_socket(desc, cat)
    mem = infere_memtype(desc, cat)
    watts = infere_watts(desc, cat)
    ram = infere_ram(desc, cat)
    apu = infere_apu(desc, cat)
    U = desc.upper()
    video = apu is True or (
        cat == "cpu" and bool(re.search(r"CORE I[3579]", U)) and not re.search(r"\d{4,5}F\b", U)
    )

    specs = []
    if socket:
        specs.append(f"Socket {socket}")
    if mem:
        specs.append(mem)
    if ram:
        specs.append(f"{ram} GB")
    if watts and cat == "psu":
        specs.append(f"{watts} W")
    if video:
        specs.append("Video integrado")
    if marca:
        specs.append(marca)

    peca = {
        "id": f"w{codigo}",
        "category": cat,
        "name": titulo(desc),
        "brand": marca,
        "code": codigo,
        "foto": foto_de(codigo),
        "pixPrice": preco,
        "stock": estoque,
        "platform": infere_plataforma(desc, cat, socket),
        "socket": socket,
        "memType": mem,
        "watts": watts,
        "ramGB": ram,
        "apu": True if apu else None,
        "videoIntegrado": True if video else None,
        "specs": specs[:3],
        "detail": str(desc_original).strip(),
    }
    # Campo vazio fica fora do JSON, igual as pecas que ja existem.
    return {k: v for k, v in peca.items() if v is not None}


# ------------------------------------------------------------------- main ---


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("arquivo", type=Path, help="resultado da 860 (.xls/.xlsx) ou da consulta (.csv)")
    ap.add_argument("--simular", action="store_true", help="mostra o relatorio sem salvar")
    args = ap.parse_args()

    catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
    por_codigo = {p["code"]: p for p in catalogo}
    ordem_cat = []
    for p in catalogo:
        if p["category"] not in ordem_cat:
            ordem_cat.append(p["category"])

    vistos = set()
    novos = []
    mudou_preco = mudou_estoque = ganhou_foto = 0
    descartes = {"sem preco": 0, "sem estoque (nova)": 0, "maquina montada": 0, "fora do montador": 0}

    for r in le_linhas(args.arquivo):
        cod = numero(r["CODPROD"])
        if cod is None:
            continue
        codigo = str(int(cod))
        preco = numero(r["PVENDA"])
        estoque = max(0, int(numero(r["ESTOQUE"]) or 0))
        marca = str(r.get("MARCA") or "").strip()
        marca = "" if marca.upper() in ("NAO INFORMADO", "NAN") else marca.title()

        if codigo in por_codigo:
            vistos.add(codigo)
            p = por_codigo[codigo]
            if preco and preco > 0 and round(preco, 2) != p["pixPrice"]:
                p["pixPrice"] = round(preco, 2)
                mudou_preco += 1
            if estoque != p["stock"]:
                p["stock"] = estoque
                mudou_estoque += 1
            if "foto" not in p and foto_de(codigo):
                p["foto"] = foto_de(codigo)
                ganhou_foto += 1
            continue

        if not preco or preco <= 0:
            descartes["sem preco"] += 1
            continue
        desc = str(r["DESCRICAO"])
        if re.search(MAQUINA, limpa_descricao(desc).upper()):
            descartes["maquina montada"] += 1
            continue
        if excluida(limpa_descricao(desc)):
            descartes["fora do montador"] += 1
            continue
        if estoque <= 0:
            descartes["sem estoque (nova)"] += 1
            continue
        nova = peca_nova(codigo, desc, marca, round(preco, 2), estoque)
        if nova is None:
            descartes["fora do montador"] += 1
            continue
        vistos.add(codigo)
        por_codigo[codigo] = nova
        novos.append(nova)

    zerados = []
    for p in catalogo:
        if p["code"] not in vistos and p["stock"] != 0:
            p["stock"] = 0
            zerados.append(p)

    # Peca nova entra logo depois das outras da mesma categoria.
    for nova in novos:
        idx = max((i for i, p in enumerate(catalogo) if p["category"] == nova["category"]), default=None)
        if idx is None:
            catalogo.append(nova)
        else:
            catalogo.insert(idx + 1, nova)

    # ----------------------------------------------------------- relatorio ---
    print(f"Pecas no catalogo: {len(catalogo)}")
    print(f"  preco atualizado:   {mudou_preco}")
    print(f"  estoque atualizado: {mudou_estoque}")
    print(f"  ganharam foto:      {ganhou_foto}")
    print(f"  zeradas (sumiram da 860): {len(zerados)}")
    print(f"  novas: {len(novos)}")
    for cat in ordem_cat + sorted({n['category'] for n in novos} - set(ordem_cat)):
        qtd = sum(1 for n in novos if n["category"] == cat)
        if qtd:
            print(f"    {cat}: {qtd}")
    print("Ignoradas da 860: " + ", ".join(f"{k} {v}" for k, v in descartes.items()))

    sem_estoque = {p["id"] for p in catalogo if p["stock"] == 0}
    builds = re.findall(r'name: "([^"]+)",[\s\S]*?ids: \[([^\]]*)\]', INDEX.read_text(encoding="utf-8"))
    for nome, ids in builds:
        faltam = [i for i in re.findall(r'"([^"]+)"', ids) if i in sem_estoque]
        if faltam:
            print(f"ATENCAO: a build pronta '{nome}' usa peca sem estoque: {', '.join(faltam)}")

    revisar = [n for n in novos if n["category"] in ("cpu", "motherboard") and "socket" not in n]
    revisar += [n for n in novos if n["category"] in ("motherboard", "memory") and "memType" not in n]
    revisar += [n for n in novos if n["category"] == "psu" and "watts" not in n]
    if revisar:
        print("Revisar a mao (sem dado tecnico, a compatibilidade nao trava essas):")
        for n in revisar:
            print(f"  {n['code']} {n['name']}")

    if args.simular:
        print("\nSimulacao: nada foi salvo.")
        return
    CATALOGO.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nSalvo em {CATALOGO.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
