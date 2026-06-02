import { useState, useRef, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════════
//  ALLY — definitive build
//  AI drives the conversation. A local engine guarantees it never breaks.
// ════════════════════════════════════════════════════════════════════════════

const ARC = {
  weaver:  { e:"🕸️", c:"#C9A84C", bg:"linear-gradient(135deg,#1a1200,#2d1f00,#1a1200)", br:"rgba(201,168,76,.5)",
    en:{n:"THE WEAVER",  s:"The Connector",  t:"Everyone's calling you. You're not always picking up.",ss:"You're basically LinkedIn with an actual personality."},
    es:{n:"EL TEJEDOR",  s:"El Conector",    t:"Todo el mundo te llama. No siempre atendes.",           ss:"Sos basicamente LinkedIn pero con personalidad."} },
  catalyst:{ e:"🔥", c:"#E8714A", bg:"linear-gradient(135deg,#1a0800,#2d1200,#1a0800)", br:"rgba(232,113,74,.5)",
    en:{n:"THE CATALYST",s:"The Mover",      t:"Always in motion. Occasionally lost. Usually fine.",    ss:"You will figure it out. You always do."},
    es:{n:"EL CATALIZADOR",s:"El Motor",     t:"Siempre en movimiento. Generalmente bien.",              ss:"Lo vas a resolver. Siempre lo haces."} },
  anchor:  { e:"⚓", c:"#7BAFC4", bg:"linear-gradient(135deg,#001018,#001a28,#001018)", br:"rgba(123,175,196,.5)",
    en:{n:"THE ANCHOR",  s:"The Foundation", t:"You don't rush. Things come to you.",                   ss:"You have 3 contacts. They are all exactly right."},
    es:{n:"EL ANCLA",    s:"La Base",        t:"No te apuras. Las cosas llegan a vos.",                 ss:"Tenes 3 contactos. Los tres son exactamente los correctos."} },
  spark:   { e:"⚡", c:"#8DC47A", bg:"linear-gradient(135deg,#091400,#122400,#091400)", br:"rgba(141,196,122,.5)",
    en:{n:"THE SPARK",   s:"The Builder",    t:"Earlier than most. More intentional than all of them.", ss:"Building the network others wish they had at your age."},
    es:{n:"LA CHISPA",   s:"La Constructora",t:"Mas temprano que la mayoria. Mas intencional que todos.",ss:"Construyendo la red que otros quisieran haber tenido."} },
};
const LPen={1:"The Leader",2:"The Mediator",3:"The Communicator",4:"The Builder",5:"The Explorer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",9:"The Humanitarian",11:"The Visionary",22:"The Master Builder"};
const LPes={1:"El Lider",2:"El Mediador",3:"El Comunicador",4:"El Constructor",5:"El Explorador",6:"El Cuidador",7:"El Buscador",8:"El Realizador",9:"El Humanitario",11:"El Visionario",22:"El Gran Constructor"};
function calcLP(s){const d=(s||"").replace(/\D/g,"").split("").map(Number);if(!d.length)return 5;let n=d.reduce((a,b)=>a+b,0);while(n>9&&n!==11&&n!==22)n=String(n).split("").map(Number).reduce((a,b)=>a+b,0);return n||5;}
function detectArc(d){const s={w:0,c:0,a:0,sp:0},g=k=>(d[k]||"").toLowerCase();
  if(/student|estudi/.test(g("occ")))s.sp+=3;if(/founder|startup|emprend/.test(g("occ")))s.c+=2;if(/retir|jubil/.test(g("occ")))s.a+=3;
  if(/mov|mud|new job|nuevo trabajo/.test(g("chg")))s.c+=2;if(/nothing|stable|nada|tranqui/.test(g("chg")))s.a+=2;
  if(/always|siempre|all the time/.test(g("conn")))s.w+=4;if(/often|seguido/.test(g("conn")))s.w+=2;
  const yr=(d.dob||"").match(/\b(19|20)\d{2}\b/);if(yr){const a=new Date().getFullYear()-parseInt(yr[0]);if(a<28)s.sp+=2;if(a>55)s.a+=2;}
  return[["weaver",s.w],["catalyst",s.c],["anchor",s.a],["spark",s.sp]].sort((a,b)=>b[1]-a[1])[0][0];}

const isNo=s=>/^no\b|nunca|never|not really|nope|para nada/.test((s||"").toLowerCase().trim());
const isYes=s=>/si\b|yes|claro|absolutely|definitely|por supuesto/.test((s||"").toLowerCase());

// ── SYSTEM PROMPT (clean array join) ────────────────────────────────────────
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
    "When they share their occupation, give a big specific genuine compliment first. Student = most exciting stage of life. Stay-at-home parent = the most important job in the world, more skill than most corporate jobs. Entrepreneur = betting on yourself takes real courage. Doctor/nurse = the backbone of any community. Teacher = literally shaping the future. Retired = a whole lifetime of wisdom. If they work AND study, compliment BOTH and ask about both in one question.",
    "",
    "Handle all user types equally. If someone says they don't network or don't need to find people, do NOT push or correct them. Warmly accept it and get curious about how they function without it. 'No' is useful, never a failure.",
    "",
    "Already learned about this person: "+(collected||"nothing yet")+".",
    "",
    "Explore naturally as the conversation allows: their name; date of birth (never explain why you ask); city; work/study/both/transition; whether they like their path and want growth; how they meet people and find help; how often they need someone new; what steps they take when they need someone; whether they ever felt blocked or missed an opportunity for lack of the right connection; whether people come to them for introductions; and finally whether they would try a tool that finds the right person inside their own network.",
    "",
    "COMPLETION: after about 14 exchanges, once you understand how this person connects, end with exactly: 'Perfect [name], calculating your profile now...' and stop.",
    "",
    "NEVER say: survey, research, data, questionnaire, segmentation.",
  ];
  if (lang === "es") return common.join("\n") + "\n\nThe user chose Spanish. Respond ONLY in natural Argentine Spanish with voseo (vos, tenes, sos, haces, queres). Completion line: 'Perfecto [nombre], calculando tu perfil ahora...'";
  return common.join("\n") + "\n\nThe user chose English.";
}

