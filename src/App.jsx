import { useState } from "react";

/* ── DESIGN TOKENS ───────────────────────────────────────────────────── */
const C = {
  bg:            "#F7F5F0",
  surface:       "#FFFFFF",
  pastelYellow:  "#F5EDD3",
  pastelBlue:    "#D3E4F5",
  pastelPeach:   "#F5DDD3",
  pastelLavender:"#E5DCF5",
  accentGold:    "#B8893A",
  accentNavy:    "#1E2D4A",
  accentWarm:    "#C09B5B",
  muted:         "#8A8F9E",
  border:        "#E8E4DC",
  danger:        "#E07A7A",
  text:          "#1E2D4A",
};

const TAB_COLORS = {
  rsu:        { bg: C.pastelBlue,      dot: "#5B9BD5",    label: "RSU Tax Estimator",    icon: "📊" },
  retirement: { bg: C.pastelYellow,    dot: C.accentGold, label: "Retirement Tracker",   icon: "🏦" },
  "401k":     { bg: C.pastelLavender,  dot: "#7B5EA7",    label: "401(k) Optimizer",     icon: "⚙️" },
  networth:   { bg: C.pastelPeach,     dot: "#C96B3E",    label: "Net Worth Snapshot",   icon: "💼" },
};

const fmt$ = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);
const fmtPct = (v) => `${Number(v || 0).toFixed(1)}%`;

/* ── SLIDER ──────────────────────────────────────────────────────────── */
function Slider({ label, value, onChange, min, max, step = 1, format = String, sublabel, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 13, fontFamily: "'Syne Mono', monospace", fontWeight: 700,
          color: C.accentNavy, background: color + "50", padding: "2px 10px", borderRadius: 99,
        }}>{format(value)}</span>
      </div>
      {sublabel && <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{sublabel}</div>}
      <div style={{ position: "relative", height: 8, background: C.border, borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", opacity: 0, cursor: "pointer", height: 24, margin: 0 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 10, color: C.muted }}>{format(min)}</span>
        <span style={{ fontSize: 10, color: C.muted }}>{format(max)}</span>
      </div>
    </div>
  );
}

