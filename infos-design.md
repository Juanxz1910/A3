# 🎨 Atmos — DESIGN_SYSTEM.md

# 🌌 Introdução

O Atmos possui um Design System completo focado em:

- Consistência visual
- Escalabilidade
- UX premium
- Dark mode nativo
- Responsividade
- Clareza visual
- Performance visual
- Hierarquia tipográfica moderna

---

# 🎯 Identidade Visual

A identidade visual do Atmos foi construída utilizando:

- Gradientes modernos
- Tons vibrantes tecnológicos
- Contrastes suaves
- Superfícies minimalistas
- Elementos glass/premium
- Tipografia forte e limpa

---

# 🎨 Sistema de Cores

# 🔵 Cores Primárias — Identidade da Marca

| Nome | Hex | RGB | Uso |
|---|---|---|---|
| Blue | `#3B82F6` | `rgb(59, 130, 246)` | Botões, links, tabs ativas, plano Pro |
| Green | `#22C55E` | `rgb(34, 197, 94)` | Sucesso, IQA, plano Free, badges positivos |
| Purple | `#8B5CF6` | `rgb(139, 92, 246)` | Premium, IA preditiva, umidade, logo |
| Amber | `#F59E0B` | `rgb(245, 158, 11)` | CO₂, alertas, atenção |
| Red | `#EF4444` | `rgb(239, 68, 68)` | Erros, ruído alto, ações destrutivas |
| Orange | `#F97316` | `rgb(249, 115, 22)` | Luminosidade, streak |

---

# ☀️ Fundos e Superfícies — Modo Claro

| Token | Hex | RGB | Uso |
|---|---|---|---|
| bg | `#F0F4FF` | `rgb(240, 244, 255)` | Fundo principal |
| card | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, sidebar, navbar |
| cardAlt | `#F8FAFF` | `rgb(248, 250, 255)` | Hover states |
| border | `#E1E8FF` | `rgb(225, 232, 255)` | Bordas |
| navBorder | `#E8EFFF` | `rgb(232, 239, 255)` | Sidebar |
| activeLink | `#EBF0FF` | `rgb(235, 240, 255)` | Link ativo |

---

# 🌑 Fundos e Superfícies — Modo Escuro

| Token | Hex | RGB | Uso |
|---|---|---|---|
| bg dark | `#0B1120` | `rgb(11, 17, 32)` | Fundo principal |
| card dark | `#131C2E` | `rgb(19, 28, 46)` | Cards |
| cardAlt dark | `#1A2540` | `rgb(26, 37, 64)` | Superfícies alternativas |
| navBg dark | `#0E1828` | `rgb(14, 24, 40)` | Navbar/Sidebar |
| border dark | `#1E2D45` | `rgb(30, 45, 69)` | Bordas |
| hover dark | `#1A2A42` | `rgb(26, 42, 66)` | Hover states |

---

# ✍️ Sistema de Texto

# ☀️ Texto — Light Mode

| Token | Hex | RGB | Uso |
|---|---|---|---|
| text | `#0F1B3D` | `rgb(15, 27, 61)` | Texto principal |
| muted | `#5B6B8A` | `rgb(91, 107, 138)` | Texto secundário |
| subtext | `#9AAAB8` | `rgb(154, 170, 184)` | Placeholders |

---

# 🌑 Texto — Dark Mode

| Token | Hex | RGB | Uso |
|---|---|---|---|
| text dark | `#EEF2FF` | `rgb(238, 242, 255)` | Texto principal |
| muted dark | `#7B8FB0` | `rgb(123, 143, 176)` | Texto secundário |
| subtext dark | `#4A5B78` | `rgb(74, 91, 120)` | Texto terciário |

---

# 🟦 Cores de Estado Leve — Light Mode

| Token | Hex |
|---|---|
| blueLight | `#EFF4FF` |
| greenLight | `#ECFDF5` |
| purpleLight | `#F5F2FF` |
| amberLight | `#FFFBEB` |
| redLight | `#FEF2F2` |

---

# 🌑 Cores de Estado Leve — Dark Mode

| Token | Hex |
|---|---|
| blueLight dark | `#0E2040` |
| greenLight dark | `#082515` |
| purpleLight dark | `#1A0D35` |
| amberLight dark | `#2D1800` |
| redLight dark | `#2D0808` |

---

# 🌫️ Shadows & Overlays

| Nome | Valor | Uso |
|---|---|---|
| Focus ring blue | `rgba(59,130,246,.15)` | Inputs |
| Shadow blue | `rgba(59,130,246,.4)` | Botões |
| Shadow green | `rgba(34,197,94,.35)` | Botões verdes |
| Shadow card | `rgba(30,60,120,.08)` | Cards |
| Shadow dark | `rgba(0,0,0,.5)` | Dark mode |
| Overlay modal | `rgba(0,0,0,.6)` | Backdrop |

---

# ✨ Cores Especiais

| Nome | Hex | Uso |
|---|---|---|
| Blue 600 | `#2563EB` | Hover btn primário |
| Blue 700 | `#1D4ED8` | Active btn |
| Green 600 | `#16A34A` | Hover verde |
| Green 400 | `#4ADE80` | Badge dark |
| Blue 400 | `#60A5FA` | Badge blue dark |
| Purple 400 | `#A78BFA` | Badge purple |
| Overlay escuro | `#050B14` | Modo foco |
| Terminal green | `#00CA4E` | Hero mockup |
| Terminal red | `#FC5A5A` | Hero mockup |
| Terminal amber | `#FFBD44` | Hero mockup |

---

# 🌈 Gradientes

# Logo Principal

```css
linear-gradient(135deg, #3B82F6, #8B5CF6)
```

# Hero Headline

```css
linear-gradient(135deg, #3B82F6, #8B5CF6, #22C55E)
```

