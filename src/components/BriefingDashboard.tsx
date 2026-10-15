/**
 * BriefingDashboard — Full-screen enterprise analytics terminal.
 * Strict design system: #0F172A (navy) + #FFFFFF (white).
 * Charts: PRIMARY shades only (#0F172A, #1E293B, #334155, #475569, #64748B, #94A3B8, #CBD5E1).
 * RED (#DC2626) reserved for critical/negative indicators only.
 */
import { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

// ── STRICT Enterprise Palette — light-background categorical colours ─────────
const C = {
  // ── Categorical chart colours (8 clearly distinct on white/light bg) ──────
  // Each is perceptually distinct — hue, lightness, saturation all vary
  blue1:   "#1D4ED8",   // Vivid blue       — primary series / budget
  blue2:   "#0369A1",   // Ocean blue       — secondary series
  blue3:   "#0891B2",   // Cyan-teal        — tertiary series
  blue4:   "#6366F1",   // Indigo-violet    — 4th series
  blue5:   "#94A3B8",   // Steel muted      — 5th / de-emphasis
  // Semantic (these don't change — always mean the same thing)
  green:   "#10B981",   // Emerald          — positive / up / on-track
  greenD:  "#059669",   // Dark emerald     — positive strong
  red:     "#DC2626",   // Red              — negative / down / critical
  redD:    "#B91C1C",   // Dark red         — critical strong
  down:    "#DC2626",
  // Supporting categoricals
  amber:   "#D97706",   // Amber            — warning / forecast / 5th series
  teal:    "#0D9488",   // Teal             — 6th series
  violet:  "#7C3AED",   // Violet           — 7th series
  emerald: "#10B981",   // alias for green
  orange:  "#EA580C",   // Orange           — 8th series
  pink:    "#DB2777",   // Pink             — overflow series
  // Backgrounds
  bg0:     "#FFFFFF",
  bg1:     "#F8FAFC",
  bg2:     "#F1F5F9",
  bg3:     "#E2E8F0",
  // Grid / border
  grid:    "rgba(15,23,42,0.06)",
  border:  "rgba(15,23,42,0.10)",
  // Text (dark on light)
  text1:   "#0F172A",
  text2:   "#475569",
  text3:   "#64748B",
  textMuted: "#94A3B8",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function rand(min: number, max: number) { return min + Math.random() * (max - min); }

function genSeries(n: number, base: number, vol: number) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    v: +(base + Math.sin(i * 0.4) * vol + rand(-vol * 0.3, vol * 0.3)).toFixed(2),
  }));
}

function genCandles(n: number, base: number, vol: number) {
  let price = base;
  return Array.from({ length: n }, (_, i) => {
    const open  = price;
    const close = +(open + rand(-vol, vol)).toFixed(4);
    const high  = +(Math.max(open, close) + rand(0, vol * 0.4)).toFixed(4);
    const low   = +(Math.min(open, close) - rand(0, vol * 0.4)).toFixed(4);
    price = close;
    return { t: i, open, close, high, low, up: close >= open };
  });
}

// ── ZSE Index 2-day intraday data (Bloomberg/CNBC style) ─────────────────
function genZSEData() {
  // Day 1 — yesterday trading session (48 points, 9am–4pm)
  const day1Labels = ["9a","10a","11a","12p","1p","2p","3p","4p"];
  const day2Labels = ["9a","10a","11a","12p","1p","2p","3p","4p"];
  let price = 4001.2;
  const pts: { t: string; v: number; day: number }[] = [];
  // Day 1
  for (let i = 0; i < 48; i++) {
    price += rand(-8, 9);
    const slot = Math.floor(i / 6);
    pts.push({ t: i % 6 === 0 ? day1Labels[slot] : "", v: +price.toFixed(2), day: 1 });
  }
  // Day 2 — today (reset gap then continue)
  price = price + rand(-15, 20);
  for (let i = 0; i < 48; i++) {
    price += rand(-7, 8.5);
    const slot = Math.floor(i / 6);
    pts.push({ t: i % 6 === 0 ? day2Labels[slot] : "", v: +price.toFixed(2), day: 2 });
  }
  return pts;
}
const INIT_ZSE_DATA = genZSEData();
const ZSE_BASE = INIT_ZSE_DATA[0].v;
const ZSE_LAST = INIT_ZSE_DATA[INIT_ZSE_DATA.length - 1].v;

