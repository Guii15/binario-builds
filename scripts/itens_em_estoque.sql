-- Todos os itens com estoque e preco de venda no WinThor (Oracle).
-- Filial 31 (estoque da loja) e regiao 1 (preco do balcao), conferidos
-- em 20/10/2026 com o Ryzen 7 5700G (cod. 23388): 2 unidades, R$ 1.529,90.
-- Depois de rodar, salve o resultado pelo disquete da grade (Excel/CSV).

SELECT p.CODPROD,
       p.DESCRICAO,
       NVL(m.MARCA, 'NAO INFORMADO') AS MARCA,
       t.PVENDA,
       e.QTESTGER - NVL(e.QTRESERV, 0) - NVL(e.QTBLOQUEADA, 0) AS ESTOQUE
  FROM PCEST e
  JOIN PCPRODUT p ON p.CODPROD = e.CODPROD
  JOIN PCTABPR t  ON t.CODPROD = e.CODPROD AND t.NUMREGIAO = 1
  LEFT JOIN PCMARCA m ON m.CODMARCA = p.CODMARCA
 WHERE e.CODFILIAL = '31'
   AND e.QTESTGER > 0
   AND p.DTEXCLUSAO IS NULL
   AND t.PVENDA > 0
   AND e.QTESTGER - NVL(e.QTRESERV, 0) - NVL(e.QTBLOQUEADA, 0) > 0
 ORDER BY p.DESCRICAO
