import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ════════════════════════════════════════════════════════════════════════════
//  ALLY DASHBOARD
//  Reads from GET /api/responses — same SQLite table the bot writes to.
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
const timeSpent = (ts_start, ts) => { if(!ts_start||!ts) return "—"; const m=Math.floor((new Date(ts)-new Date(ts_start))/60000); return m<1?"<1m":m+"m"; };

const CSS_DASH = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Barlow+Condensed:wght@300;400;500;600&family=Barlow:wght@300;400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;min-height:100%}
  body{background:#090705;-webkit-font-smoothing:antialiased}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  .fi{animation:fi .3s ease both}
  .tab{padding:8px 16px;background:transparent;border:1px solid rgba(242,237,230,.1);border-radius:20px;color:rgba(242,237,230,.4);font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;cursor:pointer;transition:all .2s;white-space:nowrap;text-transform:uppercase}
  .tab.on{background:rgba(191,160,98,.12);border-color:rgba(191,160,98,.45);color:#BFA062}
  .card{background:rgba(242,237,230,.03);border:1px solid rgba(242,237,230,.08);border-radius:12px;padding:16px 14px}
  .row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 13px;gap:10px}
  .row:not(:last-child){border-bottom:1px solid rgba(242,237,230,.05)}
  .badge{font-family:'Barlow Condensed',sans-serif;font-size:9px;padding:2px 7px;border-radius:10px;letter-spacing:1px;white-space:nowrap}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(242,237,230,.1);border-radius:2px}
  input[type=text],select{background:rgba(242,237,230,.05);border:1px solid rgba(242,237,230,.12);border-radius:8px;padding:8px 12px;color:#F2EDE6;font-family:'Barlow',sans-serif;font-size:13px;outline:none}
  select option{background:#1a1a1a}
  .del-btn{opacity:0;transition:opacity .15s,color .15s;background:none;border:none;color:rgba(242,237,230,.3);cursor:pointer;padding:2px 4px;font-size:13px;line-height:1;border-radius:4px;flex-shrink:0}
  .del-btn:hover{opacity:1!important;color:#E8714A}
  .resp-card:hover .del-btn{opacity:.45}
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
        setResps(Array.isArray(rows) ? rows : []);
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
    const keys = ["ts","lang","name","dob","city","occ","jobfeel","grow","chg","freq","steps","social","pro","missed","conn","count","advance","lp","arc"];
    const rows = [keys.join(","), ...resps.map(r => keys.map(k => '"' + ((r[k]||"").toString().replace(/"/g,'""')) + '"').join(","))];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], {type:"text/csv"}));
    a.download = "ally-responses-" + Date.now() + ".csv";
    a.click();
  }

  // ── COMPUTED ─────────────────────────────────────────────────────────────
  const total      = resps.length;
  const completed  = resps.filter(r => r.status === "completed");
  const inProgress = resps.filter(r => r.status === "in_progress");
  const abandoned  = resps.filter(r => r.status === "abandoned" || !r.status);
  const hasPain    = resps.filter(r => r.pro && !isNo(r.pro));
  const noPain     = resps.filter(r => r.pro && isNo(r.pro));
  const killer     = resps.filter(r => isYes(r.missed||"") || /paso|me paso|varias/.test((r.missed||"").toLowerCase()));
  const inTransit  = resps.filter(r => /mud|mov|job|trabajo|startup|emprend|nuevo/.test((r.chg||"").toLowerCase()));
  const connectors = resps.filter(r => /siempre|always|often|seguido/.test((r.conn||"").toLowerCase()));
  const advYes     = resps.filter(r => isYes(r.advance||""));
  const advNo      = resps.filter(r => isNo(r.advance||""));
  const advMaybe   = resps.filter(r => isMaybe(r.advance||""));

  const searchUsed = {
    "Ask friends":  resps.filter(r => /amigo|friend|pregunt|ask|conocid/.test((r.steps||"").toLowerCase())).length,
    "WhatsApp":     resps.filter(r => /whatsapp|grupo|group|telegram/.test((r.steps||"").toLowerCase())).length,
    "Google":       resps.filter(r => /google/.test((r.steps||"").toLowerCase())).length,
    "Social media": resps.filter(r => /linkedin|instagram|facebook/.test(((r.steps||"")+(r.social||"")).toLowerCase())).length,
    "AI / ChatGPT": resps.filter(r => /gpt|chatgpt|\bia\b|\bai\b/.test((r.steps||"").toLowerCase())).length,
  };
  const searchData = Object.entries(searchUsed).filter(([,n])=>n>0).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

  const isRealCity = v => {
    if (!v) return false;
    const s = v.trim();
    if (s.split(/\s+/).length > 4) return false;
    if (/\b(i am|i'm|am a|work|design|build|studi|project|engineer|developer|graphic|manager|director|student|teacher|doctor|nurse|consultant|freelance|architect|analyst)\b/i.test(s)) return false;
    return true;
  };
  const cities = {};
  resps.forEach(r => { if (isRealCity(r.city)) { const c=r.city.trim(); cities[c]=(cities[c]||0)+1; } });
  const cityData = Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name,value}));

  const OCC_SEGMENTS = [
    { name:"Student",               rx:/student|studying|university|college|estudio|estudiante|carrera|facultad/i },
    { name:"Freelancer",            rx:/freelance|independent|independiente|aut.nomo|autonomo/i },
    { name:"Big Corporate",         rx:/corporate|company|empresa|manager|director|executive|employed|trabajo en/i },
    { name:"Intern",                rx:/intern|pasante|internship|pr.ctica|practica/i },
    { name:"Entrepreneur / Startup",rx:/founder|startup|emprendedor|entrepreneur|own business|negocio propio/i },
    { name:"Teacher / Educator",    rx:/teacher|profesor|maestra|docente|educator|teaching/i },
    { name:"Scientist / Researcher",rx:/scientist|researcher|investigador|phd|lab\b|ciencia/i },
    { name:"Retired",               rx:/retired|jubilado|jubilada|retiro/i },
    { name:"Unemployed / Figuring", rx:/unemployed|desempleado|figuring|looking for|between jobs|sin trabajo|neet/i },
  ];
  const occCounts = Object.fromEntries(OCC_SEGMENTS.map(s=>[s.name,0]));
  occCounts["Other"] = 0;
  resps.forEach(r => {
    if (!r.occ) return;
    const matched = OCC_SEGMENTS.filter(s => s.rx.test(r.occ));
    if (matched.length === 0) occCounts["Other"]++;
    else matched.forEach(s => occCounts[s.name]++);
  });
  const occData = Object.entries(occCounts).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));

  const arcData = Object.entries(resps.reduce((acc,r)=>{ if(r.arc){acc[r.arc]=(acc[r.arc]||0)+1;} return acc; },{}))
    .map(([name,value])=>({name:ARC_LABELS[name]||name, value, color:ARC_COLORS[name]||"#666"}));

  const versionData = [
    {name:"Fútbol", value: resps.filter(r=>r.version==="football").length, color:"#E8714A"},
    {name:"Cultura", value: resps.filter(r=>r.version==="cultural").length, color:"#7BAFC4"},
  ].filter(d=>d.value>0);

  const filtered = resps.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = !s || (r.name||"").toLowerCase().includes(s) || (r.city||"").toLowerCase().includes(s) || (r.occ||"").toLowerCase().includes(s);
    const matchFilter =
      filter==="all"       ? true :
      filter==="completed" ? (r.status === "completed") :
      filter==="in_progress" ? (r.status === "in_progress") :
      filter==="abandoned" ? (r.status === "abandoned" || !r.status) :
      filter==="pain"      ? (r.pro && !isNo(r.pro)) :
      filter==="nopain"    ? (r.pro && isNo(r.pro)) :
      filter==="wants"     ? isYes(r.advance||"") :
      filter==="connector" ? /siempre|always|often|seguido/.test((r.conn||"").toLowerCase()) :
      filter==="no"        ? isNo(r.advance||"") : true;
    return matchSearch && matchFilter;
  });

  const GOLD = "#BFA062";
  const tip = { background:"#1a1a1a", border:"1px solid rgba(242,237,230,.1)", borderRadius:8, fontFamily:"Barlow,sans-serif", fontSize:12, color:"#F2EDE6" };

  if (loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#090705",fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontStyle:"italic",color:"rgba(242,237,230,.3)"}}>
      <style>{CSS_DASH}</style>Loading responses...
    </div>
  );

  return (
    <div style={{background:"#090705",minHeight:"100vh",fontFamily:"'Barlow',sans-serif",color:"#F2EDE6"}}>
      <style>{CSS_DASH}</style>

      {/* Header */}
      <div style={{padding:"16px 24px",borderBottom:"1px solid rgba(242,237,230,.08)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,position:"sticky",top:0,background:"rgba(9,7,5,.97)",zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(191,160,98,.12)",border:"1px solid rgba(191,160,98,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:GOLD,fontSize:14}}>✦</div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:500,letterSpacing:.5}}>Ally Research Dashboard</div>
            <div style={{fontSize:11,color:"rgba(242,237,230,.35)",marginTop:1}}>{total} response{total!==1?"s":""} · Argentina pre-launch study</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <Link to="/" style={{color:"rgba(242,237,230,.4)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,textDecoration:"none",border:"1px solid rgba(242,237,230,.15)",borderRadius:8,padding:"6px 12px"}}>← BOT</Link>
          <button onClick={load} style={{background:"none",border:"1px solid rgba(242,237,230,.15)",borderRadius:8,padding:"6px 12px",color:"rgba(242,237,230,.5)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>↻ REFRESH</button>
          {total>0&&<button onClick={exportCSV} style={{background:"rgba(191,160,98,.1)",border:"1px solid rgba(191,160,98,.3)",borderRadius:8,padding:"6px 12px",color:GOLD,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>↓ EXPORT CSV</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:"12px 24px",display:"flex",gap:8,overflowX:"auto",borderBottom:"1px solid rgba(242,237,230,.06)"}}>
        {[["overview","Overview"],["responses","Responses"],["hypotheses","Hypotheses"],["segments","Segments"]].map(([id,label])=>(
          <button key={id} className={"tab"+(tab===id?" on":"")} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {total===0 ? (
        <div style={{padding:60,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16,opacity:.3}}>✦</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"rgba(242,237,230,.4)",marginBottom:8}}>No responses yet</div>
          <div style={{fontSize:13,color:"rgba(242,237,230,.2)"}}>Responses appear here automatically when people complete the bot</div>
        </div>
      ) : (
      <div style={{padding:"20px 24px 60px",maxWidth:1200,margin:"0 auto"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div className="fi">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:24}}>
              {[
                {label:"Total responses",  val:total,             sub:"all languages",        c:GOLD},
                {label:"Felt the pain",    val:hasPain.length,    sub:pct(hasPain.length,total)+" of total", c:"#E8714A"},
                {label:"Missed contact",   val:killer.length,     sub:"H1 killer signal ⚡",  c:"#E8714A"},
                {label:"In transition",    val:inTransit.length,  sub:"H3 trigger confirmed", c:"#C9A84C"},
                {label:"Active connectors",val:connectors.length, sub:"Claudia profile base", c:"#C9A84C"},
                {label:"Want to try app",  val:advYes.length,     sub:pct(advYes.length,total)+" Block I yes", c:"#8DC47A"},
                {label:"Said no",          val:advNo.length,      sub:pct(advNo.length,total)+" Block I no", c:"rgba(232,113,74,.7)"},
              ].map(s=>(
                <div key={s.label} className="card">
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:s.c,lineHeight:1,marginBottom:6}}>{s.val}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(242,237,230,.5)",lineHeight:1.4,marginBottom:3}}>{s.label}</div>
                  <div style={{fontSize:10,color:"rgba(242,237,230,.25)",fontStyle:"italic"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>H9 — How They Search</div>
                {searchData.length>0?(
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={searchData} layout="vertical" margin={{left:0,right:20}}>
                      <XAxis type="number" tick={{fill:"rgba(242,237,230,.3)",fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="name" tick={{fill:"rgba(242,237,230,.6)",fontSize:11}} axisLine={false} tickLine={false} width={90}/>
                      <Tooltip contentStyle={tip}/>
                      <Bar dataKey="value" fill={GOLD} radius={[0,3,3,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                ):<div style={{fontSize:12,color:"rgba(242,237,230,.25)",paddingTop:40,textAlign:"center"}}>Not enough data yet</div>}
              </div>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Personality Archetypes</div>
                {arcData.length>0?(
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={arcData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({name,percent})=>name+" "+Math.round(percent*100)+"%"} labelLine={false} fontSize={10}>
                        {arcData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={tip}/>
                    </PieChart>
                  </ResponsiveContainer>
                ):<div style={{fontSize:12,color:"rgba(242,237,230,.25)",paddingTop:40,textAlign:"center"}}>Not enough data yet</div>}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Top Cities</div>
                {cityData.length>0?(
                  <ResponsiveContainer width="100%" height={Math.max(180, cityData.length * 36)}>
                    <BarChart data={cityData} layout="vertical" margin={{left:4,right:24,top:4,bottom:4}} barSize={14} barCategoryGap="35%">
                      <XAxis type="number" allowDecimals={false} tickCount={Math.min(cityData.reduce((m,d)=>Math.max(m,d.value),0)+1,6)} tick={{fill:"rgba(242,237,230,.3)",fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="name" tick={{fill:"rgba(242,237,230,.65)",fontSize:10,width:90}} axisLine={false} tickLine={false} width={96}/>
                      <Tooltip contentStyle={tip}/>
                      <Bar dataKey="value" fill="#7BAFC4" radius={[0,3,3,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                ):<div style={{fontSize:12,color:"rgba(242,237,230,.25)",paddingTop:40,textAlign:"center"}}>Not enough data yet</div>}
              </div>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Top Occupations</div>
                {occData.length>0?(
                  <ResponsiveContainer width="100%" height={Math.max(180, occData.length * 36)}>
                    <BarChart data={occData.map(d=>({...d, name: d.name.length>22 ? d.name.slice(0,21)+"…" : d.name}))}
                      layout="vertical" margin={{left:4,right:24,top:4,bottom:4}} barSize={14} barCategoryGap="35%">
                      <XAxis type="number" allowDecimals={false} tickCount={Math.min(occData.reduce((m,d)=>Math.max(m,d.value),0)+1,6)} tick={{fill:"rgba(242,237,230,.3)",fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="name" tick={{fill:"rgba(242,237,230,.65)",fontSize:10,width:140}} axisLine={false} tickLine={false} width={148}/>
                      <Tooltip contentStyle={tip}/>
                      <Bar dataKey="value" fill="#8DC47A" radius={[0,3,3,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                ):<div style={{fontSize:12,color:"rgba(242,237,230,.25)",paddingTop:40,textAlign:"center"}}>Not enough data yet</div>}
              </div>
            </div>

            <div className="card">
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Block I — Would Try App</div>
              {[
                {label:"Yes",   val:advYes.length,   c:"#8DC47A"},
                {label:"Maybe", val:advMaybe.length, c:"#C9A84C"},
                {label:"No",    val:advNo.length,    c:"#E8714A"},
              ].map(row=>(
                <div key={row.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                  <span style={{fontSize:12,color:"rgba(242,237,230,.6)",minWidth:50}}>{row.label}</span>
                  <div style={{flex:1,height:6,background:"rgba(242,237,230,.07)",borderRadius:3}}>
                    <div style={{width:total?((row.val/total)*100)+"%":"0%",height:"100%",background:row.c,borderRadius:3,transition:"width .6s"}}/>
                  </div>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:row.c,width:30,textAlign:"right"}}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESPONSES */}
        {tab==="responses"&&(
          <div className="fi">
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" placeholder="Search name, city, job..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:220}}/>
              <select value={filter} onChange={e=>setFilter(e.target.value)}>
                <option value="all">All responses ({total})</option>
                <option value="completed">Completed ({completed.length})</option>
                <option value="in_progress">In Progress ({inProgress.length})</option>
                <option value="abandoned">Abandoned ({abandoned.length})</option>
                <option value="pain">Felt pain — H1 ({hasPain.length})</option>
                <option value="nopain">No pain reported ({noPain.length})</option>
                <option value="wants">Wants the app ({advYes.length})</option>
                <option value="connector">Connectors ({connectors.length})</option>
                <option value="no">Said no ({advNo.length})</option>
              </select>
              <div style={{fontSize:12,color:"rgba(242,237,230,.3)",marginLeft:4}}>{filtered.length} result{filtered.length!==1?"s":""}</div>
            </div>

            <div style={{display:"flex",gap:16,minHeight:400}}>
              <div style={{width:sel?280:"100%",flexShrink:0,overflowY:"auto",maxHeight:"70vh"}}>
                {filtered.map(r=>(
                  <div key={r.id} className="resp-card" onClick={()=>setSel(sel?.id===r.id?null:r)}
                    style={{padding:"11px 13px",marginBottom:7,background:sel?.id===r.id?"rgba(191,160,98,.08)":"rgba(242,237,230,.03)",border:"1px solid "+(sel?.id===r.id?"rgba(191,160,98,.4)":"rgba(242,237,230,.08)"),borderRadius:11,cursor:"pointer",transition:"all .15s",opacity:r.status==="abandoned"?.75:1,position:"relative"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:500,color:"#F2EDE6"}}>{r.name||"Anonymous"}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                        <div style={{fontSize:10,color:"rgba(242,237,230,.3)"}}>{ago(r.ts)}</div>
                        <button className="del-btn" title="Delete" onClick={e=>deleteResp(r.id,e)}>🗑</button>
                      </div>
                    </div>
                    {(r.age||r.gender)&&<div style={{fontSize:12,color:"rgba(191,160,98,.7)",marginBottom:3,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.3}}>{[r.age,r.age?ageRange(r.age):null,r.gender].filter(Boolean).join(" · ")}</div>}
                    <div style={{fontSize:12,color:"rgba(242,237,230,.4)",marginBottom:3,lineHeight:1.4}}>{[r.city,r.occ].filter(Boolean).join(" · ")||"—"}</div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.25)",marginBottom:7}}>⏱ {timeSpent(r.ts_start,r.ts)}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {r.status==="completed"&&<span className="badge" style={{background:"rgba(141,196,122,.08)",color:"rgba(141,196,122,.85)",border:"1px solid rgba(141,196,122,.2)"}}>COMPLETED</span>}
                      {r.status==="in_progress"&&<span className="badge" style={{background:"rgba(191,160,98,.08)",color:"rgba(191,160,98,.8)",border:"1px solid rgba(191,160,98,.2)"}}>IN PROGRESS</span>}
                      {r.status==="abandoned"&&<span className="badge" style={{background:"rgba(232,113,74,.05)",color:"rgba(232,113,74,.6)",border:"1px solid rgba(232,113,74,.15)"}}>ABANDONED</span>}
                      {r.lang&&<span className="badge" style={{background:"rgba(242,237,230,.05)",color:"rgba(242,237,230,.5)",border:"1px solid rgba(242,237,230,.1)"}}>{r.lang==="es"?"ES":"EN"}</span>}
                      {r.version&&<span className="badge" style={{background:"rgba(242,237,230,.05)",color:"rgba(242,237,230,.5)",border:"1px solid rgba(242,237,230,.1)"}}>{r.version==="football"?"⚽ Football":"🎭 Culture"}</span>}
                      {r.arc&&<span className="badge" style={{background:"rgba(242,237,230,.05)",color:"rgba(242,237,230,.5)",border:"1px solid rgba(242,237,230,.1)"}}>{ARC_LABELS[r.arc]}</span>}
                      {r.pro&&!isNo(r.pro)&&<span className="badge" style={{background:"rgba(232,113,74,.08)",color:"rgba(232,113,74,.8)",border:"1px solid rgba(232,113,74,.2)"}}>PAIN H1</span>}
                      {isYes(r.missed||"")&&<span className="badge" style={{background:"rgba(232,113,74,.12)",color:"rgba(232,113,74,.9)",border:"1px solid rgba(232,113,74,.25)"}}>H1 KILLER ⚡</span>}
                      {isYes(r.advance||"")&&<span className="badge" style={{background:"rgba(141,196,122,.08)",color:"rgba(141,196,122,.85)",border:"1px solid rgba(141,196,122,.2)"}}>WANTS IT</span>}
                      {isNo(r.advance||"")&&<span className="badge" style={{background:"rgba(242,237,230,.04)",color:"rgba(242,237,230,.35)",border:"1px solid rgba(242,237,230,.1)"}}>SAID NO</span>}
                      {/siempre|always|often|seguido/.test((r.conn||"").toLowerCase())&&<span className="badge" style={{background:"rgba(201,168,76,.08)",color:"rgba(201,168,76,.8)",border:"1px solid rgba(201,168,76,.2)"}}>CONNECTOR</span>}
                    </div>
                  </div>
                ))}
                {filtered.length===0&&<div style={{padding:40,textAlign:"center",fontSize:13,color:"rgba(242,237,230,.25)"}}>No results match your filter</div>}
              </div>

              {sel&&(
                <div style={{flex:1,overflowY:"auto",maxHeight:"70vh"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div>
                      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:"#F2EDE6",marginBottom:3}}>{sel.name||"Anonymous"}</h2>
                      {(sel.age||sel.gender)&&<div style={{fontSize:13,color:"rgba(191,160,98,.8)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,marginBottom:3}}>{[sel.age,sel.age?ageRange(sel.age):null,sel.gender].filter(Boolean).join(" · ")}</div>}
                      <div style={{fontSize:11,color:"rgba(242,237,230,.3)"}}>{new Date(sel.ts).toLocaleString()} · Spanish{sel.lp?" · LP "+sel.lp:""}{sel.arc?" · "+ARC_LABELS[sel.arc]:""}{sel.version?" · "+(sel.version==="football"?"⚽ Football":"🎭 Culture"):""} · <span style={{color:sel.status==="completed"?"rgba(141,196,122,.7)":"rgba(242,237,230,.3)"}}>{sel.status||"abandoned"}</span></div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button onClick={e=>deleteResp(sel.id,e)} style={{background:"none",border:"1px solid rgba(232,113,74,.25)",borderRadius:6,color:"rgba(232,113,74,.6)",fontSize:12,cursor:"pointer",padding:"4px 10px",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,transition:"all .15s"}} onMouseOver={e=>{e.target.style.borderColor="rgba(232,113,74,.7)";e.target.style.color="#E8714A";}} onMouseOut={e=>{e.target.style.borderColor="rgba(232,113,74,.25)";e.target.style.color="rgba(232,113,74,.6)";}}>DELETE</button>
                      <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"rgba(242,237,230,.3)",fontSize:18,cursor:"pointer"}}>✕</button>
                    </div>
                  </div>
                  <div style={{background:"rgba(242,237,230,.03)",border:"1px solid rgba(242,237,230,.08)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
                    {[
                      ["Name","name",""],["Age","age",""],["Gender","gender",""],["DOB","dob",""],["City","city","Block A"],["Occupation","occ","Block A"],
                      ["Likes job","jobfeel",""],["Growth ambitions","grow",""],["Life change","chg","H3 Trigger"],
                      ["Net. frequency","freq",""],["How they search","steps","H9"],["Social media","social","H9"],
                      ["Needed professional","pro","H1"],["Missed contact","missed","H1 KILLER"],
                      ["Connector role","conn","H-AR1"],["Connections made","count","H-AR1"],
                      ["Would try app","advance","Block I"],
                    ].map(([label,key,hyp],i)=>(
                      <div key={key} className="row" style={{background:i%2===0?"transparent":"rgba(242,237,230,.015)"}}>
                        <div style={{flexShrink:0,minWidth:140}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(242,237,230,.45)",letterSpacing:.3}}>{label}</div>
                          {hyp&&<div style={{fontSize:9,color:"rgba(191,160,98,.5)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,marginTop:1}}>{hyp}</div>}
                        </div>
                        <span style={{fontSize:13,color:sel[key]?"#F2EDE6":"rgba(242,237,230,.2)",textAlign:"right",maxWidth:"55%",lineHeight:1.5}}>{sel[key]||"—"}</span>
                      </div>
                    ))}
                  </div>
                  {sel.report&&(
                    <div style={{background:"rgba(8,6,4,.95)",border:"1px solid rgba(191,160,98,.15)",borderRadius:12,padding:"14px"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:2,color:"rgba(191,160,98,.5)",textTransform:"uppercase",marginBottom:10}}>Generated Profile</div>
                      <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,lineHeight:1.85,color:"rgba(242,237,230,.7)",whiteSpace:"pre-wrap"}}>{sel.report}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HYPOTHESES */}
        {tab==="hypotheses"&&(
          <div className="fi">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[
                { id:"H1", priority:"P0", title:"Core thesis",
                  claim:"Argentines feel real pain finding the right person inside their own network.",
                  yes:hasPain.length, total,
                  signal: killer.length>0 ? "killer: "+killer.length+" realized too late a contact could have helped" : "no killer signal yet",
                  status: total?(hasPain.length/total>0.5?"green":hasPain.length/total>0.25?"yellow":"red"):"red" },
                { id:"H3", priority:"P0", title:"Trigger",
                  claim:"Pain fires during transitions — new job, moving, starting a business.",
                  yes:inTransit.length, total,
                  signal: "life transition = "+pct(inTransit.length,total)+" of respondents",
                  status: total?(inTransit.length/total>0.4?"green":inTransit.length/total>0.2?"yellow":"red"):"red" },
                { id:"H-AR1", priority:"P0", title:"Earner hook",
                  claim:"Active connectors (Claudia profile) exist and can be activated.",
                  yes:connectors.length, total,
                  signal: connectors.length+" active connectors ("+pct(connectors.length,total)+")",
                  status: total?(connectors.length/total>0.3?"green":connectors.length/total>0.15?"yellow":"red"):"red" },
                { id:"H9", priority:"P1", title:"Substitutes",
                  claim:"Today people make do with WhatsApp, Google, asking friends — none solve it well.",
                  yes: searchData.reduce((a,b)=>a+b.value,0), total,
                  signal: "how people search today, captured for "+pct(resps.filter(r=>r.steps).length,total),
                  status: "yellow" },
                { id:"Block I", priority:"P0", title:"Advancement",
                  claim:"Would people actually want to try Ally?",
                  yes:advYes.length, total,
                  signal: advMaybe.length+" maybe answers worth following up",
                  status: total?(advYes.length/total>0.5?"green":advYes.length/total>0.25?"yellow":"red"):"red" },
              ].map(h=>{
                const sc = h.status==="green"?"#8DC47A":h.status==="red"?"#E8714A":"#C9A84C";
                const bw = h.total>0?(h.yes/h.total)*100:0;
                return(
                  <div key={h.id} className="card" style={{borderColor:h.priority==="P0"?"rgba(191,160,98,.15)":"rgba(242,237,230,.08)"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:600,color:GOLD,letterSpacing:.5}}>{h.id}</span>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,padding:"2px 8px",borderRadius:10,background:h.priority==="P0"?"rgba(232,113,74,.1)":"rgba(242,237,230,.05)",color:h.priority==="P0"?"rgba(232,113,74,.8)":"rgba(242,237,230,.35)",border:"1px solid "+(h.priority==="P0"?"rgba(232,113,74,.2)":"rgba(242,237,230,.1)"),letterSpacing:1}}>{h.priority}</span>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:"rgba(242,237,230,.6)"}}>{h.title}</span>
                      </div>
                      <div style={{width:10,height:10,borderRadius:"50%",background:sc,flexShrink:0,marginTop:2}}/>
                    </div>
                    <div style={{fontSize:13,color:"rgba(242,237,230,.55)",marginBottom:10,fontStyle:"italic"}}>"{h.claim}"</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{flex:1,height:6,background:"rgba(242,237,230,.07)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:bw+"%",height:"100%",background:sc,borderRadius:3,transition:"width .6s"}}/>
                      </div>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:sc,minWidth:50}}>{h.yes}/{h.total}</span>
                    </div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.3)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.3}}>{h.signal}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEGMENTS */}
        {tab==="segments"&&(
          <div className="fi">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div className="card" style={{borderColor:"rgba(232,113,74,.2)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>🔥</span>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,color:"#E8714A"}}>Valeria — The Relocator</div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>In transition · H3 profile</div>
                  </div>
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,color:"#E8714A",marginBottom:4}}>{inTransit.length}</div>
                <div style={{fontSize:12,color:"rgba(242,237,230,.4)",marginBottom:10}}>{pct(inTransit.length,total)} of respondents · moving / new job / startup</div>
                <div style={{height:1,background:"rgba(242,237,230,.07)",marginBottom:10}}/>
                <div style={{fontSize:12,color:"rgba(242,237,230,.45)",lineHeight:1.6}}>People in active transition who feel the pain most acutely. Primary marketing target.</div>
              </div>
              <div className="card" style={{borderColor:"rgba(201,168,76,.2)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>🕸️</span>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,color:"#C9A84C"}}>Claudia — The Connector</div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>Active connector · H-AR1 profile</div>
                  </div>
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,color:"#C9A84C",marginBottom:4}}>{connectors.length}</div>
                <div style={{fontSize:12,color:"rgba(242,237,230,.4)",marginBottom:10}}>{pct(connectors.length,total)} of respondents · people ask them for connections</div>
                <div style={{height:1,background:"rgba(242,237,230,.07)",marginBottom:10}}/>
                <div style={{fontSize:12,color:"rgba(242,237,230,.45)",lineHeight:1.6}}>Natural connectors who already do informal referrals. Base for the earner hook.</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Bot Version Split</div>
                {versionData.length>0?(
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={versionData} cx="50%" cy="50%" outerRadius={45} dataKey="value" label={({name,percent})=>name+" "+Math.round(percent*100)+"%"} fontSize={11}>
                        {versionData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={tip}/>
                    </PieChart>
                  </ResponsiveContainer>
                ):<div style={{fontSize:12,color:"rgba(242,237,230,.25)",paddingTop:30,textAlign:"center"}}>Not enough data yet</div>}
              </div>
              <div className="card">
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(191,160,98,.6)",textTransform:"uppercase",marginBottom:14}}>Block I — Decision Signal</div>
                <div style={{marginTop:6,padding:"12px 14px",background:total&&advNo.length/total>0.35?"rgba(232,113,74,.07)":total&&advYes.length/total>0.5?"rgba(141,196,122,.07)":"rgba(191,160,98,.07)",borderRadius:8,fontSize:13,color:"rgba(242,237,230,.6)",lineHeight:1.6}}>
                  {advYes.length} yes · {advMaybe.length} maybe · {advNo.length} no
                  <div style={{marginTop:8,fontSize:12,color:"rgba(242,237,230,.45)"}}>
                    {total&&advNo.length/total>0.35?"⚠ High rejection — understand the objections before launch.":total&&advYes.length/total>0.5?"✓ Strong interest signal — proceed.":"Mixed signal — need more responses."}
                  </div>
                </div>
              </div>
            </div>

            {noPain.length>0&&(
              <div className="card" style={{borderColor:"rgba(123,175,196,.2)"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,color:"rgba(123,175,196,.6)",textTransform:"uppercase",marginBottom:10}}>No-Pain Segment — {noPain.length} people ({pct(noPain.length,total)})</div>
                <div style={{fontSize:13,color:"rgba(242,237,230,.55)",marginBottom:12,lineHeight:1.6}}>
                  These people said they have not needed to find a new professional recently. This is valid signal, not a failure — either their network already covers them, or they have not hit a triggering situation yet.
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <div className="card" style={{flex:1,minWidth:120,padding:"10px 12px"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#7BAFC4",marginBottom:3}}>{resps.filter(r=>isNo(r.pro||"")&&/siempre|always|often|seguido/.test((r.conn||"").toLowerCase())).length}</div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>Still connectors (Claudia)</div>
                  </div>
                  <div className="card" style={{flex:1,minWidth:120,padding:"10px 12px"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#7BAFC4",marginBottom:3}}>{resps.filter(r=>isNo(r.pro||"")&&isYes(r.advance||"")).length}</div>
                    <div style={{fontSize:11,color:"rgba(242,237,230,.35)"}}>Still want to try app</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      )}
    </div>
  );
}
