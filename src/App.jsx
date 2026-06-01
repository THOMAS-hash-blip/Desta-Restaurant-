import { useState, useEffect } from "react";

const SUPABASE_URL = "https://javnzbxjzqdyxjlqgnjs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphdm56YnhqenFkeXhqbHFnbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTc5NTcsImV4cCI6MjA5NTgzMzk1N30.gYwmBzDmAaErtFsQyA9B56Slq0WDGhZ7vzIZdXbYOWk";

const ETB_TO_USD = 0.0178;

const T = {
  en: {
    title: "Dasta Restaurant", subtitle: "Authentic Ethiopian Cuisine",
    search: "Search dishes...", all: "All", meat: "Meat", fasting: "Fasting", fastfood: "Fast Food", drinks: "Drinks",
    available: "Available", outofstock: "Out of Stock",
    feedback: "Share Feedback", feedbackSub: "How was your experience?",
    serviceSpeed: "Service Speed", foodQuality: "Food Quality", ambiance: "Ambiance",
    comment: "Write a comment...", submit: "Submit", thanks: "Thank you! 🙏",
    noItems: "No dishes found", loading: "Loading menu...", error: "Failed to load menu",
  },
  am: {
    title: "ዳስታ ሬስቶራንት", subtitle: "ትክክለኛ የኢትዮጵያ ምግብ",
    search: "ምግብ ፈልግ...", all: "ሁሉም", meat: "ሥጋ", fasting: "የጾም", fastfood: "ፈጣን ምግብ", drinks: "መጠጦች",
    available: "አለ", outofstock: "አልቋል",
    feedback: "አስተያየት ስጥ", feedbackSub: "ዛሬ ተሞክሮህ እንዴት ነበር?",
    serviceSpeed: "የአገልግሎት ፍጥነት", foodQuality: "የምግብ ጥራት", ambiance: "ድባቡ",
    comment: "አስተያየት ፃፍ...", submit: "ላክ", thanks: "እናመሰግናለን! 🙏",
    noItems: "ምግብ አልተገኘም", loading: "ምናሌ እየጫነ ነው...", error: "ምናሌ ለመጫን አልተቻለም",
  },
};

const CATEGORIES = [
  { key: "all", icon: "🍽️" },
  { key: "meat", icon: "🥩", db: "ሥጋ ምግቦች" },
  { key: "fasting", icon: "🫘", db: "የጾም ምግቦች" },
  { key: "fastfood", icon: "🍔", db: "ፈጣን ምግብ" },
  { key: "drinks", icon: "🥤", db: "መጠጦች" },
];