/* ── RESULT CARD ─────────────────────────────────────────────────────── */
function Result({ label, value, sub, color, highlight }) {
  return (
    <div style={{
      flex: 1, minWidth: 130,
      background: highlight ? color + "22" : C.bg,
      border: `1.5px solid ${highlight ? color + "80" : C.border}`,
      borderRadius: 16, padding: "16px 18px",
      boxShadow: highlight ? `0 4px 20px ${color}20` : "none",
    }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.accentNavy, fontFamily: "'Syne Mono', monospace", letterSpacing: "-0.03em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

/* ── RSU CALCULATOR ──────────────────────────────────────────────────── */
function RSUCalc({ color }) {
  const [shares, setShares] = useState(1000);
  const [price, setPrice] = useState(150);
  const [salary, setSalary] = useState(180000);
  const [stateRate, setStateRate] = useState(9.3);
  const [withheld, setWithheld] = useState(22);

  const rsuValue = shares * price;
  const totalIncome = salary + rsuValue;
  const fedRate = totalIncome > 578125 ? 37 : totalIncome > 231250 ? 35 : totalIncome > 182050 ? 32 : totalIncome > 95375 ? 24 : 22;
  const totalRate = fedRate + stateRate + 7.65;
  const trueTax = rsuValue * totalRate / 100;
  const withheldTax = rsuValue * withheld / 100;
  const gap = trueTax - withheldTax;

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
        RSUs vest as ordinary income — and your employer's default withholding often falls short. Estimate your true tax exposure here.
      </p>
      <Slider label="Shares Vesting" value={shares} onChange={setShares} min={100} max={10000} step={100} format={v => v.toLocaleString()} color={color} />
      <Slider label="Share Price at Vest" value={price} onChange={setPrice} min={10} max={1000} step={5} format={fmt$} color={color} />
      <Slider label="Other Annual Income" value={salary} onChange={setSalary} min={50000} max={500000} step={5000} format={fmt$} color={color} />
      <Slider label="State Tax Rate" value={stateRate} onChange={setStateRate} min={0} max={13.3} step={0.1} format={fmtPct} sublabel="CA 13.3% · NY 10.9% · TX/FL 0%" color={color} />
      <Slider label="Employer Withholding" value={withheld} onChange={setWithheld} min={10} max={37} step={0.5} format={fmtPct} sublabel="Many employers default to 22%" color={color} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <Result label="RSU Value at Vest" value={fmt$(rsuValue)} color={color} />
        <Result label="Est. Tax Owed" value={fmt$(trueTax)} sub={`~${totalRate.toFixed(1)}% effective rate`} color={color} />
        <Result label={gap > 0 ? "Underpaid Gap" : "Overpaid"} value={fmt$(Math.abs(gap))} sub={gap > 0 ? "Consider quarterly payments" : "Possible refund"} color={color} highlight />
      </div>
    </div>
  );
}

/* ── RETIREMENT TRACKER ──────────────────────────────────────────────── */
function RetirementCalc({ color }) {
  const [current, setCurrent] = useState(75000);
  const [monthly, setMonthly] = useState(2000);
  const [age, setAge] = useState(32);
  const [retireAge, setRetireAge] = useState(65);
  const [rate, setRate] = useState(7);
  const [target, setTarget] = useState(3000000);

  const years = retireAge - age;
  const mr = rate / 100 / 12;
  const m = years * 12;
  const fv = current * Math.pow(1 + mr, m) + monthly * ((Math.pow(1 + mr, m) - 1) / mr);
  const pct = Math.min((fv / target) * 100, 100);
  const onTrack = fv >= target;

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
        Project your retirement balance based on your current savings, monthly contributions, and expected growth rate.
      </p>
      <Slider label="Current Savings" value={current} onChange={setCurrent} min={0} max={500000} step={5000} format={fmt$} color={color} />
      <Slider label="Monthly Contribution" value={monthly} onChange={setMonthly} min={0} max={5000} step={100} format={fmt$} color={color} />
      <Slider label="Current Age" value={age} onChange={setAge} min={22} max={60} format={v => `${v} yrs`} color={color} />
      <Slider label="Retirement Age" value={retireAge} onChange={setRetireAge} min={age + 5} max={75} format={v => `${v} yrs`} color={color} />
      <Slider label="Expected Annual Return" value={rate} onChange={setRate} min={3} max={12} step={0.5} format={fmtPct} color={color} />
      <Slider label="Savings Goal" value={target} onChange={setTarget} min={500000} max={10000000} step={100000} format={fmt$} color={color} />
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: C.muted }}>Progress toward goal</span>
          <span style={{ color: onTrack ? C.accentGold : C.accentWarm, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ background: C.border, borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: onTrack ? C.accentGold : C.accentWarm, height: "100%", borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Result label="Projected Balance" value={fmt$(fv)} sub={`In ${years} years`} color={color} highlight />
        <Result label="Your Goal" value={fmt$(target)} color={color} />
        <Result label="Status" value={onTrack ? "On Track ✓" : "Gap Exists"} sub={onTrack ? "Keep it up!" : `${fmt$(target - fv)} shortfall`} color={color} />
      </div>
    </div>
  );
}

/* ── 401k OPTIMIZER ──────────────────────────────────────────────────── */
function K401Calc({ color }) {
  const [income, setIncome] = useState(200000);
  const [trad, setTrad] = useState(10000);
  const [roth, setRoth] = useState(13000);
  const [employer, setEmployer] = useState(6000);
  const limit = 23000;
  const totalEmp = trad + roth;
  const remaining = Math.max(limit - totalEmp, 0);
  const fedRate = income > 578125 ? 37 : income > 231250 ? 35 : income > 182050 ? 32 : income > 95375 ? 24 : 22;
  const savings = trad * fedRate / 100;

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
        Find the right mix between pre-tax traditional and Roth contributions. The 2024 employee limit is $23,000.
      </p>
      <Slider label="Annual Income" value={income} onChange={setIncome} min={50000} max={600000} step={5000} format={fmt$} color={color} />
      <Slider label="Traditional (Pre-Tax)" value={trad} onChange={setTrad} min={0} max={limit} step={500} format={fmt$} sublabel="Reduces taxable income today" color={color} />
      <Slider label="Roth Contributions" value={roth} onChange={setRoth} min={0} max={Math.max(limit - trad, 0)} step={500} format={fmt$} sublabel="Tax-free withdrawals in retirement" color={color} />
      <Slider label="Employer Match" value={employer} onChange={setEmployer} min={0} max={20000} step={500} format={fmt$} color={color} />
      {totalEmp > limit && (
        <div style={{ background: C.danger + "18", border: `1px solid ${C.danger}40`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.danger, marginBottom: 16 }}>
          ⚠️ You've exceeded the $23,000 employee limit. Excess contributions may trigger penalties.
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Result label="Total Contributions" value={fmt$(totalEmp + employer)} sub={`Employee: ${fmt$(totalEmp)}`} color={color} />
        <Result label="Est. Tax Savings" value={fmt$(savings)} sub={`At ${fedRate}% bracket`} color={color} highlight />
        <Result label="Room Left" value={fmt$(remaining)} sub={remaining === 0 ? "Maxed out 🎉" : "Until $23k limit"} color={color} />
      </div>
    </div>
  );
}

/* ── NET WORTH SNAPSHOT ──────────────────────────────────────────────── */
function NetWorthCalc({ color }) {
  const [assets, setAssets] = useState({ "Checking": 25000, "Savings": 50000, "Investments": 150000, "Retirement Accts": 120000, "Home Value": 500000, "Other Assets": 20000 });
  const [liabs, setLiabs] = useState({ "Mortgage": 380000, "Student Loans": 40000, "Auto Loan": 12000, "Credit Cards": 5000, "Other Debt": 0 });

  const totalA = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalL = Object.values(liabs).reduce((a, b) => a + b, 0);
  const nw = totalA - totalL;

  const Row = ({ label, value, isLiab }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: C.muted, width: 120, flexShrink: 0 }}>{label}</span>
      <div style={{ position: "relative", flex: 1 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.muted }}>$</span>
        <input type="number" value={value}
          onChange={e => {
            const v = Math.max(0, Number(e.target.value));
            isLiab ? setLiabs(p => ({ ...p, [label]: v })) : setAssets(p => ({ ...p, [label]: v }));
          }}
          style={{ width: "100%", padding: "8px 10px 8px 22px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, fontFamily: "'Syne Mono', monospace", outline: "none", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
        Get a clear picture of where you stand. All data stays in your browser only.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accentGold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Assets</div>
          {Object.entries(assets).map(([k, v]) => <Row key={k} label={k} value={v} />)}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.danger, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Liabilities</div>
          {Object.entries(liabs).map(([k, v]) => <Row key={k} label={k} value={v} isLiab />)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <Result label="Total Assets" value={fmt$(totalA)} sub="Everything you own" color={color} />
        <Result label="Total Liabilities" value={fmt$(totalL)} sub="Everything you owe" color={color} />
        <Result label="Net Worth" value={fmt$(nw)} sub={nw >= 0 ? "Positive net worth ✓" : "Liabilities exceed assets"} color={color} highlight />
      </div>
    </div>
  );
}

/* ── MAIN APP ─────────────────────────────────────────────────────────── */
const TABS = ["rsu", "retirement", "401k", "networth"];

export default function App() {
  const [active, setActive] = useState("rsu");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const tc = TAB_COLORS[active];

  const handleSave = () => {
    try { localStorage.setItem("ws_saved", JSON.stringify({ tab: active, date: new Date().toLocaleDateString() })); } catch(e) {}
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/xpqyavlb", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email,
          source: "WealthShed Calculator Waitlist",
          date: new Date().toLocaleDateString(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch(e) {
      setErrorMsg("Connection error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne+Mono&family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${C.accentNavy}; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { transform: translateY(-2px); }
        .cta-btn { transition: all 0.2s; }
        .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(184,137,58,0.35) !important; }
        .save-btn:hover { background: ${C.border} !important; }
        input[type=number]:focus { border-color: ${C.accentGold}80 !important; }
        input[type=email]:focus { border-color: ${C.accentGold}80 !important; outline: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(30,45,74,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.accentNavy, letterSpacing: "-0.01em" }}>WealthShed</span>
          <span style={{ fontSize: 11, background: C.pastelYellow, color: C.accentGold, padding: "3px 10px", borderRadius: 99, fontWeight: 700, letterSpacing: "0.04em" }}>Planning Tools</span>
        </div>
        <a href="https://wealthshed.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.accentGold, textDecoration: "none", border: `1.5px solid ${C.accentGold}50`, padding: "7px 18px", borderRadius: 99, background: C.pastelYellow + "80" }}>
          wealthshed.com →
        </a>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 20px 64px" }}>

        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", background: tc.bg, color: C.accentNavy, fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 99, marginBottom: 16, letterSpacing: "0.07em", textTransform: "uppercase", transition: "background 0.4s" }}>
            Free financial tools
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: C.accentNavy, lineHeight: 1.15, marginBottom: 14 }}>
            Built for tech professionals<br />
            <span style={{ color: C.accentGold }}>planning their future.</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 14, maxWidth: 460, margin: "0 auto", lineHeight: 1.75 }}>
            Equity compensation, retirement goals, and growing wealth — these tools give you a clear starting point.
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {TABS.map(tab => {
            const t = TAB_COLORS[tab];
            const isActive = active === tab;
            return (
              <button key={tab} className="tab-btn" onClick={() => setActive(tab)} style={{
                padding: "10px 20px", borderRadius: 14,
                border: `1.5px solid ${isActive ? t.dot + "60" : C.border}`,
                background: isActive ? t.bg : C.surface,
                color: isActive ? C.accentNavy : C.muted,
                fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 7,
                boxShadow: isActive ? `0 4px 16px ${t.dot}20` : "none",
              }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
              </button>
            );
          })}
        </div>

        {/* CALCULATOR CARD */}
        <div style={{ background: C.surface, borderRadius: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 8px 40px rgba(30,45,74,0.07)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg, ${tc.dot}, ${tc.dot}70)`, transition: "background 0.4s" }} />
          <div style={{ padding: "28px 32px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.4s", flexShrink: 0 }}>
                  {tc.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.accentNavy }}>{tc.label}</h2>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Adjust sliders to explore scenarios</div>
                </div>
              </div>
              <button className="save-btn" onClick={handleSave} style={{ padding: "7px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                {saveMsg || "💾 Save"}
              </button>
            </div>

            {active === "rsu"        && <RSUCalc color={tc.dot} />}
            {active === "retirement" && <RetirementCalc color={tc.dot} />}
            {active === "401k"       && <K401Calc color={tc.dot} />}
            {active === "networth"   && <NetWorthCalc color={tc.dot} />}

            <div style={{ marginTop: 20, padding: "11px 15px", background: C.bg, borderRadius: 10, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
              ⚠️ For general educational and illustrative purposes only. Not personalized financial, tax, or investment advice. Consult a qualified professional before making financial decisions.
            </div>
          </div>
        </div>

        {/* EMAIL CTA */}
        <div style={{ borderRadius: 24, overflow: "hidden", border: `1.5px solid ${C.accentGold}25`, boxShadow: "0 8px 40px rgba(184,137,58,0.10)" }}>
          <div style={{ background: `linear-gradient(135deg, ${C.pastelYellow} 0%, ${C.pastelPeach} 100%)`, padding: "36px 36px 32px" }}>
            {!submitted ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accentGold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                    Included with WealthShed
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: C.accentNavy, marginBottom: 10, lineHeight: 1.2 }}>
                    Get a complimentary<br />estate plan — on us.
                  </h3>
                  <p style={{ color: "#4A5A6B", fontSize: 13, lineHeight: 1.75 }}>
                    WealthShed offers comprehensive financial planning for tech professionals, with estate planning included. Join the waitlist to get started.
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 12, marginBottom: 10, border: `1.5px solid ${errorMsg ? C.danger : C.accentGold + "40"}`, background: "rgba(255,255,255,0.85)", color: C.text, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", display: "block", boxSizing: "border-box" }}
                  />
                  {errorMsg && (
                    <div style={{ fontSize: 11, color: C.danger, marginBottom: 8, marginTop: -6 }}>{errorMsg}</div>
                  )}
                  <button
                    className="cta-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ width: "100%", padding: "13px 24px", borderRadius: 12, border: "none", background: submitting ? C.accentWarm : C.accentGold, color: "white", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 16px rgba(184,137,58,0.30)", transition: "all 0.2s" }}>
                    {submitting ? "Submitting..." : "Join the Waitlist →"}
                  </button>
                  <div style={{ fontSize: 11, color: "#4A5A6B", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
                    No spam. A fiduciary advisor will reach out personally.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: C.accentGold, color: "white", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>✓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: C.accentNavy, marginBottom: 8 }}>You're on the list!</h3>
                <p style={{ color: "#4A5A6B", fontSize: 13, lineHeight: 1.7 }}>A WealthShed advisor will be in touch soon. Keep exploring the tools above.</p>
              </div>
            )}
          </div>
          <div style={{ background: C.surface, padding: "12px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted }}>© 2026 WealthShed. All rights reserved. Advisors are fiduciaries.</span>
            <a href="https://wealthshed.com/disclosures" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.muted, textDecoration: "none" }}>View disclosures →</a>
          </div>
        </div>

      </div>
    </div>
  );
}