// Live ZSE chart component — CNBC/Bloomberg S&P 500 style
function LiveZSEChart() {
  const [data, setData] = useState(INIT_ZSE_DATA);
  const [currentPrice, setCurrentPrice] = useState(ZSE_LAST);
  const [basePrice] = useState(ZSE_BASE);
  const tRef = useRef(data.length);

  useEffect(() => {
    const id = setInterval(() => {
      setData(d => {
        const last = d[d.length - 1].v;
        const next = +(last + rand(-5, 6)).toFixed(2);
        const newPt = { t: "", v: next, day: 2 };
        setCurrentPrice(next);
        return [...d.slice(-95), newPt];
      });
    }, 900 + rand(0, 300));
    return () => clearInterval(id);
  }, []);

  const change = +(currentPrice - basePrice).toFixed(2);
  const changePct = +((change / basePrice) * 100).toFixed(2);
  const up = change >= 0;
  const color = up ? C.green : C.red;
  const fillColor = up ? "rgba(0,230,118,0.18)" : "rgba(255,23,68,0.15)";

  // Find separator index between day1 and day2
  const day1Count = data.filter(d => d.day === 1).length;

  // Custom dot — only show last point as filled circle
  const CustomDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (index !== data.length - 1) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={1} />
        <rect x={(cx ?? 0) + 6} y={(cy ?? 0) - 10} width={46} height={18} rx={2} fill={color} />
        <text x={(cx ?? 0) + 29} y={(cy ?? 0) + 3} textAnchor="middle" fontSize={9} fontWeight={900} fontFamily="monospace" fill="#fff">
          {currentPrice.toFixed(2)}
        </text>
      </g>
    );
  };

  // Custom reference line for day separator
  const CustomVerticalLine = ({ viewBox }: { viewBox?: { x: number; y: number; height: number } }) => {
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    return <line x1={x} y1={y} x2={x} y2={y + height} stroke={C.border} strokeWidth={1} strokeDasharray="2 2" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F8FAFC", overflow: "hidden" }}>
      {/* Header — CNBC style */}
      <div style={{ padding: "5px 10px 2px", background: "#E2E8F0", borderBottom: "1px solid rgba(37,99,235,0.3)", flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: C.text2, letterSpacing: "0.08em", textTransform: "uppercase" }}>ZSE All Share Index</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 1 }}>
          <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: C.text1, letterSpacing: "-0.02em" }}>
            {currentPrice.toFixed(2)}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "monospace" }}>
            {up ? "+" : ""}{change.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>
            [{up ? "+" : ""}{changePct.toFixed(2)}%]
          </span>
        </div>
      </div>

      {/* 2-DAY label + chart */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <div style={{
          position: "absolute", top: 4, right: 8,
          fontSize: 8, fontWeight: 700, color: C.text3,
          letterSpacing: "0.1em", zIndex: 2,
        }}>2-DAY</div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 52, left: 0, bottom: 14 }}>
            <defs>
              <linearGradient id="zseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="75%" stopColor={color} stopOpacity={0.08} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Day separator reference line at midpoint */}
            <XAxis
              dataKey="t"
              tick={{ fontSize: 8, fill: C.text2, fontFamily: "monospace" }}
              axisLine={{ stroke: C.border }}
              tickLine={false}
              interval={0}
              height={16}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 8, fill: C.text3, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
              width={36}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            {/* Vertical separator between day1 and day2 */}
            <line
              x1={`${(day1Count / data.length) * 100}%`}
              y1="0%"
              x2={`${(day1Count / data.length) * 100}%`}
              y2="100%"
              stroke={C.border}
              strokeDasharray="3 2"
            />
            <Tooltip
              contentStyle={{ background: C.bg0, border: `1px solid ${color}40`, fontSize: 9, color: C.text1, borderRadius: 4 }}
              labelFormatter={() => ""}
              formatter={(v: number) => [v.toFixed(2), "ZSE"]}
              cursor={{ stroke: C.border, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.8}
              fill="url(#zseGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 3, fill: color, stroke: color }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Day date labels at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 36, right: 52,
          display: "flex", justifyContent: "space-between",
          fontSize: 7, color: C.text3, fontFamily: "monospace",
          pointerEvents: "none",
        }}>
          <span style={{ marginLeft: `${(day1Count / data.length / 2) * 100}%` }}>
            {new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })}
          </span>
          <span style={{ marginRight: "4px" }}>
            {new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Static data ───────────────────────────────────────────────────────────
const INIT_SPEND    = genSeries(80, 2.84, 0.04);
const INIT_CANDLES  = genCandles(40, 1.37, 0.025);
const INIT_RISK     = genSeries(60, 420, 35);
const INIT_BUDGET   = genSeries(60, 67.8, 2);
const INIT_NOISE    = genSeries(80, 180, 50);
const INIT_TENDER   = genSeries(60, 1287, 15);

// ── Procurement KPI charts data ───────────────────────────────────────────
const CASH_BURN_DATA = [
  { name: "Jan", budget: 850, actual: 780, forecast: 820 },
  { name: "Feb", budget: 850, actual: 810, forecast: 855 },
  { name: "Mar", budget: 900, actual: 875, forecast: 910 },
  { name: "Apr", budget: 900, actual: 920, forecast: 935 },
  { name: "May", budget: 950, actual: 965, forecast: 980 },
  { name: "Jun", budget: 950, actual: 1010, forecast: 1040 },
];

const PROC_IMPL_DATA = [
  { name: "Open Tender",  value: 38, color: C.blue2 },
  { name: "RFQ",          value: 24, color: C.blue3 },
  { name: "RFP",          value: 12, color: C.teal  },
  { name: "EOI",          value: 9,  color: C.violet },
  { name: "Auction",      value: 7,  color: C.amber  },
  { name: "Direct",       value: 10, color: C.emerald},
];

const BUDGET_COMPLIANCE_DONUT = [
  { name: "Compliant",     value: 71, color: C.emerald },
  { name: "Minor Issues",  value: 18, color: C.amber   },
  { name: "Non-Compliant", value: 11, color: C.blue2   },
];

const TENDER_STATUS_DONUT = [
  { name: "Bidding Open",   value: 412,  color: C.blue2   },
  { name: "Evaluation",     value: 187,  color: C.teal    },
  { name: "Award Pending",  value: 98,   color: C.violet  },
  { name: "Draft",          value: 341,  color: C.down    },
  { name: "Awarded",        value: 249,  color: C.emerald },
];

const MINISTRY_PIE = [
  { name: "Transport", value: 31.2, color: C.blue2   },
  { name: "Health",    value: 28.4, color: C.blue3   },
  { name: "Education", value: 22.8, color: C.teal    },
  { name: "Energy",    value: 18.6, color: C.violet  },
  { name: "Agri",      value: 15.4, color: C.amber   },
  { name: "Defence",   value: 12.1, color: C.blue4   },
  { name: "ICT",       value: 9.2,  color: C.emerald },
];

const RADAR_DATA = [
  { subject: "Compliance", A: 94, B: 80, fullMark: 100 },
  { subject: "Efficiency",  A: 72, B: 65, fullMark: 100 },
  { subject: "Savings",     A: 81, B: 70, fullMark: 100 },
  { subject: "Delivery",    A: 68, B: 72, fullMark: 100 },
  { subject: "Risk Mgmt",   A: 76, B: 68, fullMark: 100 },
  { subject: "Governance",  A: 88, B: 75, fullMark: 100 },
];

const PROJECTS_IN_COST = [
  { name: "Within Budget", value: 62,  color: C.emerald },
  { name: "Over 0-10%",    value: 21,  color: C.amber   },
  { name: "Over 10-25%",   value: 11,  color: C.blue2   },
  { name: "Over 25%+",     value: 6,   color: C.down    },
];

// Radial bars for % implementation
const RADIAL_DATA = [
  { name: "Tenders",  value: 74, fill: C.blue2   },
  { name: "RFQs",     value: 91, fill: C.teal    },
  { name: "Auctions", value: 55, fill: C.violet  },
  { name: "EOIs",     value: 67, fill: C.amber   },
];

// Right panel ministry rows
const RIGHT_ROWS = [
  { label: "Transport", value: 578, vol: 2.1 },
  { label: "Health",    value: 392, vol: 1.8 },
  { label: "Education", value: 291, vol: 1.2 },
  { label: "Energy",    value: 184, vol: 1.4 },
  { label: "Agri",      value: 312, vol: 2.3 },
  { label: "Water",     value: 218, vol: 1.9 },
  { label: "Defence",   value: 208, vol: 0.9 },
  { label: "ICT",       value: 98,  vol: 0.6 },
];

// Top ticker items
const TICKER_ITEMS = [
  { label: "Nat. Spend YTD", base: 2.84,   vol: 0.002, unit: "B",  dec: 3 },
  { label: "Compliance",      base: 94.2,   vol: 0.1,   unit: "%",  dec: 1 },
  { label: "Budget Util",     base: 67.8,   vol: 0.05,  unit: "%",  dec: 1 },
  { label: "Active Tenders",  base: 1287,   vol: 1,     unit: "",   dec: 0 },
  { label: "Savings YTD",     base: 184,    vol: 0.3,   unit: "M",  dec: 0 },
  { label: "Fraud Alerts",    base: 23,     vol: 0.2,   unit: "",   dec: 0 },
  { label: "Revenue YTD",     base: 18.2,   vol: 0.01,  unit: "B",  dec: 1 },
  { label: "Cash Burn Rate",  base: 88.4,   vol: 0.06,  unit: "%",  dec: 1 },
  { label: "Projects On Time",base: 62,     vol: 0.2,   unit: "%",  dec: 0 },
  { label: "Contracts Active",base: 964,    vol: 0.5,   unit: "",   dec: 0 },
];

// ── Animated value hook ───────────────────────────────────────────────────
function useAnimVal(base: number, vol: number, ms = 1200) {
  const [val, setVal] = useState(base);
  const [up, setUp]   = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      const d = rand(-vol, vol);
      setVal(v => { const n = +(v + d).toFixed(3); setUp(n >= v); return n; });
    }, ms + rand(0, 300));
    return () => clearInterval(t);
  }, [base, vol, ms]);
  return { val, up };
}

