"""Testes das regras de classificacao. Rode com: python -m unittest discover scripts"""

import unittest

from winthor_regras import (
    classifica,
    excluida,
    infere_memtype,
    infere_socket,
    limpa_descricao,
    nome_exibicao,
)


def prepara(desc):
    d = limpa_descricao(desc)
    cat = None if excluida(d) else classifica(d)
    return d, cat


class Classificacao(unittest.TestCase):
    def test_processador_de_alimentos_nao_e_cpu(self):
        _, cat = prepara("MINI PROCESSADOR PORTATIL OIH-2581")
        self.assertIsNone(cat)

    def test_placa_com_processador_e_placa_mae(self):
        _, cat = prepara("PLACA M?E DDR4 C/PROCESSADOR G-PC6300HQ")
        self.assertEqual(cat, "motherboard")

    def test_cooler_de_processador_e_cooler(self):
        _, cat = prepara("COOLER PARA PROCESSADOR 120MM RGB")
        self.assertEqual(cat, "cooler")


class Socket(unittest.TestCase):
    def casos(self, tabela):
        for desc, esperado in tabela:
            d, cat = prepara(desc)
            with self.subTest(desc=desc):
                self.assertEqual(infere_socket(d, cat), esperado)

    def test_intel_pela_geracao(self):
        self.casos(
            [
                ("L-PROCESSADOR I5-14400 3.5GHZLGA1700 OEM", "LGA1700"),
                ("PROCESSADOR I5-10400 2.9GHZ LGA 1200", "LGA1200"),
                ("PROCESSADOR I5-7600 3.5GHZ OEM", "LGA1151"),
                ("PROCESSADOR I5-4590S 3.00GHZ OEM", "LGA1150"),
                ("PROCESSADOR INTEL I5-3470 3.2GHZ1155 OEM", "LGA1155"),
                ("PROCESSADOR I3-540 3.2GHZ LGA1156 OEM", "LGA1156"),
                ("PROCESSADOR PENTIUM G5400 3.7GHZ", "LGA1151"),
            ]
        )

    def test_descricao_com_socket_errado(self):
        # i7-8700 e 8a geracao (LGA1151), mesmo a descricao dizendo LGA1150
        self.casos([("PROCESSADOR I7-8700 3.20GHZ LGA1150 OEM", "LGA1151")])

    def test_placa_pelo_chipset(self):
        self.casos(
            [
                ("PLACA MAE DELTA-A520M2K AM4", "AM4"),
                ("PLACA MAE 9MX87EG7-00-G11 X870 EAGLE", "AM5"),
                ("PLACA MAE G-H610 REVENGER DDR4 LGA1700", "LGA1700"),
            ]
        )


class Memoria(unittest.TestCase):
    def test_placa_sem_tipo_usa_o_socket(self):
        self.assertEqual(infere_memtype("PLACA MAE DELTA H81", "motherboard", "LGA1150"), "DDR3")
        self.assertEqual(infere_memtype("PLACA MAE X870 EAGLE", "motherboard", "AM5"), "DDR5")

    def test_lga1700_fica_sem_tipo(self):
        # LGA1700 tem placa DDR4 e DDR5: melhor nao chutar
        self.assertIsNone(infere_memtype("PLACA MAE B760", "motherboard", "LGA1700"))

    def test_ddr_escrito_vence(self):
        self.assertEqual(infere_memtype("PLACA MAE B760 DDR5", "motherboard", "LGA1700"), "DDR5")


class Nome(unittest.TestCase):
    def test_nome_de_processador_intel(self):
        d, cat = prepara("L-PROCESSADOR I5-14400 3.5GHZLGA1700 OEM")
        self.assertEqual(nome_exibicao(d, cat), "Processador Intel Core i5-14400 3.5GHz LGA1700 OEM")

    def test_lixo_do_cadastro_sai_do_nome(self):
        d, cat = prepara("PROCESSADOR INT I5 9400 OEM-PROCI59400")
        self.assertEqual(nome_exibicao(d, cat), "Processador Intel Core i5-9400 OEM")

    def test_acentos(self):
        d, cat = prepara("PLACA MAE G-H610 REVENGER DDR4 LGA1700")
        self.assertTrue(nome_exibicao(d, cat).startswith("Placa Mãe"))


if __name__ == "__main__":
    unittest.main()
