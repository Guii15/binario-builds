# Montador de PC da Binário

Site onde o cliente (ou o vendedor no balcão) monta um PC peça por peça com o
que tem em estoque na loja de Varginha. O montador confere socket, memória e
fonte, mostra o preço à vista e manda o orçamento pelo WhatsApp para o
vendedor, o estoque e o suporte T.I.

Também tem os PCs recomendados (inclusive os modelos que mais saem em
licitação) e as máquinas de pronta entrega.

## Rodar na máquina

Precisa do Node 22 ou mais novo.

```
npm install
npm run dev
```

Abre em http://127.0.0.1:8080 (ou na porta que aparecer no terminal).

## Testes

```
npm test                              # regras do montador (compatibilidade, preço, etc.)
python -m unittest discover scripts   # regras que leem a descrição do WinThor
npx eslint src/routes src/lib
npm run build
```

Os quatro rodam sozinhos no GitHub a cada push e em cada PR.

## Atualizar preço e estoque

O catálogo fica em `src/data/catalogo.json` e é atualizado a partir do WinThor.

1. Rode `scripts/itens_em_estoque.sql` no banco (filial 31, preço da região 1)
   e salve o resultado em Excel ou CSV. A rotina 860 também serve.
2. Uma vez só: `pip install pandas xlrd openpyxl`
3. Rode `python scripts/atualizar_catalogo.py caminho/do/arquivo.xls`.
   Com `--simular` no fim ele só mostra o relatório e não salva nada.

O que o script faz:

- Peça que já está no catálogo: atualiza só preço e estoque. Nome, ficha, foto
  e dados técnicos editados à mão continuam como estão.
- Peça nova com estoque: entra com categoria, socket, memória e consumo
  deduzidos da descrição (regras em `scripts/winthor_regras.py`).
- Peça que sumiu da planilha: fica com estoque 0. Some da tela, mas os links de
  orçamento antigos continuam abrindo.
- Peça que ganhou foto em `public/fotos/<CODPROD>.jpg` passa a usar a foto.

No fim, leia o relatório: ele avisa quando um PC recomendado usa peça sem
estoque e lista as peças novas que precisam de socket, memória ou watts
conferidos à mão.

Use sempre a planilha completa. Uma exportação parcial (só uma seção, por
exemplo) zera tudo o que não estiver nela.

## Onde mexer

- `src/routes/index.tsx`: a página inteira, PCs recomendados, modelos de
  licitação e pronta entrega.
- `src/lib/`: regras de compatibilidade e cálculo, com testes ao lado.
- `src/styles.css`: visual.
- `public/fotos/`: fotos das peças, com o código do produto no nome.

O site é publicado pelo Lovable a partir da branch `main`. Não reescreva
histórico já enviado (force push, rebase, amend), porque isso quebra o
histórico do lado do Lovable.