// ── Countdown Clock ───────────────────────────────────────────────────────
function CountdownClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // Market close countdown (assume 16:00 local)
  const now = time;
  const close = new Date(now);
  close.setHours(16, 0, 0, 0);
  if (close <= now) close.setDate(close.getDate() + 1);
  const diff = Math.max(0, close.getTime() - now.getTime());
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);
  const fmt2 = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ flexShrink: 0, padding: "0 12px", borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 0 }}>
      <span style={{ fontSize: 7, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>SESSION ENDS</span>
      <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: hh < 1 ? C.red : C.green, letterSpacing: "0.05em" }}>
        {fmt2(hh)}:{fmt2(mm)}:{fmt2(ss)}
      </span>
      <span style={{ fontSize: 7, color: C.text3 }}>{time.toLocaleTimeString("en-GB")}</span>
    </div>
  );
}

// ── Candlebar shape ───────────────────────────────────────────────────────
function CandleBar({ x=0, y=0, width=4, height=0, up=true }: { x?:number;y?:number;width?:number;height?:number;up?:boolean }) {
  return <rect x={x} y={y} width={Math.max(width,3)} height={Math.max(Math.abs(height),2)} fill={up ? C.green : C.red} rx={1}/>;
}

// ── Live area chart ───────────────────────────────────────────────────────
function LiveArea({ color, data: init, vol, h=70 }: { color:string; data:{t:number;v:number}[]; vol:number; h?:number }) {
  const [data, setData] = useState(init.slice(-30));
  const t = useRef(init.length);
  useEffect(() => {
    const id = setInterval(() => {
      setData(d => {
        const last = d[d.length-1]?.v ?? 0;
        return [...d.slice(-29), { t: t.current++, v: +(last + rand(-vol,vol)).toFixed(3) }];
      });
    }, 850 + rand(0,300));
    return () => clearInterval(id);
  }, [vol]);
  const gid = `ga${color.replace(/[^a-zA-Z0-9]/g,"")}`;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gid})`} dot={false} isAnimationActive={false}/>
        <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}} labelFormatter={()=>""} formatter={(v:number)=>[v.toFixed(2),""]}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Live bar chart ────────────────────────────────────────────────────────
function LiveBar({ color, data: init, vol, h=70 }: { color:string; data:{t:number;v:number}[]; vol:number; h?:number }) {
  const [data, setData] = useState(init.slice(-25));
  const t = useRef(init.length);
  useEffect(() => {
    const id = setInterval(() => {
      setData(d => {
        const last = d[d.length-1]?.v ?? 100;
        return [...d.slice(-24), { t: t.current++, v: Math.max(10, +(last+rand(-vol,vol)).toFixed(0)) }];
      });
    }, 700 + rand(0,200));
    return () => clearInterval(id);
  }, [vol]);
  const max = Math.max(...data.map(d=>d.v));
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} margin={{top:2,right:0,left:0,bottom:0}} barCategoryGap={1}>
        <Bar dataKey="v" radius={[1,1,0,0]} isAnimationActive={false}>
          {data.map((d,i)=><Cell key={i} fill={d.v===max ? C.blue4 : color}/>)}
        </Bar>
        <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}} labelFormatter={()=>""} formatter={(v:number)=>[v.toFixed(0),""]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Live candle chart ─────────────────────────────────────────────────────
function LiveCandle({ data: init, h=100 }: { data: ReturnType<typeof genCandles>; h?:number }) {
  const [data, setData] = useState(init.slice(-20));
  const pr = useRef(init[init.length-1]?.close ?? 1);
  const t  = useRef(init.length);
  useEffect(() => {
    const id = setInterval(() => {
      setData(d => {
        const v = rand(0.008,0.04);
        const o = pr.current, c = +(o+rand(-v,v)).toFixed(4);
        pr.current = c;
        return [...d.slice(-19), { t:t.current++, open:o, close:c, high:+(Math.max(o,c)+rand(0,v*0.4)).toFixed(4), low:+(Math.min(o,c)-rand(0,v*0.4)).toFixed(4), up:c>=o }];
      });
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
        <XAxis dataKey="t" hide/><YAxis domain={["auto","auto"]} hide width={0}/>
        <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}} labelFormatter={()=>""} formatter={(v:number,n)=>[v.toFixed(4),n]}/>
        <Bar dataKey="close" shape={(p:unknown)=>{ const pp=p as {x:number;y:number;width:number;height:number;up?:boolean}; return <CandleBar {...pp} up={!!pp.up}/>; }} isAnimationActive={false}>
          {data.map((d,i)=><Cell key={i} fill={d.up ? C.green : C.red}/>)}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Mini sparkline for right panel ────────────────────────────────────────
function MiniLine({ val, vol, color }: { val:number; vol:number; color:string }) {
  const [data, setData] = useState(() => genSeries(10, val, vol));
  useEffect(() => {
    const id = setInterval(() => setData(d=>[...d.slice(-9),{t:d.length,v:+(d[d.length-1].v+rand(-vol,vol)).toFixed(0)}]), 1500+rand(0,500));
    return ()=>clearInterval(id);
  }, [vol]);
  return (
    <div style={{width:52,height:20}}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><Line dataKey="v" stroke={color} strokeWidth={1} dot={false} isAnimationActive={false}/></LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Ticker cell ───────────────────────────────────────────────────────────
function TickerCell({ item }: { item: typeof TICKER_ITEMS[0] }) {
  const { val, up } = useAnimVal(item.base, item.vol, 1300);
  const color = up ? C.green : C.red;
  const triangle = up ? "▲" : "▼";
  return (
    <div className="flex flex-col items-center justify-center px-3 border-r h-full" style={{borderColor:C.border, minWidth:108}}>
      <div className="text-[9px] uppercase tracking-wider" style={{color:C.text3}}>{item.label}</div>
      <div className="text-[14px] font-black font-mono leading-tight" style={{color}}>
        {val.toFixed(item.dec)}{item.unit}
      </div>
      <div className="text-[9px] flex items-center gap-0.5 font-bold" style={{color}}>
        <span>{triangle}</span>{rand(0.01,0.15).toFixed(2)}%
      </div>
    </div>
  );
}

// ── Right panel row ───────────────────────────────────────────────────────
function MinistryRow({ row, rank }: { row:typeof RIGHT_ROWS[0]; rank:number }) {
  const { val, up } = useAnimVal(row.value, row.vol, 1600);
  const color = up ? C.green : C.red;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1" style={{borderBottom:`1px solid ${C.grid}`}}>
      <span className="text-[8px] w-3" style={{color: C.text3}}>{rank}</span>
      <span className="text-[10px] w-16 truncate" style={{color: C.text1}}>{row.label}</span>
      <MiniLine val={row.value} vol={row.vol} color={color}/>
      <span className="text-[9px] font-bold flex-shrink-0" style={{color}}>{up?"▲":"▼"}</span>
      <span className="text-[11px] font-bold font-mono ml-auto" style={{color}}>{val.toFixed(0)}</span>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────
const card = {
  background: C.bg1,
  border: `1px solid ${C.border}`,
  overflow: "hidden" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
};
const title = (label: string) => (
  <div style={{ fontSize: 8, fontWeight: 700, color: C.text2, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "6px 10px 2px" }}>
    {label}
  </div>
);

// ── Small donut label ─────────────────────────────────────────────────────
function SmallDonut({ data, label }: { data: {name:string;value:number;color:string}[]; label: string }) {
  const total = data.reduce((s,d)=>s+d.value,0);
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      {title(label)}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"2px 8px 6px"}}>
        <div style={{width:90,height:90,flexShrink:0}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} isAnimationActive={false}>
                {data.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}} formatter={(v:number,n)=>[`${((v/total)*100).toFixed(0)}%`,n]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          {data.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:d.color,flexShrink:0}}/>
              <span style={{fontSize:9,color: C.text2,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
              <span style={{fontSize:9,fontWeight:700,color:d.color,flexShrink:0}}>{((d.value/total)*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Radial gauge ─────────────────────────────────────────────────────────
function RadialGauge({ pct, label, color }: { pct:number; label:string; color:string }) {
  const data = [{ name: label, value: pct, fill: color }, { name: "rem", value: 100-pct, fill: "rgba(15,23,42,0.06)" }];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{width:68,height:68,position:"relative"}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="55%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" isAnimationActive={false}>{data.map((_,i)=><Cell key={i} fill={data[i].fill}/>)}</RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
          <span style={{fontSize:13,fontWeight:900,fontFamily:"monospace",color}}>{pct}%</span>
        </div>
      </div>
      <span style={{fontSize:8,color: C.text2,textAlign:"center",lineHeight:1.2,marginTop:3,fontWeight:600}}>{label}</span>
    </div>
  );
}

// ── Main BriefingDashboard export ─────────────────────────────────────────
export default function BriefingDashboard() {
  // Animated values
  const spend     = useAnimVal(2.84,  0.002, 600);
  const contracts = useAnimVal(0.719, 0.001, 700);
  const suppliers = useAnimVal(0.847, 0.001, 750);
  const bigBudget = useAnimVal(425,   1.5,   900);
  const bigSavings= useAnimVal(184,   0.8,  1100);
  const cashBurn  = useAnimVal(88.4,  0.05, 1000);
  const compliance= useAnimVal(94.2,  0.08, 1200);

  const t0 = useAnimVal(11.82, 0.04, 1000);
  const t1 = useAnimVal(21.68, 0.02, 1200);
  const t2 = useAnimVal(16.12, 0.02, 1400);
  const t3 = useAnimVal(27.61, 0.02, 1600);

  // The gap (0px) between tiles is handled by CSS gap on the grid — seamless look
  const GAP = 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg0, color:C.text1, overflow:"hidden", fontFamily:"'JetBrains Mono','Fira Code',monospace,sans-serif", userSelect:"none" }}>

      {/* ── TICKER BAR ─────────────────────────────────────────────────── */}
      <div style={{ flexShrink:0, background:C.bg1, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", height:42, overflow:"hidden" }}>
        {/* Brand */}
        <div style={{ flexShrink:0, padding:"0 12px", borderRight:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:6, height:"100%" }}>
          <Zap style={{width:12,height:12,color:C.green}}/>
          <span style={{fontSize:10,fontWeight:900,color:C.text1,letterSpacing:"0.1em"}}>Ai Powered e-Government Procurement & Automated Oversight Intelligence System</span>
          <span style={{fontSize:8,color:C.green,fontWeight:900}}>● LIVE</span>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
        </div>
        {/* Tickers */}
        <div style={{display:"flex",alignItems:"stretch",flex:1,height:"100%",overflowX:"hidden"}}>
          {TICKER_ITEMS.map((item,i)=><TickerCell key={i} item={item}/>)}
        </div>
        {/* Countdown clock */}
        <CountdownClock />
      </div>

      {/* ── MAIN GRID (5 columns, no gaps = seamless) ────────────────── */}
      <div style={{ flex:1, minHeight:0, display:"grid", gridTemplateColumns:"14% 22% 22% 22% 20%", gap:GAP }}>

        {/* ── COL 1 ─────────────────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`}}>

          {/* Spend Flow */}
          <div style={{...card,flex:2,borderBottom:`1px solid ${C.border}`}}>
            {title("National Spend Flow")}
            <div style={{padding:"0 10px",display:"flex",flexDirection:"column",flex:1}}>
              <div style={{fontSize:20,fontWeight:900,fontFamily:"monospace",color:spend.up?C.green:C.red}}>{spend.val.toFixed(3)}B</div>
              <div style={{fontSize:8,color: C.text2,marginBottom:4}}>USD Year-to-Date {spend.up?"▲":"▼"}</div>
              <div style={{flex:1}}><LiveArea color={spend.up?C.green:C.red} data={INIT_SPEND} vol={0.003} h={65}/></div>
            </div>
          </div>

          {/* ZSE Index — CNBC/Bloomberg S&P 500 style 2-day chart */}
          <div style={{...card, height: 160, flexShrink: 0, borderBottom:`1px solid ${C.border}`}}>
            <LiveZSEChart />
          </div>

          {/* Budget Pool */}
          <div style={{...card,flex:1,borderBottom:`1px solid ${C.border}`}}>
            {title("Budget Pool")}
            <div style={{padding:"0 10px"}}>
              <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:bigBudget.up?C.green:C.red}}>${bigBudget.val.toFixed(0)}M {bigBudget.up?"▲":"▼"}</div>
              <LiveArea color={bigBudget.up?C.green:C.red} data={INIT_BUDGET} vol={0.8} h={30}/>
            </div>
          </div>

          {/* Savings */}
          <div style={{...card,flex:1}}>
            {title("Savings YTD")}
            <div style={{padding:"0 10px"}}>
              <div style={{fontSize:16,fontWeight:900,fontFamily:"monospace",color:bigSavings.up?C.green:C.red}}>${bigSavings.val.toFixed(0)}M {bigSavings.up?"▲":"▼"}</div>
              <LiveArea color={bigSavings.up?C.green:C.red} data={INIT_NOISE} vol={1} h={28}/>
            </div>
          </div>
        </div>

        {/* ── COL 2 ─────────────────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`}}>

          {/* Mini KPI row — 3 tiles at top of col2 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            {[
              {label:"Suppliers",  av:suppliers, unit:"B"},
              {label:"Contracts",  av:contracts, unit:"B"},
              {label:"Tenders",    av:null,       unit:""},
            ].map((item,i)=>(
              <div key={i} style={{...card,padding:"4px 8px",borderRight:i<2?`1px solid ${C.border}`:"none",height:72}}>
                <div style={{fontSize:7,color: C.text3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{item.label}</div>
                {item.av ? (
                  <>
                    <div style={{fontSize:13,fontWeight:900,fontFamily:"monospace",color:item.av.up?C.green:C.red}}>
                      {item.av.val.toFixed(3)}{item.unit}
                    </div>
                    <div style={{fontSize:9,color:item.av.up?C.green:C.red,fontWeight:700}}>{item.av.up?"▲":"▼"} {(Math.random()*0.9+0.1).toFixed(2)}%</div>
                  </>
                ) : (
                  <div style={{fontSize:9}}>
                    {[t0,t1,t2,t3].map((t,ti)=>(
                      <div key={ti} style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color: C.text3,fontSize:7}}>T{ti}</span>
                        <span style={{color:t.up?C.green:C.red,fontFamily:"monospace",fontSize:8}}>{t.up?"▲":"▼"} {t.val.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Candle chart — Procurement Flow */}
          <div style={{...card,height:120,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Procurement Cycle — Tender Flow (Candle)")}
            <div style={{flex:1,padding:"0 4px 4px"}}><LiveCandle data={INIT_CANDLES} h={90}/></div>
          </div>

          {/* Cash Burn Rate chart */}
          <div style={{...card,height:130,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Cash Burn Rate — Budget vs Actual (USD M)")}
            <div style={{flex:1,padding:"0 4px 4px"}}>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={CASH_BURN_DATA} margin={{top:2,right:2,left:-20,bottom:0}} barSize={7}>
                  <XAxis dataKey="name" tick={{fontSize:7,fill: C.text2}} axisLine={false} tickLine={false}/>
                  <Bar dataKey="budget" fill={C.blue2} radius={[2,2,0,0]} isAnimationActive={false}/>
                  <Bar dataKey="actual" fill={C.green} radius={[2,2,0,0]} isAnimationActive={false}/>
                  <Bar dataKey="forecast" fill={C.amber} opacity={0.8} radius={[2,2,0,0]} isAnimationActive={false}/>
                  <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tender Status Donut */}
          <div style={{...card,flex:1}}>
            <SmallDonut data={TENDER_STATUS_DONUT} label="Tender Status Distribution"/>
          </div>
        </div>

        {/* ── COL 3 ─────────────────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`}}>

          {/* Spend tracker area */}
          <div style={{...card,height:90,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Spend Tracker — Rolling")}
            <div style={{padding:"0 6px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14,fontWeight:900,fontFamily:"monospace",color:C.blue3}}>USD {(1.70+Math.random()*0.05).toFixed(2)}B</span>
            </div>
            <div style={{flex:1,padding:"0 4px 2px"}}><LiveArea color={C.blue2} data={INIT_SPEND.slice(20)} vol={0.005} h={40}/></div>
          </div>

          {/* Risk Exposure bar */}
          <div style={{...card,height:110,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Risk Exposure — 60-day Rolling")}
            <div style={{flex:1,padding:"0 4px 4px"}}><LiveBar color={C.blue1} data={INIT_RISK} vol={15} h={82}/></div>
          </div>

          {/* Procurement Implementation % — Radial bars */}
          <div style={{...card,height:130,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("RFQ / Tender / Auction — % Implementation")}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",flex:1,padding:"4px 4px"}}>
              {RADIAL_DATA.map((d,i)=>(
                <RadialGauge key={i} pct={d.value} label={d.name} color={d.fill}/>
              ))}
            </div>
          </div>

          {/* Budget compliance donut */}
          <div style={{...card,flex:1}}>
            <SmallDonut data={BUDGET_COMPLIANCE_DONUT} label="Budget Compliance %"/>
          </div>

          {/* Budget absorption */}
          <div style={{...card,height:72,flexShrink:0}}>
            {title("Budget Absorption Trend")}
            <div style={{flex:1,padding:"0 4px 2px"}}><LiveArea color={C.amber} data={INIT_NOISE} vol={18} h={48}/></div>
          </div>
        </div>

        {/* ── COL 4 ─────────────────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`}}>

          {/* Radar — Procurement Performance Polygon */}
          <div style={{...card,height:155,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Procurement KPI Radar — Polygon")}
            <div style={{flex:1,padding:"0 2px 2px"}}>
              <ResponsiveContainer width="100%" height={125}>
                <RadarChart data={RADAR_DATA} margin={{top:4,right:8,bottom:4,left:8}}>
                  <PolarGrid stroke={C.border}/>
                  <PolarAngleAxis dataKey="subject" tick={{fill: C.text2,fontSize:7}}/>
                  <Radar name="Current" dataKey="A" stroke={C.blue3} fill={C.blue3} fillOpacity={0.2} dot/>
                  <Radar name="Target"  dataKey="B" stroke={C.teal}  fill={C.teal}  fillOpacity={0.1} strokeDasharray="3 3"/>
                  <Tooltip contentStyle={{background:C.bg0,border:`1px solid ${C.border}`,fontSize:9,color:C.text1,borderRadius:4}} formatter={(v:number)=>[`${v}%`,""]}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projects Within Cost % donut */}
          <div style={{...card,height:110,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            <SmallDonut data={PROJECTS_IN_COST} label="Projects Within Cost %"/>
          </div>

          {/* Cash burn rate gauge */}
          <div style={{...card,height:72,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            {title("Cash Burn Rate")}
            <div style={{display:"flex",alignItems:"center",padding:"0 10px",gap:12}}>
              <div style={{fontSize:22,fontWeight:900,fontFamily:"monospace",color:cashBurn.val>90?C.red:cashBurn.val>70?C.amber:C.green}}>{cashBurn.val.toFixed(1)}%</div>
              <div style={{flex:1}}><LiveArea color={cashBurn.val>90?C.red:C.amber} data={INIT_BUDGET} vol={0.5} h={38}/></div>
            </div>
          </div>

          {/* Procurement implementation pie */}
          <div style={{...card,flex:1}}>
            <SmallDonut data={PROC_IMPL_DATA} label="Procurement Type Mix — Implementation"/>
          </div>

          {/* NEW: Fraud Alerts tile — fills space */}
          <div style={{...card,height:68,flexShrink:0}}>
            {title("Fraud Alerts / Risk Triggers")}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 10px"}}>
              <span style={{fontSize:20,fontWeight:900,fontFamily:"monospace",color:C.red}}>23</span>
              <span style={{fontSize:8,color:C.red}}>▲ 3 today</span>
              <div style={{flex:1}}><LiveArea color={C.red} data={INIT_RISK.slice(-20)} vol={2} h={34}/></div>
            </div>
          </div>
        </div>

        {/* ── COL 5 — Ministry price list + ring donut ─────────────── */}
        <div style={{display:"flex",flexDirection:"column"}}>

          {/* Ministry spend table */}
          <div style={{...card,flex:2,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px 2px"}}>
              <span style={{fontSize:8,fontWeight:700,color:C.text2,textTransform:"uppercase",letterSpacing:"0.1em"}}>Ministry Spend (USD M)</span>
              <Activity style={{width:10,height:10,color:C.text3}}/>
            </div>
            <div style={{flex:1,overflow:"hidden"}}>
              {RIGHT_ROWS.map((r,i)=><MinistryRow key={i} row={r} rank={i+1}/>)}
            </div>
          </div>

          {/* Ministry Pie */}
          <div style={{...card,height:130,flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
            <SmallDonut data={MINISTRY_PIE} label="Ministry Spend Split"/>
          </div>

          {/* Compliance gauge + Tender count */}
          <div style={{...card,flex:1}}>
            {title("Compliance & Active Tenders")}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",padding:"6px 4px",flex:1}}>
              <RadialGauge pct={Math.round(compliance.val)} label="Compliance" color={C.emerald}/>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <span style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:C.blue3}}>1,287</span>
                <span style={{fontSize:7,color:C.text2,textAlign:"center"}}>Active Tenders</span>
              </div>
              <RadialGauge pct={67} label="Budget Util" color={C.amber}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM FIXED TILE BAR (seamless, no scroll) ──────────────── */}
      <div style={{ flexShrink:0, background:C.bg1, borderTop:`1px solid ${C.border}`, height:56, display:"flex", alignItems:"stretch" }}>
        {[
          {label:"Cash Burn",      color:C.red,     data:INIT_BUDGET,  val:cashBurn.val.toFixed(1)+"%",  dir:"▲"},
          {label:"Budget Util",    color:C.amber,   data:INIT_BUDGET,  val:"67.8%",   dir:"▲"},
          {label:"Compliance",     color:C.green,   data:INIT_NOISE,   val:"94.2%",   dir:"▲"},
          {label:"Tender Flow",    color:C.blue3,   data:INIT_TENDER,  val:"1,287",   dir:"▲"},
          {label:"Spend YTD",      color:C.teal,    data:INIT_SPEND,   val:"2.84B",   dir:"▲"},
          {label:"Risk Score",     color:C.red,     data:INIT_RISK,    val:"420",     dir:"▲"},
          {label:"Projects OK",    color:C.green,   data:INIT_NOISE,   val:"62%",     dir:"▲"},
          {label:"Savings YTD",    color:C.green,   data:INIT_NOISE,   val:"184M",    dir:"▲"},
        ].map((tile,i)=>(
          <div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:5,padding:"0 8px",borderRight:`1px solid ${C.border}`}}>
            <div style={{flexShrink:0}}>
              <div style={{fontSize:7,color:C.text3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{tile.label}</div>
              <div style={{fontSize:12,fontWeight:900,fontFamily:"monospace",color:tile.color}}>{tile.dir} {tile.val}</div>
            </div>
            <div style={{flex:1,height:30}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tile.data.slice(-12)} margin={{top:1,right:0,left:0,bottom:0}}>
                  <Area type="monotone" dataKey="v" stroke={tile.color} strokeWidth={1.5} fill={`${tile.color}25`} dot={false} isAnimationActive={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


