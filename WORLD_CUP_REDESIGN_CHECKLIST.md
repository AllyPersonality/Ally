# ALLY WORLD CUP REDESIGN - Implementation Checklist

## ✅ COMPLETED
- [x] Giphy URL updates for footballer celebrations
- [x] Backend support for email_capture and facebook_profile fields

---

## 📋 REMAINING TASKS

### PHASE 1: Database Schema (5 minutes)
**File**: Supabase Console

**Add columns to responses table:**
```sql
ALTER TABLE responses ADD COLUMN IF NOT EXISTS email_capture TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS facebook_profile TEXT;
```

**Verify in dashboard:**
- Update DashboardPage.jsx to show email_capture and facebook_profile in response detail view (lines ~380-395)

---

### PHASE 2: Color Scheme Update (30 minutes)
**File**: `src/BotPage.jsx`

**Global Find & Replace (in order):**

1. **Sky Blue** - Primary accent
   - Find: `#BFA062` → Replace: `#8dc2f2`
   - Find: `rgba(191,160,98,` → Replace: `rgba(141,194,242,`
   - Find: `191,160,98` → Replace: `141,194,242`

2. **Dark Navy** - Text color
   - Find: `#F2EDE6` → Replace: `#0a1628`
   - Find: `rgba(242,237,230,` → Replace: `rgba(10,22,40,`
   - Find: `242,237,230` → Replace: `10,22,40`

3. **Light Background**
   - Find: `#090705` → Replace: `#F8FBFF`
   - Find: `rgba(9,7,5,` → Replace: `rgba(248,251,255,`

4. **Gold Accents** - Keep existing or update to
   - Find: `#C9A84C` → Replace: `#F6B40E` (optional, for brighter gold)