const isDone = t => /calculando tu perfil|calculating your profile/i.test(t||"");

// ── VALIDATOR ────────────────────────────────────────────────────────────────
function valid(text) {
  if (!text || text.length < 2) return false;
  if (/\b(survey|research|questionnaire|encuesta|cuestionario|investigaci)/i.test(text)) return false;
  const qs = (text.match(/\?|¿/g) || []).length;
  if (isDone(text)) return true;            // completion line is allowed with no question
  if (qs === 0) return false;               // must ask something
  if (qs > 3) return false;                 // one question (allow ¿...? = 2 marks)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  if (sentences > 5) return false;
  return true;
}

// ── LOCAL FALLBACK ENGINE (guarantees the chat never breaks) ────────────────
// Ordered topics. The engine reacts to the last answer + asks the next gap.
const TOPICS = [
  "name","dob","city","occ","jobfeel","grow","chg","freq","steps","social","pro","missed","conn","count","advance"
];

function localAck(lastTopic, answer, lang) {
  const es = lang === "es", a = (answer||"").toLowerCase();
  if (lastTopic === "name") return es ? "Un placer, "+answer+"!" : "Great to meet you, "+answer+"!";
  if (lastTopic === "dob") return es ? "Perfecto." : "Got it.";
  if (lastTopic === "city") return es ? answer+"! Buenisimo." : answer+"! Nice.";
  if (lastTopic === "occ") {
    const both = (/work|job|trabajo|labur/.test(a)&&/studi|estudia|carrera|univers/.test(a))||/both|las dos|ambas/.test(a);
    if (both) return es ? "Wow, trabajas Y estudias al mismo tiempo, eso requiere una energia increible." : "Wow, you work AND study at the same time, that takes incredible energy.";
    if (/estudi|student/.test(a)) return es ? "Wow, estudiante! El momento mas emocionante de la vida." : "Wow, a student! The most exciting stage of life.";
    if (/ama de casa|hogar|familia|mom|mother|home/.test(a)) return es ? "El trabajo mas importante del mundo, en serio, enorme respeto." : "Honestly the most important job in the world, huge respect.";
    if (/emprend|founder|startup/.test(a)) return es ? "Emprendedor/a! Eso requiere una valentia que pocos tienen." : "An entrepreneur! That takes courage most people only talk about.";
    if (/medic|doctor|nurs|salud|health/.test(a)) return es ? "Salud! De verdad gracias, son la red mas importante de cualquier comunidad." : "Healthcare, honestly thank you, the backbone of any community.";
    if (/maest|profe|docen|teach/.test(a)) return es ? "Docente! Estas moldeando el futuro literalmente." : "A teacher! Literally shaping the future.";
    if (/jubil|retir/.test(a)) return es ? "Una vida entera construida, eso vale mas que cualquier titulo." : "A whole lifetime built, worth more than any degree.";
    return es ? "Wow, "+answer+", que mundo interesante." : "Wow, "+answer+", what an interesting world.";
  }
  if (lastTopic === "jobfeel") return isNo(answer) ? (es?"Honesto, eso tiene merito admitirlo.":"Honest, that takes guts to admit.") : (es?"Se nota que lo disfrutas.":"That really comes through.");
  if (lastTopic === "grow") return isNo(answer) ? (es?"Saber donde queres estar ya es una habilidad.":"Knowing where you want to be is a skill in itself.") : (es?"Me encanta esa ambicion.":"Love that ambition.");
  if (lastTopic === "chg") {
    if (/mud|ciudad|mov|city/.test(a)) return es ? "Mudarse resetea todo, la red incluida." : "Moving resets everything, your network included.";
    if (isNo(answer)||/nada|nothing|tranqui/.test(a)) return es ? "La estabilidad dice mucho tambien." : "Stability says a lot too.";
    return es ? "Eso suena importante." : "That sounds significant.";
  }
  if (lastTopic === "freq") return isNo(answer) ? (es?"Interesante, eso quiere decir que tu red ya cubre bastante.":"Interesting, that means your network already covers a lot.") : (es?"Entiendo.":"Got it.");
  if (lastTopic === "steps") {
    if (/google/.test(a)) return es ? "Google, el recurso universal." : "Google, the universal fallback.";
    if (/whatsapp|grupo|group/.test(a)) return es ? "El boca a boca digital, un clasico." : "Digital word of mouth, a classic.";
    if (/amigo|friend|pregunt|ask/.test(a)) return es ? "Preguntarle a alguien de confianza, la mejor red que existe." : "Asking someone you trust, still the best network there is.";
    return es ? "Interesante proceso." : "Interesting process.";
  }
  if (lastTopic === "social") return isNo(answer) ? (es?"Interesante, mucha gente no las usa para eso.":"Interesting, a lot of people don't use them for that.") : (es?"Buenisimo.":"Good.");
  if (lastTopic === "pro") return isNo(answer) ? (es?"Interesante, tu red ya cubre esas situaciones entonces.":"Interesting, your network already covers those then.") : (es?"Tiene sentido.":"That makes sense.");
  if (lastTopic === "missed") return isYes(answer)||/paso|me paso|varias/.test(a) ? (es?"Eso le pasa a todos, la respuesta estaba ahi, invisible.":"That happens to everyone, the answer was right there, invisible.") : (es?"Eso dice algo bueno de como buscas.":"That says something good about how you search.");
  if (lastTopic === "conn") return /siempre|always|often|seguido/.test(a) ? (es?"El conector de cabecera, eso es un superpoder real.":"The go-to connector, that's a real superpower.") : (es?"No todos tienen ese rol y esta perfecto.":"Not everyone plays that role and that's fine.");
  if (lastTopic === "count") return es ? "Mas de lo que la mayoria se da cuenta." : "More than most people realize.";
  return es ? "Buenisimo." : "Got it.";
}

