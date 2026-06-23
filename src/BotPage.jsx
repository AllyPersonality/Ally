import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ARC = {
  weaver:  { e:"🕸️", c:"#C9A84C", bg:"linear-gradient(135deg,#1a1200,#2d1f00,#1a1200)", br:"rgba(201,168,76,.5)",
    gifId:"l2JhpjWPccQhsAMfu",
    en:{n:"THE WEAVER",  s:"The Connector",       t:"Everyone's calling you. You're not always picking up.",           gc:"Your phone has been ringing. All of them."},
    es:{n:"EL TEJEDOR",  s:"El Conector",          t:"Todo el mundo te llama. No siempre atendes.",                    gc:"Tu teléfono no para. Todos."} },
  catalyst:{ e:"🔥", c:"#E8714A", bg:"linear-gradient(135deg,#1a0800,#2d1200,#1a0800)", br:"rgba(232,113,74,.5)",
    gifId:"l3q2K5jinAlChoCLS",
    en:{n:"THE CATALYST",s:"The Mover",            t:"Always in motion. Occasionally lost. Usually fine.",              gc:"Chaotic. Effective. Somehow fine."},
    es:{n:"EL CATALIZADOR",s:"El Motor",           t:"Siempre en movimiento. Generalmente bien.",                      gc:"Caótico. Efectivo. Misteriosamente bien."} },
  anchor:  { e:"⚓", c:"#7BAFC4", bg:"linear-gradient(135deg,#001018,#001a28,#001018)", br:"rgba(123,175,196,.5)",
    gifId:"26ufdipQqU2lhNA4g",
    en:{n:"THE ANCHOR",  s:"The Foundation",       t:"You don't rush. Things come to you.",                             gc:"They'll figure it out. You already have."},
    es:{n:"EL ANCLA",    s:"La Base",              t:"No te apurás. Las cosas llegan a vos.",                          gc:"Ellos lo van a entender. Vos ya lo sabés."} },
  spark:   { e:"⚡", c:"#8DC47A", bg:"linear-gradient(135deg,#091400,#122400,#091400)", br:"rgba(141,196,122,.5)",
    gifId:"3ohzdIuqJoo8QdKlnW",
    en:{n:"THE SPARK",   s:"The Builder",          t:"Earlier than most. More intentional than all of them.",           gc:"You saw this coming. Most people didn't."},
    es:{n:"LA CHISPA",   s:"La Constructora",      t:"Más temprano que la mayoría. Más intencional que todos.",         gc:"Vos lo veías venir. La mayoría no."} },
  tide:    { e:"🌊", c:"#4ECDC4", bg:"linear-gradient(135deg,#001a18,#002e2c,#001a18)", br:"rgba(78,205,196,.5)",
    gifId:"l0MYEqEzwMWFCg8rm",
    en:{n:"THE TIDE",    s:"The Understated One",  t:"You know more people than you think. None of them know each other.", gc:"Your network is a secret weapon you forgot you had."},
    es:{n:"LA MAREA",    s:"El Subestimado",       t:"Conocés a más gente de lo que pensás. Ninguno se conoce entre sí.", gc:"Tu red es un arma secreta que te olvidaste de tener."} },
  scout:   { e:"🦅", c:"#C0392B", bg:"linear-gradient(135deg,#1a0400,#2d0800,#1a0400)", br:"rgba(192,57,43,.5)",
    gifId:"26BRBKqUiq586bRVm",
    en:{n:"THE SCOUT",   s:"The Pioneer",          t:"First in, last remembered. That's about to change.",              gc:"You find the room before anyone else knows it exists."},
    es:{n:"EL EXPLORADOR",s:"El Pionero",          t:"El primero en entrar, el último en ser recordado. Eso está por cambiar.", gc:"Encontrás la sala antes de que alguien más sepa que existe."} },
  oracle:  { e:"🌙", c:"#8E44AD", bg:"linear-gradient(135deg,#0d0018,#1a0030,#0d0018)", br:"rgba(142,68,173,.5)",
    gifId:"3ohhwytHcusSCXXOUg",
    en:{n:"THE ORACLE",  s:"The Quiet Influence",  t:"People remember conversations with you for years. You forgot them the next day.", gc:"You give advice that changes lives and then wonder why they keep calling."},
    es:{n:"EL ORÁCULO",  s:"La Influencia Silenciosa", t:"La gente recuerda conversaciones con vos por años. Vos las olvidaste al día siguiente.", gc:"Dás consejos que cambian vidas y después te preguntás por qué siguen llamando."} },
  mirror:  { e:"🎭", c:"#95A5A6", bg:"linear-gradient(135deg,#0a0c0d,#141819,#0a0c0d)", br:"rgba(149,165,166,.5)",
    gifId:"l2JhpjWPccQhsAMfu",
    en:{n:"THE MIRROR",  s:"The Adapter",          t:"You become what the room needs. Exhausting but effective.",        gc:"Somehow always the most interesting person to whoever you're talking to."},
    es:{n:"EL ESPEJO",   s:"El Adaptador",         t:"Te convertís en lo que la sala necesita. Agotador pero efectivo.", gc:"De alguna manera siempre sos la persona más interesante para quien tengas enfrente."} },
  seed:    { e:"🌱", c:"#27AE60", bg:"linear-gradient(135deg,#020e06,#041a0b,#020e06)", br:"rgba(39,174,96,.5)",
    gifId:"26ufdipQqU2lhNA4g",
    en:{n:"THE SEED",    s:"The Long Game Player", t:"Slow to trust. Worth the wait.",                                   gc:"Your network is small, intentional, and quietly terrifying."},
    es:{n:"LA SEMILLA",  s:"El Jugador a Largo Plazo", t:"Lento para confiar. Vale la pena esperar.",                  gc:"Tu red es chica, intencional, y silenciosamente aterradora."} },
};

const CARICATURES = {
  weaver:"weaver.jpg",
  catalyst:"catalyst.jpg",
  tide:"tide.jpg",
  oracle:"oracle.jpg",
  scout:"scout.png",
  mirror:"susana.png",
  anchor:"anchor.jpg",
  spark:"spark.png",
  seed:"seed.jpg",
};

const LPen={1:"The Leader",2:"The Mediator",3:"The Communicator",4:"The Builder",5:"The Explorer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",9:"The Humanitarian",11:"The Visionary",22:"The Master Builder"};
const LPes={1:"El Lider",2:"El Mediador",3:"El Comunicador",4:"El Constructor",5:"El Explorador",6:"El Cuidador",7:"El Buscador",8:"El Realizador",9:"El Humanitario",11:"El Visionario",22:"El Gran Constructor"};

// ── NATAL DATA ───────────────────────────────────────────────────────────────
const SIGNS = {
  aries:       {e:"♈",en:"Aries",       es:"Aries"},
  taurus:      {e:"♉",en:"Taurus",      es:"Tauro"},
  gemini:      {e:"♊",en:"Gemini",      es:"Géminis"},
  cancer:      {e:"♋",en:"Cancer",      es:"Cáncer"},
  leo:         {e:"♌",en:"Leo",         es:"Leo"},
  virgo:       {e:"♍",en:"Virgo",       es:"Virgo"},
  libra:       {e:"♎",en:"Libra",       es:"Libra"},
  scorpio:     {e:"♏",en:"Scorpio",     es:"Escorpio"},
  sagittarius: {e:"♐",en:"Sagittarius", es:"Sagitario"},
  capricorn:   {e:"♑",en:"Capricorn",   es:"Capricornio"},
  aquarius:    {e:"♒",en:"Aquarius",    es:"Acuario"},
  pisces:      {e:"♓",en:"Pisces",      es:"Piscis"},
};

