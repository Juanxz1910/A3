// ╔══════════════════════════════════════════════════════════════╗
// ║  ATMOS v2.0 — Versão Final                                  ║
// ║  Plataforma de Bem-Estar e Qualidade Ambiental              ║
// ║  React 19 · CSS-in-JS · Persistência localStorage          ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback, useContext, createContext, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════════════
const LS = {
  get: (k, fb = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k)    => { try { localStorage.removeItem(k); } catch {} },
};

// ══════════════════════════════════════════════════════════════
// THEME CONTEXT
// ══════════════════════════════════════════════════════════════
const ThemeCtx = createContext({});
const useTheme = () => useContext(ThemeCtx);

const palette = (dark) => ({
  blue:        "#3B82F6",
  green:       "#22C55E",
  purple:      "#8B5CF6",
  orange:      "#F97316",
  amber:       "#F59E0B",
  red:         "#EF4444",
  bg:          dark ? "#0B1120" : "#F0F4FF",
  card:        dark ? "#131C2E" : "#FFFFFF",
  cardAlt:     dark ? "#1A2540" : "#F8FAFF",
  border:      dark ? "#1E2D45" : "#E1E8FF",
  text:        dark ? "#EEF2FF" : "#0F1B3D",
  muted:       dark ? "#7B8FB0" : "#5B6B8A",
  subtext:     dark ? "#4A5B78" : "#9AAAB8",
  blueLight:   dark ? "#0E2040" : "#EFF4FF",
  greenLight:  dark ? "#082515" : "#ECFDF5",
  purpleLight: dark ? "#1A0D35" : "#F5F2FF",
  amberLight:  dark ? "#2D1800" : "#FFFBEB",
  redLight:    dark ? "#2D0808" : "#FEF2F2",
  inputBg:     dark ? "#0B1120" : "#FFFFFF",
  navBg:       dark ? "#0E1828" : "#FFFFFF",
  navBorder:   dark ? "#1E2D45" : "#E8EFFF",
  hover:       dark ? "#1A2A42" : "#F0F4FF",
  activeLink:  dark ? "#0D2040" : "#EBF0FF",
  shadow:      dark ? "rgba(0,0,0,.5)" : "rgba(30,60,120,.08)",
  shadowHover: dark ? "rgba(0,0,0,.65)" : "rgba(30,60,120,.14)",
  dark,
});

// ══════════════════════════════════════════════════════════════
// PLANOS
// ══════════════════════════════════════════════════════════════
const PLANS = [
  {
    id: "free", name: "Free", monthlyPrice: 0, icon: "🌱", color: "#22C55E",
    features: ["1 ambiente monitorado","Dados básicos (ar e temperatura)","Relatório semanal","App mobile","Sugestões básicas"],
    unlocks: { environments:1, metrics:["air","temp"], suggestions:1, alerts:false, dailyReport:false, monitoring:false, automation:false, aiPredict:false, api:false, goals:false, focusMode:false },
    cta: "Começar grátis",
  },
  {
    id: "pro", name: "Pro", monthlyPrice: 49, icon: "⚡", color: "#3B82F6", popular: true,
    features: ["5 ambientes monitorados","Dados completos (CO₂, ruído, luz)","Relatórios diários","Sugestões inteligentes","Alertas em tempo real","Metas de bem-estar","Modo Foco","API de integração"],
    unlocks: { environments:5, metrics:["air","temp","humidity","co2","noise","light"], suggestions:6, alerts:true, dailyReport:true, monitoring:true, automation:false, aiPredict:false, api:true, goals:true, focusMode:true },
    cta: "Assinar Pro",
  },
  {
    id: "premium", name: "Premium", monthlyPrice: 119, icon: "🚀", color: "#8B5CF6",
    features: ["Ambientes ilimitados","Tudo do Pro","Automação residencial","Alexa / Google Home","Suporte 24/7","IA preditiva de bem-estar","Relatórios personalizados"],
    unlocks: { environments:Infinity, metrics:["air","temp","humidity","co2","noise","light"], suggestions:6, alerts:true, dailyReport:true, monitoring:true, automation:true, aiPredict:true, api:true, goals:true, focusMode:true },
    cta: "Assinar Premium",
  },
];
const getPlan = (id) => PLANS.find(p => p.id === id) ?? PLANS[0];

// ══════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════
const BASE_ENV = { air:78, temp:23, humidity:54, co2:620, noise:38, light:420 };

const CHART_DATA = {
  labels:   ["08h","09h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h"],
  air:      [62,67,72,75,78,76,74,79,82,78,75,72,70],
  temp:     [20,21,22,23,23,24,25,24,23,22,21,21,20],
  humidity: [48,50,52,54,56,55,54,53,52,51,50,50,49],
  co2:      [560,580,610,640,670,650,630,610,590,610,630,620,615],
  noise:    [32,35,40,38,42,39,37,40,43,38,34,30,28],
  light:    [380,430,470,490,500,480,460,490,470,440,400,360,300],
};

const WEEK_DATA = {
  labels: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
  wellness: [72,78,65,80,76,88,82],
  air:      [70,75,68,80,77,85,79],
};

const SUGGESTIONS = [
  { id:1, icon:"🪟", title:"Ventile o ambiente",  text:"Abra a janela por 10 minutos para renovar o ar e reduzir o CO₂.",       level:"info",    metric:"air",      action:"Fazer agora" },
  { id:2, icon:"💧", title:"Umidade ideal",        text:"A umidade está ótima. Continue utilizando o umidificador.",               level:"success", metric:"humidity", action:"Ver dica"    },
  { id:3, icon:"🌡️", title:"Temperatura perfeita", text:"22-24°C é a faixa ideal para máxima produtividade cognitiva.",           level:"success", metric:"temp",     action:"Saiba mais"  },
  { id:4, icon:"🔇", title:"Ambiente silencioso",  text:"Nível de ruído abaixo de 45dB. Condições ótimas para foco profundo.",    level:"success", metric:"noise",    action:"Modo Foco"   },
  { id:5, icon:"💨", title:"CO₂ sob controle",     text:"CO₂ abaixo de 700ppm. Seu cérebro agradece — máximo desempenho.",        level:"success", metric:"co2",      action:"Ver gráfico" },
  { id:6, icon:"☀️", title:"Ajuste a iluminação",  text:"400-500 lux é ideal para trabalho. Reduza persianas se necessário.",     level:"info",    metric:"light",    action:"Ajustar"     },
];

const AI_INSIGHTS = [
  { icon:"📈", text:"Sua produtividade é 31% maior quando o IQA está acima de 75. Mantenha a janela aberta das 9h às 11h.", tag:"Insight" },
  { icon:"🌙", text:"Nos últimos 7 dias, sua qualidade de sono melhorou quando a temperatura cai para 20°C antes das 22h.", tag:"Padrão" },
  { icon:"🧠", text:"Ambiente com CO₂ > 800ppm reduz capacidade cognitiva em até 20%. Você evitou isso 6 dias esta semana.", tag:"Conquista" },
  { icon:"⏰", text:"Às 14h seu ambiente costuma esquentar. Configure ventilação automática para 13h45.", tag:"Previsão" },
];

const BADGES = [
  { id:"first_day",    icon:"🌱", name:"Primeiro Passo",  desc:"Completou o primeiro dia de monitoramento",  unlocked:true  },
  { id:"week_streak",  icon:"🔥", name:"7 Dias Seguidos", desc:"Monitorou o ambiente por 7 dias consecutivos", unlocked:true  },
  { id:"air_quality",  icon:"🌬️", name:"Ar Puro",         desc:"Manteve IQA acima de 75 por 5 dias",          unlocked:true  },
  { id:"perfect_day",  icon:"⭐", name:"Dia Perfeito",    desc:"Todas as métricas no verde por um dia inteiro", unlocked:false },
  { id:"month_streak", icon:"🏆", name:"Mestre do Ar",    desc:"30 dias consecutivos de monitoramento",        unlocked:false },
  { id:"automation",   icon:"🤖", name:"Futurista",       desc:"Ativou automação residencial pela 1ª vez",     unlocked:false },
];

const GOALS = [
  { id:"air",      icon:"🌿", label:"Qualidade do Ar",  target:80, current:78, unit:"IQA",  color:"#22C55E" },
  { id:"temp",     icon:"🌡️", label:"Temperatura",      target:22, current:23, unit:"°C",   color:"#3B82F6" },
  { id:"humidity", icon:"💧", label:"Umidade",           target:55, current:54, unit:"%",    color:"#8B5CF6" },
  { id:"co2",      icon:"💨", label:"CO₂ máximo",        target:700,current:620,unit:"ppm",  color:"#F59E0B" },
];

const ENVIRONMENTS = [
  { id:1, name:"Escritório Principal", icon:"💼", status:"online",  air:78, temp:23, humidity:54 },
  { id:2, name:"Quarto",               icon:"🛏️", status:"online",  air:82, temp:21, humidity:58 },
  { id:3, name:"Sala de Estar",        icon:"🛋️", status:"online",  air:71, temp:24, humidity:51 },
  { id:4, name:"Home Office 2",        icon:"🖥️", status:"offline", air:0,  temp:0,  humidity:0  },
  { id:5, name:"Jardim",               icon:"🌳", status:"offline", air:0,  temp:0,  humidity:0  },
];