function localQuestion(topic, lang, name) {
  const es = lang === "es";
  const Q = {
    name:    es?"Empecemos, como te llamas?":"Let's start — what's your name?",
    dob:     es?(name?name+", ":"")+"cual es tu fecha de nacimiento? Dia, mes y anio.":(name?name+", ":"")+"what's your date of birth? Day, month and year.",
    city:    es?"De donde sos?":"Where are you from?",
    occ:     es?"Y que haces en la vida, trabajas, estudias, emprendes?":"What do you do in life — work, study, run something?",
    jobfeel: es?"Te gusta lo que haces, o llegaste ahi de casualidad?":"Do you love what you do, or did you end up there by accident?",
    grow:    es?"Tenes ganas de crecer en eso, o hay algo diferente que te llama?":"Do you want to grow in that, or is something else calling you?",
    chg:     es?(name?name+", ":"")+"esta pasando algo nuevo en tu vida, o esta por pasar?":(name?name+", ":"")+"is anything new happening in your life, or about to?",
    freq:    es?"Cada cuanto necesitas encontrar a alguien nuevo, un profesional, un contacto?":"How often do you need to find someone new — a professional, a contact?",
    steps:   es?"Cuando necesitas encontrar a alguien especifico, que haces primero?":"When you need to find someone specific, what do you do first?",
    social:  es?"Usas las redes sociales para conectar o encontrar gente?":"Do you use social media to connect or find people?",
    pro:     es?"En el ultimo anio necesitaste encontrar algun profesional que no tenias, para cualquier cosa en la vida?":"In the last year, did you need to find a professional you didn't have, for anything in life?",
    missed:  es?(name?name+", ":"")+"alguna vez te diste cuenta tarde de que alguien que ya tenias en tus contactos podia haber ayudado?":(name?name+", ":"")+"did you ever realize too late that someone already in your contacts could have helped?",
    conn:    es?"La gente viene a vos a pedirte que los conectes con alguien?":"Do people come to you asking to be connected with someone?",
    count:   es?"En el ultimo anio, cuantas personas conectaste con alguien que necesitaban?":"In the last year, how many people did you connect to someone they needed?",
    advance: es?"Ultima, si existiera una app que encuentra a la persona correcta dentro de tus propios contactos en segundos, la probarias?":"Last one — if an app existed that found the right person inside your own contacts in seconds, would you try it?",
  };
  return Q[topic] || (es?"Contame un poco mas?":"Tell me a bit more?");
}

// ── API ──────────────────────────────────────────────────────────────────────
async function rawCall(system, messages, maxTokens) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens||200, system, messages }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!Array.isArray(d?.content)) return null;
    return d.content.map(c=>c.text||"").join("").trim() || null;
  } catch { return null; }
}

// Turn handler: AI primary, validate, one repair, else local fallback.
async function nextTurn(lang, history, stage, collected, nextTopic, lastTopic, lastAnswer, name) {
  let reply = await rawCall(systemPrompt(lang, stage, collected), history, 200);
  if (reply && !valid(reply)) {
    // one auto-repair attempt
    const repair = "Rewrite this to follow strict rules: max 3 sentences, exactly one question, no lists, no survey words, keep the same meaning, natural and conversational. Message: \"\"\""+reply+"\"\"\"";
    const fixed = await rawCall(systemPrompt(lang, stage, collected), [...history, {role:"assistant",content:reply}, {role:"user",content:repair}], 200);
    reply = (fixed && valid(fixed)) ? fixed : null;
  }
  if (reply && valid(reply)) return reply;
  // deterministic fallback: smart ack + next gap question
  const ack = localAck(lastTopic, lastAnswer, lang);
  const q   = localQuestion(nextTopic, lang, name);
  return ack + " " + q;
}