const SIGN_TRAIT = {
  aries:       {en:"You make connections on impulse. They somehow always work out.",                         es:"Conectás por impulso. De alguna manera siempre funciona."},
  taurus:      {en:"People trust you before you've said anything. That's the whole game.",                   es:"La gente te tiene confianza antes de que abras la boca. Ese es todo el juego."},
  gemini:      {en:"You know someone everywhere. The hard part is remembering what you told them.",          es:"Conocés a alguien en todos lados. Lo difícil es recordar qué le dijiste."},
  cancer:      {en:"Your inner circle is small, fiercely chosen, and would move mountains for you.",         es:"Tu círculo íntimo es chico, elegido con fiereza, y movería montañas por vos."},
  leo:         {en:"You don't find your people — they find you.",                                            es:"No encontrás a tu gente — te encuentra a vos."},
  virgo:       {en:"You know exactly who to call for every problem. Most people don't even notice.",         es:"Sabés exactamente a quién llamar para cada problema. La mayoría ni lo nota."},
  libra:       {en:"You are the person both sides call when they need a bridge.",                            es:"Sos la persona a la que los dos lados llaman cuando necesitan un puente."},
  scorpio:     {en:"Your connections are few but they open doors nobody else can.",                          es:"Tus conexiones son pocas pero abren puertas que nadie más puede abrir."},
  sagittarius: {en:"You collect people across time zones without even trying.",                              es:"Coleccionás personas en todos los husos horarios sin querer."},
  capricorn:   {en:"Every connection you build is a slow investment that compounds for years.",              es:"Cada conexión que construís es una inversión lenta que crece por años."},
  aquarius:    {en:"You don't network — you find your people and then you build something.",                 es:"No hacés networking — encontrás a tu gente y después construís algo."},
  pisces:      {en:"Strangers tell you their secrets. You already know this.",                               es:"Los desconocidos te cuentan sus secretos. Ya lo sabés."},
};

const SATURN_MSG = {
  approaching: {en:"🪐 Saturn Return incoming (you're close) — you're sensing it already: the life you're building doesn't quite fit anymore.",    es:"🪐 Retorno de Saturno en camino — ya lo sentís: la vida que construís ya no te termina de cerrar."},
  first:       {en:"🪐 Saturn Return active (27–30) — the version of you that everyone expects is on borrowed time.",                              es:"🪐 Retorno de Saturno activo (27–30) — la versión tuya que todos esperan está viviendo de prestado."},
  second:      {en:"🪐 Second Saturn Return (56–60) — you've done this before. You already know what doesn't fit won't ever fit.",                es:"🪐 Segundo Retorno de Saturno (56–60) — ya pasaste por esto. Ya sabés: lo que no encaja ahora, nunca va a encajar."},
};

function calcLP(s){const d=(s||"").replace(/\D/g,"").split("").map(Number);if(!d.length)return 5;let n=d.reduce((a,b)=>a+b,0);while(n>9&&n!==11&&n!==22)n=String(n).split("").map(Number).reduce((a,b)=>a+b,0);return n||5;}
function ageRange(age){const a=parseInt(age);if(!a||isNaN(a))return "";if(a<20)return "under 20";const lo=Math.floor(a/10)*10;return lo+"-"+(lo+10);}

function sunSign(dob) {
  if (!dob) return null;
  const s = dob.toLowerCase();
  const MN = {jan:1,january:1,enero:1,feb:2,february:2,febrero:2,mar:3,march:3,marzo:3,
    apr:4,april:4,abril:4,may:5,mayo:5,jun:6,june:6,junio:6,jul:7,july:7,julio:7,
    aug:8,august:8,agosto:8,sep:9,september:9,septiembre:9,setiembre:9,
    oct:10,october:10,octubre:10,nov:11,november:11,noviembre:11,dec:12,december:12,diciembre:12};
  let month, day;
  for (const [name, num] of Object.entries(MN)) {
    if (s.includes(name)) { month = num; const dm = s.match(/\b(\d{1,2})\b/); if (dm) day = parseInt(dm[1]); break; }
  }
  if (!month) {
    let m = dob.match(/\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
    if (m) { month = parseInt(m[2]); day = parseInt(m[3]); }
    else {
      m = dob.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
      if (m) { day = parseInt(m[1]); month = parseInt(m[2]); }
    }
  }
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = month * 100 + day;
  if (d>=321&&d<=419) return "aries"; if (d>=420&&d<=520) return "taurus";
  if (d>=521&&d<=620) return "gemini"; if (d>=621&&d<=722) return "cancer";
  if (d>=723&&d<=822) return "leo"; if (d>=823&&d<=922) return "virgo";
  if (d>=923&&d<=1022) return "libra"; if (d>=1023&&d<=1121) return "scorpio";
  if (d>=1122&&d<=1221) return "sagittarius";
  if ((d>=1222&&d<=1231)||(d>=101&&d<=119)) return "capricorn";
  if (d>=120&&d<=218) return "aquarius"; if (d>=219&&d<=320) return "pisces";
  return null;
}

function saturnReturn(age) {
  const a = parseInt(age);
  if (!a || isNaN(a)) return null;
  if (a >= 25 && a <= 26) return "approaching";
  if (a >= 27 && a <= 30) return "first";
  if (a >= 56 && a <= 60) return "second";
  return null;
}

function detectArc(d) {
  const sc = {weaver:0,catalyst:0,anchor:0,spark:0,tide:0,scout:0,oracle:0,mirror:0,seed:0};
  const g = k => (d[k]||"").toLowerCase();
  const steps = g("steps") + " " + g("social");
  const methods = [/google/,/whatsapp|telegram|grupo/,/amigo|friend|pregunt|ask/,/linkedin/,/instagram|facebook/].filter(r=>r.test(steps)).length;

  // Age signals
  const age = parseInt(d.age) || (() => { const yr=(d.dob||"").match(/\b(19|20)\d{2}\b/); return yr ? new Date().getFullYear()-parseInt(yr[0]) : 0; })();
  if (age > 0 && age < 25) sc.spark += 3;
  else if (age >= 25 && age < 30) sc.spark += 1;
  if (age > 55) sc.anchor += 2;

  // Occupation
  if (/student|estudi/.test(g("occ"))) sc.spark += 3;
  if (/founder|startup|emprend/.test(g("occ"))) { sc.catalyst += 2; sc.scout += 1; }
  if (/retir|jubil/.test(g("occ"))) sc.anchor += 4;
  if (/sales|marketing|ventas|comunic|PR|relacion/.test(g("occ"))) sc.mirror += 2;
  if (/medic|doctor|nurs|psic|counsel|teach|maest|profe|docen/.test(g("occ"))) sc.oracle += 2;

  // Connector role (conn field)
  if (/always|siempre|all the time|todo el tiempo/.test(g("conn"))) sc.weaver += 5;
  else if (/often|seguido|frecuente/.test(g("conn"))) sc.weaver += 3;
  else if (/sometimes|a veces|de vez en cuando/.test(g("conn"))) sc.oracle += 2;
  else if (/no\b|nunca|never|not really|rara/.test(g("conn"))) { sc.seed += 2; sc.anchor += 1; }

  // Life change / transition
  if (/new city|nueva ciudad|mudé|moved|me mudé|reloc/.test(g("chg"))) { sc.scout += 3; sc.catalyst += 1; }
  else if (/new job|nuevo trabajo|startup|emprend/.test(g("chg"))) { sc.catalyst += 2; sc.scout += 1; }
  else if (/nothing|stable|nada|tranqui|igual|same|sin cambios/.test(g("chg"))) { sc.anchor += 2; sc.seed += 1; }

  // How they search for people
  if (methods >= 3) { sc.tide += 3; sc.mirror += 1; }
  else if (methods === 2) sc.tide += 1;
  if (/amigo|friend|close|cercano/.test(g("steps")) && !/linkedin|instagram|google/.test(g("steps"))) sc.seed += 2;
  if (/google/.test(g("steps")) && /mov|mud|new|nuev/.test(g("chg"))) sc.scout += 2;

  // Social media
  if (/yes|si\b|claro|mucho/.test(g("social"))) { sc.tide += 1; sc.mirror += 2; }
  if (/linkedin/.test(steps)) sc.mirror += 1;

  // Frequency of needing new contacts
  if (/often|frequently|seguido|mucho|siempre/.test(g("freq"))) sc.mirror += 2;
  if (/rarely|almost never|casi nunca|poco|raro/.test(g("freq"))) { sc.seed += 2; sc.anchor += 1; }
  if (/sometimes|a veces|occasionally/.test(g("freq"))) sc.tide += 1;

  // Missed connection signal
  if (/yes|si\b|claro|paso|me paso|varias/.test(g("missed"))) sc.oracle += 2;

  // Would try app
  if (/yes|si\b|claro|absolutely/.test(g("advance"))) { sc.scout += 1; sc.catalyst += 1; }

  return Object.entries(sc).sort((a,b)=>b[1]-a[1])[0][0];
}

const isNo=s=>/^no\b|nunca|never|not really|nope|para nada/.test((s||"").toLowerCase().trim());
const isYes=s=>/si\b|yes|claro|absolutely|definitely|por supuesto/.test((s||"").toLowerCase());

// ── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function systemPrompt(lang, stage, collected) {
  const common = [
    "You are in stage: "+stage+". You do NOT follow a fixed question order. You adapt freely to what the user just said.",
    "",
    "You are Ally, a warm, intelligent, deeply curious conversation partner genuinely getting to know another person. You are NOT an interviewer, survey, or questionnaire.",
    "",
    "RESPONSE RULES (strict): max 3 sentences. ALWAYS end with exactly one question (except the final completion line). NEVER ask more than one question. Natural and conversational, never a checklist.",
    "",
    "Always respond directly to what the user just said before introducing anything new. Let curiosity guide transitions.",
    "",
    "When they share their occupation, give a big specific genuine compliment first. Student = most exciting stage of life. Stay-at-home parent = the most important job in the world. Entrepreneur = betting on yourself takes real courage. Doctor/nurse = the backbone of any community. Teacher = literally shaping the future. Retired = a whole lifetime of wisdom.",
    "",
    "Handle all user types equally. If someone says they don't network, warmly accept it and get curious about how they function without it.",
    "",
    "ALREADY COLLECTED (do not re-ask these): "+(collected||"nothing yet")+".",
    "",
    "EXPLORE naturally, only fields not yet collected: name; exact age; gender (open question, no options); date of birth (never explain why); city (a place name — if they answer with something that is clearly NOT a place name like a feeling or sentence, warmly acknowledge it and ask again: 'Got it — and which city or town are you based in?'); occupation (what they do for work or study — if they answer with 'yes', 'no', a feeling, or something clearly not a job, gently ask what they do for work); whether they like their work; growth ambitions; life changes or transitions; how often they need new contacts; how they find people when they need them; whether they ever realized too late a contact could have helped; whether people come to them for introductions; whether they would try a tool that finds the right person inside their own contacts.",
    "",
    "COMPLETION: after about 14 exchanges end with exactly: 'Perfect [name], calculating your profile now...' and stop.",
    "",
    "NEVER say: survey, research, data, questionnaire, segmentation.",
  ];
  if (lang === "es") return common.join("\n") + "\n\nThe user chose Spanish. Respond ONLY in natural Argentine Spanish with voseo. Completion line: 'Perfecto [nombre], calculando tu perfil ahora...'";
  return common.join("\n") + "\n\nThe user chose English.";
}