**CSS Updates** (lines ~440-479):
```javascript
const CSS = `
  // Update body background
  body{background:#F8FBFF;...}
  
  // Update dot color (typing indicator)
  .dot{...background:#8dc2f2;...}
  
  // Update textarea text color
  textarea{...color:#0a1628;...}
  textarea::placeholder{color:rgba(10,22,40,.4)}
  
  // Update scrollbar
  ::-webkit-scrollbar-thumb{background:#8dc2f2;...}
  
  // Update input fields
  input[type=text],input[type=email]{
    background:#fff;
    border:2px solid #8dc2f2;
    color:#0a1628;
  }
  input::placeholder{color:rgba(10,22,40,.4)}
  
  // Update buttons
  .scp{
    border:2px solid #8dc2f2;
    background:#fff;
    color:#8dc2f2;
  }
  .scp:hover{
    background:#8dc2f2;
    color:#fff;
  }
`;
```

---

### PHASE 3: Opening Screen Redesign (45 minutes)
**File**: `src/BotPage.jsx` - VERSION SELECTION SCREEN (lines ~613-630)

**Replace entire opening screen with:**

```jsx
if (view === "choose") return (
  <div className="ally-root" style={{
    margin:"0 auto",
    minHeight:"100vh",
    background:"linear-gradient(to bottom, #8dc2f2 0%, #8dc2f2 33%, #F0F0F0 33%, #F0F0F0 66%, #8dc2f2 66%, #8dc2f2 100%)",
    position:"relative",
    overflow:"auto"
  }}>
    <style>{CSS}</style>
    
    {/* Dark overlay */}
    <div style={{position:"absolute",inset:0,background:"rgba(5,15,35,0.8)",zIndex:0}}/>
    
    {/* Stadium at top */}
    <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"90%",maxWidth:600,height:200,background:"linear-gradient(135deg, #2d5016 0%, #4a7c2a 50%, #2d5016 100%)",borderRadius:"0 0 50% 50%",overflow:"hidden",zIndex:1}}>
      {/* White lines */}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"60%",height:"60%",border:"2px solid rgba(255,255,255,0.4)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",width:2,height:"100%",background:"rgba(255,255,255,0.4)"}}/>
      
      {/* Floodlights */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position:"absolute",
          [i<2?"top":"bottom"]:0,
          [i%2===0?"left":"right"]:i%2===0?20:20,
          width:3,
          height:40,
          background:"rgba(255,255,255,0.6)",
          animation:"floodlight 2s ease-in-out infinite",
          animationDelay:`${i*0.5}s`
        }}/>
      ))}
      
      {/* Confetti */}
      {Array.from({length:10}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:-20,
          left:`${Math.random()*100}%`,
          width:8,
          height:8,
          background:"#F6B40E",
          borderRadius:"50%",
          animation:"confetti 3s linear infinite",
          animationDelay:`${Math.random()*2}s`
        }}/>
      ))}
    </div>
    
    {/* Argentina flag progress bar at very top */}
    <div style={{position:"absolute",top:0,left:0,right:0,height:8,background:"linear-gradient(to right, #8dc2f2 0%, #8dc2f2 33%, #fff 33%, #fff 66%, #8dc2f2 66%, #8dc2f2 100%)",zIndex:2}}/>
    
    {/* Content */}
    <div style={{position:"relative",zIndex:2,padding:"220px 20px 40px",textAlign:"center",maxWidth:480,margin:"0 auto"}}>
      
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:30}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,letterSpacing:3,color:"#8dc2f2",fontWeight:600}}>✦ ALLY ✦</div>
        <div style={{fontSize:20}}>🇦🇷🏆🇦🇷</div>
      </div>
      
      {/* Title */}
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(32px,8vw,48px)",fontWeight:700,color:"#8dc2f2",marginBottom:8,letterSpacing:2}}>¿CUÁL DE</h1>
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(48px,12vw,72px)",fontWeight:900,background:"linear-gradient(90deg, #8dc2f2 0%, #fff 50%, #8dc2f2 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1,marginBottom:8,letterSpacing:4}}>LOS 9</h1>
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(36px,9vw,54px)",fontWeight:700,color:"#F6B40E",marginBottom:20,letterSpacing:2}}>SOS VOS?</h1>
      
      {/* Subtitle */}
      <p style={{fontFamily:"'Barlow',sans-serif",fontSize:16,color:"rgba(255,255,255,0.9)",lineHeight:1.6,marginBottom:20}}>
        Todos tienen un jugador adentro. El tuyo se esconde en cómo conectás con la gente.
      </p>
      
      {/* Tag */}
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:"#F6B40E",marginBottom:30,fontWeight:600}}>
        ✦ CARTA NATAL + NÚMERO DE VIDA INCLUIDOS ✦
      </div>
      
      {/* Version buttons */}
      <div style={{display:"flex",gap:16,marginBottom:20}}>
        <button onClick={()=>{setVersion("football");start();}} style={{
          flex:1,
          padding:"18px 24px",
          background:"transparent",
          border:"3px solid #8dc2f2",
          borderRadius:16,
          color:"#8dc2f2",
          fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:20,
          fontWeight:700,
          letterSpacing:2,
          cursor:"pointer",
          transition:"all .3s"
        }} onMouseOver={e=>{e.target.style.background="#8dc2f2";e.target.style.color="#fff";}} onMouseOut={e=>{e.target.style.background="transparent";e.target.style.color="#8dc2f2";}}>
          ⚽ FÚTBOL
        </button>
        
        <button onClick={()=>{setVersion("cultural");start();}} style={{
          flex:1,
          padding:"18px 24px",
          background:"transparent",
          border:"3px solid #F6B40E",
          borderRadius:16,
          color:"#F6B40E",
          fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:20,
          fontWeight:700,
          letterSpacing:2,
          cursor:"pointer",
          transition:"all .3s"
        }} onMouseOver={e=>{e.target.style.background="#F6B40E";e.target.style.color="#0a1628";}} onMouseOut={e=>{e.target.style.background="transparent";e.target.style.color="#F6B40E";}}>
          🌟 CULTURA
        </button>
      </div>
      
      {/* Small text */}
      <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"'Barlow',sans-serif"}}>
        gratis · 5 minutos · sin registro
      </div>
    </div>
  </div>
);
```

**Add CSS animations** (add to CSS string):
```css
@keyframes confetti{
  0%{transform:translateY(-100%) rotate(0deg)}
  100%{transform:translateY(100vh) rotate(720deg)}
}
@keyframes floodlight{
  0%,100%{opacity:.6}
  50%{opacity:1}
}
```

---

### PHASE 4: Chat Screen Updates (30 minutes)
**File**: `src/BotPage.jsx` - CHAT SCREEN (lines ~755-850)

**Update chat container** (line ~755):
```jsx
<div className="ally-root ally-chat" style={{
  margin:"0 auto",
  height:"100vh",
  background:"#F8FBFF",  // Light background
  display:"flex",
  flexDirection:"column",
  position:"relative",
  overflow:"hidden"
}}>
```

**Add Argentina flag stripe at top** (after style tag):
```jsx
{/* Argentina flag decorative stripe */}
<div style={{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  height:6,
  background:"linear-gradient(to right, #8dc2f2 0%, #8dc2f2 33%, #fff 33%, #fff 66%, #8dc2f2 66%, #8dc2f2 100%)",
  zIndex:10
}}/>
```

**Update header** (lines ~756-774):
```jsx
<div style={{
  padding:"16px 18px 10px",
  borderBottom:"1px solid #8dc2f2",
  background:"#fff",
  flexShrink:0,
  position:"relative",
  zIndex:1
}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:36,
        height:36,
        borderRadius:"50%",
        background:"#8dc2f2",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:18
      }}>⚽</div>
      <div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:600,color:"#0a1628"}}>Ally</div>
        <div style={{fontSize:11,color:"#8dc2f2"}}>{done?"Completo":typing?"Escribiendo...":"En línea"}</div>
      </div>
    </div>
  </div>
  
  {/* Argentina flag progress bar */}
  <div style={{height:6,background:"linear-gradient(to right, #8dc2f2 0%, #8dc2f2 33%, #fff 33%, #fff 66%, #8dc2f2 66%, #8dc2f2 100%)",borderRadius:3,position:"relative",overflow:"hidden"}}>
    <div style={{width:prog+"%",height:"100%",background:"rgba(246,180,14,0.6)",transition:"width .6s ease"}}/>
  </div>
</div>
```

**Update message bubbles** (lines ~777-788):

Bot message:
```jsx
<div style={{
  maxWidth:"78%",
  padding:"13px 17px",
  background:"#fff",           // White bubble
  border:"2px solid #8dc2f2",  // Sky blue border
  borderRadius:"18px 18px 18px 4px",
  fontSize:17,
  lineHeight:1.72,
  color:"#0a1628",             // Dark navy text
  boxShadow:"0 2px 8px rgba(141,194,242,0.1)"
}}>{m.text}</div>
```

User message:
```jsx
<div style={{
  maxWidth:"76%",
  padding:"13px 17px",
  background:"#8dc2f2",        // Sky blue bubble
  border:"2px solid #8dc2f2",
  borderRadius:"18px 18px 4px 18px",
  fontSize:17,
  lineHeight:1.65,
  color:"#fff"                 // White text
}}>{m.text}</div>
```

**Update input bar** (lines ~840-850):
```jsx
<div style={{
  padding:"12px 15px 20px",
  borderTop:"2px solid #8dc2f2",
  background:"#fff",
  flexShrink:0,
  position:"relative",
  zIndex:1
}}>
  <div style={{
    display:"flex",
    alignItems:"flex-end",
    gap:10,
    background:"#fff",
    border:"2px solid #8dc2f2",
    borderRadius:16,
    padding:"12px 12px 12px 16px"
  }}>
    <textarea ... style={{color:"#0a1628"}}/>
    <button ... style={{
      background:"#8dc2f2",  // Sky blue send button
      color:"#fff"
    }}>↑</button>
  </div>
</div>
```

---

### PHASE 5: Caricature Animations (45 minutes)
**File**: `src/BotPage.jsx`

**Add caricature trigger logic** (in submit function, after line ~578):
```javascript
// Show caricature every 3-4 messages
if ((turns + 1) % 3 === 0 && !done) {
  const caricatures = ["weaver","catalyst","tide","oracle","scout","mirror","anchor","spark","seed"];
  const randomCaric = caricatures[Math.floor(Math.random() * caricatures.length)];
  setTimeout(() => {
    setCaricatureShow(randomCaric);
    setTimeout(() => setCaricatureShow(null), 3000);
  }, 1500);
}
```

**Add caricature display** (in chat screen, after messages div ~776):
```jsx
{/* Sliding caricature */}
{caricatureShow && (
  <div style={{
    position:"fixed",
    right:caricatureShow?"20px":"-200px",
    bottom:"30%",
    width:150,
    height:150,
    borderRadius:"50%",
    overflow:"hidden",
    border:"4px solid #8dc2f2",
    boxShadow:"0 8px 24px rgba(141,194,242,0.4)",
    animation:"slideIn 0.5s ease-out forwards",
    zIndex:100,
    background:"#fff"
  }}>
    <img 
      src={`/caricatures-football/${CARICATURES[caricatureShow]}`} 
      alt={caricatureShow}
      style={{width:"100%",height:"100%",objectFit:"cover"}}
    />
  </div>
)}
```

**Add animations to CSS**:
```css
@keyframes slideIn{
  from{transform:translateX(200px);opacity:0}
  to{transform:translateX(0);opacity:1}
}
```

---

### PHASE 6: Email Capture UI (60 minutes)
**File**: `src/BotPage.jsx` - RESULT CARD (lines ~789-870)

**After result display, before share buttons** (around line ~850):
```jsx
{/* Email Capture - MANDATORY before sharing */}
{!emailOk ? (
  <div style={{
    background:"#fff",
    border:"3px solid #8dc2f2",
    borderRadius:16,
    padding:"24px",
    marginTop:20
  }}>
    <h3 style={{
      fontFamily:"'Barlow Condensed',sans-serif",
      fontSize:24,
      fontWeight:700,
      color:"#0a1628",
      marginBottom:8
    }}>¡Guardá tu resultado!</h3>
    
    <p style={{
      fontSize:15,
      color:"rgba(10,22,40,0.7)",
      marginBottom:20,
      lineHeight:1.6
    }}>
      Dejá tu mail y te avisamos cuando Ally lanza. Tu perfil te espera ahí.
    </p>
    
    <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
      <input 
        type="text" 
        placeholder="Nombre completo" 
        value={fullName} 
        onChange={e=>setFullName(e.target.value)}
        style={{
          background:"#fff",
          border:"2px solid #8dc2f2",
          borderRadius:10,
          padding:"12px 16px",
          fontSize:16,
          color:"#0a1628"
        }}
      />
      
      <input 
        type="email" 
        placeholder="tu@email.com" 
        value={email} 
        onChange={e=>setEmail(e.target.value)}
        style={{
          background:"#fff",
          border:"2px solid #8dc2f2",
          borderRadius:10,
          padding:"12px 16px",
          fontSize:16,
          color:"#0a1628"
        }}
      />
      
      <label style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:"#0a1628"}}>
        <input 
          type="checkbox" 
          checked={shareFb} 
          onChange={e=>setShareFb(e.target.checked)}
        />
        <span>¿Compartís en Facebook?</span>
      </label>
      
      {shareFb && (
        <input 
          type="text" 
          placeholder="Tu perfil o nombre de Facebook" 
          value={fbProfile} 
          onChange={e=>setFbProfile(e.target.value)}
          style={{
            background:"#fff",
            border:"2px solid #8dc2f2",
            borderRadius:10,
            padding:"12px 16px",
            fontSize:16,
            color:"#0a1628"
          }}
        />
      )}
    </div>
    
    <button 
      onClick={async ()=>{
        if(!fullName.trim() || !email.includes("@")) {
          alert("Por favor completá tu nombre y email");
          return;
        }
        // Save to database
        await fetch("/api/responses", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            id: sessionId.current,
            email_capture: email,
            facebook_profile: shareFb ? fbProfile : null,
            ts: new Date().toISOString()
          })
        });
        setEmailOk(true);
      }}
      style={{
        width:"100%",
        padding:"16px",
        background:"#F6B40E",
        border:"none",
        borderRadius:12,
        color:"#0a1628",
        fontFamily:"'Barlow Condensed',sans-serif",
        fontSize:18,
        fontWeight:700,
        letterSpacing:1,
        cursor:"pointer",
        transition:"all .2s"
      }}
      onMouseOver={e=>e.target.style.transform="scale(1.02)"}
      onMouseOut={e=>e.target.style.transform="scale(1)"}
    >
      GUARDAR Y COMPARTIR
    </button>
  </div>
) : (
  <div style={{
    textAlign:"center",
    padding:16,
    background:"rgba(141,194,242,0.1)",
    borderRadius:12,
    marginTop:20,
    marginBottom:20
  }}>
    <div style={{fontSize:16,color:"#8dc2f2",fontWeight:600}}>
      ✓ ¡Listo! Te avisamos cuando lancemos.
    </div>
  </div>
)}

{/* Share buttons - only show after email capture */}
{emailOk && (
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <button className="sfb" onClick={()=>share(m.arcId,m.lp,"fb")}>
      <span style={{fontSize:17,fontWeight:700}}>f</span>COMPARTIR EN FACEBOOK
    </button>
    <button className="sig" onClick={()=>share(m.arcId,m.lp,"ig")}>
      <span style={{fontSize:14}}>◎</span>COMPARTIR EN INSTAGRAM
    </button>
    <button className="scp" onClick={()=>share(m.arcId,m.lp,"copy")}>
      {copied?"✓ COPIADO":"COPIAR TEXTO"}
    </button>
  </div>
)}
```

---

### PHASE 7: Multiple Choice Button Updates (15 minutes)
**File**: `src/BotPage.jsx` - CHOICE BUTTONS (lines ~810-835)

**Update button styling**:
```jsx
<button ... style={{
  padding:"14px 18px",
  background:"#fff",           // White background
  border:"2px solid #8dc2f2",  // Sky blue border
  borderRadius:14,
  color:"#0a1628",             // Dark text
  fontSize:16,
  fontFamily:"'Barlow',sans-serif",
  cursor:"pointer",
  transition:"all .2s",
  textAlign:"left",
  display:"flex",
  alignItems:"center",
  gap:8
}} 
onMouseOver={e=>{
  e.target.style.background="#8dc2f2";
  e.target.style.color="#fff";
  e.target.style.borderColor="#F6B40E";
}} 
onMouseOut={e=>{
  e.target.style.background="#fff";
  e.target.style.color="#0a1628";
  e.target.style.borderColor="#8dc2f2";
}}>
```

---

### PHASE 8: Dashboard Update (10 minutes)
**File**: `src/DashboardPage.jsx`

**Add email columns to detail view** (around line ~380):
```jsx
["Email captured","email_capture",""],
["Facebook profile","facebook_profile",""],
```

---

## 🧪 TESTING CHECKLIST

After implementation, test:

- [ ] Opening screen displays Argentina flag background with stadium
- [ ] Confetti and floodlights animate on opening screen
- [ ] Progress bar shows Argentina flag colors
- [ ] Chat bubbles use new colors (sky blue, dark navy, white)
- [ ] Multiple choice buttons are white with sky blue borders
- [ ] Caricatures slide in every 3-4 messages from the right
- [ ] Result card shows correct Giphy footballer celebration
- [ ] Email capture form appears before share buttons
- [ ] Cannot share without submitting email
- [ ] Email and Facebook data saves to Supabase
- [ ] Dashboard shows email_capture and facebook_profile columns
- [ ] Mobile responsive on all screens

---

## 📦 DEPLOYMENT

```bash
npm run build
git add -A
git commit -m "Complete World Cup redesign: Argentina theme, stadium animations, email capture"
git push origin main
```

Railway will auto-deploy.

---

## 🎨 COLOR REFERENCE

**Primary Colors:**
- Sky Blue: `#8dc2f2` / `rgba(141,194,242,1)`
- Gold: `#F6B40E` / `rgba(246,180,14,1)`
- Dark Navy: `#0a1628` / `rgba(10,22,40,1)`
- White: `#FFFFFF` / `rgba(255,255,255,1)`
- Light BG: `#F8FBFF` / `rgba(248,251,255,1)`

**Argentina Flag:**
- Gradient: `linear-gradient(to right, #8dc2f2 0%, #8dc2f2 33%, #fff 33%, #fff 66%, #8dc2f2 66%, #8dc2f2 100%)`

---

## ⚠️ COMMON PITFALLS

1. **Don't forget** to update BOTH hover and default states for buttons
2. **Test mobile** - stadium animation should be responsive
3. **Verify Giphy GIFs load** - check network tab for 404s
4. **Email validation** - require @ symbol before allowing submission
5. **Caricature images** - ensure /public/caricatures-football/ folder exists
6. **Database columns** - must add email_capture and facebook_profile to Supabase first

---

## 📞 HELP

If stuck on any phase, the backup file is at: `src/BotPage.backup.jsx`

Original dark theme can be restored from backup if needed.