async function finalize(lang, history) {
  const convo = history.map(m => (m.role==="user"?"USER":"ALLY")+": "+m.content).join("\n");
  let data = {};
  const ext = await rawCall(
    "Extract data from the conversation. Return ONLY valid JSON, no markdown.",
    [{role:"user",content:"Extract values for keys discussed. Only include keys with clear answers.\nKeys: name, dob, city, occ, jobfeel, grow, chg, freq, steps, social, pro, found, srchtime, srchfeel, missed, conn, count, advance\n\nConversation:\n"+convo+"\n\nReturn JSON only."}],
    500
  );
  if (ext) { try { data = JSON.parse(ext.replace(/```json|```/g,"").trim()); } catch {} }

  const lp=calcLP(data.dob||""), arcId=detectArc(data), arc=ARC[arcId], AL=arc[lang], lpn=lang==="es"?(LPes[lp]||""):(LPen[lp]||""), n=data.name||"";
  const sum=Object.entries(data).map(([k,v])=>k+": "+v).join("\n");
  const sys=lang==="es"?"Guia de personalidad. Espanol argentino con voseo. Especifico, mistico, compartible. NUNCA encuestas ni datos. Solo el texto.":"Personality guide. Specific, mystical, shareable. NEVER surveys or data. Only profile text.";
  const p=lang==="es"
    ?"Perfil para "+n+". Tipo: "+AL.n+" ("+AL.s+"). Camino de Vida "+lp+" - "+lpn+".\n\nDATOS:\n"+sum+"\n\nFORMATO EXACTO:\n\n🎁 TU DON SOCIAL\n[2 oraciones MUY especificas usando datos reales.]\n\n⚡ TU PUNTO CIEGO\n[1 oracion honesta y amable.]\n\n🔢 Numero de vida "+lp+" - "+lpn+".\n[1 oracion sobre como conectas.]\n\n😄 LA VERDAD QUE NADIE TE DICE\n[1 linea graciosa y especifica que quiera mandar ahora.]"
    :"Profile for "+n+". Type: "+AL.n+" ("+AL.s+"). Life Path "+lp+" - "+lpn+".\n\nDATA:\n"+sum+"\n\nEXACT FORMAT:\n\n🎁 YOUR SOCIAL GIFT\n[2 VERY specific sentences using real details.]\n\n⚡ YOUR BLIND SPOT\n[1 honest gentle sentence.]\n\n🔢 Life number "+lp+" - "+lpn+".\n[1 sentence on how you connect.]\n\n😄 THE TRUTH NOBODY TELLS YOU\n[1 funny specific line they will want to send right now.]";
  let report = await rawCall(sys, [{role:"user",content:p}], 700);
  if (!report) {
    report = lang==="es"
      ?"🎁 TU DON SOCIAL\nTenes una manera natural de entender que necesita la gente. Conectas con proposito.\n\n⚡ TU PUNTO CIEGO\nSubestimas el valor de lo que ya tenes en tu red.\n\n🔢 Numero de vida "+lp+" - "+lpn+".\nConectas con intencion, no por accidente.\n\n😄 LA VERDAD QUE NADIE TE DICE\nSos la persona a la que todos llaman cuando necesitan algo y la ultima a la que piensan en agradecer. Clasico."
      :"🎁 YOUR SOCIAL GIFT\nYou have a natural sense of what people need before they say it.\n\n⚡ YOUR BLIND SPOT\nYou underestimate what is already in your network.\n\n🔢 Life number "+lp+" - "+lpn+".\nYou connect with intention, not by accident.\n\n😄 THE TRUTH NOBODY TELLS YOU\nYou are the one everyone calls when they need something and the last one they think to thank. Classic.";
  }
  return { data, lp, arcId, report };
}