const isDone = t => /calculando tu perfil|calculating your profile/i.test(t||"");

function valid(text) {
  if (!text || text.length < 2) return false;
  if (/\b(survey|research|questionnaire|encuesta|cuestionario|investigaci)/i.test(text)) return false;
  const qs = (text.match(/\?|¿/g) || []).length;
  if (isDone(text)) return true;
  if (qs === 0) return false;
  if (qs > 3) return false;
  if (text.split(/[.!?]+/).filter(s => s.trim().length > 3).length > 5) return false;
  return true;
}

// ── ANSWER VALIDATION — prevents saving garbage to structured fields ─────────
const BAD_CITY_WORDS = /\b(enjoy|enjoying|figuring|still|okay|ok|sure|love|hate|feel|going|getting|trying|don't|doesn't|really|great|good|bad|fine|work here|live here|yes\b|no\b|maybe)\b/i;

function isValidForField(field, value) {
  const v = (value || "").trim();
  if (!v) return false;
  if (field === "city") {
    if (v.length > 30) return false;
    if (v.split(/\s+/).length > 5) return false;
    if (BAD_CITY_WORDS.test(v)) return false;
    if (/[.!?]/.test(v)) return false; // sentence punctuation = not a city
    return true;
  }
  if (field === "occ") {
    // Reject single-word yes/no/feeling answers
    if (/^(yes|no|maybe|sure|okay|ok|si\b|nope|claro|yeah|fine|good|bad|great)$/i.test(v)) return false;
    if (/^(i (really |do )?(enjoy|like|love|hate|feel)|it'?s (great|good|fine|okay))/i.test(v)) return false;
    return true;
  }
  return true;
}

// ── FIELD DETECTION — reads the bot reply to know what was just asked ────────
function detectNextTopic(text) {
  const t = (text||"").toLowerCase();
  if (/how old|your age|cuantos a|qu. edad/.test(t)) return "age";
  if (/gender|g.nero/.test(t)) return "gender";
  if (/birth|born|fecha.*nacimiento|cumplea/.test(t)) return "dob";
  if (/where.*from|where.*live|city|ciudad|de donde|d.nde/.test(t)) return "city";
  if (/your name|c.mo te llam/.test(t)) return "name";
  if (/what do you do|work|study|trabaj|estudi|hac.s en la vida/.test(t)) return "occ";
  if (/like.*job|enjoy.*work|te gusta lo que hac|disfrutas/.test(t)) return "jobfeel";
  if (/grow|growth|calling|crecer|algo.*diferente/.test(t)) return "grow";
  if (/change|transition|new.*happening|pasando algo/.test(t)) return "chg";
  if (/how often|cada cu.nto/.test(t)) return "freq";
  if (/first.*step|what do you do first|que haces primero/.test(t)) return "steps";
  if (/social media|redes sociales/.test(t)) return "social";
  if (/professional|profesional/.test(t)) return "pro";
  if (/realized.*late|contact.*could|diste cuenta/.test(t)) return "missed";
  if (/people.*ask.*connect|te.*piden.*conect/.test(t)) return "conn";
  if (/how many.*year|cu.ntas.*a.o/.test(t)) return "count";
  if (/app.*exist|try.*tool|probarias|existiera/.test(t)) return "advance";
  return null;
}

// ── LOCAL FALLBACK ENGINE ────────────────────────────────────────────────────
const TOPICS = ["name","age","gender","dob","city","occ","jobfeel","grow","chg","freq","steps","social","pro","missed","conn","count","advance"];

function localAck(lastTopic, answer, lang) {
  const es = lang === "es", a = (answer||"").toLowerCase();
  if (lastTopic === "name") return es ? "Un placer, "+answer+"!" : "Great to meet you, "+answer+"!";
  if (lastTopic === "age") return es ? "Perfecto." : "Got it.";
  if (lastTopic === "gender") return es ? "Buenisimo." : "Got it.";
  if (lastTopic === "dob") return es ? "Perfecto." : "Got it.";
  if (lastTopic === "city") return es ? answer+"! Buenisimo." : answer+"! Nice.";
  if (lastTopic === "occ") {
    const both = (/work|job|trabajo/.test(a)&&/studi|estudia/.test(a))||/both|las dos/.test(a);
    if (both) return es ? "Wow, trabajas Y estudias, eso requiere una energia increible." : "Wow, you work AND study, that takes incredible energy.";
    if (/estudi|student/.test(a)) return es ? "Wow, estudiante! El momento mas emocionante de la vida." : "Wow, a student! The most exciting stage of life.";
    if (/ama de casa|hogar|familia|mom|mother|home/.test(a)) return es ? "El trabajo mas importante del mundo, enorme respeto." : "Honestly the most important job in the world, huge respect.";
    if (/emprend|founder|startup/.test(a)) return es ? "Emprendedor/a! Eso requiere una valentia que pocos tienen." : "An entrepreneur! That takes courage most people only talk about.";
    if (/medic|doctor|nurs|salud|health/.test(a)) return es ? "Salud! Son la red mas importante de cualquier comunidad." : "Healthcare — the backbone of any community.";
    if (/maest|profe|docen|teach/.test(a)) return es ? "Docente! Estas moldeando el futuro literalmente." : "A teacher! Literally shaping the future.";
    if (/jubil|retir/.test(a)) return es ? "Una vida entera construida, eso vale mas que cualquier titulo." : "A whole lifetime built, worth more than any degree.";
    return es ? "Wow, "+answer+", que mundo interesante." : "Wow, "+answer+", what an interesting world.";
  }
  if (lastTopic === "jobfeel") return isNo(answer)?(es?"Honesto, eso tiene merito admitirlo.":"Honest, that takes guts to admit."):(es?"Se nota que lo disfrutas.":"That really comes through.");
  if (lastTopic === "grow") return isNo(answer)?(es?"Saber donde queres estar ya es una habilidad.":"Knowing where you want to be is a skill."):(es?"Me encanta esa ambicion.":"Love that ambition.");
  if (lastTopic === "chg") {
    if (/mud|ciudad|mov|city/.test(a)) return es ? "Mudarse resetea todo, la red incluida." : "Moving resets everything, your network included.";
    if (isNo(answer)||/nada|nothing|tranqui/.test(a)) return es ? "La estabilidad dice mucho tambien." : "Stability says a lot too.";
    return es ? "Eso suena importante." : "That sounds significant.";
  }
  if (lastTopic === "freq") return isNo(answer)?(es?"Tu red ya cubre bastante entonces.":"Interesting, your network covers a lot."):(es?"Entiendo.":"Got it.");
  if (lastTopic === "steps") {
    if (/google/.test(a)) return es ? "Google, el recurso universal." : "Google, the universal fallback.";
    if (/whatsapp|grupo|group/.test(a)) return es ? "El boca a boca digital, un clasico." : "Digital word of mouth, a classic.";
    if (/amigo|friend|pregunt|ask/.test(a)) return es ? "Preguntarle a alguien de confianza, siempre funciona." : "Asking someone you trust, still the best network.";
    return es ? "Interesante proceso." : "Interesting process.";
  }
  if (lastTopic === "social") return isNo(answer)?(es?"Mucha gente no las usa para eso.":"A lot of people don't use them for that."):(es?"Buenisimo.":"Good.");
  if (lastTopic === "pro") return isNo(answer)?(es?"Tu red ya cubre esas situaciones entonces.":"Your network covers those then."):(es?"Tiene sentido.":"That makes sense.");
  if (lastTopic === "missed") return isYes(answer)||/paso|me paso|varias/.test(a)?(es?"La respuesta estaba ahi, invisible.":"The answer was right there, invisible."):(es?"Dice algo bueno de como buscas.":"That says something good about how you search.");
  if (lastTopic === "conn") return /siempre|always|often|seguido/.test(a)?(es?"El conector de cabecera, eso es un superpoder.":"The go-to connector — that's a real superpower."):(es?"No todos tienen ese rol y esta perfecto.":"Not everyone plays that role and that's fine.");
  if (lastTopic === "count") return es ? "Mas de lo que la mayoria se da cuenta." : "More than most people realize.";
  return es ? "Buenisimo." : "Got it.";
}

function localQuestion(topic, lang, name) {
  const es = lang === "es";
  const Q = {
    name:    es?"Empecemos, como te llamas?":"Let's start — what's your name?",
    age:     es?(name?name+", ":"")+"cuantos anos tenes?":(name?name+", ":"")+"how old are you?",
    gender:  es?"Y cual es tu genero?":"And what's your gender?",
    dob:     es?(name?name+", ":"")+"cual es tu fecha de nacimiento? Dia, mes y anio.":(name?name+", ":"")+"what's your date of birth? Day, month and year.",
    city:    es?"De donde sos?":"Where are you from?",
    occ:     es?"Y que haces en la vida, trabajas, estudias, emprendes?":"What do you do — work, study, run something?",
    jobfeel: es?"Te gusta lo que haces, o llegaste ahi de casualidad?":"Do you love what you do, or did you end up there by accident?",
    grow:    es?"Tenes ganas de crecer en eso, o hay algo diferente que te llama?":"Do you want to grow in that, or is something else calling you?",
    chg:     es?(name?name+", ":"")+"esta pasando algo nuevo en tu vida, o esta por pasar?":(name?name+", ":"")+"is anything new happening in your life, or about to?",
    freq:    es?"Cada cuanto necesitas encontrar a alguien nuevo, un profesional, un contacto?":"How often do you need to find someone new — a professional, a contact?",
    steps:   es?"Cuando necesitas encontrar a alguien especifico, que haces primero?":"When you need to find someone specific, what do you do first?",
    social:  es?"Usas las redes sociales para conectar o encontrar gente?":"Do you use social media to connect or find people?",
    pro:     es?"En el ultimo anio necesitaste encontrar algun profesional que no tenias?":"In the last year, did you need to find a professional you didn't have?",
    missed:  es?(name?name+", ":"")+"alguna vez te diste cuenta tarde de que alguien en tus contactos podia haber ayudado?":(name?name+", ":"")+"did you ever realize too late that someone already in your contacts could have helped?",
    conn:    es?"La gente viene a vos a pedirte que los conectes con alguien?":"Do people come to you asking to be connected with someone?",
    count:   es?"En el ultimo anio, cuantas personas conectaste con alguien que necesitaban?":"In the last year, how many people did you connect to someone they needed?",
    advance: es?"Ultima, si existiera una app que encuentra a la persona correcta dentro de tus propios contactos en segundos, la probarias?":"Last one — if an app found the right person inside your own contacts in seconds, would you try it?",
  };
  return Q[topic] || (es?"Contame un poco mas?":"Tell me a bit more?");
}

// ── API ───────────────────────────────────────────────────────────────────────
async function rawCall(system, messages, maxTokens) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ system, messages, max_tokens: maxTokens || 200 }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!Array.isArray(d?.content)) return null;
    return d.content.map(c => c.text||"").join("").trim() || null;
  } catch { return null; }
}

