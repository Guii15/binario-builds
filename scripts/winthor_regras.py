"""
Regras de limpeza, classificacao e inferencia das descricoes do WinThor.

Vieram do prototipo do extrator (rotina 860). Ficam separadas do script
principal pra poder ajustar uma regra sem mexer no resto.
"""

import re

# ---------------------------------------------------------------- limpeza ---


def limpa_descricao(desc: str) -> str:
    """Remove prefixo de controle interno (L-, E-, S-, BH-) e normaliza espaco."""
    s = str(desc).strip()
    s = re.sub(r"^[A-Z]{1,2}-\s*", "", s)
    s = re.sub(r"\s+", " ", s)
    # separa numero grudado em letra: "DDR43200MHZ" -> "DDR4 3200MHZ"
    s = re.sub(r"(DDR[345])(\d{4})", r"\1 \2", s)
    s = re.sub(r"(GHZ)(AM\d)", r"\1 \2", s, flags=re.I)
    s = re.sub(r"\bMEMORIAPC\b", "MEMORIA PC", s, flags=re.I)
    s = re.sub(r"\bPLACA DEVIDEO\b", "PLACA DE VIDEO", s, flags=re.I)
    s = re.sub(r"\bRYZEN(\d)", r"RYZEN \1", s, flags=re.I)
    return s.strip()


def titulo(s: str) -> str:
    """WinThor guarda tudo em CAIXA ALTA. Deixa apresentavel no card."""
    miudas = {"de", "da", "do", "para", "com", "e", "c/", "p/"}
    siglas = {
        "PC", "SSD", "HD", "NVME", "SATA", "ATX", "RGB", "LED", "USB", "GB",
        "TB", "MHZ", "GHZ", "W", "OEM", "BOX", "AM4", "AM5", "II", "III",
        "AMD", "INTEL", "NVIDIA", "ITX", "ATA", "PCIE", "WIFI", "BT", "ARGB",
        "KIT", "TG", "MB", "VGA", "HDMI", "DP", "IPS", "VA", "TN", "HZ", "MM",
    }
    out = []
    for w in s.split():
        U = w.upper()
        if (
            U in siglas
            # token com numero+letra colados (3200G, 1050TI, 5800X, 3.0GHZ)
            or re.fullmatch(r"[A-Z]?[\d.]+[A-Z]{0,3}", U) and any(c.isdigit() for c in U)
            or re.match(
                r"^(DDR\d|LGA\d+|M\.2|\d+GB|\d+TB|\d+W|\d+MHZ|RX\d+|GT\d+|GTX\d+"
                r"|RTX\d+|I[3579]\b|B\d{3}|H\d{3}|A\d{3}|X\d{3}|Z\d{3}|G-)",
                U,
            )
        ):
            out.append(U)
        elif w.lower() in miudas and out:
            out.append(w.lower())
        else:
            out.append(w.capitalize())
    return " ".join(out)


# ------------------------------------------------------------ exclusoes ---
# Coisas que casam com a palavra-chave mas NAO sao peca de PC desktop.
EXCLUIR = [
    r"NOTEBOOK", r"\bNOTE\b", r"MACBOOK", r"PATINETE", r"SPEED DOME",
    r"CHAVEADA", r"COLMEIA", r"\bCFTV\b", r"CAMERA", r"IMPRESSORA",
    r"ROTEADOR", r"NOBREAK", r"MOUSE PAD", r"SUPORTE", r"CASE PARA",
    r"CASE P/", r"\bCASE\b.*\bSSD\b", r"COMPARTIMENTO", r"CARREGADOR",
    r"VEICULAR", r"CELULAR", r"\bTV\b", r"PROJETOR", r"SPLITTER",
    r"EXTENSOR", r"ADAPTADOR", r"CABO", r"HUB ", r"BATERIA",
]
# Produto acabado (maquina montada) - tem vitrine propria no site, nao e peca.
MAQUINA = r"^(COMPUTADOR|PC )|\bALL IN ONE\b"


def excluida(d: str) -> bool:
    U = d.upper()
    return any(re.search(rx, U) for rx in EXCLUIR)


# ---------------------------------------------------------- classificacao ---


