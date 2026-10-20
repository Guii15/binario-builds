-- Consulta do WinThor (Oracle) com as mesmas colunas da rotina 860.
-- Roda numa maquina da loja que alcance o banco (SQL Developer, por exemplo).
-- Exporte o resultado em CSV e passe pro scripts/atualizar_catalogo.py.
--
-- AINDA NAO TESTADA no banco da loja: confira com o T.I. os dois valores abaixo
-- antes de usar, e compare o resultado com uma 860 tirada no mesmo dia.
--   :CODFILIAL  filial do estoque da loja (ex.: '1')
--   :NUMREGIAO  regiao da tabela de preco usada no balcao (ex.: 1)
--
-- Estoque disponivel = estoque gerencial - reservado - bloqueado.
-- A classificacao (processador, placa-mae, etc.) e feita pelo script a partir
-- da descricao, entao aqui nao precisa filtrar departamento.

SELECT p.CODPROD,
       p.DESCRICAO,
       NVL(m.MARCA, 'NAO INFORMADO') AS MARCA,
       t.PVENDA,
       GREATEST(NVL(e.QTESTGER, 0) - NVL(e.QTRESERV, 0) - NVL(e.QTBLOQUEADA, 0), 0) AS ESTOQUE
  FROM PCPRODUT p
  LEFT JOIN PCMARCA m ON m.CODMARCA = p.CODMARCA
  JOIN PCTABPR t ON t.CODPROD = p.CODPROD AND t.NUMREGIAO = :NUMREGIAO
  LEFT JOIN PCEST e ON e.CODPROD = p.CODPROD AND e.CODFILIAL = :CODFILIAL
 WHERE p.DTEXCLUSAO IS NULL
   AND NVL(t.PVENDA, 0) > 0
 ORDER BY p.CODPROD