async function nextTurn(lang, history, stage, collected, nextTopic, lastTopic, lastAnswer, name) {
  let reply = await rawCall(systemPrompt(lang, stage, collected), history, 200);
  if (reply && !valid(reply)) {
    const repair = "Rewrite this: max 3 sentences, exactly one question, no lists, no survey words, same meaning, conversational. Message: \"\"\""+reply+"\"\"\"";
    const fixed = await rawCall(systemPrompt(lang, stage, collected), [...history, {role:"assistant",content:reply},{role:"user",content:repair}], 200);
    reply = (fixed && valid(fixed)) ? fixed : null;
  }
  if (reply && valid(reply)) return reply;
  return localAck(lastTopic, lastAnswer, lang) + " " + localQuestion(nextTopic, lang, name);
}

async function finalize(lang, history) {
  const convo = history.map(m => (m.role==="user"?"USER":"ALLY")+": "+m.content).join("\n");
  let data = {};
  const ext = await rawCall(
    "Extract data from the conversation. Return ONLY valid JSON, no markdown.",
    [{role:"user",content:"Extract values for keys with clear answers.\nKeys: name, age, gender, dob, city, occ, jobfeel, grow, chg, freq, steps, social, pro, found, srchtime, srchfeel, missed, conn, count, advance\n\nCRITICAL RULES — read carefully before extracting:\n- age: extract the number only (e.g. 28, not 'I am 28').\n- gender: exactly what they said.\n- city: MUST be a place/location name (city, town, neighborhood, country). Max 4 words. Valid examples: 'Buenos Aires', 'Córdoba', 'New York', 'Georgia'. INVALID — do NOT extract if the value contains any of: feelings, verbs, 'enjoy', 'yes', 'no', 'work', 'design', 'build', 'study', 'I am', 'figuring', 'still', or any sentence. When in doubt, leave BLANK.\n- occ: what they do for work or study. Valid: 'graphic designer', 'student', 'software engineer'. INVALID — do NOT extract if it is a single 'yes'/'no', a feeling ('I enjoy it'), or any non-job answer. When in doubt, leave BLANK.\n- Never put a sentence into city. Never put yes/no into occ.\n\nConversation:\n"+convo+"\n\nReturn JSON only."}],
    500
  );
  if (ext) { try { data = JSON.parse(ext.replace(/```json|```/g,"").trim()); } catch {} }

  // Safety net: if city looks like a job description or sentence, move it to occ
  if (data.city) {
    const cw = data.city.trim().split(/\s+/).length;
    const jobLike = /\b(i am|i'm|am a|work|design|build|studi|project|engineer|developer|graphic|manager|director|student|teacher|doctor|nurse|consultant|freelance|architect|analyst)\b/i.test(data.city);
    if (cw > 4 || jobLike) { if (!data.occ) data.occ = data.city; data.city = null; }
  }

  const lp=calcLP(data.dob||""), arcId=detectArc(data), arc=ARC[arcId], AL=arc[lang], lpn=lang==="es"?(LPes[lp]||""):(LPen[lp]||""), n=data.name||"";
  const sign = sunSign(data.dob);
  const saturn = saturnReturn(data.age);
  const signName = sign ? (lang==="es" ? SIGNS[sign].es : SIGNS[sign].en) : "";
  const saturnNote = saturn ? (lang==="es" ? SATURN_MSG[saturn].es : SATURN_MSG[saturn].en) : "";

  const sum = Object.entries(data).map(([k,v])=>k+": "+v).join("\n");
  const sys = lang==="es"
    ? "Sos un guia de personalidad. Espanol argentino con voseo. Especifico, mistico, compartible. NUNCA encuestas. Solo el texto del perfil."
    : "You are a personality guide. Specific, mystical, shareable. NEVER surveys. Profile text only.";

  const p = lang==="es"
    ? "Escribí un perfil para "+n+". Arquetipo: "+AL.n+". Camino de Vida "+lp+" ("+lpn+")."+(signName?" Sol en "+signName+".":"")+(saturnNote?" "+saturnNote:"")
      +"\n\nDATOS DE LA CONVERSACIÓN:\n"+sum
      +"\n\nREGLAS ESTRICTAS — si las rompés, el perfil falla:\n"
      +"1. NUNCA repitas hechos directamente. 'Vivís en X y trabajás de Y' es un fracaso total.\n"
      +"2. Cruzá 2-3 datos inesperados y decí lo que revelan JUNTOS — no los hechos, sino la verdad detrás de ellos.\n"
      +"3. Escribí como una tarotista que también tiene sus notas de terapia: precisa, un poco incómoda, cálida pero sin edulcorar.\n"
      +"4. Usá voseo argentino natural. Directo. No adulador.\n"
      +"5. Cada sección: MÁXIMO 2 oraciones cortas.\n\n"
      +"FORMATO — exactamente 3 secciones:\n\n"
      +"🎁 TU DON SOCIAL\n"
      +"Cruzá su ocupación, cómo encuentra gente, y su rol de conector para revelar su poder subyacente — no lo que hace, sino por qué funciona. Máx 2 oraciones.\n\n"
      +"⚡ TU PUNTO CIEGO\n"
      +"Usá su patrón de búsqueda O su respuesta sobre conexiones perdidas para nombrar algo que no ve de sí mismo. No un defecto — una fortaleza oculta que no usa. 1 oración.\n\n"
      +"😄 LA VERDAD QUE NADIE TE DICE\n"
      +"1 línea. Savage y específica. Combiná su signo solar"+(signName?" ("+signName+")":" (si lo sabés)")+", su arquetipo "+AL.n+", y un dato concreto de la conversación. Que la lea, haga pausa, y se la mande a alguien ahora mismo."
    : "Write a profile for "+n+". Archetype: "+AL.n+". Life Path "+lp+" ("+lpn+")."+(signName?" Sun in "+signName+".":"")+(saturnNote?" "+saturnNote:"")
      +"\n\nCONVERSATION DATA:\n"+sum
      +"\n\nSTRICT RULES — break these and the profile fails:\n"
      +"1. NEVER repeat facts back. 'You live in X and work as Y' is a complete failure.\n"
      +"2. Cross-reference 2-3 unexpected data points and say what they reveal TOGETHER — not the facts, but the truth behind them.\n"
      +"3. Write like a tarot reader who also has their therapy notes: precise, slightly uncomfortable, warm but not soft.\n"
      +"4. Each section: MAX 2 short sentences.\n\n"
      +"FORMAT — exactly 3 sections:\n\n"
      +"🎁 YOUR SOCIAL GIFT\n"
      +"Cross-reference their occupation, how they find people, and their connector role to reveal their underlying power — not what they do, but why it works. Max 2 sentences.\n\n"
      +"⚡ YOUR BLIND SPOT\n"
      +"Use their search pattern OR their missed-connection answer to name the one thing they don't see about themselves. Not a flaw — a hidden strength they're underusing. 1 sentence.\n\n"
      +"😄 THE TRUTH NOBODY TELLS YOU\n"
      +"1 line. Savage and specific. Combine their sun sign"+(signName?" ("+signName+")":" (if known)")+", archetype "+AL.n+", and one real data point from the conversation. The kind of line they read, pause, then immediately forward to someone.";

  let report = await rawCall(sys, [{role:"user",content:p}], 450);
  if (!report) {
    report = lang==="es"
      ? "🎁 TU DON SOCIAL\nTenes una manera natural de entender lo que la gente necesita antes de que lo digan. Conectas con proposito, no por accidente.\n\n⚡ TU PUNTO CIEGO\nSubestimas lo que ya tenes en tu red.\n\n🔢 Numero de vida "+lp+" — "+lpn+".\nConectas con intencion.\n\n😄 LA VERDAD QUE NADIE TE DICE\nSos la persona a la que todos llaman cuando necesitan algo y la ultima a la que se le agradece. Clasico."
      : "🎁 YOUR SOCIAL GIFT\nYou have a natural sense of what people need before they say it. You connect with intention, not by accident.\n\n⚡ YOUR BLIND SPOT\nYou underestimate what's already in your network.\n\n🔢 Life number "+lp+" — "+lpn+".\nYou connect with intention.\n\n😄 THE TRUTH NOBODY TELLS YOU\nYou're the one everyone calls when they need something and the last one they think to thank. Classic.";
  }
  return { data, lp, arcId, report, sign, saturn };
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
async function savePartial(id, data, lang) {
  try {
    const now = new Date().toISOString();
    const payload = { id, ts_start: tsStart.current, ts: now, lang, version, status:"abandoned", ...data };
    await fetch("/api/responses", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
  } catch {}
}

async function saveResp(id, data, lang, lp, arcId, report, sign, saturn) {
  try {
    const now = new Date().toISOString();
    await fetch("/api/responses", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, ts_start: tsStart.current, ts: now, lang, version, status:"completed",
        lp: String(lp), arc: arcId, report, sign: sign||null, saturn: saturn||null, ...data }),
    });
  } catch {}
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ago = ts => { const m=Math.floor((Date.now()-new Date(ts))/60000); return m<1?"just now":m<60?m+"m ago":m<1440?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago"; };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Barlow+Condensed:wght@300;400;500;600&family=Barlow:wght@300;400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{background:#090705;-webkit-font-smoothing:antialiased;overflow:hidden}
  @media(min-width:768px){
    html,body{height:auto;min-height:100%;overflow:auto}
    body{overflow-y:auto}
    #root{height:auto;min-height:100%;display:flex;flex-direction:column;align-items:center}
    .ally-root{max-width:700px;width:100%;border-left:1px solid rgba(191,160,98,.07);border-right:1px solid rgba(191,160,98,.07)}
    .ally-chat{height:100vh}
  }
  @keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes bn{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
  @keyframes pp{0%{opacity:0;transform:scale(.94)}100%{opacity:1;transform:scale(1)}}
  .mu{animation:up .28s cubic-bezier(.22,1,.36,1) both}
  .fi{animation:fi .4s ease both}
  .pp{animation:pp .4s cubic-bezier(.22,1,.36,1) both}
  .dot{width:7px;height:7px;border-radius:50%;background:rgba(242,237,230,.4);display:inline-block;animation:bn 1.1s infinite}
  .dot:nth-child(2){animation-delay:.18s}.dot:nth-child(3){animation-delay:.36s}
  textarea{flex:1;background:transparent;border:none;outline:none;resize:none;color:#F2EDE6;font-family:'Barlow',sans-serif;font-size:17px;line-height:1.65;padding:0;max-height:140px;overflow-y:auto}
  textarea::placeholder{color:rgba(242,237,230,.28)}
  .lb{width:100%;padding:20px;background:rgba(242,237,230,.04);border:1px solid rgba(242,237,230,.1);border-radius:14px;color:#F2EDE6;font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;cursor:pointer;transition:all .2s}
  .lb:hover{background:rgba(242,237,230,.09);border-color:rgba(191,160,98,.5);color:#BFA062}
  .sfb{width:100%;padding:14px;border:none;border-radius:12px;background:#1877F2;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:600;letter-spacing:.8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s}
  .sfb:hover{opacity:.88}
  .sig{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:600;letter-spacing:.8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s}
  .sig:hover{opacity:.88}
  .scp{width:100%;padding:12px;border:1px solid rgba(242,237,230,.2);border-radius:12px;background:transparent;color:rgba(242,237,230,.7);font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1px;cursor:pointer;transition:all .2s}
  .scp:hover{border-color:rgba(242,237,230,.4);color:#F2EDE6}
  input[type=email]{flex:1;background:rgba(242,237,230,.06);border:1px solid rgba(242,237,230,.15);border-radius:8px;padding:10px 14px;color:#F2EDE6;font-family:'Barlow',sans-serif;font-size:15px;outline:none}
  input[type=email]::placeholder{color:rgba(242,237,230,.3)}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(242,237,230,.1);border-radius:2px}
`;

export default function BotPage({ version = "cultural" }) {
  const navigate = useNavigate();
  const [view,      setView]     = useState("choose");
  const [msgs,      setMsgs]     = useState([]);
  const [hist,      setHist]     = useState([]);
  const [input,     setInput]    = useState("");
  const [typing,    setTyping]   = useState(false);
  const [done,      setDone]     = useState(false);
  const [turns,     setTurns]    = useState(0);
  const [topicI,    setTopicI]   = useState(0);
  const [activeField,setActiveField] = useState("name");
  const [data,      setData]     = useState({});
  const [email,     setEmail]    = useState("");
  const [emailOk,   setEmailOk]  = useState(false);
  const [copied,    setCopied]   = useState(false);
  const [smsg,      setSmsg]     = useState("");

  const bot=useRef(null), inp=useRef(null), busy=useRef(false), sessionId=useRef(null), tsStart=useRef(null);

  useEffect(()=>{/* bot starts when user clicks button */},[]);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  useEffect(()=>{if(!typing&&lang&&!done&&view==="chat")setTimeout(()=>inp.current?.focus(),80);},[typing,lang,done,view]);

  function push(m){setMsgs(p=>[...p,{id:Date.now()+Math.random(),...m}]);}

  async function start(){
    setView("chat");
    sessionId.current = "r:" + Date.now();
    tsStart.current = new Date().toISOString();
    setActiveField("name");
    const op = "Bienvenido/a a tu Test de Personalidad Social.\n\nVamos a charlar un rato sobre como te moves por el mundo. Al final te voy a dar un perfil completo sobre vos.\n\nSe dice que te saca la ficha bastante bien 😄";
    await sleep(300); setTyping(true); await sleep(900); setTyping(false);
    push({role:"bot", text:op});
    await sleep(450); setTyping(true); await sleep(600); setTyping(false);
    const first = localQuestion("name", "es", "");
    push({role:"bot", text:first});
    setHist([{role:"assistant", content:first}]);
  }

  async function submit(){
    const text = input.trim();
    if (!text||typing||done||busy.current) return;
    busy.current = true; setInput("");
    push({role:"user", text});

    const nt = turns+1; setTurns(nt);
    // Validate answer for the current field before saving
    const answerValid = isValidForField(activeField, text);
    const nd = {...data};
    if (answerValid) nd[activeField] = text;
    setData(nd);
    // Build collected string only from fields with validated values
    const collectedStr = Object.entries(nd).filter(([,v])=>v).map(([k,v])=>k+"="+v).join(", ") || "nothing yet";
    const myName = nd.name || "";

    const nh = [...hist, {role:"user", content:text}];
    setTyping(true);

    const fallbackNext = TOPICS[Math.min(topicI+1, TOPICS.length-1)];
    const stage = nt < 4 ? "warmup" : nt < 11 ? "open_conversation" : "wind_down";
    const reply = await nextTurn("es", nh, stage, collectedStr, fallbackNext, activeField, text, myName);

    await sleep(150+Math.random()*300);
    setTyping(false);
    push({role:"bot", text:reply});
    setHist([...nh, {role:"assistant", content:reply}]);
    if (answerValid) setTopicI(i => Math.min(i+1, TOPICS.length-1));

    // Detect what field the bot just asked about → that field captures the NEXT user answer
    // If the answer was invalid, the AI will re-ask; try to keep tracking the same field
    const detected = detectNextTopic(reply);
    if (detected) setActiveField(detected);
    else if (!answerValid) setActiveField(activeField); // hold position if invalid answer
    else setActiveField(fallbackNext);

    // Save partial after every turn
    await savePartial(sessionId.current, nd, "es");

    if (isDone(reply) || topicI+1 >= TOPICS.length) {
      await sleep(700); setTyping(true);
      const res = await finalize("es", [...nh, {role:"assistant", content:reply}]);
      const merged = {...nd, ...res.data};
      setTyping(false);
      push({role:"result", lp:res.lp, arcId:res.arcId, report:res.report, sign:res.sign, saturn:res.saturn});
      setDone(true);
      await saveResp(sessionId.current, merged, "es", res.lp, res.arcId, res.report, res.sign, res.saturn);
    }
    busy.current = false;
  }

  function onKey(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}

  function shareText(arcId,lp){
    const A=ARC[arcId],AL=A.es,ln=LPes[lp]||"";
    return "Hice el Test de Personalidad Social de Ally\n\nSoy "+AL.n+" "+A.e+"\n\n\""+AL.t+"\"\n\nCamino de Vida "+lp+" — "+ln+"\n\nY vos?";
  }
  async function share(arcId,lp,t){
    try{await navigator.clipboard.writeText(shareText(arcId,lp));}catch{}
    if(t==="fb") window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://ally.app"),"_blank");
    else if(t==="ig"){setSmsg("Copiado — pegalo en tu historia");setTimeout(()=>setSmsg(""),3000);}
    else{setCopied(true);setTimeout(()=>setCopied(false),2500);}
  }
  function reset(){
    setView("choose");setMsgs([]);setHist([]);setInput("");setTyping(false);
    setDone(false);setTurns(0);setTopicI(0);setActiveField("name");setData({});
    setEmail("");setEmailOk(false);setCopied(false);setSmsg("");
  }

  const prog = Math.min(95, Math.round((topicI/TOPICS.length)*100));

  // ── OPENING SCREEN WITH CARICATURES ───────────────────────────────────────────
  const arcIds = ["weaver", "catalyst", "tide", "oracle", "scout", "mirror", "anchor", "spark", "seed"];
  if (view === "choose") return (
    <div className="ally-root" style={{margin:"0 auto",minHeight:"100vh",background:"#090705",backgroundImage:"radial-gradient(rgba(242,237,230,.04) 1px,transparent 1px)",backgroundSize:"36px 36px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6",position:"relative",overflow:"auto"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(191,160,98,.09) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:900,textAlign:"center"}} className="fi">
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:4,color:"rgba(191,160,98,.7)",textTransform:"uppercase",marginBottom:16}}>✦ &nbsp;Ally&nbsp; ✦</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,8vw,60px)",fontWeight:300,lineHeight:1.0,color:"#F2EDE6",marginBottom:4}}>¿Cuál</h1>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,8vw,60px)",fontWeight:600,fontStyle:"italic",lineHeight:1.0,color:"#BFA062",marginBottom:16}}>de los 9 sos vos?</h1>
        <div style={{width:40,height:1,background:"rgba(191,160,98,.4)",margin:"0 auto 20px"}}/>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:300,fontStyle:"italic",color:"rgba(242,237,230,.55)",lineHeight:1.65,marginBottom:40}}>9 personalidades. Una es incómodamente la tuya.</p>

        {/* Caricature Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:12,marginBottom:40,maxWidth:600,margin:"0 auto 40px"}}>
          {arcIds.map(arcId => {
            const arc = ARC[arcId];
            return (
              <div key={arcId} style={{borderRadius:12,overflow:"hidden",border:"2px solid "+arc.br,background:arc.bg,cursor:"pointer",transition:"all .2s",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseOver={e=>{e.currentTarget.style.boxShadow="0 0 20px "+arc.c+"88"}} onMouseOut={e=>{e.currentTarget.style.boxShadow="none"}}>
                <img src={`/caricatures${version==="football"?"-football":""}/`+CARICATURES[arcId]} alt={arc.es.n} style={{width:"80%",height:"80%",objectFit:"contain"}} onError={e=>{e.target.style.display="none"}}/>
              </div>
            );
          })}
        </div>

        <button onClick={()=>setView("chat")} style={{background:"rgba(191,160,98,.12)",border:"2px solid #BFA062",color:"#F2EDE6",padding:"16px 48px",borderRadius:14,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:600,letterSpacing:2,cursor:"pointer",transition:"all .3s",textTransform:"uppercase"}}>¡Hacé el test!</button>
      </div>
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────────────────────
  return (
    <div className="ally-root ally-chat" style={{margin:"0 auto",height:"100vh",background:"#090705",display:"flex",flexDirection:"column",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6"}}>
      <style>{CSS}</style>
      <div style={{padding:"13px 18px 10px",borderBottom:"1px solid rgba(242,237,230,.07)",background:"#090705",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.12)",border:"1px solid rgba(191,160,98,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#BFA062"}}>✦</div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:500,letterSpacing:.6}}>Ally</div>
              <div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>{done?"Completo":typing?"Escribiendo...":"En linea"}</div>
            </div>
          </div>
          {done&&<div style={{fontSize:11,color:"rgba(141,196,122,.8)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>✓ Saved</div>}
        </div>
        <div style={{height:2,background:"rgba(242,237,230,.07)",borderRadius:2}}>
          <div style={{width:prog+"%",height:"100%",background:"#BFA062",borderRadius:2,transition:"width .6s"}}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 15px 6px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map(m => {
          if (m.role==="user") return (
            <div key={m.id} className="mu" style={{display:"flex",justifyContent:"flex-end"}}>
              <div style={{maxWidth:"76%",padding:"13px 17px",background:"rgba(191,160,98,.18)",border:"1px solid rgba(191,160,98,.28)",borderRadius:"18px 18px 4px 18px",fontSize:17,lineHeight:1.65,color:"#F2EDE6"}}>{m.text}</div>
            </div>
          );
          if (m.role==="bot") return (
            <div key={m.id} className="mu" style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(191,160,98,.8)"}}>✦</div>
              <div style={{maxWidth:"78%",padding:"13px 17px",background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.09)",borderRadius:"18px 18px 18px 4px",fontSize:17,lineHeight:1.72,color:"rgba(242,237,230,.92)",whiteSpace:"pre-line"}}>{m.text}</div>
            </div>
          );
          if (m.role==="result") {
            const arc=ARC[m.arcId]||ARC.catalyst, AL=arc.es;
            const lpn = LPes[m.lp]||"";
            const signData = m.sign && SIGNS[m.sign];
            const signLabel = signData ? signData.es : null;
            const signTrait = m.sign && SIGN_TRAIT[m.sign] ? SIGN_TRAIT[m.sign].es : null;
            const saturnText = m.saturn && SATURN_MSG[m.saturn] ? SATURN_MSG[m.saturn].es : null;
            return (
              <div key={m.id} className="pp" style={{margin:"4px 0"}}>
                <div style={{borderRadius:20,overflow:"hidden",border:"2px solid "+arc.br,boxShadow:"0 0 60px "+arc.c+"22"}}>

                  {/* ── Archetype header ── */}
                  <div style={{background:arc.bg,padding:"34px 22px 26px",textAlign:"center",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,"+arc.c+"20 0%,transparent 70%)",pointerEvents:"none"}}/>
                    <img src={`/caricatures${version==="football"?"-football":""}/{CARICATURES[m.arcId]||m.arcId+".jpg"}`} alt={AL.n} style={{width:140,height:140,marginBottom:16,filter:"drop-shadow(0 0 20px "+arc.c+"88)"}} onError={e=>{e.target.style.display="none"}} />
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:4,color:arc.c+"99",textTransform:"uppercase",marginBottom:8}}>Tu tipo es</div>
                    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,8vw,46px)",fontWeight:600,letterSpacing:3,color:"#F2EDE6",marginBottom:6,textShadow:"0 0 40px "+arc.c+"66"}}>{AL.n}</h2>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:3,color:arc.c,textTransform:"uppercase",marginBottom:18}}>{AL.s}</div>
                    <div style={{background:arc.c+"15",border:"1px solid "+arc.c+"40",borderRadius:12,padding:"13px 18px",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"rgba(242,237,230,.9)",lineHeight:1.5}}>"{AL.t}"</div>

                    {/* Animated GIF (served as MP4 for reliability) */}
                    {arc.gifId && (
                      <div style={{marginTop:16,borderRadius:14,overflow:"hidden",border:"1px solid "+arc.c+"30",position:"relative"}} ref={el=>{if(el&&!el.dataset.tried){el.dataset.tried="1";}}}>
                        <video autoPlay muted loop playsInline
                          style={{width:"100%",maxHeight:220,objectFit:"cover",display:"block"}}
                          onError={e=>{e.target.parentElement.style.display="none";}}>
                          <source src={"https://media.giphy.com/media/"+arc.gifId+"/giphy.mp4"} type="video/mp4"/>
                        </video>
                        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 14px",background:"linear-gradient(transparent,rgba(0,0,0,.82))",fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:"rgba(242,237,230,.92)",textAlign:"left"}}>{AL.gc}</div>
                      </div>
                    )}

                    {/* Life Path */}
                    <div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.12)",borderRadius:20,padding:"5px 14px"}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(242,237,230,.5)",letterSpacing:1}}>Camino de Vida {m.lp} — {lpn}</span>
                    </div>

                    {/* Sun sign */}
                    {signLabel && signTrait && (
                      <div style={{marginTop:12,padding:"11px 16px",background:"rgba(242,237,230,.05)",border:"1px solid rgba(242,237,230,.1)",borderRadius:12,textAlign:"left"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:3,color:arc.c+"bb",textTransform:"uppercase",marginBottom:5}}>
                          {signData.e} Sol en {signLabel}
                        </div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:"rgba(242,237,230,.8)",lineHeight:1.5}}>{signTrait}</div>
                      </div>
                    )}

                    {/* Saturn return */}
                    {saturnText && (
                      <div style={{marginTop:10,padding:"11px 16px",background:"rgba(147,112,219,.08)",border:"1px solid rgba(147,112,219,.25)",borderRadius:12,fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:"rgba(242,237,230,.85)",lineHeight:1.5,textAlign:"left"}}>
                        {saturnText}
                      </div>
                    )}
                  </div>

                  {/* ── Profile section ── */}
                  <div style={{background:"rgba(6,5,3,.98)",padding:"20px 18px"}}>
                    <div style={{fontFamily:"'Barlow',sans-serif",fontSize:15,lineHeight:1.9,color:"rgba(242,237,230,.8)",whiteSpace:"pre-wrap",wordBreak:"break-word",marginBottom:20}}>{m.report?.replace(/\*\*/g,"")}</div>
                    <div style={{height:1,background:"rgba(242,237,230,.07)",marginBottom:16}}/>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:3,color:arc.c+"88",textTransform:"uppercase",textAlign:"center",marginBottom:12}}>Te identificas? Compartilo 👇</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      <button className="sfb" onClick={()=>share(m.arcId,m.lp,"fb")}><span style={{fontSize:17,fontWeight:700}}>f</span>COMPARTIR EN FACEBOOK</button>
                      <button className="sig" onClick={()=>share(m.arcId,m.lp,"ig")}><span style={{fontSize:14}}>◎</span>COMPARTIR EN INSTAGRAM</button>
                      {smsg&&<div style={{textAlign:"center",fontSize:12,color:"rgba(141,196,122,.8)",padding:"3px 0"}}>{smsg}</div>}
                      <button className="scp" onClick={()=>share(m.arcId,m.lp,"copy")}>{copied?"✓ COPIADO":"COPIAR TEXTO"}</button>
                    </div>
                    {!emailOk ? (
                      <div style={{background:"rgba(242,237,230,.04)",border:"1px solid rgba(242,237,230,.08)",borderRadius:12,padding:"13px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:arc.c+"CC",textTransform:"uppercase",marginBottom:8}}>Cuando lanza Ally?</div>
                        <div style={{display:"flex",gap:8}}>
                          <input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&email.includes("@"))setEmailOk(true);}}/>
                          <button onClick={()=>email.includes("@")&&setEmailOk(true)} style={{background:arc.c,border:"none",borderRadius:8,padding:"0 15px",color:"#090705",fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:600,cursor:"pointer",flexShrink:0}}>→</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{textAlign:"center",padding:12,background:arc.c+"10",borderRadius:10,fontSize:13,color:"rgba(242,237,230,.6)"}}>Estas en la lista! 🎉</div>
                    )}
                  </div>
                </div>
                <div style={{textAlign:"center",marginTop:12}}>
                  <button onClick={reset} style={{background:"none",border:"none",color:"rgba(242,237,230,.22)",fontSize:12,fontFamily:"'Barlow',sans-serif",cursor:"pointer",textDecoration:"underline"}}>Empezar de nuevo</button>
                </div>
              </div>
            );
          }
          return null;
        })}
        {typing && (
          <div className="mu" style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(191,160,98,.8)"}}>✦</div>
            <div style={{padding:"13px 17px",background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.09)",borderRadius:"18px 18px 18px 4px",display:"flex",gap:5,alignItems:"center"}}>
              <span className="dot"/><span className="dot"/><span className="dot"/>
            </div>
          </div>
        )}
        <div ref={bot}/>
      </div>

      {!done && (
        <div style={{padding:"10px 15px 20px",borderTop:"1px solid rgba(242,237,230,.07)",background:"#090705",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,background:"rgba(242,237,230,.05)",border:"1px solid rgba(242,237,230,.1)",borderRadius:16,padding:"12px 12px 12px 16px"}}>
            <textarea ref={inp} rows={1} value={input}
              onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,140)+"px";}}
              onKeyDown={onKey}
              placeholder={typing?"...":"Escribe tu respuesta..."}
              disabled={typing} style={{height:"26px"}}/>
            <button onClick={submit} disabled={!input.trim()||typing}
              style={{width:36,height:36,borderRadius:"50%",flexShrink:0,border:"none",
                background:input.trim()&&!typing?"#BFA062":"rgba(242,237,230,.08)",
                cursor:input.trim()&&!typing?"pointer":"default",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"background .2s",fontSize:16,
                color:input.trim()&&!typing?"#090705":"rgba(242,237,230,.2)"}}>↑</button>
          </div>
          <div style={{textAlign:"center",marginTop:6,fontSize:11,color:"rgba(242,237,230,.18)"}}>Enter para enviar</div>
        </div>
      )}
    </div>
  );
}
