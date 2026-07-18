---
name: Tax Smart Contabilidade
description: A contabilidade que joga a favor da sua empresa, sem burocracia.
colors:
  primary: "#ff3300"
  secondary: "#f4f5f8"
  dark-bg: "#050505"
  neutral-bg: "#ffffff"
  text-body: "#666666"
  text-heading: "#333333"
  text-inverse: "#ffffff"
typography:
  display:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  kicker:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 700
    letterSpacing: "0.1em"
  body:
    fontFamily: "'Inter', sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "20px"
  lg: "32px"
  full: "50px"
spacing:
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "80px"
components:
  button-primary-glow:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
    padding: "18px 40px"
  bento-item:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.lg}"
    padding: "40px"
---

# Design System: Tax Smart Contabilidade

## 1. Overview

**Creative North Star: "A Revolução Laranja"**

O design da Tax Smart abandona a estética burocrática clássica (fundos cinzas e paredes de texto). A nova versão foca no contraste extremo de um Dark Mode premium (primeira dobra) que valoriza o laranja vibrante da marca. O sistema usa Bento Grids ultra arredondados e a tipografia geométrica 'Outfit' para construir autoridade, tecnologia e confiança sem o peso do tradicionalismo.

O sistema explicitamente rejeita designs monótonos, componentes nativos engessados e a estética "blanda" comum em sistemas contábeis. É profissional, mas inegavelmente ágil.

**Key Characteristics:**
- **Alto Contraste:** Uso de áreas em Preto Absoluto para destacar o Laranja Neon.
- **Tipografia Agressiva:** A fonte Outfit nos títulos injeta confiança e juventude corporativa.
- **Layout Dinâmico:** Bento Grids com hover inversivo (fundo cinza para laranja).
- **Animação como Voz:** Tudo entra em cena via slideUpFade, dando percepção de performance.

## 2. Colors

A paleta de cores rejeita o tédio, abraçando um constraste vibrante entre o escuro absoluto, o laranja neon e o fundo limpo para leitura.

### Primary
- **Laranja Tax Smart** (#ff3300): A assinatura da marca. Usada com generosidade para trazer energia à tela, iluminar áreas escuras e inverter a cor dos cards no hover.

### Secondary
- **Cinza Alternado** (#f4f5f8): Fundo claro usado nos cartões Bento Grid em estado inativo.

### Neutral
- **Preto Premium** (#050505): O "Dark Mode" para Hero Sections. Garante altíssimo contraste com o laranja.
- **Fundo Branco** (#ffffff): O papel digital principal para leitura de textos longos e seções institucionais de respiro.
- **Texto Heading** (#333333): Para títulos em fundos claros.
- **Texto Body** (#666666): Para leitura de textos e descrições.

### Named Rules
**The Dark Impact Rule.** A primeira dobra (Hero Section) das páginas institucionais adota fundos ultra escuros (#050505) com a tipografia branca e destaque em Laranja, comunicando aspecto premium.

## 3. Typography

**Display Font:** 'Outfit', sans-serif
**Body Font:** 'Inter', sans-serif

**Character:** Uma dupla perfeita de autoridade contemporânea (Outfit) com legibilidade funcional implacável (Inter).

### Hierarchy
- **Display** (800, clamp(2.5rem, 5vw, 4rem)): Títulos Hero e afirmações de alto impacto.
- **Headline** (700, clamp(2rem, 4vw, 3rem)): Cabeçalhos de seção (e.g., "O que fazemos").
- **Title** (700, 1.5rem): Títulos dentro dos blocos Bento Grid.
- **Body** (400, 1rem/1.25rem, 1.6): Texto de apoio e descrições.
- **Kicker** (700, 1rem, 0.1em tracking, Uppercase): Eyebrows (sobrenomes de seção) como "A REVOLUÇÃO LARANJA".

### Named Rules
**The Outfit Strike Rule.** A fonte Outfit está reservada para os Display Titles e Kickers, operando no modo Bold (700/800). Todo o texto longo continua na Inter para garantir a legibilidade.

## 4. Elevation

O projeto transita entre o flat limpo e a iluminação através de "glows", em vez de depender de sombras drop-shadow opacas comuns.

### Shadow Vocabulary
- **Glow Primário** (`box-shadow: 0 8px 32px rgba(255, 51, 0, 0.3)`): Usado em botões de ação e nos ícones quando o card sofre hover. Emula luz de neon.
- **Elevate Hover** (`box-shadow: 0 20px 40px rgba(255, 51, 0, 0.2)`): Sombra difusa e alaranjada embaixo dos cartões do Bento Grid no momento em que eles "saltam".

### Named Rules
**The Glow Fallback Rule.** Botões primários no ambiente Dark recebem um glow (sombra espalhada) na cor laranja, substituindo o conceito de drop-shadow puro por iluminação. Superfícies nascem planas e iluminam/saltam apenas na interação.

## 5. Components

Os componentes são desenhados para serem densos, arredondados e reagirem vividamente à interação.

### Buttons (Primary Glow)
- **Shape:** Pill-shape arredondado extremo (50px).
- **Primary:** Fundo Laranja Tax Smart (#ff3300) com texto em Branco e padding 18px 40px.
- **Hover / Focus:** Transforma `translateY(-4px)` e acende a sombra Glow Primária para 0.5 de opacidade.

### Bento Items (Cards)
- **Corner Style:** Ultra arredondados (32px).
- **Background:** Cinza Alternado (#f4f5f8) em repouso.
- **Hover:** O card inteiro inverte para Laranja (#ff3300), o ícone e os textos ficam brancos, e ele salta com a sombra Elevate Hover.
- **Internal Padding:** 40px de respiro interno.

### Icon Wrappers
- **Shape:** Raio de 20px, quadrado 64x64px.
- **Background:** Translúcido (10% opacity do Laranja).

## 6. Do's and Don'ts

### Do:
- **Do** usar a tipografia Outfit em h1, h2, e Kickers em caixa alta, usando letter-spacing negativo no Display.
- **Do** usar animações em cascata (slideUpFade) respeitando atrasos de 100ms a 400ms para carregar blocos.
- **Do** estruturar seções usando Bento Grid com bordas de 32px e hover state inversivo.

### Don't:
- **Don't** criar sites com a estética "burocrática e cinza" típica de contabilidades antigas.
- **Don't** usar paredes de texto longas sem interrupções visuais, espaçamentos ou listas.
- **Don't** voltar para os 'ion-cards' engessados do Ionic sem tratamentos de raio ou padding customizados.
- **Don't** colocar sombras comuns nos cards da grade Bento fora do hover state (eles devem ser flat e só elevar na interação).