# Botão Primário

```css
linear-gradient(135deg, #3B82F6, #2563EB)
```

# Botão Verde

```css
linear-gradient(135deg, #22C55E, #16A34A)
```

# Barra de Progresso

```css
linear-gradient(90deg, #3B82F6, #8B5CF6)
```

# CTA Final — Light

```css
linear-gradient(135deg, #EFF4FF, #F5F2FF)
```

# CTA Final — Dark

```css
linear-gradient(135deg, #0E2040, #1A0D35)
```

---

# 🔠 Tipografia

# Fonte Principal

```css
font-family: 'Inter', sans-serif;
```

## Pesos

| Peso | Nome |
|---|---|
| 300 | Light |
| 400 | Regular |
| 500 | Medium |
| 600 | SemiBold |
| 700 | Bold |
| 800 | ExtraBold |
| 900 | Black |

Fallback:

```css
sans-serif
```

Renderização:

```css
-webkit-font-smoothing: antialiased;
```

---

# 📏 Escala Tipográfica

| Uso | Tamanho | Peso |
|---|---|---|
| Hero H1 | `clamp(40px,6vw,76px)` | 900 |
| H1 grande | `clamp(28px,4vw,44px)` | 800 |
| H1 Dashboard | `clamp(22px,3vw,30px)` | 800 |
| H2 seção | `18px–22px` | 800 |
| H3 card | `15px–16px` | 700 |
| Métrica principal | `38px–40px` | 900 |
| Score ring | `28px` | 900 |
| Plano preço | `36px` | 900 |
| Timer foco | `clamp(64px,10vw,120px)` | 900 |
| Body padrão | `14px` | 400 |
| Body secundário | `13px` | 400 |
| Caption | `12px` | 400–600 |
| Micro | `11px` | 700 |
| Sidebar | `13.5px` | 500 |
| Botão | `14px` | 600 |
| Botão lg | `16px` | 600 |
| Botão sm | `12px` | 600 |
| Label form | `12px` | 700 |
| Input text | `14px` | 400 |
| Badge | `11px` | 700 |
| Logo Atmos | `19px–20px` | 800 |

---

# ✨ Tratamentos Tipográficos

## Gradient Text

```css
background-clip: text;
text-fill-color: transparent;
```

## Letter Spacing

```css
letter-spacing: -.02em a -.04em;
```

## Labels Uppercase

```css
text-transform: uppercase;
letter-spacing: .05em;
```

---

# 📐 Line Heights

| Valor | Uso |
|---|---|
| 1 | Números grandes |
| 1.05 | Hero |
| 1.4 | Notificações |
| 1.5 | Sugestões |
| 1.6 | Insights |
| 1.65 | Features |
| 1.7 | Landing text |
| 1.75 | Hero paragraph |

---

# 🖥️ Landing Page

# Hero

| Elemento | Configuração |
|---|---|
| H1 | `clamp(40–76px)` |
| Peso | 900 |
| Kerning | `-.03em` |
| Line-height | `1.05` |

---

# CTA

| Elemento | Configuração |
|---|---|
| Botão CTA | `16px · 600` |
| Fundo | Blue gradient |
| Botão secundário | Border blue |

---

# 📊 Dashboard

# Estrutura

- Sidebar
- Navbar
- Métricas
- Score Ring
- Sugestões
- Eventos
- Gráficos

---

# Cards Métricos

| Elemento | Configuração |
|---|---|
| Valor | `22–26px · 800` |
| Unidade | `12–13px · 400` |
| Label | `12px · 500` |

---

# 📡 Monitoramento

# Valores

| Elemento | Configuração |
|---|---|
| Valor destaque | `38px · 900` |
| Unidade | `16px · 400` |
| Stat value | `26px · 800` |

---

# 💳 Planos

| Elemento | Configuração |
|---|---|
| Nome do plano | `24px · 800` |
| Preço | `36px · 900` |
| Economia anual | `12px · 600` |
| Feature item | `13px · 400` |

---

# 👤 Perfil

| Elemento | Configuração |
|---|---|
| Nome usuário | `20px · 800` |
| Cidade | `13px · 400` |
| Stat value | `20px · 800` |

---

# ⚙️ Configurações

| Elemento | Configuração |
|---|---|
| Seção title | `16px · 700` |
| Toggle label | `14px · 600` |
| Toggle desc | `12px · 400` |

---

# 🎯 Modo Foco

| Elemento | Configuração |
|---|---|
| Timer | `clamp(64–120px)` |
| Label | `14px · 600` |
| Dica | `13px · 400` |
| Métrica valor | `26px · 800` |

---

# 🧩 Componentes

# Botões

Tipos:

- Primary
- Secondary
- Green
- Danger
- Ghost
- Outline

---

# Inputs

Características:

- Focus ring azul
- Estados de erro
- Placeholder customizado
- Labels uppercase

---

# Cards

Características:

- Radius suave
- Shadow leve
- Dark mode adaptativo
- Hover interaction

---

# 📱 Responsividade

O projeto utiliza:

- `clamp()`
- Layout fluido
- Mobile first
- Grids flexíveis
- Sidebar responsiva
- Escalas adaptativas

---

# 🧠 UX/UI

O Atmos segue princípios de:

- Nielsen Heuristics
- Consistência visual
- Feedback imediato
- Hierarquia clara
- Minimalismo moderno

---

# ♿ Acessibilidade

- Alto contraste
- Legibilidade
- Hierarquia visual
- Navegação intuitiva
- Estados distintos

---

# 🚀 Performance Visual

- Sombras leves
- Tokens reutilizáveis
- Renderização otimizada
- Estrutura escalável

---

# 🌌 Atmos

> “Transformando dados ambientais em experiências inteligentes.”
