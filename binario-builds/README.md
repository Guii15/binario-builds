# PC Assembler Pro

<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Montador de PC Binário</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* Tela clara sempre: o site vai pro cliente e tem que sair igual em qualquer celular. */
:root{
  color-scheme:light;
  --ground:#eef1f6; --surface:#ffffff; --surface-2:#f5f7fb; --surface-3:#e9eef7;
  --ink:#101724; --ink-2:#3d4859; --ink-3:#6a7689;
  --line:#d7dde8; --line-forte:#b9c3d3;
  --azul:#0b4fa8; --azul-claro:#2f7ad6; --azul-fraco:#eef4fd; --vermelho:#c62230;
  --azul-escuro:#07213f;
  --ok:#12694a; --ok-bg:#e3f3ec; --alerta:#8a5000; --alerta-bg:#fdf0d9;
  --erro:#9d1420; --erro-bg:#fbe6e8; --zap:#1a7f4b;
  --sombra:0 1px 2px rgba(16,23,36,.06), 0 8px 24px -16px rgba(16,23,36,.35);
  --raio:10px;
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--ground); color:var(--ink);
  font-family:"IBM Plex Sans",system-ui,-apple-system,Segoe UI,sans-serif;
  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;
  padding-bottom:76px; /* barra fixa do orçamento */
}
h1,h2,h3{font-family:Archivo,"IBM Plex Sans",system-ui,sans-serif; text-wrap:balance; margin:0}
.mono{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.wrap{max-width:1560px; margin:0 auto; padding-inline:28px}
a{color:var(--azul)}
button{font:inherit}
:focus-visible{outline:2px solid var(--azul); outline-offset:2px}

/* ---------- topo ---------- */
.topo{position:sticky; top:0; z-index:40; background:var(--azul-escuro); border-bottom:3px solid var(--vermelho)}
.topo .wrap{display:flex; align-items:center; gap:14px; padding-block:12px}
.marca{display:flex; align-items:center; gap:10px; font-family:Archivo; font-weight:800; letter-spacing:-.01em; color:#fff; font-size:17px}
.marca-quad{width:24px; height:24px; border-radius:5px; background:#fff; position:relative; flex:none}
.marca-quad::after{content:""; position:absolute; inset:auto 5px 5px auto; width:8px; height:8px; border-radius:2px; background:var(--vermelho)}
.marca small{display:block; font-family:"IBM Plex Sans"; font-weight:500; font-size:10.5px; color:#8fb3dd; letter-spacing:.08em; text-transform:uppercase}
.topo nav{margin-left:auto; display:flex; gap:6px; flex-wrap:wrap}
.topo nav a{color:#cddcf0; text-decoration:none; font-size:13.5px; font-weight:600; padding:8px 12px; border-radius:7px}
.topo nav a:hover{background:rgba(255,255,255,.1); color:#fff}
.topo .fone{margin-left:14px; color:#fff; font-size:13px; font-weight:600; white-space:nowrap}
.topo .fone span{display:block; font-size:10.5px; color:#8fb3dd; font-weight:400; letter-spacing:.06em; text-transform:uppercase}

/* ---------- hero ---------- */
.hero{background:var(--surface); border-bottom:1px solid var(--line)}
.hero .wrap{padding-block:44px 38px; display:grid; gap:40px; grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr); align-items:center}
.eyebrow{font-size:11.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--azul); display:flex; align-items:center; gap:8px}
.eyebrow::before{content:""; width:26px; height:2px; background:var(--vermelho)}
.hero h1{font-size:clamp(28px,4.2vw,42px); line-height:1.05; letter-spacing:-.02em; margin:12px 0 10px}
.hero p{color:var(--ink-2); max-width:54ch; margin:0 0 18px}
.botoes{display:flex; gap:10px; flex-wrap:wrap}
.btn{font-weight:600; font-size:14px; cursor:pointer; text-decoration:none; padding:11px 18px; border-radius:8px; border:1px solid transparent; display:inline-flex; align-items:center; gap:8px; justify-content:center}
.btn-azul{background:var(--azul); color:#fff; border-color:var(--azul)}
.btn-azul:hover{background:#093f86}
.btn-linha{background:var(--surface); color:var(--azul); border-color:var(--line-forte)}
.btn-linha:hover{border-color:var(--azul)}
.btn-zap{background:var(--zap); color:#fff; border-color:var(--zap)}
.btn-zap:hover{filter:brightness(1.08)}
.btn:disabled{opacity:.5; cursor:not-allowed}

/* carrossel do topo */
.vitrine{position:relative; aspect-ratio:4/3; border-radius:12px; overflow:hidden; background:var(--surface-2); border:1px solid var(--line)}
.vitrine[hidden]{display:none}
.garantias{display:grid; gap:10px}
.garantia{
  display:flex; gap:12px; align-items:flex-start; background:var(--surface);
  border:1px solid var(--line); border-radius:var(--raio); padding:14px 16px;
}
.garantia .ic{width:26px; height:26px; color:var(--azul); flex:none; margin-top:2px}
.garantia b{display:block; font-size:14.5px}
.garantia span{font-size:12.5px; color:var(--ink-2)}
.vitrine .cena{position:absolute; inset:0; opacity:0; transition:opacity .8s ease}
.vitrine .cena.ativa{opacity:1}
.vitrine .cena img, .vitrine .cena svg{width:100%; height:100%; object-fit:cover; display:block}
.vitrine .legenda{
  position:absolute; left:0; right:0; bottom:0; padding:14px 16px;
  background:linear-gradient(180deg,rgba(11,23,41,0) 0%, rgba(11,23,41,.82) 60%);
  color:#fff; font-size:13.5px; font-weight:600;
}
.pontos{position:absolute; right:12px; top:12px; display:flex; gap:6px}
.pontos button{width:8px; height:8px; padding:0; border-radius:99px; border:0; background:rgba(16,23,36,.25); cursor:pointer}
.pontos button[aria-current="true"]{background:var(--azul); width:20px}
.placar{display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:12px}
.placar div{background:var(--surface); border:1px solid var(--line); border-radius:var(--raio); padding:12px}
.placar b{display:block; font-family:Archivo; font-weight:800; font-size:22px; letter-spacing:-.02em; font-variant-numeric:tabular-nums; color:var(--azul)}
.placar span{font-size:11px; color:var(--ink-3); line-height:1.3; display:block; margin-top:2px}

/* ---------- seções ---------- */
section{padding-block:40px}
.faixa{background:var(--surface-2); border-block:1px solid var(--line)}
.cabeca{margin-bottom:18px; max-width:62ch}
.cabeca .num{display:none}
.cabeca h2{font-size:clamp(21px,2.6vw,28px); letter-spacing:-.015em; margin:6px 0 8px}
.cabeca p{color:var(--ink-2); margin:0}

/* ---------- etapas ---------- */
.etapas{
  display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;
  border-bottom:1px solid var(--line); scrollbar-width:thin;
}
.etapa{
  flex:none; display:flex; align-items:center; gap:8px; padding:9px 13px; border-radius:8px;
  border:1px solid transparent; background:transparent; color:var(--ink-3); cursor:pointer;
  font-size:13.5px; font-weight:600; white-space:nowrap;
}
.etapa:hover{background:var(--surface-2); color:var(--ink)}
.etapa[aria-current="true"]{background:var(--azul-fraco); color:var(--azul); border-color:var(--azul)}
.etapa .ic{width:20px; height:20px; flex:none}
.etapa .ok{color:var(--ok); font-size:12px}

/* ---------- grade de peças ---------- */
.montador{display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:24px; align-items:start}
.filtros{display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; align-items:center}
.busca{flex:1 1 240px; display:flex; gap:0; border:1px solid var(--line-forte); border-radius:8px; overflow:hidden; background:var(--surface)}
.busca input{flex:1; border:0; padding:10px 12px; font:inherit; font-size:14px; background:transparent; color:var(--ink); min-width:0}
.busca input:focus{outline:none}
.busca span{display:grid; place-items:center; padding-inline:11px; color:var(--ink-3)}
.chip{
  border:1px solid var(--line-forte); background:var(--surface); color:var(--ink-2);
  padding:8px 13px; border-radius:99px; font-size:13px; font-weight:600; cursor:pointer;
}
.chip[aria-pressed="true"]{background:var(--azul); color:#fff; border-color:var(--azul)}

.grade-produtos{display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px}
.produto{
  background:var(--surface); border:1px solid var(--line); border-radius:var(--raio);
  padding:15px; display:grid; grid-template-columns:108px minmax(0,1fr); gap:13px; align-items:start;
}
.produto.escolhido{border-color:var(--azul); box-shadow:inset 0 0 0 1px var(--azul)}
.produto .dados{display:grid; gap:7px; min-width:0}
.produto .nome{font-size:13px; line-height:1.35; color:var(--ink); margin:0}
.produto .marca-codigo{display:flex; gap:8px; align-items:baseline; flex-wrap:wrap}
.produto .marca{font-size:11px; color:var(--ink-3); text-transform:uppercase; letter-spacing:.05em}
.produto .codigo{font-size:11px; color:var(--azul); font-weight:600; background:var(--azul-fraco); padding:2px 6px; border-radius:4px}
.item-resumo .codigo{color:var(--ink-3); font-weight:600}
.produto .disponivel{font-size:11.5px; font-weight:600; color:var(--ok); display:flex; align-items:center; gap:5px}
.produto .disponivel::before{content:""; width:7px; height:7px; border-radius:99px; background:var(--ok)}
.produto .encomenda{font-size:11.5px; font-weight:600; color:var(--alerta); display:flex; align-items:center; gap:5px}
.produto .encomenda::before{content:""; width:7px; height:7px; border-radius:99px; background:var(--alerta)}
.chip-encomenda[aria-pressed="true"]{background:var(--alerta); border-color:var(--alerta); color:#fff}
.produto .valor{font-family:Archivo; font-weight:800; font-size:22px; color:var(--ink); font-variant-numeric:tabular-nums; letter-spacing:-.02em}
.produto .linha-tags{display:flex; gap:5px; flex-wrap:wrap}
.produto .btn{width:100%; padding:8px 12px; font-size:13px}
.cotar{
  grid-column:1/-1; background:var(--azul-fraco); border:1px dashed var(--azul);
  border-radius:var(--raio); padding:16px 18px; display:grid; gap:8px;
}
.cotar-titulo{font-family:Archivo; font-weight:700; font-size:15.5px}
.cotar-texto{margin:0; font-size:13px; color:var(--ink-2); max-width:70ch}
.cotar-categoria-linha{display:flex; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap}
.cotar-label{font-size:13px; font-weight:500; color:var(--ink); white-space:nowrap}
.cotar-select{
  flex:0 1 200px; font:inherit; font-size:13px; padding:9px 12px;
  border-radius:8px; border:1px solid var(--line-forte); background:var(--surface); color:var(--ink);
  cursor:pointer;
}
.cotar-linha{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
.cotar-linha input{
  flex:1 1 280px; min-width:0; font:inherit; font-size:14px; padding:10px 12px;
  border-radius:8px; border:1px solid var(--line-forte); background:var(--surface); color:var(--ink);
}
.vazio{
  grid-column:1/-1; background:var(--surface); border:1px dashed var(--line-forte);
  border-radius:var(--raio); padding:26px; text-align:center; color:var(--ink-3); font-size:14px;
}

/* ---------- foto ---------- */
.foto{background:var(--surface-3); border:1px solid var(--line); border-radius:8px; display:grid; place-items:center; overflow:hidden; flex:none}
.foto img{width:100%; height:100%; object-fit:contain; display:block}
.foto svg{width:60%; height:60%; color:var(--ink-3)}
.foto-92{width:108px; height:108px}
.foto-44{width:44px; height:44px}
.foto-30{width:30px; height:30px; border-radius:6px}
.foto-larga{width:100%; aspect-ratio:16/10; border-radius:8px}

/* ---------- painel lateral ---------- */
.lateral{display:grid; gap:14px; position:sticky; top:74px}
.explica{
  background:var(--surface); border:1px solid var(--line); border-left:4px solid var(--azul);
  border-radius:var(--raio); padding:16px 18px; display:grid; gap:8px;
}
.explica .ic-grande{width:34px; height:34px; color:var(--azul)}
.explica h3{font-size:16.5px; color:var(--ink)}
.explica p{margin:0; font-size:13.5px; color:var(--ink-2); line-height:1.5}
.resumo{background:var(--surface); border:1px solid var(--line); border-radius:var(--raio); padding:16px; box-shadow:var(--sombra); display:grid; gap:11px}
.resumo h3{font-size:15px}
.limpar-link{
  margin-left:auto; border:0; background:transparent; color:var(--ink-3); cursor:pointer;
  font-size:12.5px; text-decoration:underline; padding:0;
}
.limpar-link:hover{color:var(--vermelho)}
.navegar-etapa{
  grid-column:1/-1; display:flex; gap:10px; justify-content:space-between; align-items:center;
  border-top:1px solid var(--line); padding-top:14px; margin-top:2px; flex-wrap:wrap;
}
.navegar-etapa .aviso-etapa{font-size:12.5px; color:var(--ink-3)}
.resumo .total{font-family:Archivo; font-weight:800; font-size:27px; letter-spacing:-.02em; font-variant-numeric:tabular-nums}
.medidor{display:grid; gap:5px}
.medidor .barra{height:7px; border-radius:99px; background:var(--surface-2); border:1px solid var(--line); overflow:hidden}
.medidor .barra i{display:block; height:100%; background:var(--ok)}
.medidor .barra i.curto{background:var(--vermelho)}
.medidor small{color:var(--ink-3); font-size:11.5px}
.avisos{display:grid; gap:7px}
.aviso{font-size:12.5px; padding:9px 11px; border-radius:8px}
.aviso.erro{background:var(--erro-bg); color:var(--erro)}
.aviso.falta{background:var(--alerta-bg); color:var(--alerta)}
.aviso.ok{background:var(--ok-bg); color:var(--ok)}
.resumo-itens{display:grid; gap:8px; font-size:12.5px; border-top:1px solid var(--line); padding-top:10px}
.item-resumo{display:grid; grid-template-columns:30px minmax(0,1fr) auto; gap:9px; align-items:center}
.item-resumo .txt{color:var(--ink-2); line-height:1.3}
.item-resumo .preco-item{font-variant-numeric:tabular-nums; white-space:nowrap}
.controles-qtd{display:flex; align-items:center; gap:4px; margin-top:3px}
.controles-qtd button{
  width:22px; height:22px; border-radius:5px; border:1px solid var(--line-forte);
  background:var(--surface); color:var(--ink-2); cursor:pointer; line-height:1; font-size:13px; padding:0;
}
.controles-qtd button:hover{border-color:var(--azul); color:var(--azul)}
.controles-qtd .n{font-size:12px; min-width:18px; text-align:center; font-variant-numeric:tabular-nums}
.controles-qtd .tirar{margin-left:4px; color:var(--ink-3)}
.controles-qtd .tirar:hover{border-color:var(--vermelho); color:var(--vermelho)}

/* ---------- barra fixa ---------- */
.barra-fixa{
  position:fixed; left:0; right:0; bottom:0; z-index:45; background:var(--surface);
  border-top:1px solid var(--line); box-shadow:0 -6px 20px -12px rgba(16,23,36,.4);
}
.barra-fixa .wrap{display:flex; align-items:center; gap:14px; padding-block:11px; flex-wrap:wrap}
.barra-fixa .valor{font-family:Archivo; font-weight:800; font-size:22px; font-variant-numeric:tabular-nums; line-height:1.1}
.barra-fixa .rotulo{font-size:11.5px; color:var(--ink-3)}
.barra-fixa .acoes{margin-left:auto; display:flex; gap:8px; flex-wrap:wrap}
.progresso{flex:1 1 140px; max-width:260px}
.progresso .barra{height:6px; border-radius:99px; background:var(--surface-2); border:1px solid var(--line); overflow:hidden}
.progresso .barra i{display:block; height:100%; background:var(--azul)}
.progresso small{font-size:11px; color:var(--ink-3)}

/* ---------- modal ---------- */
.fundo-modal{
  position:fixed; inset:0; z-index:60; background:rgba(16,23,36,.55);
  display:grid; place-items:center; padding:20px;
}
.fundo-modal[hidden]{display:none!important}
.modal{background:var(--surface); border-radius:14px; padding:22px; max-width:420px; width:100%; display:grid; gap:12px; box-shadow:0 24px 60px -20px rgba(16,23,36,.6)}
.modal h3{font-size:19px}
.modal p{margin:0; font-size:13.5px; color:var(--ink-2)}
.vendedor{
  display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--line);
  border-radius:var(--raio); background:var(--surface); cursor:pointer; text-align:left; width:100%;
}
.vendedor:hover{border-color:var(--azul); background:var(--azul-fraco)}
.vendedor b{display:block; font-size:14px}
.vendedor span{font-size:12px; color:var(--ink-3)}
.vendedor .bolha{width:36px; height:36px; border-radius:99px; background:var(--zap); color:#fff; display:grid; place-items:center; flex:none}

/* ---------- perfis ---------- */
.grade-perfis{display:grid; grid-template-columns:repeat(auto-fit,minmax(330px,1fr)); gap:18px}
.perfil{background:var(--surface); border:1px solid var(--line); border-radius:var(--raio); padding:18px; display:flex; flex-direction:column; gap:12px; box-shadow:var(--sombra)}
.perfil.destaque{border-color:var(--azul); box-shadow:0 0 0 1px var(--azul), var(--sombra)}
.perfil h3{font-size:18.5px; letter-spacing:-.01em}
.chamada{color:var(--ink-2); font-size:14px; margin:-6px 0 0}
.tira{display:flex; gap:6px; flex-wrap:wrap}
.preco{display:flex; align-items:baseline; gap:8px; flex-wrap:wrap}
.preco b{font-family:Archivo; font-size:25px; font-weight:800; letter-spacing:-.02em; font-variant-numeric:tabular-nums}
.preco span{font-size:12px; color:var(--ink-3)}
.explica-txt{font-size:13.5px; color:var(--ink-2); margin:0}
.listas{display:grid; gap:6px; font-size:13px}
.listas p{margin:0; display:flex; gap:7px; align-items:flex-start; color:var(--ink-2)}
.listas p::before{content:"✓"; color:var(--ok); font-weight:600; flex:none}
.listas p.nao::before{content:"×"; color:var(--vermelho)}
.acoes-perfil{display:grid; gap:8px; margin-top:auto; border-top:1px solid var(--line); padding-top:12px}
.acoes-perfil .dupla{display:grid; grid-template-columns:1fr 1fr; gap:8px}
details.pecas summary{cursor:pointer; font-size:13px; font-weight:600; color:var(--azul); list-style:none}
details.pecas summary::-webkit-details-marker{display:none}
details.pecas summary::after{content:" ▾"}
details.pecas[open] summary::after{content:" ▴"}
.linha-peca{display:flex; justify-content:space-between; gap:12px; font-size:12.5px; padding:5px 0; border-bottom:1px dashed var(--line)}
.linha-peca:last-child{border-bottom:0}
.linha-peca span:first-child{color:var(--ink-2)}
.tag{display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:99px}
.tag-ok{background:var(--ok-bg); color:var(--ok)}
.tag-alerta{background:var(--alerta-bg); color:var(--alerta)}
.tag-erro{background:var(--erro-bg); color:var(--erro)}
.tag-neutra{background:var(--surface-2); color:var(--ink-3); border:1px solid var(--line)}

/* ---------- prontas ---------- */
.prontas{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px}
.pronta{background:var(--surface); border:1px solid var(--line); border-top:4px solid var(--azul); border-radius:var(--raio); padding:16px; display:grid; gap:8px}
.pronta.gamer{border-top-color:var(--vermelho)}
.pronta h3{font-size:16.5px}
.pronta .id{font-size:11.5px; color:var(--ink-3); letter-spacing:.04em}
.pronta .resumo-txt{font-size:13px; color:var(--ink-2)}
.pronta .rodape{display:flex; justify-content:space-between; align-items:baseline; gap:10px; border-top:1px solid var(--line); padding-top:9px}
.pronta .rodape b{font-family:Archivo; font-size:20px; font-variant-numeric:tabular-nums}

footer{border-top:1px solid var(--line); background:var(--surface); padding-block:22px; color:var(--ink-3); font-size:12.5px}
footer .wrap{display:flex; gap:14px; flex-wrap:wrap; justify-content:space-between}

@media (max-width:980px){
  .hero .wrap{grid-template-columns:1fr; padding-block:30px}
  .montador{grid-template-columns:1fr}
  .lateral{position:static}
}
@media (max-width:560px){
  body{padding-bottom:132px}
  .topo .fone{display:none}
  .topo nav{flex-wrap:wrap}
  .grade-produtos{grid-template-columns:1fr}
  .placar{grid-template-columns:1fr 1fr}
  .barra-fixa .acoes{width:100%; margin-left:0}
  .barra-fixa .acoes .btn{flex:1}
  .progresso{display:none}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important; transition:none!important}}

/* ---------- modo visualização (link compartilhado) ---------- */
body.modo-link .cabeca,
body.modo-link .etapas,
body.modo-link .coluna-escolha{display:none}
body.modo-link .montador{grid-template-columns:1fr; max-width:520px; margin-inline:auto}
body.modo-link .lateral{position:static}

/* ---------- impressão (vira o PDF quando não tem servidor) ---------- */
@media print{
  body{padding:0; background:#fff}
  .topo,.hero,.etapas,.filtros,.grade-produtos,.explica,.barra-fixa,footer,
  #prontas,#estoque,.cabeca,.fundo-modal,.controles-qtd{display:none!important}
  .montador{display:block}
  .lateral{position:static}
  .resumo{border:0; box-shadow:none; padding:0}
  section{padding:0}
  .impressao-cabecalho{display:block!important}
}
.impressao-cabecalho{display:none}







    


      
      Montador de PCBinário Tecnologia
    


    
      Montar do zero
      Configurações prontas
      Máquinas em estoque
    
    

Varginha/MGBinário Distribuidora e Tecnologia






    


      

Monte o seu PC com as peças que temos em estoque.


      

Escolha Intel ou AMD e vá peça por peça: só aparece o que encaixa de verdade, e o site
         avisa se a fonte não aguenta. No fim, manda o orçamento no WhatsApp ou baixa em PDF.


      


        Começar a montar
        Ver configurações prontas
      


    


    


      


      


      


        

0máquinas montadas e entregues


        

0peças disponíveis pra montar


        

0modelos prontos pra levar


      


    






    


      

Monte seu PC


      

Vá pelas etapas do topo. Em cada uma aparecem só as peças que encaixam no que você
         já escolheu — se não está na lista, é porque não monta junto.


    



    



    


      


        


          
            ⌕
            
          
          


          Mais barato primeiro
          Incluir peças sob encomenda
        


        


      



      


        


        


          


            

Orçamento — Binário Distribuidora e Tecnologia


            

Varginha/MG · valores sujeitos a alteração e à disponibilidade em estoque.


          


          


            

Seu orçamento


            Limpar tudo
          


          

R$ 0,00


          

peças + montagem inclusa


          


            


            Escolha o processador e a placa de vídeo pra calcular a fonte.
          


          


          Copiar link desta montagem
          


          Editar as peças
          


        


      


    






    


      

Configurações prontas


      

Se não quiser escolher peça por peça, comece por uma destas — dá pra comprar direto
         ou abrir no montador e trocar o que quiser.


    


    






    


      

Máquinas montadas no estoque


      

Já montadas, testadas e paradas na prateleira. Antes de montar uma nova, veja se uma dessas resolve.


    


    






    Binário Distribuidora e Tecnologia · Varginha/MG
    Peças, preços e estoque são dados de exemplo até ligar o extrator no WinThor.






    


      

R$ 0,00


      

nenhuma peça escolhida


    


    


      


      Comece pelo processador
    


    


      Limpar tudo
      Baixar PDF
      Comprar pelo WhatsApp
    






    

Mandar o orçamento pra quem?


    

Escolha o vendedor. O orçamento já vai escrito na mensagem.


    


    Cancelar


eu tenho esse html, mas percebe que ele está com muita cara de ia, queria mudar isso, melhorar, consegue fazer isso?

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/30a030c0-da27-4211-a65b-fbd20b5a0d52).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