def classifica(d: str):
    U = d.upper()
    if re.search(MAQUINA, U):
        return None  # maquina montada, fora do montador de pecas
    # combo placa-mae + processador: conta como placa-mae
    if re.search(r"PLACA MAE.*PROCESSADOR|PLACA MAE C/ PROC", U):
        return "motherboard"
    if re.search(r"PLACA MAE|PLACA-MAE|MAINBOARD", U):
        return "motherboard"
    if re.search(r"PLACA DE VIDEO|GEFORCE|RADEON|\bGTX\b|\bRTX\b|\bRX ?\d{3}", U):
        return "gpu"
    if re.search(r"PROCESSADOR|RYZEN|CORE I[3579]|ATHLON|PENTIUM", U):
        # "COOLER PARA PROCESSADOR" nao e processador
        if re.search(r"COOLER|WATER", U):
            return "cooler"
        return "cpu"
    if re.search(r"\bMEMORIA\b", U):
        # "CARTAO DE MEMORIA" / "MEMORIA MICRO SD" sao cartao, nao RAM de PC.
        if re.search(r"CARTAO|MICRO ?SD|\bSD\b|PEN ?DRIVE|FLASH", U):
            return None
        # RAM de verdade sempre declara o tipo DDR
        if not re.search(r"\bDDR[345]\b", U):
            return None
        return "memory"
    # MONITOR antes de storage: 'MONITOR 19,5" HD' - esse HD e resolucao, nao disco.
    if re.search(r"MONITOR", U):
        return "monitor"
    if re.search(r"\bSSD\b|\bNVME\b|HARD DISK", U) or re.search(r"\bHD\b \d+\s?(GB|TB)", U):
        return "storage"
    # COOLER/FAN antes de GABINETE: 'FAN COOLER P/GABINETE' e cooler, nao gabinete.
    if re.search(r"\bFAN\b|VENTILACAO|VENTOINHA", U):
        return "cooler"
    # GABINETE antes de FONTE: "GABINETE ATX S/FONTE" nao e fonte, e gabinete.
    if re.search(r"GABINETE", U):
        return "case"
    if re.search(r"\bFONTE\b", U):
        # so fonte de PC: ATX, ou com watts declarados
        if re.search(r"\bATX\b|\bREAL\b|\bGAMER\b|80 ?PLUS|\d{3} ?W\b", U):
            return "psu"
        return None
    if re.search(r"COOLER|WATER COOLER|VENTOINHA|AIR COOLER", U):
        return "cooler"
    if re.search(r"MONITOR", U):
        return "monitor"
    if re.search(r"TECLADO", U):
        return "keyboard"
    if re.search(r"\bMOUSE\b", U) and not re.search(r"MOUSE ?PAD", U):
        return "mouse"
    if re.search(r"\bCADEIRA", U):
        return "chair"
    return None


# ------------------------------------------------------------- inferencia ---

SOCKETS = ["AM5", "AM4", "AM3", "LGA1700", "LGA1200", "LGA1151", "LGA1150",
           "LGA1155", "LGA1156", "LGA775"]


def infere_socket(d: str, cat: str):
    if cat not in ("cpu", "motherboard"):
        return None
    U = re.sub(r"[\s\-]", "", d.upper())
    for s in SOCKETS:
        if s in U:
            return s
    # chipset -> socket (so quando o socket nao veio escrito)
    # Sem \b no fim: o chipset costuma vir grudado no modelo (H310MHP, B550M).
    CHIPSET = {
        r"\bA520|\bB550|\bA320|\bB450|\bX570": "AM4",
        r"\bB650|\bX670|\bA620": "AM5",
        r"\bH610|\bB660|\bB760|\bZ690|\bZ790|\bH710": "LGA1700",
        r"\bH510|\bH511|\bB560|\bZ590|\bH470|\bB460": "LGA1200",
        r"\bH310|\bB250|\bB360|\bH110|\bZ370": "LGA1151",
        r"\bH81|\bB85|\bZ97": "LGA1150",
        r"\bH61|\bB75|\bZ77": "LGA1155",
        r"\bH55": "LGA1156",
    }
    U2 = d.upper()
    for rx, sock in CHIPSET.items():
        if re.search(rx, U2):
            return sock
    # familia de processador
    if cat == "cpu":
        if re.search(r"RYZEN [3579] [1-5]\d{3}", U2):
            return "AM4"
        if re.search(r"RYZEN [3579] [7-9]\d{3}", U2):
            return "AM5"
    return None


def infere_memtype(d: str, cat: str):
    """CUIDADO: em placa de video, DDR5 = memoria de VIDEO, nao serve pra compat."""
    if cat not in ("motherboard", "memory"):
        return None
    m = re.search(r"\bDDR([345])\b", d.upper())
    return f"DDR{m.group(1)}" if m else None


def infere_watts(d: str, cat: str):
    U = d.upper()
    if cat == "psu":
        m = re.search(r"(\d{3,4})\s?W\b", U)
        return int(m.group(1)) if m else None
    if cat == "gpu":
        # estimativa grosseira por familia - o extrator real precisa de tabela
        TDP = {r"GT ?610": 30, r"GT ?730": 50, r"GT ?740": 65,
               r"GTX ?750": 60, r"GTX ?1050": 75, r"RX ?560": 80, r"RX ?580": 185}
        for rx, w in TDP.items():
            if re.search(rx, U):
                return w
        return None
    if cat == "cpu":
        if re.search(r"RYZEN [79]", U):
            return 105
        if re.search(r"RYZEN [35]", U):
            return 65
        if re.search(r"CORE I[79]", U):
            return 125
        if re.search(r"CORE I[35]", U):
            return 65
        return None
    return None


def infere_ram(d: str, cat: str):
    if cat != "memory":
        return None
    m = re.search(r"(\d{1,2})\s?GB", d.upper())
    return int(m.group(1)) if m else None


def infere_apu(d: str, cat: str):
    if cat != "cpu":
        return None
    U = d.upper()
    # sufixo G na AMD = video integrado. Intel sem F tem integrado.
    if re.search(r"RYZEN [3579] \d{4}G\b", U):
        return True
    if re.search(r"CORE I[3579].*\d{4,5}F\b", U):
        return False
    return None


def infere_plataforma(d: str, cat: str, socket):
    if cat not in ("cpu", "motherboard"):
        return None
    U = d.upper()
    if socket and socket.startswith("AM"):
        return "AMD"
    if socket and socket.startswith("LGA"):
        return "Intel"
    if re.search(r"RYZEN|ATHLON|\bAMD\b", U):
        return "AMD"
    if re.search(r"CORE I|INTEL|PENTIUM|CELERON", U):
        return "Intel"
    return None