// ══════════════════════════════════════════════════════════════
// CSS FACTORY
// ══════════════════════════════════════════════════════════════
const buildCSS = (dark) => {
  const C = palette(dark);
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',sans-serif;background:${C.bg};color:${C.text};min-height:100vh;transition:background .35s,color .35s;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px}

    /* BUTTONS */
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;border-radius:12px;font-size:14px;font-weight:600;border:none;transition:all .2s cubic-bezier(.4,0,.2,1);cursor:pointer;font-family:'Inter',sans-serif;line-height:1;white-space:nowrap}
    .btn:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
    .btn-primary{background:linear-gradient(135deg,#3B82F6,#2563EB);color:#fff;box-shadow:0 4px 16px rgba(59,130,246,.4)}
    .btn-primary:hover{background:linear-gradient(135deg,#2563EB,#1D4ED8);transform:translateY(-1px);box-shadow:0 8px 24px rgba(59,130,246,.45)}
    .btn-primary:active{transform:translateY(0)}
    .btn-secondary{background:${C.card};color:#3B82F6;border:1.5px solid #3B82F6}
    .btn-secondary:hover{background:${C.blueLight};transform:translateY(-1px)}
    .btn-ghost{background:transparent;color:${C.muted};border:1.5px solid ${C.border}}
    .btn-ghost:hover{background:${C.hover};color:${C.text};border-color:${C.muted}}
    .btn-danger{background:${C.redLight};color:#EF4444;border:1.5px solid #FCA5A5}
    .btn-danger:hover{background:#FEE2E2}
    .btn-green{background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;box-shadow:0 4px 16px rgba(34,197,94,.35)}
    .btn-green:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(34,197,94,.4)}
    .btn-lg{padding:14px 32px;font-size:16px;border-radius:14px}
    .btn-sm{padding:7px 14px;font-size:12px;border-radius:9px}
    .btn-xs{padding:4px 10px;font-size:11px;border-radius:7px}
    .btn-icon{padding:9px;border-radius:10px;min-width:38px}

    /* CARDS */
    .card{background:${C.card};border-radius:20px;border:1px solid ${C.border};box-shadow:0 2px 12px ${C.shadow};transition:box-shadow .25s,transform .25s,background .35s,border-color .35s}
    .card-hover:hover{box-shadow:0 8px 32px ${C.shadowHover};transform:translateY(-2px)}
    .card-alt{background:${C.cardAlt};border-radius:16px;border:1px solid ${C.border}}

    /* BADGES */
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.02em}
    .badge-green{background:${C.greenLight};color:${dark?"#4ADE80":"#15803D"}}
    .badge-blue{background:${C.blueLight};color:${dark?"#60A5FA":"#1D4ED8"}}
    .badge-amber{background:${C.amberLight};color:#B45309}
    .badge-red{background:${C.redLight};color:#DC2626}
    .badge-purple{background:${C.purpleLight};color:${dark?"#A78BFA":"#6D28D9"}}
    .badge-gray{background:${C.hover};color:${C.muted}}

    /* INPUTS */
    .input-field{width:100%;padding:11px 15px;border:1.5px solid ${C.border};border-radius:12px;font-size:14px;background:${C.inputBg};color:${C.text};outline:none;transition:border-color .2s,box-shadow .2s,background .35s;font-family:'Inter',sans-serif}
    .input-field:focus{border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.15)}
    .input-field::placeholder{color:${C.subtext}}
    .input-field option{background:${C.card};color:${C.text}}
    textarea.input-field{resize:vertical;min-height:80px}
    .label{font-size:12px;font-weight:700;color:${C.muted};margin-bottom:6px;display:block;letter-spacing:.05em;text-transform:uppercase}

    /* SIDEBAR */
    .sidebar-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;font-size:13.5px;font-weight:500;color:${C.muted};transition:all .18s;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;position:relative}
    .sidebar-link:hover{background:${C.hover};color:${C.text}}
    .sidebar-link.active{background:${C.activeLink};color:#3B82F6;font-weight:700}
    .sidebar-link.active::before{content:'';position:absolute;left:-16px;top:50%;transform:translateY(-50%);width:3px;height:20px;background:#3B82F6;border-radius:0 3px 3px 0}

    /* PROGRESS BAR */
    .progress-track{background:${C.border};border-radius:99px;overflow:hidden}
    .progress-fill{height:100%;border-radius:99px;transition:width .8s cubic-bezier(.4,0,.2,1)}

    /* ANIMATIONS */
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideRight{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes countUp{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
    @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    @keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}

    .fade-up{animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both}
    .fade-in{animation:fadeIn .3s ease both}
    .slide-right{animation:slideRight .35s ease both}
    .pulse-dot{animation:pulse 2.5s infinite}
    .spinning{animation:spin 1s linear infinite}
    .count-up{animation:countUp .5s ease both}
    .toast-in{animation:toastIn .4s cubic-bezier(.4,0,.2,1) both}

    /* ONBOARDING */
    .onboarding-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}

    /* FOCUS MODE */
    .focus-mode-overlay{position:fixed;inset:0;background:${dark?"#050B14":"#F0F4FF"};z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px}

    /* NOTIFICATION */
    .notification-dot{position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:99px;background:#EF4444;border:2px solid ${C.navBg}}

    /* TOOLTIP */
    .tooltip-wrap{position:relative}
    .tooltip-wrap:hover .tooltip-box{opacity:1;pointer-events:auto;transform:translateY(0)}
    .tooltip-box{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);background:${C.text};color:${C.bg};padding:6px 10px;border-radius:8px;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:all .2s;z-index:100}

    /* MOBILE */
    @media(max-width:900px){
      .sidebar{display:none!important}
      .main-content{margin-left:0!important}
      .mobile-nav{display:flex!important}
      .hide-mobile{display:none!important}
    }
    @media(max-width:640px){
      .grid-3{grid-template-columns:1fr!important}
      .grid-4{grid-template-columns:1fr 1fr!important}
      .grid-plans{grid-template-columns:1fr!important}
    }
    @media(min-width:641px) and (max-width:900px){
      .grid-3{grid-template-columns:repeat(2,1fr)!important}
      .grid-plans{grid-template-columns:1fr!important}
    }
  `;
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
const clamp = (v,mn,mx) => Math.min(Math.max(v,mn),mx);
const rand  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const lerp  = (a,b,t) => a + (b-a)*t;

const getAirLabel  = v => v>=80?["Excelente","green"]:v>=65?["Bom","blue"]:v>=45?["Moderado","amber"]:["Ruim","red"];
const getTempLabel = v => (v>=20&&v<=24)?["Ideal","green"]:v<20?["Frio","blue"]:["Quente","amber"];
const getHumLabel  = v => (v>=45&&v<=60)?["Ideal","green"]:["Atenção","amber"];
const getCo2Label  = v => v<700?["Ótimo","green"]:v<900?["Moderado","amber"]:["Alto","red"];
const getNoiseLabel= v => v<40?["Silencioso","green"]:v<60?["Moderado","amber"]:["Alto","red"];
const getLightLabel= v => (v>=350&&v<=600)?["Ideal","green"]:v<350?["Baixo","amber"]:["Alto","amber"];

const METRIC_META = {
  air:      { icon:"🌿", label:"Qualidade do Ar", unit:"IQA",  max:100, getLabel:getAirLabel,   color:"#22C55E", chart:CHART_DATA.air      },
  temp:     { icon:"🌡️", label:"Temperatura",     unit:"°C",   max:40,  getLabel:getTempLabel,  color:"#3B82F6", chart:CHART_DATA.temp     },
  humidity: { icon:"💧", label:"Umidade",          unit:"%",    max:100, getLabel:getHumLabel,   color:"#8B5CF6", chart:CHART_DATA.humidity },
  co2:      { icon:"💨", label:"CO₂",              unit:"ppm",  max:1200,getLabel:getCo2Label,   color:"#F59E0B", chart:CHART_DATA.co2      },
  noise:    { icon:"🔇", label:"Ruído",             unit:"dB",   max:100, getLabel:getNoiseLabel, color:"#EF4444", chart:CHART_DATA.noise    },
  light:    { icon:"☀️", label:"Luminosidade",     unit:"lux",  max:800, getLabel:getLightLabel, color:"#F97316", chart:CHART_DATA.light    },
};

const fmt = (n) => n >= 1000 ? (n/1000).toFixed(1)+"k" : String(n);

// ══════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ══════════════════════════════════════════════════════════════
function LogoMark({ size=32 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.28, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.5, flexShrink:0, boxShadow:"0 4px 12px rgba(59,130,246,.4)" }}>
      🌬️
    </div>
  );
}

function LogoBtn({ user, onNav }) {
  return (
    <button onClick={() => onNav(user ? "dashboard" : "landing")}
      style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:0 }}>
      <LogoMark size={34}/>
      <span style={{ fontSize:19, fontWeight:800, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-.02em" }}>Atmos</span>
    </button>
  );
}

function Toggle({ checked, onChange, color="#3B82F6", size="md" }) {
  const C = useTheme();
  const w = size==="sm" ? 36 : 44, h = size==="sm" ? 20 : 24, thumb = size==="sm" ? 14 : 18, off = size==="sm" ? 3 : 3, on = size==="sm" ? 19 : 23;
  return (
    <div onClick={() => onChange(!checked)} style={{ width:w, height:h, borderRadius:99, background:checked?color:C.border, position:"relative", cursor:"pointer", transition:"background .25s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:checked?on:off, width:thumb, height:thumb, borderRadius:99, background:"#fff", transition:"left .2s cubic-bezier(.4,0,.2,1)", boxShadow:"0 1px 4px rgba(0,0,0,.25)" }}/>
    </div>
  );
}

function Divider({ label }) {
  const C = useTheme();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ flex:1, height:1, background:C.border }}/>
      {label && <span style={{ fontSize:12, color:C.muted, fontWeight:500, whiteSpace:"nowrap" }}>{label}</span>}
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function PageHeader({ title, sub, right, center }) {
  const C = useTheme();
  return (
    <div style={{ display:"flex", justifyContent:center?"center":"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12, textAlign:center?"center":"left" }}>
      <div>
        <h1 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:800, color:C.text, marginBottom:5, letterSpacing:"-.02em" }}>{title}</h1>
        {sub && <p style={{ color:C.muted, fontSize:14 }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function ProgressBar({ pct, color, height=6 }) {
  const C = useTheme();
  return (
    <div className="progress-track" style={{ height, background:C.border }}>
      <div className="progress-fill" style={{ width:`${Math.min(pct,100)}%`, height, background:color }}/>
    </div>
  );
}

function LockedOverlay({ requiredPlan, onUpgrade }) {
  const C = useTheme();
  const plan = getPlan(requiredPlan);
  return (
    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, background:C.dark?"rgba(11,17,32,.82)":"rgba(240,244,255,.86)", backdropFilter:"blur(4px)", borderRadius:20, zIndex:10 }}>
      <div style={{ fontSize:26 }}>🔒</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontWeight:700, fontSize:13, color:C.text }}>Recurso {plan.name}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Faça upgrade para desbloquear</div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Ver planos</button>
    </div>
  );
}

function WellnessScore({ score }) {
  const C = useTheme();
  const r = 52, circ = 2*Math.PI*r, dash = (score/100)*circ;
  const color = score>=80 ? "#22C55E" : score>=60 ? "#F59E0B" : "#EF4444";
  const label = score>=80 ? "Excelente" : score>=60 ? "Bom" : "Atenção";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color}/>
            <stop offset="100%" stopColor={color+"CC"}/>
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r={r} fill="none" stroke={C.border} strokeWidth="10"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 65 65)" style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="65" y="58" textAnchor="middle" fontSize="28" fontWeight="900" fill={C.text}>{score}</text>
        <text x="65" y="76" textAnchor="middle" fontSize="11" fill={C.muted}>/ 100</text>
      </svg>
      <span style={{ fontSize:13, fontWeight:700, color }}>{label}</span>
    </div>
  );
}

function Sparkline({ data, color, height=52 }) {
  const C = useTheme();
  const w=220, h=height;
  const max=Math.max(...data), min=Math.min(...data);
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-6)-3}`).join(" ");
  const gid = `sg${color.replace("#","")}${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RadialGauge({ value, max=100, color, size=110, label, sub }) {
  const C = useTheme();
  const r=42, circ=2*Math.PI*r, dash=Math.min(value/max,1)*circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke={C.border} strokeWidth="9"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition:"stroke-dasharray .9s ease" }}/>
        <text x="50" y="45" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.text}>{value}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="9" fill={C.muted}>{sub}</text>
      </svg>
      <span style={{ fontSize:12, fontWeight:700, color }}>{label}</span>
    </div>
  );
}

function Toast({ toasts, dismiss }) {
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, display:"flex", flexDirection:"column", gap:10, maxWidth:340 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-in" style={{ background:"white", border:`1.5px solid ${t.color}`, borderRadius:16, padding:"14px 18px", boxShadow:`0 8px 32px rgba(0,0,0,.15)`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:t.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{t.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{t.title}</div>
            <div style={{ fontSize:12, color:"#5B6B8A", marginTop:1 }}>{t.sub}</div>
          </div>
          <button onClick={() => dismiss(t.id)} style={{ background:"none", border:"none", fontSize:18, color:"#9AAAB8", cursor:"pointer", lineHeight:1, padding:0 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(() => LS.get("atmos_user"));
  const [page,      setPage]      = useState(() => {
    if (!LS.get("atmos_user")) return "landing";
    const p = LS.get("atmos_page","dashboard");
    return ["dashboard","monitoring","goals","environments","reports","plans","profile","settings"].includes(p) ? p : "dashboard";
  });
  const [themeMode, setThemeMode] = useState(() => LS.get("atmos_theme","auto"));
  const [sysDark,   setSysDark]   = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [env,       setEnv]       = useState(BASE_ENV);
  const [toasts,    setToasts]    = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Detect OS theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setSysDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const dark = themeMode==="dark" || (themeMode==="auto" && sysDark);
  const C = palette(dark);

  // Inject CSS
  useEffect(() => {
    let el = document.getElementById("atmos-css");
    if (!el) { el = document.createElement("style"); el.id = "atmos-css"; document.head.appendChild(el); }
    el.textContent = buildCSS(dark);
  }, [dark]);

  // Simulate realtime env data
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => setEnv(e => ({
      air:      clamp(e.air      + rand(-2,2),   20, 100),
      temp:     clamp(e.temp     + rand(-1,1),   15, 35),
      humidity: clamp(e.humidity + rand(-1,1),   25, 85),
      co2:      clamp(e.co2      + rand(-15,15), 400, 1100),
      noise:    clamp(e.noise    + rand(-2,2),   15, 75),
      light:    clamp(e.light    + rand(-20,20), 80, 750),
    })), 6000);
    return () => clearInterval(id);
  }, [user]);

  const navigateTo = useCallback((p) => { setPage(p); LS.set("atmos_page", p); }, []);
  const changeTheme = useCallback((mode) => { setThemeMode(mode); LS.set("atmos_theme", mode); }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const changePlan = useCallback((planId) => {
    const plan = getPlan(planId);
    setUser(prev => { const u = { ...prev, plan:planId }; LS.set("atmos_user", u); return u; });
    addToast({ icon:plan.icon, title:"Plano alterado!", sub:`Agora você está no plano ${plan.name}`, color:plan.color });
  }, [addToast]);

  const login = (u) => {
    LS.set("atmos_user", u);
    setUser(u);
    navigateTo("dashboard");
    if (!u.onboarded) setTimeout(() => setShowOnboarding(true), 600);
  };

  const logout = () => { LS.del("atmos_user"); LS.del("atmos_page"); setUser(null); setPage("landing"); };

  const planInfo = getPlan(user?.plan ?? "free");
  const wellnessScore = Math.round((env.air*0.35 + (100 - (env.co2-400)/8)*0.25 + (env.humidity>=45&&env.humidity<=60?100:70)*0.2 + (env.noise<40?100:env.noise<60?70:40)*0.2));

  const themeValue = { ...C, dark, themeMode };

  // Auth routes
  if (!user) {
    const routes = { landing:Landing, login:LoginPage, signup:SignupPage, plans:PlansPagePublic };
    const PageComp = routes[page] ?? Landing;
    return (
      <ThemeCtx.Provider value={themeValue}>
        <PageComp onNav={navigateTo} onLogin={login} user={null}/>
        <Toast toasts={toasts} dismiss={dismissToast}/>
      </ThemeCtx.Provider>
    );
  }

  // Focus Mode
  if (focusMode) {
    return (
      <ThemeCtx.Provider value={themeValue}>
        <FocusMode env={env} wellnessScore={wellnessScore} onExit={() => setFocusMode(false)} C={C}/>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={themeValue}>
      <AppShell page={page} setPage={navigateTo} user={user} onLogout={logout} planInfo={planInfo} onFocus={() => setFocusMode(true)}>
        {page==="dashboard"    && <Dashboard    env={env} planInfo={planInfo} onUpgrade={() => navigateTo("plans")} wellnessScore={wellnessScore} onFocus={() => setFocusMode(true)}/>}
        {page==="monitoring"   && <MonitoringPage env={env} planInfo={planInfo} onUpgrade={() => navigateTo("plans")}/>}
        {page==="goals"        && <GoalsPage     env={env} planInfo={planInfo} onUpgrade={() => navigateTo("plans")}/>}
        {page==="environments" && <EnvironmentsPage planInfo={planInfo} onUpgrade={() => navigateTo("plans")}/>}
        {page==="reports"      && <ReportsPage   planInfo={planInfo} onUpgrade={() => navigateTo("plans")}/>}
        {page==="plans"        && <PlansPage     user={user} onChangePlan={changePlan}/>}
        {page==="profile"      && <ProfilePage   user={user} planInfo={planInfo} addToast={addToast}/>}
        {page==="settings"     && <SettingsPage  themeMode={themeMode} setThemeMode={changeTheme} addToast={addToast}/>}
      </AppShell>

      {showOnboarding && (
        <OnboardingWizard onDone={() => {
          setShowOnboarding(false);
          setUser(prev => { const u={...prev,onboarded:true}; LS.set("atmos_user",u); return u; });
        }}/>
      )}

      <Toast toasts={toasts} dismiss={dismissToast}/>
    </ThemeCtx.Provider>
  );
}

// ══════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════
function AppShell({ page, setPage, user, onLogout, planInfo, onFocus, children }) {
  const C = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navMain = [
    { id:"dashboard",    icon:"⚡", label:"Dashboard"     },
    { id:"monitoring",   icon:"📊", label:"Monitoramento" },
    { id:"goals",        icon:"🎯", label:"Metas"         },
    { id:"environments", icon:"🏠", label:"Ambientes"     },
    { id:"reports",      icon:"📋", label:"Relatórios"    },
  ];
  const navSec = [
    { id:"plans",    icon:"💳", label:"Planos"        },
    { id:"profile",  icon:"👤", label:"Perfil"        },
    { id:"settings", icon:"⚙️", label:"Configurações" },
  ];

  const sideW = collapsed ? 68 : 232;

  return (
    <>
      {/* SIDEBAR */}
      <aside style={{ position:"fixed", top:0, left:0, width:sideW, height:"100vh", background:C.navBg, borderRight:`1px solid ${C.navBorder}`, display:"flex", flexDirection:"column", padding:collapsed?"14px 10px":"20px 14px", zIndex:100, transition:"width .28s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }} className="sidebar">

        {/* LOGO + COLLAPSE */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", marginBottom:28 }}>
          {!collapsed && <LogoBtn user={user} onNav={setPage}/>}
          {collapsed && <LogoMark size={30}/>}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:16, padding:4, borderRadius:8 }} title="Recolher">‹</button>
          )}
        </div>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:14, padding:4, borderRadius:8, marginBottom:8, textAlign:"center" }} title="Expandir">›</button>
        )}

        {/* NAV MAIN */}
        {!collapsed && <div style={{ fontSize:10, fontWeight:800, color:C.subtext, letterSpacing:".1em", textTransform:"uppercase", marginBottom:8, paddingLeft:12 }}>Principal</div>}
        <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
          {navMain.map(n => (
            <button key={n.id} className={`sidebar-link ${page===n.id?"active":""}`}
              onClick={() => setPage(n.id)} style={{ justifyContent:collapsed?"center":"flex-start", paddingLeft:collapsed?0:12 }}
              title={collapsed?n.label:undefined}>
              <span style={{ fontSize:17, flexShrink:0 }}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
            </button>
          ))}

          <div style={{ height:1, background:C.border, margin:"10px 0" }}/>
          {!collapsed && <div style={{ fontSize:10, fontWeight:800, color:C.subtext, letterSpacing:".1em", textTransform:"uppercase", marginBottom:8, paddingLeft:12 }}>Conta</div>}

          {navSec.map(n => (
            <button key={n.id} className={`sidebar-link ${page===n.id?"active":""}`}
              onClick={() => setPage(n.id)} style={{ justifyContent:collapsed?"center":"flex-start", paddingLeft:collapsed?0:12 }}
              title={collapsed?n.label:undefined}>
              <span style={{ fontSize:17, flexShrink:0 }}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* FOCUS MODE BTN */}
        {!collapsed && planInfo.unlocks.focusMode && (
          <button className="btn btn-primary btn-sm" onClick={onFocus} style={{ marginBottom:12, borderRadius:10 }}>
            🎯 Modo Foco
          </button>
        )}

        {/* USER FOOTER */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, display:"flex", alignItems:"center", gap:10, justifyContent:collapsed?"center":"flex-start" }}>
          <div style={{ width:34, height:34, borderRadius:99, background:`linear-gradient(135deg,#3B82F6,#8B5CF6)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() ?? "N"}
          </div>
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:planInfo.color, fontWeight:600 }}>{planInfo.icon} {planInfo.name}</div>
            </div>
          )}
          {!collapsed && (
            <button className="btn btn-ghost btn-icon" onClick={onLogout} title="Sair" style={{ flexShrink:0 }}>↩</button>
          )}
        </div>
      </aside>

      {/* TOPBAR */}
      <div style={{ position:"fixed", top:0, left:sideW, right:0, height:58, background:C.navBg, borderBottom:`1px solid ${C.navBorder}`, zIndex:90, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", transition:"left .28s cubic-bezier(.4,0,.2,1)" }} className="hide-mobile">
        <div style={{ fontSize:14, color:C.muted }}>
          {new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* NOTIFICAÇÕES */}
          <div style={{ position:"relative" }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setNotifOpen(o=>!o)} style={{ fontSize:18, position:"relative" }}>
              🔔
              <div className="notification-dot"/>
            </button>
            {notifOpen && (
              <div className="fade-in" style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:320, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:`0 12px 40px ${C.shadow}`, zIndex:200, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, fontSize:14, color:C.text }}>Notificações</span>
                  <button className="btn btn-xs" onClick={() => setNotifOpen(false)} style={{ color:C.muted, background:"none", border:"none", cursor:"pointer" }}>Fechar</button>
                </div>
                {[
                  { icon:"🌿", text:"IQA acima de 75 — ambiente excelente hoje!", time:"agora",   color:"#22C55E" },
                  { icon:"💨", text:"CO₂ dentro do ideal. Continue ventilando!",  time:"2h atrás", color:"#F59E0B" },
                  { icon:"🏆", text:"Nova conquista desbloqueada: '7 Dias Seguidos'", time:"ontem",color:"#8B5CF6" },
                ].map((n,i) => (
                  <div key={i} style={{ padding:"12px 18px", borderBottom:i<2?`1px solid ${C.border}`:"none", display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background=C.hover}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <div style={{ width:34, height:34, borderRadius:10, background:n.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:C.text, lineHeight:1.4 }}>{n.text}</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft:sideW, paddingTop:58, minHeight:"100vh", background:C.bg, transition:"margin-left .28s cubic-bezier(.4,0,.2,1)" }} className="main-content">
        <div style={{ padding:"28px 28px 80px" }} className="fade-up">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, background:C.navBg, borderTop:`1px solid ${C.navBorder}`, padding:"6px 0 8px", zIndex:200, justifyContent:"space-around" }}>
        {[...navMain.slice(0,3), ...navSec.slice(0,2)].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", fontSize:10, fontWeight:600, color:page===n.id?"#3B82F6":C.muted, padding:"4px 8px", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// ONBOARDING WIZARD
// ══════════════════════════════════════════════════════════════
function OnboardingWizard({ onDone }) {
  const C = useTheme();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goal:"productivity", space:"home_office", concern:"air" });

  const steps = [
    {
      title: "Olá! Bem-vinda ao Atmos 🌬️",
      sub: "Vamos personalizar sua experiência em 3 passos rápidos.",
      content: (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:72, marginBottom:16 }}>🌱</div>
          <p style={{ color:C.muted, fontSize:15, lineHeight:1.7 }}>O Atmos monitora a qualidade do seu ambiente em tempo real e te ajuda a respirar melhor, trabalhar com mais foco e viver com mais bem-estar.</p>
        </div>
      )
    },
    {
      title: "Qual seu principal objetivo?",
      sub: "Vamos adaptar as sugestões para o que você precisa.",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { id:"productivity", icon:"💼", label:"Aumentar produtividade no trabalho" },
            { id:"health",       icon:"💚", label:"Melhorar saúde e bem-estar geral" },
            { id:"sleep",        icon:"🌙", label:"Dormir melhor e ter mais energia" },
            { id:"focus",        icon:"🎯", label:"Ter mais foco e concentração" },
          ].map(o => (
            <button key={o.id} onClick={() => setAnswers(a=>({...a,goal:o.id}))}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:14, border:`2px solid ${answers.goal===o.id?"#3B82F6":C.border}`, background:answers.goal===o.id?C.blueLight:C.card, cursor:"pointer", textAlign:"left", transition:"all .2s" }}>
              <span style={{ fontSize:22 }}>{o.icon}</span>
              <span style={{ fontSize:14, fontWeight:600, color:answers.goal===o.id?"#3B82F6":C.text }}>{o.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Onde você mais usa o Atmos?",
      sub: "Isso nos ajuda a calibrar os sensores corretamente.",
      content: (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { id:"home_office", icon:"🖥️", label:"Home Office" },
            { id:"office",      icon:"💼", label:"Escritório"  },
            { id:"bedroom",     icon:"🛏️", label:"Quarto"      },
            { id:"living",      icon:"🛋️", label:"Sala"        },
          ].map(o => (
            <button key={o.id} onClick={() => setAnswers(a=>({...a,space:o.id}))}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"20px 12px", borderRadius:14, border:`2px solid ${answers.space===o.id?"#3B82F6":C.border}`, background:answers.space===o.id?C.blueLight:C.card, cursor:"pointer", transition:"all .2s" }}>
              <span style={{ fontSize:32 }}>{o.icon}</span>
              <span style={{ fontSize:13, fontWeight:600, color:answers.space===o.id?"#3B82F6":C.text }}>{o.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Tudo pronto! ✨",
      sub: "Seu Atmos foi personalizado para você.",
      content: (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🚀</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
            {[
              { icon:"📊", text:"Dashboard personalizado configurado" },
              { icon:"🧠", text:"Sugestões baseadas em seus objetivos" },
              { icon:"🔔", text:"Alertas inteligentes ativados" },
            ].map((item,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 16px", borderRadius:12, background:C.greenLight }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:14, color:C.text, fontWeight:500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const cur = steps[step];

  return (
    <div className="onboarding-overlay">
      <div className="card fade-up" style={{ maxWidth:460, width:"100%", padding:0, overflow:"hidden" }}>
        {/* PROGRESS */}
        <div style={{ height:4, background:C.border }}>
          <div style={{ height:"100%", background:"linear-gradient(90deg,#3B82F6,#8B5CF6)", width:`${((step+1)/steps.length)*100}%`, transition:"width .4s" }}/>
        </div>

        <div style={{ padding:32 }}>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {steps.map((_,i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:99, background:i<=step?"#3B82F6":C.border, transition:"background .3s" }}/>
            ))}
          </div>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>{cur.title}</h2>
          <p style={{ color:C.muted, fontSize:14, marginBottom:24 }}>{cur.sub}</p>
          {cur.content}

          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s=>s-1)} style={{ flex:1 }}>← Voltar</button>
            )}
            {step < steps.length-1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s=>s+1)} style={{ flex:2 }}>Continuar →</button>
            ) : (
              <button className="btn btn-green" onClick={onDone} style={{ flex:2 }}>Começar minha jornada 🚀</button>
            )}
          </div>
          {step === 0 && (
            <button onClick={onDone} style={{ display:"block", width:"100%", marginTop:12, background:"none", border:"none", fontSize:13, color:C.muted, cursor:"pointer" }}>Pular configuração</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FOCUS MODE
// ══════════════════════════════════════════════════════════════
function FocusMode({ env, wellnessScore, onExit, C }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(t => t+1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mins = Math.floor(elapsed/60), secs = elapsed%60;
  const [airL,airC] = getAirLabel(env.air);

  return (
    <div className="focus-mode-overlay">
      <div style={{ position:"absolute", top:20, right:20, display:"flex", gap:10 }}>
        <button className="btn btn-ghost" onClick={() => setRunning(r=>!r)}>{running?"⏸ Pausar":"▶ Retomar"}</button>
        <button className="btn btn-primary" onClick={onExit}>Sair do Foco</button>
      </div>

      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.muted, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>🎯 Modo Foco Ativo</div>
        <div style={{ fontSize:"clamp(64px,10vw,120px)", fontWeight:900, color:C.text, letterSpacing:"-.04em", lineHeight:1 }}>
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </div>
        <div style={{ fontSize:15, color:C.muted, marginTop:8 }}>Foque no que importa. O Atmos cuida do resto.</div>
      </div>

      <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { label:"Qualidade do Ar", value:env.air,      unit:"IQA",  color:"#22C55E", icon:"🌿", good:env.air>=75 },
          { label:"Temperatura",     value:env.temp,     unit:"°C",   color:"#3B82F6", icon:"🌡️", good:env.temp>=20&&env.temp<=24 },
          { label:"CO₂",             value:env.co2,      unit:"ppm",  color:"#F59E0B", icon:"💨", good:env.co2<700 },
          { label:"Ruído",           value:env.noise,    unit:"dB",   color:"#EF4444", icon:"🔇", good:env.noise<45 },
        ].map(m => (
          <div key={m.label} style={{ background:C.card, borderRadius:20, padding:"20px 24px", textAlign:"center", border:`1px solid ${C.border}`, minWidth:120 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontSize:26, fontWeight:800, color:m.color }}>{m.value}</div>
            <div style={{ fontSize:11, color:C.muted }}>{m.unit}</div>
            <div style={{ fontSize:12, fontWeight:600, color:m.good?"#22C55E":"#F59E0B", marginTop:6 }}>{m.good?"✓ Ideal":"⚠️ Atenção"}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, borderRadius:20, padding:"16px 24px", border:`1px solid ${C.border}`, maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:13, color:C.muted }}>💡 <strong style={{color:C.text}}>Dica:</strong> Com CO₂ abaixo de 700ppm e ruído abaixo de 45dB, você está em condições ideais para deep work.</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard({ env, planInfo, onUpgrade, wellnessScore, onFocus }) {
  const C = useTheme();
  const has = m => planInfo.unlocks.metrics.includes(m);
  const [dismissedSugs, setDismissedSugs] = useState([]);

  const visibleSugs = SUGGESTIONS
    .filter(s => has(s.metric))
    .filter(s => !dismissedSugs.includes(s.id))
    .slice(0, planInfo.unlocks.suggestions);

  const stats = [
    { icon:"🔥", label:"Sequência",   value:"12 dias",  sub:"novo recorde!",   color:"#F97316" },
    { icon:"⭐", label:"Bem-Estar",   value:`${wellnessScore}%`, sub:"hoje",   color:"#22C55E" },
    { icon:"🏆", label:"Conquistas",  value:"3/6",       sub:"desbloqueadas",  color:"#8B5CF6" },
    { icon:"💡", label:"Sugestões",   value:"6",         sub:"esta semana",    color:"#3B82F6" },
  ];

  return (
    <>
      <PageHeader
        title={`Bom dia, ${(planInfo && planInfo.name) ? "" : ""}${""}`}
        sub={`${new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} · ${planInfo.unlocks.environments===Infinity?"Ilimitados":`${planInfo.unlocks.environments} ambiente${planInfo.unlocks.environments>1?"s":""}`} ativos`}
        right={
          <div style={{ display:"flex", gap:8 }}>
            {planInfo.unlocks.focusMode && (
              <button className="btn btn-primary btn-sm" onClick={onFocus}>🎯 Modo Foco</button>
            )}
          </div>
        }
      />

      {/* STATUS BAR */}
      <div style={{ background:C.card, borderRadius:16, padding:"14px 20px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{ width:10, height:10, borderRadius:99, background:"#22C55E", flexShrink:0 }} className="pulse-dot"/>
        <span style={{ fontWeight:600, fontSize:14, color:C.text }}>Escritório Principal — Monitorando</span>
        {planInfo.unlocks.alerts && <span className="badge badge-blue">🔔 Alertas ativos</span>}
        <span className={`badge badge-${getAirLabel(env.air)[1]}`} style={{ marginLeft:"auto" }}>🌿 Ar {getAirLabel(env.air)[0]}</span>
      </div>

      {/* GAMIFICATION STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="grid-4">
        {stats.map(s => (
          <div key={s.label} className="card card-hover" style={{ padding:"18px 16px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, fontWeight:600, color:C.muted }}>{s.label}</div>
            <div style={{ fontSize:11, color:C.subtext }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID: WELLNESS + METRICS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20, marginBottom:20 }}>

        {/* WELLNESS SCORE */}
        <div className="card" style={{ padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div style={{ fontWeight:700, fontSize:15, color:C.text, alignSelf:"flex-start" }}>🧬 Índice de Bem-Estar</div>
          <WellnessScore score={wellnessScore}/>
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label:"Qualidade do Ar", pct:(env.air/100)*100, color:"#22C55E" },
              { label:"CO₂",             pct:Math.max(0,100-((env.co2-400)/8)), color:"#F59E0B" },
              { label:"Ruído",           pct:Math.max(0,100-(env.noise/80)*100), color:"#EF4444" },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:C.muted }}>{b.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:b.color }}>{Math.round(b.pct)}%</span>
                </div>
                <ProgressBar pct={b.pct} color={b.color} height={5}/>
              </div>
            ))}
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {Object.entries(METRIC_META).map(([key,meta]) => {
            const val = env[key] ?? meta.chart.slice(-1)[0];
            const [lbl,cl] = meta.getLabel(val);
            const locked = !has(key);
            return (
              <div key={key} style={{ position:"relative" }} className="card card-hover">
                {locked && <LockedOverlay requiredPlan="pro" onUpgrade={onUpgrade}/>}
                <div style={{ padding:"18px 16px", opacity:locked?.5:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:20 }}>{meta.icon}</span>
                    <span className={`badge badge-${cl}`}>{lbl}</span>
                  </div>
                  <div style={{ fontSize:26, fontWeight:800, color:meta.color, lineHeight:1 }}>
                    {locked ? "—" : val}<span style={{ fontSize:12, color:C.muted, marginLeft:3 }}>{meta.unit}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2, marginBottom:8 }}>{meta.label}</div>
                  <Sparkline data={meta.chart} color={meta.color} height={40}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUGESTÕES + IA */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

        {/* SUGESTÕES */}
        <div className="card" style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:C.text }}>💡 Sugestões Inteligentes</h3>
            <span className="badge badge-blue">{visibleSugs.length} ativas</span>
          </div>
          {planInfo.unlocks.suggestions > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {visibleSugs.map(s => (
                <div key={s.id} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", borderRadius:14, background:s.level==="success"?C.greenLight:C.blueLight, position:"relative" }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s.text}</div>
                  </div>
                  <button onClick={() => setDismissedSugs(d=>[...d,s.id])} style={{ background:"none", border:"none", color:C.subtext, cursor:"pointer", fontSize:14, lineHeight:1, flexShrink:0 }}>×</button>
                </div>
              ))}
              {visibleSugs.length === 0 && (
                <div style={{ textAlign:"center", padding:24, color:C.muted }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>✨</div>
                  <div style={{ fontSize:14 }}>Ambiente perfeito! Sem sugestões no momento.</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ position:"relative" }}>
              <div style={{ opacity:.5 }}>
                {SUGGESTIONS.slice(0,3).map(s => (
                  <div key={s.id} style={{ display:"flex", gap:10, padding:"10px 12px", borderRadius:12, background:C.blueLight, marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{s.icon}</span>
                    <span style={{ fontSize:13, color:C.text }}>{s.text}</span>
                  </div>
                ))}
              </div>
              <LockedOverlay requiredPlan="pro" onUpgrade={onUpgrade}/>
            </div>
          )}
        </div>

        {/* IA INSIGHTS */}
        <div className="card" style={{ padding:22, position:"relative" }}>
          {!planInfo.unlocks.aiPredict && <LockedOverlay requiredPlan="premium" onUpgrade={onUpgrade}/>}
          <div style={{ opacity:planInfo.unlocks.aiPredict?1:.5 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:C.text }}>🤖 IA Preditiva</h3>
              <span className="badge badge-purple">Premium</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {AI_INSIGHTS.map((ins,i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", borderRadius:14, background:C.purpleLight }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{ins.icon}</span>
                  <div>
                    <span className="badge badge-purple" style={{ fontSize:10, marginBottom:4 }}>{ins.tag}</span>
                    <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{ins.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMAÇÃO */}
      <div className="card" style={{ padding:22, position:"relative", marginBottom:20 }}>
        {!planInfo.unlocks.automation && <LockedOverlay requiredPlan="premium" onUpgrade={onUpgrade}/>}
        <div style={{ opacity:planInfo.unlocks.automation?1:.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:C.text }}>🏠 Automação Residencial</h3>
            <span className="badge badge-purple">Premium</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { name:"Ar-condicionado", icon:"❄️", status:"22°C · Auto",    on:true,  color:"#3B82F6" },
              { name:"Purificador",     icon:"🌬️", status:"Velocidade 2",   on:true,  color:"#22C55E" },
              { name:"Umidificador",    icon:"💧", status:"55% alvo",       on:false, color:"#8B5CF6" },
              { name:"Alexa",          icon:"🔊", status:"Conectado",       on:true,  color:"#F97316" },
              { name:"Google Home",    icon:"🤖", status:"Integrado",       on:true,  color:"#EF4444" },
              { name:"Venezianas",     icon:"🌅", status:"Abertas 40%",     on:true,  color:"#F59E0B" },
            ].map((d,i) => {
              const [deviceOn, setDeviceOn] = useState(d.on);
              return (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:12, background:C.cardAlt, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:d.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{d.icon}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{d.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{d.status}</div>
                    </div>
                  </div>
                  <Toggle checked={deviceOn} onChange={setDeviceOn} color={d.color} size="sm"/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GAUGES */}
      <div className="card" style={{ padding:22 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:20 }}>📊 Painel de Gauges</h3>
        <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:20 }}>
          {Object.entries(METRIC_META).map(([key,meta]) => {
            const val = env[key] ?? 0;
            const locked = !has(key);
            const [lbl] = meta.getLabel(val);
            return (
              <div key={key} style={{ opacity:locked?.4:1 }}>
                {locked
                  ? <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}><div style={{width:110,height:110,borderRadius:99,border:`3px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🔒</div><span style={{fontSize:11,color:C.muted}}>{meta.label}</span></div>
                  : <RadialGauge value={val} max={meta.max} color={meta.color} label={lbl} sub={meta.unit}/>
                }
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MONITORING PAGE
// ══════════════════════════════════════════════════════════════
function MonitoringPage({ env, planInfo, onUpgrade }) {
  const C = useTheme();
  const [tab, setTab] = useState("air");
  const has = m => planInfo.unlocks.metrics.includes(m);
  const active = METRIC_META[tab] ?? METRIC_META.air;
  const curVal = env[tab] ?? active.chart.slice(-1)[0];

  return (
    <>
      <PageHeader title="Monitoramento" sub="Dados históricos e análise detalhada de cada métrica."/>

      {/* BANNER FREE */}
      {!planInfo.unlocks.monitoring && (
        <div style={{ padding:"14px 20px", borderRadius:14, background:C.amberLight, border:`1px solid ${C.amber}`, display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14, color:C.text }}>Monitoramento limitado no plano Free</div><div style={{ fontSize:13, color:C.muted }}>Faça upgrade para ver CO₂, ruído, luz e relatórios completos.</div></div>
          <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Fazer upgrade</button>
        </div>
      )}

      {/* TABS */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(METRIC_META).map(([key,meta]) => {
          const locked = !has(key);
          return (
            <button key={key} onClick={() => !locked && setTab(key)} style={{
              padding:"8px 16px", borderRadius:10, fontWeight:600, fontSize:13,
              border:`1.5px solid ${tab===key&&!locked?meta.color:locked?"dashed":C.border}`,
              borderStyle:locked?"dashed":"solid",
              background:tab===key&&!locked?meta.color:locked?C.cardAlt:C.card,
              color:tab===key&&!locked?"#fff":locked?C.subtext:C.muted,
              cursor:locked?"not-allowed":"pointer", opacity:locked?.6:1, transition:"all .2s",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {meta.icon} {meta.label} {locked && "🔒"}
            </button>
          );
        })}
      </div>

      {/* CHART CARD */}
      <div className="card" style={{ padding:28, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div>
            <h3 style={{ fontWeight:800, fontSize:18, color:C.text }}>{active.icon} {active.label}</h3>
            <p style={{ fontSize:13, color:C.muted }}>Hoje · 08:00 – 20:00 · Atualização contínua</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:38, fontWeight:900, color:active.color, lineHeight:1 }}>
              {curVal}<span style={{ fontSize:16, color:C.muted }}>{active.unit}</span>
            </div>
            <span className={`badge badge-${active.getLabel(curVal)[1]}`}>{active.getLabel(curVal)[0]}</span>
          </div>
        </div>

        {/* FULL SVG CHART */}
        <svg viewBox="0 0 780 200" style={{ width:"100%", height:200 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="fullGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity=".35"/>
              <stop offset="100%" stopColor={active.color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0,1,2,3].map(i => <line key={i} x1="0" x2="780" y1={50*i} y2={50*i} stroke={C.border} strokeWidth="1"/>)}
          {CHART_DATA.labels.map((l,i) => (
            <text key={l} x={(i/(CHART_DATA.labels.length-1))*760+10} y="198" textAnchor="middle" fontSize="11" fill={C.muted}>{l}</text>
          ))}
          {(() => {
            const d = active.chart, max=Math.max(...d), min=Math.min(...d);
            const pts = d.map((v,i) => `${(i/(d.length-1))*760+10},${180-((v-min)/(max-min||1))*165}`).join(" ");
            const [fx] = pts.split(" ")[0].split(",");
            const [lx] = pts.split(" ").slice(-1)[0].split(",");
            return (
              <>
                <polygon points={`${fx},180 ${pts} ${lx},180`} fill="url(#fullGrad)"/>
                <polyline points={pts} fill="none" stroke={active.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {d.map((v,i) => { const x=(i/(d.length-1))*760+10, y=180-((v-min)/(max-min||1))*165; return <circle key={i} cx={x} cy={y} r="5" fill={C.card} stroke={active.color} strokeWidth="2.5"/>; })}
              </>
            );
          })()}
        </svg>
      </div>

      {/* STATS ROW */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }} className="grid-4">
        {[
          { label:"Mínimo", value:Math.min(...active.chart), icon:"⬇️" },
          { label:"Máximo", value:Math.max(...active.chart), icon:"⬆️" },
          { label:"Média",  value:Math.round(active.chart.reduce((a,b)=>a+b,0)/active.chart.length), icon:"📊" },
          { label:"Atual",  value:curVal, icon:"📍" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:"18px 16px", textAlign:"center" }}>
            <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:26, fontWeight:800, color:active.color }}>{s.value}<span style={{ fontSize:12, color:C.muted }}>{active.unit}</span></div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* WEEKLY CHART */}
      <div className="card" style={{ padding:22, marginBottom:20 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>📅 Tendência da Semana</h3>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
          {WEEK_DATA.labels.map((day,i) => {
            const pct = WEEK_DATA.wellness[i]/100;
            const h = Math.round(pct*70);
            const col = pct>=.8?"#22C55E":pct>=.6?"#F59E0B":"#EF4444";
            const isToday = i===4;
            return (
              <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:col }}>{WEEK_DATA.wellness[i]}</div>
                <div style={{ width:"100%", borderRadius:"6px 6px 0 0", background:isToday?col:col+"60", height:h, transition:"height .6s ease", minHeight:4 }}/>
                <div style={{ fontSize:11, color:isToday?C.text:C.muted, fontWeight:isToday?700:400 }}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EVENTOS */}
      <div className="card" style={{ padding:22, position:"relative" }}>
        {!planInfo.unlocks.dailyReport && <LockedOverlay requiredPlan="pro" onUpgrade={onUpgrade}/>}
        <div style={{ opacity:planInfo.unlocks.dailyReport?1:.5 }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>📋 Log de Eventos</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { time:"14:32", msg:"IQA atingiu 82 — nível Excelente", level:"green", icon:"🌿" },
              { time:"13:15", msg:"CO₂ voltou ao nível seguro após ventilação", level:"green", icon:"💨" },
              { time:"12:00", msg:"CO₂ acima de 800ppm — ventilação recomendada", level:"amber", icon:"⚠️" },
              { time:"11:20", msg:"Temperatura subiu para 25°C — levemente quente", level:"amber", icon:"🌡️" },
              { time:"09:30", msg:"Ambiente otimizado — todas as métricas no verde", level:"green", icon:"✅" },
              { time:"08:00", msg:"Monitoramento iniciado com sucesso", level:"blue", icon:"🚀" },
            ].map((e,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 14px", borderRadius:12, background:C.cardAlt }}>
                <span style={{ fontSize:16 }}>{e.icon}</span>
                <span className={`badge badge-${e.level}`}>{e.time}</span>
                <span style={{ fontSize:13, color:C.text, flex:1 }}>{e.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// GOALS PAGE
// ══════════════════════════════════════════════════════════════
function GoalsPage({ env, planInfo, onUpgrade }) {
  const C = useTheme();
  const [goals, setGoals] = useState(GOALS.map(g => ({ ...g, current: env[g.id] ?? g.current })));

  if (!planInfo.unlocks.goals) return (
    <>
      <PageHeader title="Metas de Bem-Estar" sub="Defina e acompanhe metas para o seu ambiente."/>
      <div className="card" style={{ padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
        <h3 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:8 }}>Metas disponíveis no Pro</h3>
        <p style={{ color:C.muted, marginBottom:24 }}>Defina alvos para cada métrica e acompanhe seu progresso com notificações inteligentes.</p>
        <button className="btn btn-primary" onClick={onUpgrade}>Ver planos</button>
      </div>
    </>
  );

  const achievements = [
    { label:"Metas cumpridas hoje", value:goals.filter(g=>Math.abs(g.current-g.target)<=g.target*0.05).length, total:goals.length, color:"#22C55E" },
    { label:"Melhor sequência",     value:"12 dias", color:"#F97316" },
    { label:"Score médio",          value:"78/100",  color:"#3B82F6" },
  ];

  return (
    <>
      <PageHeader title="🎯 Metas de Bem-Estar" sub="Acompanhe e ajuste seus objetivos ambientais."/>

      {/* ACHIEVEMENT STRIP */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {achievements.map(a => (
          <div key={a.label} className="card" style={{ padding:"16px 18px", display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ fontSize:28, fontWeight:900, color:a.color }}>{a.value}</div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.4 }}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* GOALS */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
        {goals.map((g,i) => {
          const pct   = Math.min((g.current/g.target)*100, 120);
          const ok    = Math.abs(g.current-g.target) <= g.target*0.08;
          const over  = g.current > g.target*1.08;
          return (
            <div key={g.id} className="card" style={{ padding:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:g.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{g.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{g.label}</div>
                    <div style={{ fontSize:13, color:C.muted }}>Meta: {g.target}{g.unit} · Atual: {g.current}{g.unit}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {ok && <span className="badge badge-green">✓ No alvo</span>}
                  {over && <span className="badge badge-amber">⚠ Acima</span>}
                  {!ok && !over && <span className="badge badge-blue">Em progresso</span>}
                </div>
              </div>
              <ProgressBar pct={Math.min(pct,100)} color={ok?"#22C55E":over?"#EF4444":g.color} height={8}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:C.muted }}>0{g.unit}</span>
                <span style={{ fontSize:11, fontWeight:700, color:ok?"#22C55E":g.color }}>{Math.round(pct)}% da meta</span>
                <span style={{ fontSize:11, color:C.muted }}>{g.target}{g.unit}</span>
              </div>
              {/* AJUSTE DE META */}
              <div style={{ marginTop:14, display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Ajustar meta:</span>
                <input type="range" min={g.id==="co2"?400:g.id==="temp"?15:g.id==="light"?100:0} max={g.id==="co2"?1000:g.id==="temp"?35:g.id==="light"?800:100}
                  value={g.target} onChange={e => setGoals(gs => gs.map((x,j) => j===i?{...x,target:Number(e.target.value)}:x))}
                  style={{ flex:1, accentColor:g.color }}/>
                <span style={{ fontSize:12, fontWeight:700, color:g.color, minWidth:50, textAlign:"right" }}>{g.target}{g.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BADGES */}
      <div className="card" style={{ padding:22 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>🏆 Conquistas</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {BADGES.map(b => (
            <div key={b.id} className="card-alt" style={{ padding:"16px 14px", textAlign:"center", opacity:b.unlocked?1:.5, border:`1px solid ${b.unlocked?C.green:C.border}` }}>
              <div style={{ fontSize:30, marginBottom:8, filter:b.unlocked?"none":"grayscale(1)" }}>{b.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{b.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4, lineHeight:1.4 }}>{b.desc}</div>
              {b.unlocked && <span className="badge badge-green" style={{ marginTop:8 }}>✓ Desbloqueada</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// ENVIRONMENTS PAGE
// ══════════════════════════════════════════════════════════════
function EnvironmentsPage({ planInfo, onUpgrade }) {
  const C = useTheme();
  const maxEnvs = planInfo.unlocks.environments;
  const [envs, setEnvs] = useState(ENVIRONMENTS);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeEnv, setActiveEnv] = useState(1);
  const active = envs.find(e=>e.id===activeEnv) ?? envs[0];

  const addEnv = () => {
    if (!newName.trim()) return;
    const id = Math.max(...envs.map(e=>e.id))+1;
    setEnvs(es=>[...es,{id,name:newName,icon:"📍",status:"offline",air:0,temp:0,humidity:0}]);
    setNewName(""); setAdding(false);
  };

  const canAdd = maxEnvs===Infinity || envs.length < maxEnvs;

  return (
    <>
      <PageHeader title="🏠 Ambientes" sub={`${envs.filter(e=>e.status==="online").length} ambientes ativos · ${maxEnvs===Infinity?"Ilimitados":maxEnvs} disponíveis no seu plano`}
        right={canAdd ? <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Adicionar</button>
               : <button className="btn btn-ghost btn-sm" onClick={onUpgrade}>🔒 Upgrade para mais ambientes</button>}/>

      {adding && (
        <div className="card" style={{ padding:20, marginBottom:16, border:`2px solid ${C.blue}` }}>
          <h4 style={{ fontWeight:700, color:C.text, marginBottom:12 }}>Novo Ambiente</h4>
          <div style={{ display:"flex", gap:10 }}>
            <input className="input-field" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome do ambiente (ex: Quarto 2)"/>
            <button className="btn btn-primary" onClick={addEnv}>Criar</button>
            <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20 }}>
        {/* ENV LIST */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {envs.map((e,i) => {
            const isLocked = i >= maxEnvs && maxEnvs!==Infinity;
            return (
              <div key={e.id} onClick={() => !isLocked && setActiveEnv(e.id)}
                className="card card-hover"
                style={{ padding:"14px 16px", cursor:isLocked?"not-allowed":"pointer", opacity:isLocked?.5:1,
                  border:`1.5px solid ${activeEnv===e.id?C.blue:C.border}`, background:activeEnv===e.id?C.blueLight:C.card }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:20 }}>{e.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:activeEnv===e.id?C.blue:C.text }}>{e.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{isLocked?"🔒 Bloqueado":e.status==="online"?"● Online":"○ Offline"}</div>
                    </div>
                  </div>
                  {e.status==="online" && !isLocked && (
                    <span className={`badge badge-${getAirLabel(e.air)[1]}`}>{e.air}</span>
                  )}
                </div>
              </div>
            );
          })}
          {!canAdd && (
            <div className="card-alt" style={{ padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>Limite do plano atingido</div>
              <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Fazer upgrade</button>
            </div>
          )}
        </div>

        {/* ENV DETAIL */}
        <div>
          {active.status==="online" ? (
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
                <span style={{ fontSize:28 }}>{active.icon}</span>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:18, color:C.text }}>{active.name}</h3>
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>
                    <span className="badge badge-green">● Online</span>
                    <span className={`badge badge-${getAirLabel(active.air)[1]}`}>Ar {getAirLabel(active.air)[0]}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[
                  { icon:"🌿", label:"Qualidade do Ar", value:active.air,      unit:"IQA",  color:"#22C55E" },
                  { icon:"🌡️", label:"Temperatura",     value:active.temp,     unit:"°C",   color:"#3B82F6" },
                  { icon:"💧", label:"Umidade",          value:active.humidity, unit:"%",    color:"#8B5CF6" },
                ].map(m => (
                  <div key={m.label} className="card-alt" style={{ padding:"16px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
                    <div style={{ fontSize:24, fontWeight:800, color:m.color }}>{m.value}<span style={{ fontSize:11, color:C.muted }}>{m.unit}</span></div>
                    <div style={{ fontSize:11, color:C.muted }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <Sparkline data={CHART_DATA.air} color="#22C55E" height={80}/>
            </div>
          ) : (
            <div className="card" style={{ padding:40, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📡</div>
              <h4 style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Ambiente offline</h4>
              <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>Configure um sensor Atmos neste ambiente para começar o monitoramento.</p>
              <button className="btn btn-primary">Conectar sensor</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// REPORTS PAGE
// ══════════════════════════════════════════════════════════════
function ReportsPage({ planInfo, onUpgrade }) {
  const C = useTheme();
  const [period, setPeriod] = useState("week");

  if (!planInfo.unlocks.dailyReport) return (
    <>
      <PageHeader title="Relatórios" sub="Análises completas do seu ambiente."/>
      <div className="card" style={{ padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
        <h3 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:8 }}>Relatórios disponíveis no Pro</h3>
        <p style={{ color:C.muted, marginBottom:24 }}>Tenha acesso a relatórios diários e semanais detalhados com insights personalizados.</p>
        <button className="btn btn-primary" onClick={onUpgrade}>Ver planos</button>
      </div>
    </>
  );

  const periodData = {
    week:  { labels:WEEK_DATA.labels, wellness:WEEK_DATA.wellness },
    month: { labels:["S1","S2","S3","S4"], wellness:[74,79,71,82] },
  };
  const pd = periodData[period];

  return (
    <>
      <PageHeader title="📋 Relatórios" sub="Análise completa do seu bem-estar ambiental."
        right={
          <div style={{ display:"flex", gap:8, background:C.card, padding:4, borderRadius:12, border:`1px solid ${C.border}` }}>
            {["week","month"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding:"6px 16px", borderRadius:9, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", background:period===p?"#3B82F6":"transparent", color:period===p?"#fff":C.muted, transition:"all .2s" }}>
                {p==="week"?"Semana":"Mês"}
              </button>
            ))}
          </div>
        }
      />

      {/* SUMMARY CARDS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="grid-4">
        {[
          { icon:"🌿", label:"IQA Médio",       value:"76",    unit:"",    trend:"+3", color:"#22C55E" },
          { icon:"💨", label:"CO₂ Médio",        value:"618",   unit:"ppm", trend:"-12",color:"#F59E0B" },
          { icon:"🌡️", label:"Temp. Média",     value:"22.4",  unit:"°C",  trend:"0",  color:"#3B82F6" },
          { icon:"⭐", label:"Score Médio",      value:"79",    unit:"%",   trend:"+5", color:"#8B5CF6" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:"18px 16px" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}<span style={{ fontSize:12, color:C.muted }}>{s.unit}</span></div>
            <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
            <div style={{ fontSize:11, fontWeight:700, color:s.trend.startsWith("+")?C.green:s.trend.startsWith("-")?"#22C55E":C.muted, marginTop:4 }}>
              {s.trend.startsWith("+")||s.trend.startsWith("-") ? `${s.trend} vs período anterior` : "Estável"}
            </div>
          </div>
        ))}
      </div>

      {/* WELLNESS CHART */}
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:20 }}>📊 Score de Bem-Estar — {period==="week"?"Semana":"Mês"}</h3>
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100 }}>
          {pd.labels.map((l,i) => {
            const v = pd.wellness[i], pct = v/100, col = pct>=.8?"#22C55E":pct>=.6?"#F59E0B":"#EF4444";
            const isLast = i===pd.labels.length-1;
            return (
              <div key={l} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:col }}>{v}</div>
                <div style={{ width:"100%", background:isLast?col:col+"70", borderRadius:"6px 6px 0 0", height:Math.round(pct*80), minHeight:4, transition:"height .6s" }}/>
                <div style={{ fontSize:11, color:isLast?C.text:C.muted, fontWeight:isLast?700:400 }}>{l}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="card" style={{ padding:22, marginBottom:20 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>💡 Insights do Período</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { icon:"🌿", text:"Qualidade do ar melhorou 8% em relação à semana passada. Continue ventilando!", color:"#22C55E" },
            { icon:"⏰", text:"Seu ambiente tende a ter CO₂ mais alto das 12h às 14h. Ventile nesse horário.", color:"#F59E0B" },
            { icon:"🌡️", text:"Temperatura dentro do ideal em 85% do tempo. Excelente regulação!", color:"#3B82F6" },
            { icon:"📈", text:"Score de bem-estar aumentou 5 pontos. Você está no caminho certo!", color:"#8B5CF6" },
          ].map((ins,i) => (
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 16px", borderRadius:12, background:ins.color+"12", borderLeft:`3px solid ${ins.color}` }}>
              <span style={{ fontSize:20 }}>{ins.icon}</span>
              <span style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORT */}
      <div className="card" style={{ padding:22 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>📤 Exportar Relatório</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-secondary">📄 Exportar PDF</button>
          <button className="btn btn-secondary">📊 Exportar CSV</button>
          <button className="btn btn-secondary">📧 Enviar por E-mail</button>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PLANS PAGE (authenticated)
// ══════════════════════════════════════════════════════════════
function PlansPage({ user, onChangePlan }) {
  const C = useTheme();
  const [annual, setAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(user?.plan ?? "free");
  const [confirming, setConfirming] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => setCurrentPlan(user?.plan ?? "free"), [user?.plan]);

  const handleConfirm = (planId) => {
    setCurrentPlan(planId); setConfirming(null); setSuccess(planId);
    onChangePlan?.(planId);
    setTimeout(() => setSuccess(null), 3500);
  };

  const getPrice = (plan) => {
    if (plan.monthlyPrice===0) return { main:"Grátis", period:null, note:null, was:null };
    if (annual) {
      const disc  = Math.round(plan.monthlyPrice*0.8);
      const total = disc*12;
      const save  = plan.monthlyPrice*12-total;
      return { main:`R$ ${disc}`, period:"/mês", note:`R$ ${total}/ano — economize R$ ${save}`, was:`R$ ${plan.monthlyPrice}/mês` };
    }
    return { main:`R$ ${plan.monthlyPrice}`, period:"/mês", note:`ou R$ ${Math.round(plan.monthlyPrice*0.8)*12}/ano (−20%)`, was:null };
  };

  const myIdx = PLANS.findIndex(p=>p.id===currentPlan);

  return (
    <>
      <PageHeader title="💳 Planos & Preços" sub="Troque quando quiser. Sem multa, sem burocracia." center/>

      {/* TOGGLE */}
      <div style={{ display:"flex", justifyContent:"center", gap:12, alignItems:"center", marginBottom:40 }}>
        <span style={{ fontSize:14, fontWeight:600, color:annual?C.muted:C.text }}>Mensal</span>
        <Toggle checked={annual} onChange={setAnnual}/>
        <span style={{ fontSize:14, fontWeight:600, color:annual?C.text:C.muted }}>
          Anual <span className="badge badge-green" style={{ marginLeft:4 }}>−20%</span>
        </span>
      </div>

      <div className="grid-plans" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, alignItems:"start" }}>
        {PLANS.map((plan,idx) => {
          const price      = getPrice(plan);
          const isCurrent  = currentPlan===plan.id;
          const isConfirm  = confirming===plan.id;
          const isSuccess  = success===plan.id;
          const isUpgrade  = !isCurrent && idx > myIdx;
          const isDowngrade= !isCurrent && idx < myIdx;

          return (
            <div key={plan.id} style={{
              background:C.card, borderRadius:24, padding:"28px 24px", position:"relative",
              border: isCurrent ? `2px solid ${plan.color}` : plan.popular&&!isCurrent ? `2px solid #3B82F6` : `1px solid ${C.border}`,
              boxShadow: isCurrent ? `0 8px 40px ${plan.color}30` : plan.popular&&!isCurrent ? "0 8px 40px rgba(59,130,246,.18)" : "none",
              transform: plan.popular&&!isCurrent ? "translateY(-10px)" : "none",
              transition:"all .35s",
            }}>
              {isCurrent && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)" }}><span className="badge badge-green" style={{ padding:"5px 14px", whiteSpace:"nowrap" }}>✓ Plano atual</span></div>}
              {plan.popular&&!isCurrent && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)" }}><span className="badge badge-blue" style={{ padding:"5px 14px" }}>⭐ Mais popular</span></div>}

              {/* ICON + NAME */}
              <div style={{ width:48, height:48, borderRadius:14, background:plan.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:14 }}>{plan.icon}</div>
              <h3 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:10 }}>{plan.name}</h3>

              {/* PRICE */}
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontSize:36, fontWeight:900, color:plan.color, lineHeight:1 }}>{price.main}</span>
                  {price.period && <span style={{ fontSize:14, color:C.muted }}>{price.period}</span>}
                </div>
                {price.note && <p style={{ fontSize:12, color:annual?"#16A34A":C.muted, marginTop:4, fontWeight:annual?600:400 }}>{price.note}</p>}
                {price.was && <p style={{ fontSize:12, color:C.subtext, textDecoration:"line-through", marginTop:2 }}>{price.was}</p>}
              </div>

              {/* FEATURES */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ color:plan.color, fontWeight:700, marginTop:1, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isCurrent ? (
                <button disabled className="btn" style={{ width:"100%", padding:"12px 0", borderRadius:12, fontWeight:700, background:plan.color+"18", color:plan.color, border:`1.5px solid ${plan.color}` }}>✓ Plano Atual</button>
              ) : isSuccess ? (
                <button disabled className="btn btn-green" style={{ width:"100%", padding:"12px 0", borderRadius:12, fontWeight:700 }}>✓ Alterado com sucesso!</button>
              ) : isConfirm ? (
                <div style={{ background:C.cardAlt, borderRadius:12, padding:14, border:`1px solid ${C.border}` }}>
                  <p style={{ fontSize:13, color:C.text, marginBottom:12, lineHeight:1.5 }}>
                    {isUpgrade?"🚀 Fazer upgrade":"⬇️ Mudar"} para o plano <strong style={{color:plan.color}}>{plan.name}</strong>?
                  </p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => handleConfirm(plan.id)}>Confirmar</button>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => setConfirming(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button className="btn" style={{
                  width:"100%", padding:"12px 0", borderRadius:12, fontWeight:700,
                  background: isUpgrade ? `linear-gradient(135deg,${plan.color},${plan.color}CC)` : "transparent",
                  color: isUpgrade ? "#fff" : plan.color,
                  border: isUpgrade ? "none" : `1.5px solid ${plan.color}`,
                  boxShadow: isUpgrade ? `0 4px 16px ${plan.color}44` : "none",
                }} onClick={() => setConfirming(plan.id)}>
                  {isUpgrade ? `⬆️ Upgrade para ${plan.name}` : `⬇️ Mudar para ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* COMPARISON TABLE */}
      <div className="card" style={{ padding:24, marginTop:32 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:18 }}>📋 Comparação completa</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.border}` }}>
                <th style={{ textAlign:"left", padding:"10px 12px", color:C.muted, fontWeight:700 }}>Recurso</th>
                {PLANS.map(p => <th key={p.id} style={{ textAlign:"center", padding:"10px 12px", color:p.color, fontWeight:800 }}>{p.icon} {p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Ambientes monitorados", "1", "5", "Ilimitado"],
                ["Métricas disponíveis", "2 (ar, temp)", "6 completas", "6 completas"],
                ["Sugestões inteligentes", "1 básica", "6 completas", "6 completas"],
                ["Alertas em tempo real", "✗", "✓", "✓"],
                ["Metas de bem-estar", "✗", "✓", "✓"],
                ["Modo Foco", "✗", "✓", "✓"],
                ["Relatórios diários", "✗", "✓", "✓"],
                ["API de integração", "✗", "✓", "✓"],
                ["IA preditiva", "✗", "✗", "✓"],
                ["Automação residencial", "✗", "✗", "✓"],
                ["Suporte", "Email", "Email + Chat", "24/7 Prioritário"],
              ].map(([feat,...vals]) => (
                <tr key={feat} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"10px 12px", color:C.text, fontWeight:500 }}>{feat}</td>
                  {vals.map((v,i) => (
                    <td key={i} style={{ textAlign:"center", padding:"10px 12px", color:v==="✓"?"#22C55E":v==="✗"?C.subtext:C.text, fontWeight:v==="✓"||v==="✗"?700:400 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ textAlign:"center", color:C.muted, fontSize:13, marginTop:20 }}>
        🔒 Pagamento seguro · Troca instantânea · Cancele quando quiser · Sem fidelidade
      </p>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PLANS (PUBLIC - standalone)
// ══════════════════════════════════════════════════════════════
function PlansPagePublic({ onNav }) {
  const C = useTheme();
  const [annual, setAnnual] = useState(false);

  const getPrice = (plan) => {
    if (plan.monthlyPrice===0) return { main:"Grátis", period:null, note:null };
    if (annual) {
      const disc=Math.round(plan.monthlyPrice*0.8), total=disc*12, save=plan.monthlyPrice*12-total;
      return { main:`R$ ${disc}`, period:"/mês", note:`R$ ${total}/ano — economize R$ ${save}` };
    }
    return { main:`R$ ${plan.monthlyPrice}`, period:"/mês", note:`ou R$ ${Math.round(plan.monthlyPrice*0.8)*12}/ano (−20%)` };
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"40px 24px 80px" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}><LogoBtn user={null} onNav={onNav}/></div>
        <PageHeader title="Planos & Preços" sub="Escolha o plano ideal para o seu ambiente." center/>

        <div style={{ display:"flex", justifyContent:"center", gap:12, alignItems:"center", marginBottom:40 }}>
          <span style={{ fontSize:14, fontWeight:600, color:annual?C.muted:C.text }}>Mensal</span>
          <Toggle checked={annual} onChange={setAnnual}/>
          <span style={{ fontSize:14, fontWeight:600, color:annual?C.text:C.muted }}>Anual <span className="badge badge-green" style={{marginLeft:4}}>−20%</span></span>
        </div>

        <div className="grid-plans" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, alignItems:"start", marginBottom:32 }}>
          {PLANS.map((plan,idx) => {
            const price = getPrice(plan);
            return (
              <div key={plan.id} style={{ background:C.card, borderRadius:24, padding:"28px 24px", position:"relative", border:plan.popular?`2px solid #3B82F6`:`1px solid ${C.border}`, boxShadow:plan.popular?"0 8px 40px rgba(59,130,246,.18)":"none", transform:plan.popular?"translateY(-10px)":"none", transition:"all .3s" }}>
                {plan.popular && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)" }}><span className="badge badge-blue" style={{ padding:"5px 14px" }}>⭐ Mais popular</span></div>}
                <div style={{ width:48, height:48, borderRadius:14, background:plan.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:14 }}>{plan.icon}</div>
                <h3 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>{plan.name}</h3>
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:34, fontWeight:900, color:plan.color, lineHeight:1 }}>{price.main}</span>
                    {price.period && <span style={{ fontSize:14, color:C.muted }}>{price.period}</span>}
                  </div>
                  {price.note && <p style={{ fontSize:12, color:annual?"#16A34A":C.muted, marginTop:4, fontWeight:annual?600:400 }}>{price.note}</p>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:"flex", gap:8 }}>
                      <span style={{ color:plan.color, fontWeight:700, flexShrink:0 }}>✓</span>
                      <span style={{ fontSize:13, color:C.text }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className={plan.popular?"btn btn-primary":"btn btn-secondary"} style={{ width:"100%", padding:"12px 0", borderRadius:12, fontWeight:700 }} onClick={() => onNav("signup")}>
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:"center" }}>
          <button className="btn btn-ghost" onClick={() => onNav("landing")}>← Voltar para a Home</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════
function ProfilePage({ user, planInfo, addToast }) {
  const C = useTheme();
  const [form, setForm] = useState({
    name:  user?.name  || "Natalie Costa",
    email: user?.email || "natalie@atmos.io",
    bio:   "Apaixonada por tecnologia, bem-estar e ambientes inteligentes.",
    city:  "São Paulo, SP",
    phone: "(11) 99999-0000",
  });
  const [tab, setTab] = useState("info");
  const set = k => e => setForm(f => ({...f, [k]:e.target.value}));
  const save = () => { LS.set("atmos_user", { ...user, name:form.name, email:form.email }); addToast({ icon:"✅", title:"Perfil salvo!", sub:"Suas informações foram atualizadas.", color:"#22C55E" }); };

  return (
    <>
      <PageHeader title="👤 Perfil" sub="Gerencie sua conta e preferências."/>

      {/* PROFILE CARD */}
      <div className="card" style={{ padding:28, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:80, height:80, borderRadius:99, background:`linear-gradient(135deg,#3B82F6,#8B5CF6)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:32, flexShrink:0, boxShadow:"0 8px 24px rgba(59,130,246,.4)" }}>
            {form.name[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.text }}>{form.name}</h2>
            <p style={{ color:C.muted, fontSize:14 }}>{form.city}</p>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              <span className="badge" style={{ background:planInfo.color+"22", color:planInfo.color }}>{planInfo.icon} Plano {planInfo.name}</span>
              <span className="badge badge-green">🔥 12 dias de sequência</span>
              <span className="badge badge-purple">🏆 3 conquistas</span>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <WellnessScore score={79}/>
            <div style={{ fontSize:12, color:C.muted }}>Score médio</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:8, marginBottom:20, background:C.card, padding:4, borderRadius:14, border:`1px solid ${C.border}`, width:"fit-content" }}>
        {[{id:"info",label:"Informações"},{id:"stats",label:"Estatísticas"},{id:"security",label:"Segurança"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"8px 20px", borderRadius:10, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", background:tab===t.id?"#3B82F6":"transparent", color:tab===t.id?"#fff":C.muted, transition:"all .2s" }}>{t.label}</button>
        ))}
      </div>

      {tab==="info" && (
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              {label:"Nome completo",key:"name", type:"text"},
              {label:"E-mail",       key:"email",type:"email"},
              {label:"Cidade",       key:"city", type:"text"},
              {label:"Telefone",     key:"phone",type:"tel"},
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input className="input-field" type={f.type} value={form[f.key]} onChange={set(f.key)}/>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="label">Bio</label>
            <textarea className="input-field" value={form.bio} onChange={set("bio")}/>
          </div>
          <button className="btn btn-primary" onClick={save}>Salvar alterações</button>
        </div>
      )}

      {tab==="stats" && (
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
            {[
              {icon:"📅",label:"Dias monitorados",value:"28",color:"#3B82F6"},
              {icon:"🔔",label:"Sugestões recebidas",value:"142",color:"#22C55E"},
              {icon:"🎯",label:"Metas cumpridas",value:"89%",color:"#8B5CF6"},
              {icon:"⭐",label:"Score médio",value:"79/100",color:"#F59E0B"},
              {icon:"🔥",label:"Maior sequência",value:"18 dias",color:"#F97316"},
              {icon:"🏆",label:"Conquistas",value:"3/6",color:"#EF4444"},
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", padding:18, background:C.cardAlt, borderRadius:14 }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h4 style={{ fontWeight:700, color:C.text, marginBottom:12 }}>Histórico de Atividade</h4>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {Array.from({length:35},(_,i) => {
              const v = Math.random();
              const col = v>.7?"#22C55E":v>.4?"#86EFAC":"#DCFCE7";
              return <div key={i} style={{ width:16, height:16, borderRadius:4, background:col, title:`Dia ${i+1}` }}/>;
            })}
          </div>
        </div>
      )}

      {tab==="security" && (
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label className="label">Senha atual</label>
              <input className="input-field" type="password" placeholder="••••••••"/>
            </div>
            <div>
              <label className="label">Nova senha</label>
              <input className="input-field" type="password" placeholder="Mínimo 8 caracteres"/>
            </div>
            <div>
              <label className="label">Confirmar nova senha</label>
              <input className="input-field" type="password" placeholder="Repita a nova senha"/>
            </div>
            <button className="btn btn-primary" style={{ alignSelf:"flex-start" }}>Atualizar senha</button>
            <Divider label="Zona de perigo"/>
            <div className="card-alt" style={{ padding:16, border:`1px solid ${C.red}` }}>
              <h4 style={{ fontWeight:700, color:C.red, marginBottom:6 }}>Excluir conta</h4>
              <p style={{ fontSize:13, color:C.muted, marginBottom:12 }}>Esta ação é irreversível. Todos os seus dados serão permanentemente deletados.</p>
              <button className="btn btn-danger btn-sm">⚠️ Excluir minha conta</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════
function SettingsPage({ themeMode, setThemeMode, addToast }) {
  const C = useTheme();
  const [notif, setNotif] = useState({ push:true, email:false, weekly:true, co2:true, temp:false });
  const [interval, setInterval_] = useState("5");
  const [units, setUnits] = useState("metric");
  const [lang, setLang] = useState("pt-BR");

  const save = () => addToast({ icon:"✅", title:"Configurações salvas!", sub:"Suas preferências foram atualizadas.", color:"#22C55E" });

  return (
    <>
      <PageHeader title="⚙️ Configurações" sub="Personalize sua experiência Atmos."
        right={<button className="btn btn-primary btn-sm" onClick={save}>Salvar tudo</button>}/>

      {/* APARÊNCIA */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:6 }}>🎨 Aparência</h3>
        <p style={{ fontSize:13, color:C.muted, marginBottom:18 }}>
          {themeMode==="auto" ? `Automático — seguindo o sistema (${C.dark?"escuro":"claro"} agora)` : `Tema ${themeMode==="dark"?"escuro":"claro"} fixo`}
        </p>
        <div style={{ display:"flex", gap:12 }}>
          {[{id:"light",icon:"☀️",label:"Claro"},{id:"dark",icon:"🌙",label:"Escuro"},{id:"auto",icon:"⚙️",label:"Sistema"}].map(t => (
            <button key={t.id} onClick={() => setThemeMode(t.id)} style={{
              flex:1, padding:"16px 12px", borderRadius:14,
              border: themeMode===t.id ? `2px solid #3B82F6` : `1.5px solid ${C.border}`,
              background: themeMode===t.id ? C.blueLight : C.card,
              color: themeMode===t.id ? "#3B82F6" : C.muted,
              fontWeight:700, fontSize:13, cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all .2s",
            }}>
              <span style={{ fontSize:26 }}>{t.icon}</span>
              {t.label}
              {themeMode===t.id && <span style={{ fontSize:10, background:"#3B82F6", color:"#fff", padding:"2px 10px", borderRadius:99 }}>Ativo</span>}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICAÇÕES */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:20 }}>🔔 Notificações</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {[
            {key:"push",   label:"Notificações push",  desc:"Alertas em tempo real no celular",              color:"#3B82F6"},
            {key:"email",  label:"Resumo por e-mail",   desc:"Relatório diário enviado às 8h",               color:"#22C55E"},
            {key:"weekly", label:"Relatório semanal",   desc:"Análise completa toda segunda-feira às 9h",    color:"#8B5CF6"},
            {key:"co2",    label:"Alerta de CO₂",       desc:"Notificar quando CO₂ ultrapassar 800ppm",      color:"#F59E0B"},
            {key:"temp",   label:"Alerta de temperatura",desc:"Notificar quando sair da faixa 18-26°C",      color:"#EF4444"},
          ].map((n,i,arr) => (
            <div key={n.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:8, height:8, borderRadius:99, background:n.color, marginTop:1 }}/>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:C.text }}>{n.label}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{n.desc}</div>
                </div>
              </div>
              <Toggle checked={notif[n.key]} onChange={v => setNotif(x=>({...x,[n.key]:v}))} color={n.color}/>
            </div>
          ))}
        </div>
      </div>

      {/* MONITORAMENTO */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:20 }}>📡 Monitoramento</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <label className="label">Intervalo de atualização</label>
            <select className="input-field" value={interval} onChange={e=>setInterval_(e.target.value)}>
              <option value="1">A cada 1 minuto</option>
              <option value="5">A cada 5 minutos</option>
              <option value="15">A cada 15 minutos</option>
              <option value="30">A cada 30 minutos</option>
            </select>
          </div>
          <div>
            <label className="label">Unidades</label>
            <select className="input-field" value={units} onChange={e=>setUnits(e.target.value)}>
              <option value="metric">Métrico (°C, km)</option>
              <option value="imperial">Imperial (°F, mi)</option>
            </select>
          </div>
          <div>
            <label className="label">Idioma</label>
            <select className="input-field" value={lang} onChange={e=>setLang(e.target.value)}>
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* INTEGRAÇÕES */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>🔌 Integrações</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            {icon:"🏠",name:"Google Home",    desc:"Controle dispositivos pelo Atmos", connected:false, color:"#EF4444"},
            {icon:"🔊",name:"Amazon Alexa",   desc:"Voice commands para o ambiente",   connected:false, color:"#3B82F6"},
            {icon:"📱",name:"Apple HomeKit",  desc:"Integração com o ecossistema Apple",connected:false,color:"#333"},
            {icon:"📊",name:"Google Sheets",  desc:"Exportar dados automaticamente",   connected:true,  color:"#22C55E"},
          ].map((int,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderRadius:14, background:C.cardAlt, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:int.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{int.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:C.text }}>{int.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{int.desc}</div>
                </div>
              </div>
              <button className={int.connected?"btn btn-danger btn-sm":"btn btn-secondary btn-sm"}>{int.connected?"Desconectar":"Conectar"}</button>
            </div>
          ))}
        </div>
      </div>

      {/* DADOS E PRIVACIDADE */}
      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>🔐 Dados & Privacidade</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button className="btn btn-secondary" style={{ justifyContent:"flex-start" }}>📤 Exportar todos os meus dados</button>
          <button className="btn btn-secondary" style={{ justifyContent:"flex-start" }}>📋 Ver política de privacidade</button>
          <button className="btn btn-secondary" style={{ justifyContent:"flex-start" }}>🍪 Gerenciar cookies</button>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════
function Landing({ onNav }) {
  const C = useTheme();
  const [faqOpen, setFaqOpen] = useState(null);

  const faqs = [
    { q:"O Atmos funciona sem sensores físicos?", a:"Sim! Você pode usar o app com dados simulados para experimentar. Para monitoramento real, conecte sensores compatíveis." },
    { q:"Posso usar em mais de um ambiente?", a:"No plano Free você monitora 1 ambiente. No Pro são 5, e no Premium são ilimitados." },
    { q:"Como funciona a automação residencial?", a:"No plano Premium, conectamos ao Google Home, Alexa e Apple HomeKit para controlar dispositivos automaticamente com base nas métricas do ambiente." },
    { q:"Meus dados são seguros?", a:"Sim. Todos os dados são criptografados em trânsito e em repouso. Somos 100% conformes com a LGPD." },
    { q:"Posso cancelar a qualquer momento?", a:"Sim! Sem multa, sem período mínimo de fidelidade. Cancele em 1 clique nas configurações." },
  ];

  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      {/* NAVBAR */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:C.dark?"rgba(11,17,32,.92)":"rgba(240,244,255,.92)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <LogoBtn user={null} onNav={onNav}/>
          <nav style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("plans")}>Planos</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("login")}>Entrar</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav("signup")}>Começar grátis →</button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"80px 24px 40px", textAlign:"center" }} className="fade-up">
        <div className="badge badge-green" style={{ marginBottom:20, fontSize:13, padding:"6px 16px" }}>
          🌿 Monitoramento em tempo real · Gratuito para começar
        </div>
        <h1 style={{ fontSize:"clamp(40px,6vw,76px)", fontWeight:900, lineHeight:1.05, letterSpacing:"-.03em", marginBottom:24, color:C.text }}>
          Respire melhor.<br/>
          <span style={{ background:"linear-gradient(135deg,#3B82F6 0%,#8B5CF6 50%,#22C55E 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Produza mais.
          </span>
        </h1>
        <p style={{ fontSize:"clamp(16px,2.2vw,20px)", color:C.muted, maxWidth:580, margin:"0 auto 40px", lineHeight:1.75 }}>
          O Atmos monitora qualidade do ar, CO₂, temperatura e umidade em tempo real — e transforma esses dados em ações que melhoram sua produtividade e bem-estar.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav("signup")}>Criar conta grátis →</button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav("login")}>Ver demo</button>
        </div>
        <p style={{ fontSize:13, color:C.subtext }}>✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Configuração em 2 minutos &nbsp;·&nbsp; ✓ Cancele quando quiser</p>
      </section>

      {/* HERO MOCKUP */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"0 24px 80px" }}>
        <div className="card" style={{ padding:0, overflow:"hidden", boxShadow:"0 32px 80px rgba(30,60,120,.18)" }}>
          {/* WINDOW BAR */}
          <div style={{ background:C.dark?"rgba(59,130,246,.1)":"rgba(59,130,246,.06)", padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
            {["#FC5A5A","#FFBD44","#00CA4E"].map(c => <div key={c} style={{width:12,height:12,borderRadius:99,background:c}}/>)}
            <span style={{ marginLeft:8, fontSize:12, color:C.muted }}>Atmos · Dashboard</span>
          </div>
          {/* DEMO CONTENT */}
          <div style={{ padding:"24px 24px 20px" }}>
            {/* METRICS ROW */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:20 }}>
              {Object.entries(METRIC_META).map(([k,m]) => {
                const v = BASE_ENV[k] ?? m.chart.slice(-1)[0];
                return (
                  <div key={k} style={{ background:C.cardAlt, borderRadius:14, padding:"14px 10px", textAlign:"center", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{m.icon}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:m.color }}>{v}</div>
                    <div style={{ fontSize:9, color:C.muted }}>{m.unit}</div>
                    <div style={{ fontSize:9, fontWeight:700, color:m.color, marginTop:3 }}>{m.label.split(" ")[0]}</div>
                  </div>
                );
              })}
            </div>
            {/* CHART PREVIEW */}
            <div style={{ background:C.cardAlt, borderRadius:14, padding:"14px 16px", border:`1px solid ${C.border}` }}>
              <Sparkline data={CHART_DATA.air} color="#22C55E" height={60}/>
            </div>
          </div>
          {/* SUGGESTIONS */}
          <div style={{ padding:"0 24px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {SUGGESTIONS.slice(0,2).map((s,i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:12, background:s.level==="success"?C.greenLight:C.blueLight }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{s.title}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 80px" }}>
        <h2 style={{ textAlign:"center", fontSize:"clamp(28px,4vw,44px)", fontWeight:800, marginBottom:14, color:C.text, letterSpacing:"-.02em" }}>Por que o Atmos?</h2>
        <p style={{ textAlign:"center", color:C.muted, marginBottom:48, fontSize:16, maxWidth:500, margin:"0 auto 48px" }}>Tudo que você precisa para transformar seu ambiente de trabalho.</p>
        <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {[
            {icon:"🧠",title:"Sugestões com IA",       desc:"Dicas personalizadas baseadas no seu padrão de uso e nas condições do ambiente.",color:"#3B82F6"},
            {icon:"📊",title:"6 Métricas em Tempo Real",desc:"Qualidade do ar, CO₂, temperatura, umidade, ruído e luminosidade com updates a cada segundo.",color:"#22C55E"},
            {icon:"🎯",title:"Metas de Bem-Estar",      desc:"Defina objetivos para cada métrica e acompanhe seu progresso diariamente.",color:"#8B5CF6"},
            {icon:"🏠",title:"Automação Residencial",   desc:"Conecte ao Google Home, Alexa e outros para automatizar seu ambiente perfeito.",color:"#F97316"},
            {icon:"🔔",title:"Alertas Inteligentes",    desc:"Receba notificações imediatas quando algo sair do ideal antes de impactar você.",color:"#EF4444"},
            {icon:"📋",title:"Relatórios Detalhados",   desc:"Análises semanais e mensais com insights de tendências e evolução do seu ambiente.",color:"#F59E0B"},
            {icon:"🎮",title:"Gamificação",              desc:"Conquistas, sequências e badges que tornam o cuidado com o ambiente divertido.",color:"#22C55E"},
            {icon:"📱",title:"Mobile First",             desc:"Interface projetada primeiro para mobile. Acesse de qualquer dispositivo.",color:"#3B82F6"},
            {icon:"🔒",title:"Privacidade Total",        desc:"LGPD compliant. Seus dados são seus. Criptografia de ponta a ponta.",color:"#8B5CF6"},
          ].map(f => (
            <div key={f.title} className="card card-hover" style={{ padding:24 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:f.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:8, color:C.text }}>{f.title}</h3>
              <p style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ background:C.dark?"rgba(59,130,246,.06)":"rgba(59,130,246,.04)", padding:"64px 24px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", gap:56, flexWrap:"wrap", marginBottom:48 }}>
            {[["15.000+","usuários ativos"],["98%","satisfação"],["6","métricas monitoradas"],["< 2s","atualização"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontSize:40, fontWeight:900, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
                <div style={{ fontSize:14, color:C.muted }}>{l}</div>
              </div>
            ))}
          </div>
          {/* TESTIMONIALS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              {name:"Ana Lima",  role:"Designer UX",      text:"O Atmos mudou minha rotina. Agora sei exatamente quando devo ventilar o escritório.",       stars:5},
              {name:"Pedro S.",  role:"Dev Backend",      text:"CO₂ alto era meu grande inimigo de produtividade. Com o Atmos, resolvido!",                 stars:5},
            ].map((t,i) => (
              <div key={i} className="card" style={{ padding:20, textAlign:"left" }}>
                <div style={{ color:"#F59E0B", fontSize:14, marginBottom:8 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize:13, color:C.text, lineHeight:1.6, marginBottom:12 }}>"{t.text}"</p>
                <div style={{ fontSize:12, fontWeight:700, color:C.muted }}>{t.name} · {t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth:700, margin:"0 auto", padding:"80px 24px" }}>
        <h2 style={{ textAlign:"center", fontSize:36, fontWeight:800, marginBottom:40, color:C.text }}>Perguntas frequentes</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {faqs.map((faq,i) => (
            <div key={i} className="card" style={{ padding:0, overflow:"hidden" }}>
              <button onClick={() => setFaqOpen(faqOpen===i?null:i)} style={{ width:"100%", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{faq.q}</span>
                <span style={{ fontSize:20, color:C.muted, transition:"transform .3s", transform:faqOpen===i?"rotate(45deg)":"none" }}>+</span>
              </button>
              {faqOpen===i && (
                <div className="fade-in" style={{ padding:"0 20px 16px", fontSize:14, color:C.muted, lineHeight:1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth:700, margin:"0 auto", padding:"0 24px 80px", textAlign:"center" }}>
        <div className="card" style={{ padding:"48px 40px", background:`linear-gradient(135deg,${C.dark?"#0D2040":"#EBF0FF"},${C.dark?"#1A0D35":"#F5F2FF"})`, border:`1px solid ${C.blueLight}` }}>
          <h2 style={{ fontSize:"clamp(28px,4vw,40px)", fontWeight:800, marginBottom:14, color:C.text }}>Comece a respirar melhor hoje.</h2>
          <p style={{ color:C.muted, marginBottom:28, fontSize:15 }}>Grátis para sempre no plano básico. Sem cartão de crédito.</p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav("signup")} style={{ fontSize:17, padding:"16px 48px" }}>
            Criar minha conta grátis →
          </button>
        </div>
      </section>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"32px 24px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16, alignItems:"center" }}>
          <LogoMark size={28}/>
          <span style={{ fontSize:16, fontWeight:800, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Atmos</span>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:16, flexWrap:"wrap" }}>
          {["Privacidade","Termos","Segurança","LGPD","Status","Blog"].map(l => (
            <a key={l} href="#" onClick={e=>e.preventDefault()} style={{ fontSize:13, color:C.muted }}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:12, color:C.subtext }}>© 2025 Atmos · Todos os direitos reservados · Feito com 💙 em São Paulo, Brasil</p>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AUTH PAGES
// ══════════════════════════════════════════════════════════════
function AuthLayout({ title, sub, children, onNav }) {
  const C = useTheme();
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, transition:"background .3s" }}>
      <div style={{ width:"100%", maxWidth:420 }} className="fade-up">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <button onClick={() => onNav("landing")} style={{ display:"inline-flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", marginBottom:24 }}>
            <LogoMark size={36}/><span style={{ fontSize:20, fontWeight:800, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Atmos</span>
          </button>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:6 }}>{title}</h1>
          <p style={{ color:C.muted, fontSize:14 }}>{sub}</p>
        </div>
        <div className="card" style={{ padding:32 }}>{children}</div>
        <p style={{ textAlign:"center", fontSize:12, color:C.subtext, marginTop:20 }}>
          🔒 Conexão segura · Dados criptografados · LGPD
        </p>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onNav }) {
  const C = useTheme();
  const [email,setEmail]=useState("natalie@atmos.io");
  const [pass,setPass]=useState("12345678");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit = () => {
    if (!email || !pass) { setError("Preencha todos os campos."); return; }
    setError(""); setLoading(true);
    setTimeout(() => onLogin({ name:"Natalie Costa", email, plan:"pro" }), 900);
  };

  return (
    <AuthLayout title="Bem-vinda de volta! 👋" sub="Entre na sua conta Atmos" onNav={onNav}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label className="label">E-mail</label>
          <input className="input-field" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div>
          <label className="label">Senha</label>
          <input className="input-field" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <div style={{ textAlign:"right", marginTop:6 }}>
            <span style={{ fontSize:12, color:"#3B82F6", cursor:"pointer", fontWeight:600 }}>Esqueci a senha</span>
          </div>
        </div>
        {error && <div style={{ fontSize:13, color:"#EF4444", background:"#FEF2F2", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? <span className="spinning" style={{display:"inline-block"}}>⟳</span> : "Entrar →"}
        </button>
        <div style={{ textAlign:"center", fontSize:13, color:C.muted }}>
          Não tem conta?{" "}<span style={{ color:"#3B82F6", fontWeight:700, cursor:"pointer" }} onClick={()=>onNav("signup")}>Criar conta grátis</span>
        </div>
        <Divider label="ou continue com"/>
        <button className="btn btn-secondary" onClick={()=>onLogin({name:"Demo User",email:"demo@atmos.io",plan:"pro"})}>
          🎮 Entrar como Demo
        </button>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNav("landing")} style={{ color:C.muted }}>← Voltar para a home</button>
      </div>
    </AuthLayout>
  );
}

function SignupPage({ onLogin, onNav }) {
  const C = useTheme();
  const [form,setForm]=useState({name:"",email:"",pass:""});
  const [loading,setLoading]=useState(false);
  const [agree,setAgree]=useState(false);
  const [error,setError]=useState("");
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = () => {
    if (!form.name||!form.email||!form.pass) { setError("Preencha todos os campos."); return; }
    if (form.pass.length<6) { setError("Senha deve ter ao menos 6 caracteres."); return; }
    if (!agree) { setError("Aceite os termos para continuar."); return; }
    setError(""); setLoading(true);
    setTimeout(() => onLogin({ name:form.name, email:form.email, plan:"free", onboarded:false }), 900);
  };

  return (
    <AuthLayout title="Crie sua conta 🌿" sub="Comece a respirar melhor hoje, de graça" onNav={onNav}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {[{label:"Nome completo",key:"name",type:"text",ph:"Natalie Costa"},{label:"E-mail",key:"email",type:"email",ph:"seu@email.com"},{label:"Senha",key:"pass",type:"password",ph:"Mínimo 6 caracteres"}].map(f=>(
          <div key={f.key}><label className="label">{f.label}</label><input className="input-field" type={f.type} value={form[f.key]} onChange={set(f.key)} placeholder={f.ph} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        ))}
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <Toggle checked={agree} onChange={setAgree} size="sm"/>
          <span style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginTop:2 }}>
            Concordo com os <span style={{ color:"#3B82F6", cursor:"pointer" }}>Termos de Uso</span> e a <span style={{ color:"#3B82F6", cursor:"pointer" }}>Política de Privacidade</span>
          </span>
        </div>
        {error && <div style={{ fontSize:13, color:"#EF4444", background:"#FEF2F2", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
        <button className="btn btn-green" onClick={submit} disabled={loading}>
          {loading ? <span className="spinning" style={{display:"inline-block"}}>⟳</span> : "Criar conta grátis →"}
        </button>
        <div style={{ textAlign:"center", fontSize:13, color:C.muted }}>
          Já tem conta?{" "}<span style={{ color:"#3B82F6", fontWeight:700, cursor:"pointer" }} onClick={()=>onNav("login")}>Entrar</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNav("landing")} style={{ color:C.muted }}>← Voltar</button>
      </div>
    </AuthLayout>
  );
}