const ITEM_EMOJIS = { "ሥጋ ምግቦች": "🥩", "የጾም ምግቦች": "🫘", "ፈጣን ምግብ": "🍔", "መጠጦች": "🥤" };

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default function DastaMenu() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("am");
  const [currency, setCurrency] = useState("ETB");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [ratings, setRatings] = useState({ serviceSpeed: 0, foodQuality: 0, ambiance: 0 });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const t = T[lang];

  useEffect(() => { loadMenu(); }, []);

  async function loadMenu() {
    try {
      setLoading(true); setError(null);
      const data = await sbFetch("menu_items?order=category,name_am");
      setItems(data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = items.filter(i => {
    const catMatch = category === "all" || CATEGORIES.find(c => c.key === category)?.db === i.category;
    const q = search.toLowerCase();
    const searchMatch = !search || i.name_am?.includes(search) || i.name_en?.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  const formatPrice = (p) => currency === "USD" ? `$${(p * ETB_TO_USD).toFixed(2)}` : `${p} ብር`;

  async function submitFeedback() {
    setSubmitting(true);
    try {
      await sbFetch("feedback", { method: "POST", body: JSON.stringify({ ...ratings, comment }) });
      setSubmitted(true);
    } catch (e) { alert("Error submitting. Try again."); }
    setSubmitting(false);
  }

  const bg = dark ? "#0c0b09" : "#fdfaf5";
  const surface = dark ? "#161410" : "#ffffff";
  const surface2 = dark ? "#1e1c17" : "#f5f0e8";
  const border = dark ? "#2a2820" : "#ebe3d5";
  const text = dark ? "#f0ece2" : "#1c1612";
  const muted = dark ? "#7a7060" : "#9a8e7a";
  const accent = "#b8872a";
  const accentBg = dark ? "#2a1f0a" : "#fef6e4";

  const Stars = ({ field }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => setRatings(r => ({...r, [field]: s}))}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, padding: 0,
            color: ratings[field] >= s ? "#f0a500" : (dark ? "#333" : "#ddd"),
            transition: "transform 0.1s", transform: ratings[field] >= s ? "scale(1.15)" : "scale(1)" }}>★</button>
      ))}
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "'Palatino Linotype', Georgia, serif", maxWidth: 440, margin: "0 auto" }}>
      <div style={{ background: dark ? "#0a0804" : "#1a0f02", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(45deg, #c8963c 0, #c8963c 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div style={{ position: "relative", padding: "30px 20px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: accent, textTransform: "uppercase", marginBottom: 6 }}>✦ እንኳን ደህና መጡ ✦</div>
          <div style={{ fontSize: 30, fontWeight: 400, color: "#fff", letterSpacing: 2 }}>{t.title}</div>
          <div style={{ width: 50, height: 1, background: accent, margin: "10px auto" }} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 3, textTransform: "uppercase" }}>{t.subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px 18px", position: "relative", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowLang(!showLang)}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
              🌐 {lang === "en" ? "EN" : "አማ"}
            </button>
            {showLang && (
              <div style={{ position: "absolute", top: 38, left: 0, background: surface, border: `1px solid ${border}`, borderRadius: 12, zIndex: 100, overflow: "hidden", minWidth: 150, boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
                {[["am","🇪🇹 አማርኛ"],["en","🇬🇧 English"]].map(([code, label]) => (
                  <div key={code} onClick={() => { setLang(code); setShowLang(false); }}
                    style={{ padding: "11px 16px", cursor: "pointer", fontSize: 13, background: lang === code ? accentBg : "transparent", color: lang === code ? accent : text, fontWeight: lang === code ? 700 : 400 }}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setCurrency(c => c === "ETB" ? "USD" : "ETB")}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "6px 16px", fontSize: 12, cursor: "pointer" }}>
            {currency === "ETB" ? "🇪🇹 ETB" : "🇺🇸 USD"}
          </button>
          <button onClick={() => setDark(d => !d)}
            style={{ background: dark ? accent : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 14px", fontSize: 14, cursor: "pointer" }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 40px", background: surface2, border: `1px solid ${border}`, borderRadius: 14, color: text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 0", overflowX: "auto", scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, border: category === c.key ? "none" : `1px solid ${border}`, background: category === c.key ? accent : surface2, color: category === c.key ? "#fff" : muted, fontSize: 12, fontWeight: category === c.key ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {c.icon} {t[c.key]}
          </button>
        ))}
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍽️</div>
            <div>{t.loading}</div>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div style={{ color: "#e05555", marginTop: 8, fontSize: 13 }}>{error}</div>
            <button onClick={loadMenu} style={{ marginTop: 14, padding: "9px 22px", background: accent, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Retry</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: muted }}>
            <div style={{ fontSize: 32 }}>🍽️</div>
            <div style={{ marginTop: 8 }}>{t.noItems}</div>
          </div>
        )}
        {!loading && !error && filtered.map(item => (
          <div key={item.id} onClick={() => item.available && setSelected(item)}
            style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", cursor: item.available ? "pointer" : "default", opacity: item.available ? 1 : 0.6, display: "flex", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 96, minHeight: 96, flexShrink: 0, background: `linear-gradient(135deg, ${dark ? "#2a1e0a" : "#fef3d0"}, ${dark ? "#1a1206" : "#fde4a0"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, position: "relative", overflow: "hidden" }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name_am} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                : <span>{ITEM_EMOJIS[item.category] || "🍽️"}</span>}
            </div>
            <div style={{ flex: 1, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{lang === "am" ? item.name_am : (item.name_en || item.name_am)}</div>
                <div style={{ fontWeight: 700, color: accent, fontSize: 14, whiteSpace: "nowrap" }}>{formatPrice(item.price)}</div>
              </div>
              {item.description && <div style={{ color: muted, fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{item.description}</div>}
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 10, fontWeight: 700,
                  background: item.available ? (dark ? "#0d2b1a" : "#e8f8ef") : (dark ? "#2a0d0d" : "#fde8e8"),
                  color: item.available ? "#22a05a" : "#e05555" }}>
                  {item.available ? "✓ " + t.available : "✗ " + t.outofstock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 16px 36px" }}>
        <button onClick={() => { setShowFeedback(true); setSubmitted(false); setRatings({ serviceSpeed:0, foodQuality:0, ambiance:0 }); setComment(""); }}
          style={{ width: "100%", padding: 15, background: "linear-gradient(135deg, #1a0f02, #2d1a06)", color: "#fff", border: `1px solid ${accent}44`, borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          ⭐ {t.feedback}
        </button>
      </div>
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: surface, borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 440, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ height: 180, background: `linear-gradient(135deg, ${dark?"#2a1e0a":"#fef3d0"}, ${dark?"#1a1206":"#fde4a0"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90, position: "relative", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
              {selected.image_url
                ? <img src={selected.image_url} alt={selected.name_am} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span>{ITEM_EMOJIS[selected.category] || "🍽️"}</span>}
              <button onClick={() => setSelected(null)} style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.4)", border:"none", color:"#fff", borderRadius:"50%", width:36, height:36, fontSize:16, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 20px 36px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:22, fontWeight:700 }}>{lang==="am" ? selected.name_am : (selected.name_en||selected.name_am)}</div>
                <div style={{ fontSize:20, fontWeight:700, color:accent }}>{formatPrice(selected.price)}</div>
              </div>
              {selected.name_en && lang==="am" && <div style={{ color:muted, fontSize:13, marginTop:2 }}>{selected.name_en}</div>}
              {selected.description && <div style={{ color:muted, fontSize:13, marginTop:10, lineHeight:1.6 }}>{selected.description}</div>}
              <div style={{ height:1, background:border, margin:"16px 0" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{ padding:"4px 14px", background:accentBg, color:accent, borderRadius:20, fontSize:12, fontWeight:700 }}>{selected.category}</span>
                <span style={{ padding:"4px 14px", background:selected.available?(dark?"#0d2b1a":"#e8f8ef"):(dark?"#2a0d0d":"#fde8e8"), color:selected.available?"#22a05a":"#e05555", borderRadius:20, fontSize:12, fontWeight:700 }}>
                  {selected.available ? "✓ "+t.available : "✗ "+t.outofstock}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFeedback && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => setShowFeedback(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:surface, borderRadius:"22px 22px 0 0", width:"100%", maxWidth:440, padding:"28px 20px 44px", maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ fontSize:40 }}>⭐</div>
              <div style={{ fontSize:20, fontWeight:700, marginTop:6 }}>{t.feedback}</div>
              <div style={{ color:muted, fontSize:13, marginTop:4 }}>{t.feedbackSub}</div>
            </div>
            {submitted ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:52 }}>🙏</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#22a05a", marginTop:12 }}>{t.thanks}</div>
              </div>
            ) : (
              <>
                {[["serviceSpeed",t.serviceSpeed,"⚡"],["foodQuality",t.foodQuality,"🍴"],["ambiance",t.ambiance,"✨"]].map(([field,label,icon]) => (
                  <div key={field} style={{ marginBottom:20 }}>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{icon} {label}</div>
                    <Stars field={field} />
                  </div>
                ))}
                <div style={{ height:1, background:border, margin:"6px 0 14px" }} />
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={t.comment}
                  style={{ width:"100%", boxSizing:"border-box", padding:14, background:surface2, border:`1px solid ${border}`, borderRadius:12, color:text, fontSize:13, fontFamily:"inherit", resize:"none", outline:"none", minHeight:90 }} />
                <button onClick={submitFeedback} disabled={submitting}
                  style={{ width:"100%", marginTop:14, padding:15, background:accent, border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", opacity:submitting?0.7:1 }}>
                  {submitting ? "..." : t.submit}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
