import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// ════════════════════════════════════════════════════════════════════════════
//  ALLY RESEARCH DASHBOARD — English, Fixed Data Extraction, Time Tracking
// ════════════════════════════════════════════════════════════════════════════

const isNo    = s => /^no\b|nunca|never|not really|nope|para nada/.test((s||"").toLowerCase().trim());
const isYes   = s => /si\b|yes|claro|definitely|absolutely|of course|por supuesto|obvio/.test((s||"").toLowerCase());
const isMaybe = s => /maybe|quiza|tal vez|depends|depende|might/.test((s||"").toLowerCase());

const ARC_LABELS = {
  weaver:"🕸️ Weaver", catalyst:"🔥 Catalyst", anchor:"⚓ Anchor",   spark:"⚡ Spark",
  tide:"🌊 Tide",      scout:"🦅 Scout",       oracle:"🌙 Oracle",  mirror:"🎭 Mirror", seed:"🌱 Seed",
};
const ARC_COLORS = {
  weaver:"#C9A84C", catalyst:"#E8714A", anchor:"#7BAFC4", spark:"#8DC47A",
  tide:"#4ECDC4",   scout:"#C0392B",    oracle:"#8E44AD", mirror:"#95A5A6", seed:"#27AE60",
};

const ago = ts => { const m=Math.floor((Date.now()-new Date(ts))/60000); return m<1?"just now":m<60?m+"m ago":m<1440?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago"; };
const pct = (n,t) => t ? Math.round((n/(t||1))*100)+"%" : "—";
const ageRange = age => { const a=parseInt(age); if(!a||isNaN(a))return ""; if(a<20)return "under 20"; const lo=Math.floor(a/10)*10; return lo+"-"+(lo+10); };
const timeSpent = (ts_start, ts) => {
  if(!ts_start||!ts) return "—";
  const m=Math.floor((new Date(ts)-new Date(ts_start))/60000);
  return m<1?"<1 min":m+" min";
};

// ── DATA CLEANING HELPERS ────────────────────────────────────────────────────
const isRealName = v => {
  if (!v) return false;
  const s = v.trim();
  const words = s.split(/\s+/);
  if (words.length > 3) return false; // Names are 1-3 words
  if (s.length > 40) return false;
  // Reject if contains city names, job titles, or sentence patterns
  if (/\b(buenos aires|cordoba|mendoza|rosario|argentina|student|designer|engineer|developer|manager|work|study|i am|i'm)\b/i.test(s)) return false;
  if (/[.!?]/.test(s)) return false; // No punctuation
  return true;
};

const isRealCity = v => {
  if (!v) return false;
  const s = v.trim();
  if (s.length > 30) return false;
  const words = s.split(/\s+/);
  if (words.length > 4) return false;
  // Reject if contains verbs, job-like words, or sentence patterns
  if (/\b(i am|i'm|am a|work|design|build|studi|project|engineer|developer|graphic|manager|director|student|teacher|doctor|nurse|consultant|freelance|architect|analyst|trabajo|estudio|enjoy|figuring|going|getting|trying|love|hate|feel|yes|no|maybe|messi|maradona)\b/i.test(s)) return false;
  if (/[.!?]/.test(s)) return false;
  return true;
};

const isRealOcc = v => {
  if (!v) return false;
  const s = v.trim();
  if (s.length < 3) return false;
  // Occupation should describe work/study, not be a name or city
  if (/\b(buenos aires|cordoba|mendoza|rosario|argentina|montevideo|santiago|lima)\b/i.test(s)) return false;
  return true;
};

const cleanData = (resp) => {
  // Fix misplaced data
  let {name, city, occ} = resp;

  // If name contains a city, move it
  if (name && !isRealName(name) && isRealCity(name)) {
    if (!city || !isRealCity(city)) city = name;
    name = null;
  }

  // If city contains a name or job, move it
  if (city && !isRealCity(city)) {
    if (isRealName(city) && (!name || !isRealName(name))) {
      name = city;
      city = null;
    } else if (isRealOcc(city) && (!occ || !isRealOcc(occ))) {
      occ = city;
      city = null;
    } else {
      city = null;
    }
  }

  // If occ contains a city, move it
  if (occ && !isRealOcc(occ) && isRealCity(occ)) {
    if (!city || !isRealCity(city)) city = occ;
    occ = null;
  }

  return {...resp, name, city, occ};
};

// ── PROFILE DETECTION ────────────────────────────────────────────────────────
const isValeriaProfile = (resp) => {
  // In transition: moved, new job, new city, starting something
  const text = [resp.chg, resp.jobfeel, resp.grow, resp.occ].join(" ").toLowerCase();
  return /mud[eé]|mov[ií]|nuevo trabajo|nueva ciudad|empec[eé]|started|new job|moved|transition|cambio|reci[eé]n/i.test(text);
};

const isClaudiaProfile = (resp) => {
  // Connector: people ask them, they connect others
  const conn = (resp.conn || "").toLowerCase();
  return /siempre|always|todos me preguntan|conecto|referente|often|seguido|people ask me|connector/i.test(conn);
};

// ── FREQUENCY EXTRACTION ─────────────────────────────────────────────────────
const extractFrequency = (resp) => {
  const freq = (resp.freq || "").toLowerCase();
  if (/0-1|cero|nunca|never|rarely|casi nunca/i.test(freq)) return "0-1";
  if (/2-5|dos|few times|algunas veces/i.test(freq)) return "2-5";
  if (/6-15|seis|several/i.test(freq)) return "6-15";
  if (/15-30|quince|many times/i.test(freq)) return "15-30";
  if (/30\+|m[aá]s de|more than|mucho|very often/i.test(freq)) return "30+";
  return "Unknown";
};

const CSS_DASH = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Barlow+Condensed:wght@300;400;500;600&family=Barlow:wght@300;400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;min-height:100%}
  body{background:#F8FBFF;-webkit-font-smoothing:antialiased}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  .fi{animation:fi .3s ease both}
  .tab{padding:10px 18px;background:transparent;border:2px solid rgba(10,22,40,.12);border-radius:24px;color:rgba(10,22,40,.5);font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:.5px;cursor:pointer;transition:all .2s;white-space:nowrap;font-weight:600}
  .tab.on{background:#8dc2f2;border-color:#8dc2f2;color:#fff}
  .card{background:#fff;border:2px solid rgba(141,194,242,.2);border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(141,194,242,.08)}
  .row{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 16px;gap:12px}
  .row:not(:last-child){border-bottom:1px solid rgba(10,22,40,.06)}
  .badge{font-family:'Barlow Condensed',sans-serif;font-size:10px;padding:3px 9px;border-radius:12px;letter-spacing:.5px;white-space:nowrap;font-weight:600}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-thumb{background:rgba(141,194,242,.3);border-radius:3px}
  input[type=text],select{background:#fff;border:2px solid rgba(141,194,242,.25);border-radius:10px;padding:10px 14px;color:#0a1628;font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border .2s}
  input[type=text]:focus,select:focus{border-color:#8dc2f2}
  select option{background:#fff}
  .del-btn{opacity:0;transition:opacity .15s,color .15s;background:none;border:none;color:rgba(10,22,40,.3);cursor:pointer;padding:3px 6px;font-size:14px;line-height:1;border-radius:6px;flex-shrink:0}
  .del-btn:hover{opacity:1!important;color:#E8714A}
  .resp-card:hover .del-btn{opacity:.5}
`;

export default function DashboardPage() {
  const [resps,   setResps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");
  const [sel,     setSel]     = useState(null);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/responses");
      if (res.ok) {
        const rows = await res.json();
        // Clean data on load
        const cleaned = rows.map(cleanData);
        setResps(Array.isArray(cleaned) ? cleaned : []);
      }
    } catch {}
    setLoading(false);
  }

  async function deleteResp(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this response permanently? This cannot be undone.")) return;
    try {
      await fetch(`/api/responses/${encodeURIComponent(id)}`, { method: "DELETE" });
      setResps(prev => prev.filter(r => r.id !== id));
      if (sel?.id === id) setSel(null);
    } catch {}
  }

  function exportCSV() {
    const keys = ["ts","ts_start","time_spent","status","version","lang","name","dob","city","occ","jobfeel","grow","chg","freq","steps","social","pro","missed","conn","count","advance","lp","arc"];
    const rows = [keys.join(","), ...resps.map(r => {
      const timeMin = r.ts_start && r.ts ? Math.floor((new Date(r.ts)-new Date(r.ts_start))/60000) : "";
      return keys.map(k => {
        if (k === "time_spent") return timeMin;
        return '"' + ((r[k]||"").toString().replace(/"/g,'""')) + '"';
      }).join(",");
    })];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], {type:"text/csv"}));
    a.download = "ally-responses-" + Date.now() + ".csv";
    a.click();
  }

  // ── STATUS RECALCULATION ─────────────────────────────────────────────────
  // Abandoned = answered < 4 questions
  // In Progress = answered >= 4 but not completed
  // Completed = got result card
  const respsWithStatus = resps.map(r => {
    if (r.status === "completed") return r;

    // Count answered questions
    const answers = [r.name, r.dob, r.city, r.occ, r.jobfeel, r.grow, r.chg, r.freq, r.steps, r.social, r.pro, r.missed, r.conn].filter(Boolean).length;

    if (answers < 4) {
      return {...r, status: "abandoned"};
    } else {
      return {...r, status: "in_progress"};
    }
  });

  // ── COMPUTED ─────────────────────────────────────────────────────────────
  const total      = respsWithStatus.length;
  const completed  = respsWithStatus.filter(r => r.status === "completed");
  const inProgress = respsWithStatus.filter(r => r.status === "in_progress");
  const abandoned  = respsWithStatus.filter(r => r.status === "abandoned");

  // SIGNAL 1: PAIN — Did they say YES to missed connection question?
  const hasPain    = respsWithStatus.filter(r => isYes(r.missed||"") || /paso|me paso|varias|yes|s[ií]|claro/i.test((r.missed||"")));

  // SIGNAL 2: FREQUENCY — How often do they search?
  const freqBreakdown = {
    "0-1": respsWithStatus.filter(r => extractFrequency(r) === "0-1").length,
    "2-5": respsWithStatus.filter(r => extractFrequency(r) === "2-5").length,
    "6-15": respsWithStatus.filter(r => extractFrequency(r) === "6-15").length,
    "15-30": respsWithStatus.filter(r => extractFrequency(r) === "15-30").length,
    "30+": respsWithStatus.filter(r => extractFrequency(r) === "30+").length,
  };
  const highFreq = freqBreakdown["6-15"] + freqBreakdown["15-30"] + freqBreakdown["30+"];

  // SIGNAL 3: ACTIVE CONNECTORS — People who said "Siempre" or "A veces"
  const connectors = respsWithStatus.filter(r => /siempre|always|often|seguido|a veces|sometimes/i.test((r.conn||"")));

  // SIGNAL 4: SEARCH METHOD
  const searchMethods = {
    "Ask friends": respsWithStatus.filter(r => /amigo|friend|pregunt|ask|conocid|boca a boca/i.test((r.steps||""))).length,
    "WhatsApp groups": respsWithStatus.filter(r => /whatsapp|grupo|group|telegram/i.test((r.steps||""))).length,
    "Google": respsWithStatus.filter(r => /google|internet|busco online/i.test((r.steps||""))).length,
    "LinkedIn": respsWithStatus.filter(r => /linkedin/i.test(((r.steps||"")+(r.social||"")))).length,
    "Social media": respsWithStatus.filter(r => /instagram|facebook|redes/i.test(((r.steps||"")+(r.social||"")))).length,
  };
  const topMethod = Object.entries(searchMethods).sort((a,b)=>b[1]-a[1])[0];
  const searchData = Object.entries(searchMethods).filter(([,n])=>n>0).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

  // SIGNAL 5: SEGMENTS
  const valeriaUsers = respsWithStatus.filter(isValeriaProfile);
  const claudiaUsers = respsWithStatus.filter(isClaudiaProfile);

  // TIME SPENT
  const timesSpent = respsWithStatus.map(r => {
    if (!r.ts_start || !r.ts) return 0;
    return Math.floor((new Date(r.ts) - new Date(r.ts_start)) / 60000);
  }).filter(t => t > 0);
  const avgTime = timesSpent.length ? Math.round(timesSpent.reduce((a,b)=>a+b,0) / timesSpent.length) : 0;

  // Want to try app
  const advYes     = respsWithStatus.filter(r => isYes(r.advance||""));
  const advNo      = respsWithStatus.filter(r => isNo(r.advance||""));

  const cities = {};
  respsWithStatus.forEach(r => { if (isRealCity(r.city)) { const c=r.city.trim(); cities[c]=(cities[c]||0)+1; } });
  const cityData = Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name,value}));

  const OCC_SEGMENTS = [
    { name:"Student",               rx:/student|studying|university|college|estudiante|estudio|universidad|facultad|carrera|secundaria|colegio/i },
    { name:"Freelancer",            rx:/freelance|independent|independiente|aut.nomo|autonomo|cuenta propia|por mi cuenta/i },
    { name:"Big Corporate",         rx:/corporate|company|empresa|manager|director|executive|employed|trabajo en|empleado|oficina|corporativo|relacion de dependencia/i },
    { name:"Intern",                rx:/intern|pasante|internship|pr.ctica|practica/i },
    { name:"Entrepreneur / Startup",rx:/founder|startup|emprendedor|entrepreneur|own business|negocio propio|emprendimiento|mi empresa/i },
    { name:"Teacher / Educator",    rx:/teacher|profesor|maestra|docente|educator|teaching|ense.o|doy clases/i },
    { name:"Scientist / Researcher",rx:/scientist|researcher|investigador|phd|lab\b|ciencia/i },
    { name:"Retired",               rx:/retired|jubilado|jubilada|retiro|retirado/i },
    { name:"Unemployed / Figuring", rx:/unemployed|desempleado|figuring|looking for|between jobs|sin trabajo|neet|busco trabajo|buscando|nini/i },
  ];
  const occCounts = Object.fromEntries(OCC_SEGMENTS.map(s=>[s.name,0]));
  occCounts["Other"] = 0;
  respsWithStatus.forEach(r => {
    if (!r.occ) return;
    const matched = OCC_SEGMENTS.filter(s => s.rx.test(r.occ));
    if (matched.length === 0) occCounts["Other"]++;
    else matched.forEach(s => occCounts[s.name]++);
  });
  const occData = Object.entries(occCounts).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));

  const arcData = Object.entries(respsWithStatus.reduce((acc,r)=>{ if(r.arc){acc[r.arc]=(acc[r.arc]||0)+1;} return acc; },{}))
    .map(([name,value])=>({name:ARC_LABELS[name]||name, value, color:ARC_COLORS[name]||"#666"}));

  const versionData = [
    {name:"Football", value: respsWithStatus.filter(r=>r.version==="football").length, color:"#8dc2f2"},
    {name:"Culture", value: respsWithStatus.filter(r=>r.version==="cultural").length, color:"#F6B40E"},
  ].filter(d=>d.value>0);

  const filtered = respsWithStatus.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = !s || (r.name||"").toLowerCase().includes(s) || (r.city||"").toLowerCase().includes(s) || (r.occ||"").toLowerCase().includes(s);
    const matchFilter =
      filter==="all"       ? true :
      filter==="completed" ? (r.status === "completed") :
      filter==="in_progress" ? (r.status === "in_progress") :
      filter==="abandoned" ? (r.status === "abandoned") :
      filter==="pain"      ? hasPain.includes(r) :
      filter==="highfreq"  ? (extractFrequency(r) === "6-15" || extractFrequency(r) === "15-30" || extractFrequency(r) === "30+") :
      filter==="connector" ? connectors.includes(r) :
      filter==="valeria"   ? valeriaUsers.includes(r) :
      filter==="claudia"   ? claudiaUsers.includes(r) :
      filter==="wants"     ? isYes(r.advance||"") : true;
    return matchSearch && matchFilter;
  });

  const GOLD = "#F6B40E";
  const BLUE = "#8dc2f2";
  const NAVY = "#0a1628";
  const tip = { background:"#fff", border:"2px solid rgba(141,194,242,.2)", borderRadius:12, fontFamily:"Barlow,sans-serif", fontSize:13, color:NAVY, padding:8 };

  if (loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F8FBFF",fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontStyle:"italic",color:"rgba(10,22,40,.3)"}}>
      <style>{CSS_DASH}</style>Loading responses...
    </div>
  );

  return (
    <div style={{background:"#F8FBFF",minHeight:"100vh",fontFamily:"'Barlow',sans-serif",color:NAVY}}>
      <style>{CSS_DASH}</style>

      {/* Header */}
      <div style={{padding:"20px 28px",borderBottom:"2px solid rgba(141,194,242,.15)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14,position:"sticky",top:0,background:"rgba(248,251,255,.98)",zIndex:20,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:700}}>A</div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:600,letterSpacing:.5,color:NAVY}}>Ally Research Dashboard</div>
            <div style={{fontSize:12,color:"rgba(10,22,40,.5)",marginTop:2}}>{total} response{total!==1?"s":""} · Argentina pre-launch study</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <Link to="/" style={{color:NAVY,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:.5,textDecoration:"none",border:"2px solid rgba(141,194,242,.25)",borderRadius:10,padding:"8px 16px",fontWeight:600}}>← BOT</Link>
          <button onClick={load} style={{background:"none",border:"2px solid rgba(141,194,242,.25)",borderRadius:10,padding:"8px 16px",color:NAVY,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:.5,cursor:"pointer",fontWeight:600}}>↻ REFRESH</button>
          {total>0&&<button onClick={exportCSV} style={{background:GOLD,border:"2px solid "+GOLD,borderRadius:10,padding:"8px 16px",color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:.5,cursor:"pointer",fontWeight:600}}>↓ EXPORT CSV</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:"16px 28px",display:"flex",gap:10,overflowX:"auto",borderBottom:"2px solid rgba(141,194,242,.1)"}}>
        {[["overview","Overview"],["responses","Responses"],["segments","Segments"]].map(([id,label])=>(
          <button key={id} className={"tab"+(tab===id?" on":"")} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {total===0 ? (
        <div style={{padding:80,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:20,opacity:.2}}>📊</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:"rgba(10,22,40,.4)",marginBottom:10}}>No responses yet</div>
          <div style={{fontSize:14,color:"rgba(10,22,40,.3)"}}>Responses appear here automatically when people complete the bot</div>
        </div>
      ) : (
      <div style={{padding:"24px 28px 80px",maxWidth:1400,margin:"0 auto"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div className="fi">

            {/* RESEARCH SUMMARY CARD */}
            <div className="card" style={{marginBottom:28,background:"linear-gradient(135deg, "+BLUE+" 0%, #5fa8db 100%)",color:"#fff",border:"none"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,marginBottom:18,letterSpacing:.5}}>🎯 Research Summary</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{total}</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>Total Responses</div>
                </div>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{pct(hasPain.length,total)}</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>Pain Signal (missed connection)</div>
                </div>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{pct(highFreq,total)}</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>High Frequency (6+ searches/year)</div>
                </div>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{pct(connectors.length,total)}</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>Active Connectors</div>
                </div>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{topMethod ? topMethod[0] : "—"}</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>Top Search Method</div>
                </div>
                <div>
                  <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginBottom:6}}>{avgTime} min</div>
                  <div style={{fontSize:13,opacity:.85,fontWeight:500}}>Avg Time Spent</div>
                </div>
              </div>
            </div>

            {/* STATUS CARDS */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:28}}>
              {[
                {label:"Completed",        val:completed.length,     sub:pct(completed.length,total),     c:"#8DC47A"},
                {label:"In Progress",      val:inProgress.length,    sub:pct(inProgress.length,total),    c:GOLD},
                {label:"Abandoned",        val:abandoned.length,     sub:pct(abandoned.length,total),     c:"#E8714A"},
                {label:"Pain Signal",      val:hasPain.length,       sub:"Missed connection",             c:"#E8714A"},
                {label:"High Frequency",   val:highFreq,             sub:"6+ searches/year",              c:BLUE},
                {label:"Connectors",       val:connectors.length,    sub:"Others ask them",               c:"#C9A84C"},
                {label:"Valeria Profile",  val:valeriaUsers.length,  sub:"In transition",                 c:"#8E44AD"},
                {label:"Claudia Profile",  val:claudiaUsers.length,  sub:"Active networker",              c:"#C0392B"},
              ].map(s=>(
                <div key={s.label} className="card">
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:s.c,lineHeight:1,marginBottom:8}}>{s.val}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:NAVY,lineHeight:1.3,marginBottom:4,fontWeight:600}}>{s.label}</div>
                  <div style={{fontSize:11,color:"rgba(10,22,40,.5)",fontStyle:"italic"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* CHARTS ROW 1 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,marginBottom:16}}>

              {/* FREQUENCY BREAKDOWN */}
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>🔥 Search Frequency (Signal #2)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(freqBreakdown).map(([name,value])=>({name:name+" times/year",value}))}>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:NAVY}} />
                    <YAxis tick={{fontSize:11,fill:NAVY}} />
                    <Tooltip contentStyle={tip} />
                    <Bar dataKey="value" fill={BLUE} radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{fontSize:11,color:"rgba(10,22,40,.5)",marginTop:12,fontStyle:"italic"}}>Target users: 6+ searches/year</div>
              </div>

              {/* SEARCH METHOD */}
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>🔍 How They Search (Signal #4)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={searchData}>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:NAVY}} />
                    <YAxis tick={{fontSize:11,fill:NAVY}} />
                    <Tooltip contentStyle={tip} />
                    <Bar dataKey="value" fill={GOLD} radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{fontSize:11,color:"rgba(10,22,40,.5)",marginTop:12,fontStyle:"italic"}}>What Ally competes with</div>
              </div>

            </div>

            {/* CHARTS ROW 2 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>

              {/* OCCUPATION */}
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>💼 Occupation</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={occData} layout="vertical">
                    <XAxis type="number" tick={{fontSize:11,fill:NAVY}} />
                    <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:NAVY}} width={140} />
                    <Tooltip contentStyle={tip} />
                    <Bar dataKey="value" fill="#8E44AD" radius={[0,8,8,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CITIES */}
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>📍 Cities</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cityData} layout="vertical">
                    <XAxis type="number" tick={{fontSize:11,fill:NAVY}} />
                    <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:NAVY}} width={100} />
                    <Tooltip contentStyle={tip} />
                    <Bar dataKey="value" fill="#4ECDC4" radius={[0,8,8,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ARCHETYPES */}
              {arcData.length>0&&(
                <div className="card">
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>🎭 Archetypes</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={arcData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e)=>e.name}>
                        {arcData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={tip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* VERSION */}
              {versionData.length>0&&(
                <div className="card">
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:NAVY,letterSpacing:.5}}>⚽🌟 Version</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={versionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {versionData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={tip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            </div>

          </div>
        )}

        {/* RESPONSES TAB */}
        {tab==="responses"&&(
          <div className="fi">
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" placeholder="Search name, city, occupation..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:"1 1 240px"}} />
              <select value={filter} onChange={e=>setFilter(e.target.value)} style={{flex:"0 0 auto"}}>
                <option value="all">All ({total})</option>
                <option value="completed">Completed ({completed.length})</option>
                <option value="in_progress">In Progress ({inProgress.length})</option>
                <option value="abandoned">Abandoned ({abandoned.length})</option>
                <option value="pain">Pain Signal ({hasPain.length})</option>
                <option value="highfreq">High Frequency ({highFreq})</option>
                <option value="connector">Connectors ({connectors.length})</option>
                <option value="valeria">Valeria Profile ({valeriaUsers.length})</option>
                <option value="claudia">Claudia Profile ({claudiaUsers.length})</option>
                <option value="wants">Want to try app ({advYes.length})</option>
              </select>
            </div>

            <div style={{display:"grid",gap:12}}>
              {filtered.length===0 ? (
                <div style={{padding:40,textAlign:"center",color:"rgba(10,22,40,.3)",fontSize:14}}>No responses match your filter</div>
              ) : (
                filtered.map(r=>{
                  const statusColor = r.status==="completed" ? "#8DC47A" : r.status==="in_progress" ? GOLD : "#E8714A";
                  const cleanR = cleanData(r);
                  return (
                    <div key={r.id} className="card resp-card" onClick={()=>setSel(r)} style={{cursor:"pointer",transition:"all .2s",border:sel?.id===r.id?"2px solid "+BLUE:"2px solid rgba(141,194,242,.2)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:NAVY}}>{cleanR.name||"Anonymous"}</div>
                            <div className="badge" style={{background:statusColor,color:"#fff"}}>{r.status||"abandoned"}</div>
                            {r.version&&<div className="badge" style={{background:r.version==="football"?BLUE:GOLD,color:"#fff"}}>{r.version==="football"?"⚽":"🌟"}</div>}
                            <div style={{fontSize:11,color:"rgba(10,22,40,.4)",marginLeft:"auto"}}>{timeSpent(r.ts_start,r.ts)}</div>
                          </div>
                          <div style={{fontSize:13,color:"rgba(10,22,40,.6)",marginBottom:4}}>
                            {cleanR.city&&<span>📍 {cleanR.city}</span>}
                            {cleanR.city&&cleanR.occ&&<span style={{margin:"0 8px",color:"rgba(10,22,40,.25)"}}>·</span>}
                            {cleanR.occ&&<span>💼 {cleanR.occ}</span>}
                          </div>
                          {r.arc&&<div style={{fontSize:13,color:ARC_COLORS[r.arc]||NAVY,fontWeight:600}}>{ARC_LABELS[r.arc]||r.arc}</div>}
                          <div style={{fontSize:11,color:"rgba(10,22,40,.35)",marginTop:6}}>{ago(r.ts)}</div>
                        </div>
                        <button className="del-btn" onClick={e=>deleteResp(r.id,e)}>✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DETAIL MODAL */}
            {sel&&(
              <div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
                <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,maxWidth:600,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
                  <div style={{padding:"24px 28px",borderBottom:"2px solid rgba(141,194,242,.15)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,marginBottom:8,color:NAVY}}>{cleanData(sel).name||"Anonymous"}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                        <div className="badge" style={{background:sel.status==="completed"?"#8DC47A":sel.status==="in_progress"?GOLD:"#E8714A",color:"#fff"}}>{sel.status||"abandoned"}</div>
                        {sel.version&&<div className="badge" style={{background:sel.version==="football"?BLUE:GOLD,color:"#fff"}}>{sel.version==="football"?"⚽ Football":"🌟 Culture"}</div>}
                        <div className="badge" style={{background:"rgba(10,22,40,.08)",color:NAVY}}>⏱️ {timeSpent(sel.ts_start,sel.ts)}</div>
                      </div>
                      <div style={{fontSize:12,color:"rgba(10,22,40,.5)"}}>{ago(sel.ts)} · {new Date(sel.ts).toLocaleString()}</div>
                    </div>
                    <button onClick={()=>setSel(null)} style={{background:"none",border:"none",fontSize:24,color:"rgba(10,22,40,.3)",cursor:"pointer",lineHeight:1,padding:4}}>×</button>
                  </div>
                  <div style={{padding:"20px 28px"}}>
                    {[
                      {l:"Name",n:"name"},{l:"Date of Birth",n:"dob"},{l:"City",n:"city"},{l:"Occupation",n:"occ"},
                      {l:"Job Feel",n:"jobfeel"},{l:"Growth",n:"grow"},{l:"Recent Change",n:"chg"},
                      {l:"Search Frequency",n:"freq"},{l:"Search Steps",n:"steps"},{l:"Social Networks",n:"social"},
                      {l:"Pain Point",n:"pro"},{l:"Missed Connection",n:"missed"},{l:"Connection Requests",n:"conn"},
                      {l:"Want to Try",n:"advance"},{l:"Life Path",n:"lp"},{l:"Archetype",n:"arc"},
                    ].map(({l,n})=>{
                      const val = cleanData(sel)[n];
                      if (!val) return null;
                      return (
                        <div key={n} className="row">
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:"rgba(10,22,40,.5)",fontWeight:600,flex:"0 0 140px"}}>{l}</div>
                          <div style={{fontSize:13,color:NAVY,flex:1,lineHeight:1.5}}>{n==="arc"?(ARC_LABELS[val]||val):val}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEGMENTS TAB */}
        {tab==="segments"&&(
          <div className="fi">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20}}>

              {/* VALERIA PROFILE */}
              <div className="card" style={{borderColor:"#8E44AD"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,marginBottom:12,color:"#8E44AD"}}>🔄 Valeria Profile</div>
                <div style={{fontSize:36,fontWeight:700,color:"#8E44AD",marginBottom:8}}>{valeriaUsers.length}</div>
                <div style={{fontSize:13,color:"rgba(10,22,40,.6)",marginBottom:16,lineHeight:1.5}}>
                  In transition: moved, new city, new job, starting something. Keywords: mudé, cambié, nuevo trabajo, nueva ciudad, empecé.
                </div>
                <div style={{fontSize:12,color:"rgba(10,22,40,.5)",fontStyle:"italic"}}>
                  {pct(valeriaUsers.length,total)} of all responses
                </div>
              </div>

              {/* CLAUDIA PROFILE */}
              <div className="card" style={{borderColor:"#C0392B"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,marginBottom:12,color:"#C0392B"}}>🤝 Claudia Profile</div>
                <div style={{fontSize:36,fontWeight:700,color:"#C0392B",marginBottom:8}}>{claudiaUsers.length}</div>
                <div style={{fontSize:13,color:"rgba(10,22,40,.6)",marginBottom:16,lineHeight:1.5}}>
                  Connector: others ask them for intros. Keywords: siempre, todos me preguntan, conecto, referente.
                </div>
                <div style={{fontSize:12,color:"rgba(10,22,40,.5)",fontStyle:"italic"}}>
                  {pct(claudiaUsers.length,total)} of all responses
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      )}
    </div>
  );
}