async function saveResp(data,lang,lp,arcId,report){
  try{
    const id="r:"+Date.now();
    await window.storage.set(id,JSON.stringify({id,ts:new Date().toISOString(),lang,lp,arc:arcId,...data,report}),true);
    let idx=[];try{const r=await window.storage.get("aidx",true);if(r)idx=JSON.parse(r.value);}catch{}
    await window.storage.set("aidx",JSON.stringify([...idx,id]),true);
  }catch{}
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ago=ts=>{const m=Math.floor((Date.now()-new Date(ts))/60000);return m<1?"just now":m<60?m+"m ago":m<1440?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago";};

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Barlow+Condensed:wght@300;400;500;600&family=Barlow:wght@300;400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{background:#090705;-webkit-font-smoothing:antialiased;overflow:hidden}
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

export default function App() {
  const [view,   setView]   = useState("lang");
  const [lang,   setLang]   = useState(null);
  const [msgs,   setMsgs]   = useState([]);
  const [hist,   setHist]   = useState([]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const [done,   setDone]   = useState(false);
  const [turns,  setTurns]  = useState(0);
  const [topicI, setTopicI] = useState(0);   // local fallback progress
  const [data,   setData]   = useState({});
  const [email,  setEmail]  = useState("");
  const [emailOk,setEmailOk]= useState(false);
  const [copied, setCopied] = useState(false);
  const [smsg,   setSmsg]   = useState("");
  const [resps,  setResps]  = useState([]);
  const [sel,    setSel]    = useState(null);
  const [loading,setLoading]= useState(false);

  const bot=useRef(null), inp=useRef(null), busy=useRef(false);

  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  useEffect(()=>{if(!typing&&lang&&!done&&view==="chat")setTimeout(()=>inp.current?.focus(),80);},[typing,lang,done,view]);

  function push(m){setMsgs(p=>[...p,{id:Date.now()+Math.random(),...m}]);}

  async function start(l){
    setLang(l);setView("chat");
    const op=l==="es"
      ?"Bienvenido/a a tu Test de Personalidad Social.\n\nVamos a charlar un rato sobre como te moves por el mundo. Al final te doy un perfil completo.\n\nLa mayoria dice que es incomodamente preciso 😄"
      :"Welcome to your Social Personality Test.\n\nLet's just chat for a bit about how you move through the world. At the end I'll give you a full profile.\n\nMost people say it is uncomfortably accurate 😄";
    await sleep(300);setTyping(true);await sleep(900);setTyping(false);
    push({role:"bot",text:op});
    await sleep(450);setTyping(true);await sleep(600);setTyping(false);
    const first=localQuestion("name",l,"");
    push({role:"bot",text:first});
    setHist([{role:"assistant",content:first}]);
  }

  async function submit(){
    const text=input.trim();
    if(!text||typing||done||busy.current)return;
    busy.current=true;setInput("");
    push({role:"user",text});

    const nt=turns+1;setTurns(nt);
    const lastTopic = TOPICS[Math.min(topicI, TOPICS.length-1)];
    const nextTopicName = TOPICS[Math.min(topicI+1, TOPICS.length-1)];

    // capture for local data + fallback (keep latest answer under the topic key)
    const nd={...data,[lastTopic]:text};
    setData(nd);
    const collectedStr = Object.entries(nd).map(([k,v])=>k+"="+v).join(", ");
    const myName = nd.name || "";

    const nh=[...hist,{role:"user",content:text}];
    setTyping(true);

    const stage = nt < 4 ? "warmup" : nt < 11 ? "open_conversation" : "wind_down";
    const reply = await nextTurn(lang, nh, stage, collectedStr, nextTopicName, lastTopic, text, myName);

    await sleep(150+Math.random()*300);
    setTyping(false);
    push({role:"bot",text:reply});
    setHist([...nh,{role:"assistant",content:reply}]);
    setTopicI(i=>Math.min(i+1, TOPICS.length-1));

    // completion: model said it, OR we've covered all local topics
    if (isDone(reply) || topicI+1 >= TOPICS.length) {
      await sleep(700);setTyping(true);
      const res=await finalize(lang,[...nh,{role:"assistant",content:reply}]);
      // merge local data with extracted (extracted wins where present)
      const merged = {...nd, ...res.data};
      setTyping(false);
      push({role:"result",lp:res.lp,arcId:res.arcId,report:res.report});
      setDone(true);
      await saveResp(merged,lang,res.lp,res.arcId,res.report);
    }
    busy.current=false;
  }

  function onKey(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}

  function shareText(arcId,lp){const A=ARC[arcId],AL=A[lang],ln=lang==="es"?(LPes[lp]||""):(LPen[lp]||"");
    return lang==="es"?"Hice el Test de Personalidad Social de Ally\n\nSoy "+AL.n+" "+A.e+"\n\n\""+AL.t+"\"\n\nCamino de Vida "+lp+" - "+ln+"\n\nY vos?":"I took the Ally Social Personality Test\n\nI am "+AL.n+" "+A.e+"\n\n\""+AL.t+"\"\n\nLife Path "+lp+" - "+ln+"\n\nWhat are you?";}
  async function share(arcId,lp,t){try{await navigator.clipboard.writeText(shareText(arcId,lp));}catch{}
    if(t==="fb")window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://ally.app"),"_blank");
    else if(t==="ig"){setSmsg(lang==="es"?"Copiado - pegalo en tu historia":"Copied - paste into your story");setTimeout(()=>setSmsg(""),3000);}
    else{setCopied(true);setTimeout(()=>setCopied(false),2500);}}
  function reset(){setView("lang");setLang(null);setMsgs([]);setHist([]);setInput("");setTyping(false);setDone(false);setTurns(0);setTopicI(0);setData({});setEmail("");setEmailOk(false);setCopied(false);setSmsg("");}

  async function loadAdmin(){setLoading(true);
    try{let idx=[];try{const r=await window.storage.get("aidx",true);if(r)idx=JSON.parse(r.value);}catch{}
      const items=[];for(const id of idx){try{const r=await window.storage.get(id,true);if(r)items.push(JSON.parse(r.value));}catch{}}
      setResps(items.sort((a,b)=>new Date(b.ts)-new Date(a.ts)));}catch{}setLoading(false);}
  function exportCSV(){const keys=["ts","lang","name","dob","city","occ","jobfeel","grow","chg","freq","steps","social","pro","missed","conn","count","advance","lp","arc"];
    const rows=[keys.join(","),...resps.map(r=>keys.map(k=>"\""+((r[k]||"").toString().replace(/"/g,'""'))+"\"").join(","))];
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/csv"}));a.download="ally-responses-"+Date.now()+".csv";a.click();}

  const prog=Math.min(95,Math.round((topicI/TOPICS.length)*100));

  // ── LANG ──
  if(view==="lang")return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#090705",backgroundImage:"radial-gradient(rgba(242,237,230,.04) 1px,transparent 1px)",backgroundSize:"36px 36px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6",position:"relative"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(191,160,98,.09) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:340,textAlign:"center"}} className="fi">
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:4,color:"rgba(191,160,98,.7)",textTransform:"uppercase",marginBottom:36}}>✦ &nbsp;Ally&nbsp; ✦</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(44px,12vw,62px)",fontWeight:300,lineHeight:1.0,color:"#F2EDE6",marginBottom:2}}>Personality</h1>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(44px,12vw,62px)",fontWeight:600,fontStyle:"italic",lineHeight:1.0,color:"#BFA062",marginBottom:28}}>Test</h1>
        <div style={{width:40,height:1,background:"rgba(191,160,98,.4)",margin:"0 auto 20px"}}/>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:300,fontStyle:"italic",color:"rgba(242,237,230,.45)",lineHeight:1.65,marginBottom:46}}>Discover what kind of connector you really are</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:22}}>
          <button className="lb" onClick={()=>start("en")}>English</button>
          <button className="lb" onClick={()=>start("es")}>Español</button>
        </div>
        <button onClick={()=>{setView("admin");loadAdmin();}} style={{background:"none",border:"none",color:"rgba(242,237,230,.2)",fontSize:12,fontFamily:"'Barlow',sans-serif",cursor:"pointer",textDecoration:"underline"}}>View responses →</button>
      </div>
    </div>
  );

  // ── ADMIN ──
  if(view==="admin")return(
    <div style={{maxWidth:960,margin:"0 auto",height:"100vh",background:"#090705",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>
      <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(242,237,230,.08)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(191,160,98,.12)",border:"1px solid rgba(191,160,98,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#BFA062",fontSize:13}}>✦</div>
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:500,letterSpacing:.5}}>Ally Responses</div><div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>{loading?"Loading...":resps.length+" response"+(resps.length!==1?"s":"")}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={loadAdmin} style={{background:"none",border:"1px solid rgba(242,237,230,.15)",borderRadius:8,padding:"6px 12px",color:"rgba(242,237,230,.5)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>REFRESH</button>
          {resps.length>0&&<button onClick={exportCSV} style={{background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.3)",borderRadius:8,padding:"6px 12px",color:"#BFA062",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>CSV</button>}
          <button onClick={()=>{setView("lang");setSel(null);}} style={{background:"none",border:"1px solid rgba(242,237,230,.15)",borderRadius:8,padding:"6px 12px",color:"rgba(242,237,230,.5)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>BACK</button>
        </div>
      </div>
      {loading?(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"rgba(242,237,230,.3)"}}>Loading...</div>
      ):resps.length===0?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{fontSize:40,opacity:.3}}>✦</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"rgba(242,237,230,.4)"}}>No responses yet</div>
          <div style={{fontSize:13,color:"rgba(242,237,230,.2)"}}>Responses appear here when people finish the test</div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div style={{width:sel?270:"100%",flexShrink:0,overflowY:"auto",padding:"10px 0",borderRight:sel?"1px solid rgba(242,237,230,.07)":"none"}}>
            {resps.map(r=>(
              <div key={r.id} onClick={()=>setSel(r)} style={{margin:"0 12px 7px",padding:"11px 13px",background:sel?.id===r.id?"rgba(191,160,98,.08)":"rgba(242,237,230,.03)",border:"1px solid "+(sel?.id===r.id?"rgba(191,160,98,.4)":"rgba(242,237,230,.08)"),borderRadius:11,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:500,color:"#F2EDE6"}}>{r.name||"Anonymous"}</div>
                  <div style={{fontSize:11,color:"rgba(242,237,230,.3)",flexShrink:0,marginLeft:8}}>{ago(r.ts)}</div>
                </div>
                <div style={{fontSize:12,color:"rgba(242,237,230,.4)",marginBottom:7}}>{[r.city,r.occ].filter(Boolean).join(" · ")||"—"}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {r.lang&&<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,padding:"2px 7px",borderRadius:10,background:"rgba(191,160,98,.08)",color:"rgba(191,160,98,.7)",border:"1px solid rgba(191,160,98,.2)",letterSpacing:1}}>{r.lang.toUpperCase()}</span>}
                  {r.arc&&<span style={{fontSize:13}}>{ARC[r.arc]?.e}</span>}
                  {r.pro&&!isNo(r.pro)&&<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,padding:"2px 7px",borderRadius:10,background:"rgba(232,113,74,.08)",color:"rgba(232,113,74,.75)",border:"1px solid rgba(232,113,74,.2)",letterSpacing:1}}>PAIN</span>}
                  {isYes(r.advance||"")&&<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,padding:"2px 7px",borderRadius:10,background:"rgba(141,196,122,.08)",color:"rgba(141,196,122,.8)",border:"1px solid rgba(141,196,122,.2)",letterSpacing:1}}>WANTS IT</span>}
                </div>
              </div>
            ))}
          </div>
          {sel&&(
            <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:"#F2EDE6"}}>{sel.name||"Anonymous"}</h2><div style={{fontSize:11,color:"rgba(242,237,230,.3)"}}>{new Date(sel.ts).toLocaleString()} · {sel.lang==="es"?"Spanish":"English"}</div></div>
                <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"rgba(242,237,230,.3)",fontSize:18,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{background:"rgba(242,237,230,.03)",border:"1px solid rgba(242,237,230,.08)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
                {[["Name","name"],["DOB","dob"],["City","city"],["Occupation","occ"],["Likes job","jobfeel"],["Growth","grow"],["Life change","chg"],["Net frequency","freq"],["How they search","steps"],["Social media","social"],["Needed professional","pro"],["Missed contact","missed"],["Connector role","conn"],["Connections","count"],["Would try app","advance"]].map(([label,key],i)=>(
                  <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 13px",borderBottom:i<14?"1px solid rgba(242,237,230,.05)":"none",background:i%2===0?"transparent":"rgba(242,237,230,.015)"}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(242,237,230,.4)",flexShrink:0,minWidth:130}}>{label}</span>
                    <span style={{fontSize:13,color:sel[key]?"#F2EDE6":"rgba(242,237,230,.2)",textAlign:"right",maxWidth:"56%",lineHeight:1.5}}>{sel[key]||"—"}</span>
                  </div>
                ))}
              </div>
              {sel.report&&<div style={{background:"rgba(8,6,4,.95)",border:"1px solid rgba(191,160,98,.15)",borderRadius:12,padding:"14px"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:2,color:"rgba(191,160,98,.5)",textTransform:"uppercase",marginBottom:10}}>Generated Profile</div><div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,lineHeight:1.85,color:"rgba(242,237,230,.7)",whiteSpace:"pre-wrap"}}>{sel.report}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── CHAT ──
  return(
    <div style={{maxWidth:480,margin:"0 auto",height:"100vh",background:"#090705",display:"flex",flexDirection:"column",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6"}}>
      <style>{CSS}</style>
      <div style={{padding:"13px 18px 10px",borderBottom:"1px solid rgba(242,237,230,.07)",background:"#090705",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.12)",border:"1px solid rgba(191,160,98,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#BFA062"}}>✦</div>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:500,letterSpacing:.6}}>Ally</div><div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>{done?(lang==="es"?"Completo":"Complete"):typing?(lang==="es"?"Escribiendo...":"Typing..."):(lang==="es"?"En linea":"Online")}</div></div>
          </div>
          {done&&<div style={{fontSize:11,color:"rgba(141,196,122,.8)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>✓ Saved</div>}
        </div>
        <div style={{height:2,background:"rgba(242,237,230,.07)",borderRadius:2}}><div style={{width:prog+"%",height:"100%",background:"#BFA062",borderRadius:2,transition:"width .6s"}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 15px 6px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map(m=>{
          if(m.role==="user")return(<div key={m.id} className="mu" style={{display:"flex",justifyContent:"flex-end"}}><div style={{maxWidth:"76%",padding:"13px 17px",background:"rgba(191,160,98,.18)",border:"1px solid rgba(191,160,98,.28)",borderRadius:"18px 18px 4px 18px",fontSize:17,lineHeight:1.65,color:"#F2EDE6"}}>{m.text}</div></div>);
          if(m.role==="bot")return(<div key={m.id} className="mu" style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(191,160,98,.8)"}}>✦</div><div style={{maxWidth:"78%",padding:"13px 17px",background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.09)",borderRadius:"18px 18px 18px 4px",fontSize:17,lineHeight:1.72,color:"rgba(242,237,230,.92)",whiteSpace:"pre-line"}}>{m.text}</div></div>);
          if(m.role==="result"){const arc=ARC[m.arcId]||ARC.catalyst,AL=arc[lang]||arc.en,lpn=lang==="es"?(LPes[m.lp]||""):(LPen[m.lp]||"");
            return(
              <div key={m.id} className="pp" style={{margin:"4px 0"}}>
                <div style={{borderRadius:20,overflow:"hidden",border:"2px solid "+arc.br,boxShadow:"0 0 60px "+arc.c+"22"}}>
                  <div style={{background:arc.bg,padding:"34px 22px 26px",textAlign:"center",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,"+arc.c+"20 0%,transparent 70%)",pointerEvents:"none"}}/>
                    <div style={{fontSize:68,marginBottom:12,filter:"drop-shadow(0 0 18px "+arc.c+"88)"}}>{arc.e}</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:4,color:arc.c+"99",textTransform:"uppercase",marginBottom:8}}>{lang==="es"?"Tu tipo es":"You are"}</div>
                    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,8vw,46px)",fontWeight:600,letterSpacing:3,color:"#F2EDE6",marginBottom:6,textShadow:"0 0 40px "+arc.c+"66"}}>{AL.n}</h2>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:3,color:arc.c,textTransform:"uppercase",marginBottom:18}}>{AL.s}</div>
                    <div style={{background:arc.c+"15",border:"1px solid "+arc.c+"40",borderRadius:12,padding:"13px 18px",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"rgba(242,237,230,.9)",lineHeight:1.5}}>"{AL.t}"</div>
                    <div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.12)",borderRadius:20,padding:"5px 14px"}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(242,237,230,.5)",letterSpacing:1}}>{lang==="es"?"Camino de Vida":"Life Path"} {m.lp} — {lpn}</span>
                    </div>
                  </div>
                  <div style={{background:"rgba(6,5,3,.98)",padding:"20px 18px"}}>
                    <div style={{fontFamily:"'Barlow',sans-serif",fontSize:15,lineHeight:1.9,color:"rgba(242,237,230,.8)",whiteSpace:"pre-wrap",wordBreak:"break-word",marginBottom:20}}>{m.report}</div>
                    <div style={{height:1,background:"rgba(242,237,230,.07)",marginBottom:16}}/>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:3,color:arc.c+"88",textTransform:"uppercase",textAlign:"center",marginBottom:12}}>{lang==="es"?"Te identificas? Compartilo":"Feels accurate? Share it"} 👇</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      <button className="sfb" onClick={()=>share(m.arcId,m.lp,"fb")}><span style={{fontSize:17,fontWeight:700}}>f</span>{lang==="es"?"COMPARTIR EN FACEBOOK":"SHARE ON FACEBOOK"}</button>
                      <button className="sig" onClick={()=>share(m.arcId,m.lp,"ig")}><span style={{fontSize:14}}>◎</span>{lang==="es"?"COMPARTIR EN INSTAGRAM":"SHARE ON INSTAGRAM"}</button>
                      {smsg&&<div style={{textAlign:"center",fontSize:12,color:"rgba(141,196,122,.8)",padding:"3px 0"}}>{smsg}</div>}
                      <button className="scp" onClick={()=>share(m.arcId,m.lp,"copy")}>{copied?"✓ COPIED":(lang==="es"?"COPIAR TEXTO":"COPY TEXT")}</button>
                    </div>
                    {!emailOk?(
                      <div style={{background:"rgba(242,237,230,.04)",border:"1px solid rgba(242,237,230,.08)",borderRadius:12,padding:"13px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:arc.c+"CC",textTransform:"uppercase",marginBottom:8}}>{lang==="es"?"Cuando lanza Ally?":"When Ally launches?"}</div>
                        <div style={{display:"flex",gap:8}}>
                          <input type="email" placeholder={lang==="es"?"tu@email.com":"your@email.com"} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&email.includes("@"))setEmailOk(true);}}/>
                          <button onClick={()=>email.includes("@")&&setEmailOk(true)} style={{background:arc.c,border:"none",borderRadius:8,padding:"0 15px",color:"#090705",fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:600,cursor:"pointer",flexShrink:0}}>→</button>
                        </div>
                      </div>
                    ):(
                      <div style={{textAlign:"center",padding:12,background:arc.c+"10",borderRadius:10,fontSize:13,color:"rgba(242,237,230,.6)"}}>{lang==="es"?"Estas en la lista! 🎉":"You are on the list! 🎉"}</div>
                    )}
                  </div>
                </div>
                <div style={{textAlign:"center",marginTop:12}}><button onClick={reset} style={{background:"none",border:"none",color:"rgba(242,237,230,.22)",fontSize:12,fontFamily:"'Barlow',sans-serif",cursor:"pointer",textDecoration:"underline"}}>{lang==="es"?"Empezar de nuevo":"Start over"}</button></div>
              </div>
            );
          }
          return null;
        })}
        {typing&&(<div className="mu" style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(191,160,98,.8)"}}>✦</div><div style={{padding:"13px 17px",background:"rgba(242,237,230,.06)",border:"1px solid rgba(242,237,230,.09)",borderRadius:"18px 18px 18px 4px",display:"flex",gap:5,alignItems:"center"}}><span className="dot"/><span className="dot"/><span className="dot"/></div></div>)}
        <div ref={bot}/>
      </div>
      {!done&&(
        <div style={{padding:"10px 15px 20px",borderTop:"1px solid rgba(242,237,230,.07)",background:"#090705",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,background:"rgba(242,237,230,.05)",border:"1px solid rgba(242,237,230,.1)",borderRadius:16,padding:"12px 12px 12px 16px"}}>
            <textarea ref={inp} rows={1} value={input} onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,140)+"px";}} onKeyDown={onKey} placeholder={typing?"...":(lang==="es"?"Escribe tu respuesta...":"Type your answer…")} disabled={typing} style={{height:"26px"}}/>
            <button onClick={submit} disabled={!input.trim()||typing} style={{width:36,height:36,borderRadius:"50%",flexShrink:0,border:"none",background:input.trim()&&!typing?"#BFA062":"rgba(242,237,230,.08)",cursor:input.trim()&&!typing?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s",fontSize:16,color:input.trim()&&!typing?"#090705":"rgba(242,237,230,.2)"}}>↑</button>
          </div>
          <div style={{textAlign:"center",marginTop:6,fontSize:11,color:"rgba(242,237,230,.18)"}}>{lang==="es"?"Enter para enviar":"Enter to send"}</div>
        </div>
      )}
    </div>
  );
}
