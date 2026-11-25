---
name: MindChallenge
description: Mural de aventuras com madeira, pergaminhos e movimento.
colors:
  wood: "#2c1d19"
  paper: "#f3dfba"
  ink: "#493226"
  muted-ink: "#755740"
  teal: "#246d68"
  red: "#a54137"
  gold: "#d3ab57"
  admin-background: "#f4f6f4"
  admin-ink: "#263e3a"
typography:
  display:
    fontFamily: "Pirata One, serif"
    fontSize: "80px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0"
  body:
    fontFamily: "Baloo, sans-serif"
    fontSize: "16px"
    letterSpacing: "0"
  admin-title:
    fontFamily: "Baloo, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  control: "4px"
  button: "2px"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "#fff1d7"
    rounded: "{rounded.button}"
    padding: "10px 25px"
---

# Design System: MindChallenge

## Overview

**Creative North Star: "Mural de aventuras"**

As referências fornecidas pelo usuário orientam a madeira pintada, os papéis gastos, os selos e as fitas coloridas. Texto e controles são HTML; as ilustrações servem como materiais de fundo. A interface continua sendo um catálogo de um projeto em desenvolvimento.

## Colors

Madeira sustenta o mural; pergaminho recebe texto em tinta escura. Verde-petróleo identifica Kids, vermelho identifica Adultos e ações principais. Dourado marca ornamentos. Os modos extras usam também oliva e azul acinzentado.

## Typography

Pirata One, hospedada localmente, aparece na marca e nos títulos. O título principal passa de 80px para 47px no celular; títulos de seção passam de 36px para 29px. Baloo é a fonte de leitura e controles. As licenças ficam em `frontend/public/fonts`.

## Layout

O conteúdo tem largura máxima de 1120px. Os grupos ocupam duas colunas e passam a uma abaixo de 600px. Os modos extras passam de quatro para duas colunas abaixo de 900px. As linhas de jogo permanecem sem contêineres internos decorativos. A demonstração mantém proporção 2:1.

## Elevation & Depth

Papéis usam sombras suaves deslocadas e pequenas rotações. A sombra recorrente é `2px 9px 15px #170b0866`. Madeira e papel são os arquivos gerados `quest-board.png` e `parchment.png`; seus prompts estão documentados junto aos assets.

## Shapes

Papéis usam o contorno orgânico da imagem, sem recortar o texto. Controles têm cantos discretos de 2px a 4px. Selos e alfinetes são circulares; fitas têm cauda de bandeirola.

## Components

Os filtros usam botões com `aria-pressed`. As linhas abrem detalhes em um diálogo nativo, fechado por botão, Escape ou clique fora. O foco usa contorno dourado de 3px. Jogos ainda indisponíveis e modos extras são identificados como em desenvolvimento.

A entrada do pergaminho usa GSAP; fitas oscilam em ciclos de seis segundos. Motion controla a reorganização dos grupos, o destaque deslizante dos filtros, as transições do catálogo, a resposta dos bilhetes e a entrada/saída do diálogo. A duração padrão é 280ms, o filtro usa 250ms e a saída do diálogo usa 170ms. O foco permanece no diálogo nativo durante sua saída e retorna ao botão de origem ao fechar.

O botão de pausa e `prefers-reduced-motion` desativam as transições de Motion e seus gestos espaciais. Cada elemento tem um único responsável por suas transformações: GSAP na abertura, Motion nos componentes React e Phaser no canvas. Phaser pausa fora da tela e limita a quantidade de peças.

O jogo da memória é uma mesa em verde-petróleo com moldura de madeira, cartas de proporção 0,84 e imagens reais dos personagens. Motion controla a virada em 3D, com troca instantânea quando o movimento é reduzido. O nível de 12 pares usa seis colunas no desktop; abaixo de 700px todos os níveis usam quatro. A pausa da partida oculta as cartas e interrompe o tempo; ela é independente da pausa das animações decorativas.

O painel `/admin` é uma superfície de operação: fundo neutro claro, Baloo para leitura e títulos compactos (28px), ações em verde-petróleo e listas tabulares. Usa navegação lateral, tabela e editor em colunas; abaixo de 850px a navegação passa ao topo e abaixo de 650px o editor passa para baixo da tabela. O painel não reproduz as animações decorativas do mural. Imagens têm prévia e ações de edição/exclusão usam ícones com nomes acessíveis.

## Do's and Don'ts

- Use os materiais e fontes locais para manter a identidade entre telas.
- Mantenha os textos escuros nos pergaminhos e claros sobre madeira e tecidos.
- Preserve foco por teclado, estados de erro e preferência de movimento reduzido.
- Não transforme funcionalidades planejadas em promessas de jogos prontos.
