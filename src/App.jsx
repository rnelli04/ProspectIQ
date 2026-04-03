import { useState, useCallback, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// ── EMBEDDED MODEL ──────────────────────────────────────────────────
const FEATURES = ["Income","Recency","NumDealsPurchases","Customer_Tenure","Total_Spent","Total_Purchases","Total_Children","Previous_Campaign_Score","Education_Basic","Education_Graduation","Education_PhD","Marital_Status_Married","Marital_Status_Single","Marital_Status_Together","Marital_Status_Widow"];
const S_MEAN   = [51972.85,49.34,2.34,355.76,605.60,12.58,0.954,0.296,0.0257,0.508,0.213,0.390,0.218,0.253,0.0336];
const S_SCALE  = [21561.04,28.75,1.953,202.70,598.65,7.204,0.752,0.682,0.158,0.500,0.409,0.488,0.413,0.435,0.180];
const LR_COEF  = [-0.0109,-0.9082,0.2653,0.7975,0.4312,-0.4585,-0.3718,1.0699,-0.1680,0.0209,0.3564,-0.5959,0.0437,-0.5215,0.0304];
const LR_INT   = -2.6815;
const TREE     = {"leaf":false,"feature":"Previous_Campaign_Score","threshold":1.7647,"left":{"leaf":false,"feature":"Previous_Campaign_Score","threshold":0.2992,"left":{"leaf":false,"feature":"Customer_Tenure","threshold":1.2963,"left":{"leaf":false,"feature":"Recency","threshold":-1.5597,"left":{"leaf":false,"feature":"Customer_Tenure","threshold":0.2503,"left":{"leaf":false,"feature":"Marital_Status_Widow","threshold":2.5901,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Low"}},"right":{"leaf":false,"feature":"Marital_Status_Married","threshold":0.2259,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"Low"}}},"right":{"leaf":false,"feature":"Customer_Tenure","threshold":0.5266,"left":{"leaf":true,"class":"Low"},"right":{"leaf":false,"feature":"Education_PhD","threshold":0.7027,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Low"}}}},"right":{"leaf":false,"feature":"Recency","threshold":-1.1770,"left":{"leaf":false,"feature":"Education_PhD","threshold":0.7027,"left":{"leaf":false,"feature":"Marital_Status_Together","threshold":0.5688,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Low"}},"right":{"leaf":false,"feature":"Marital_Status_Single","threshold":0.6826,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"High"}}},"right":{"leaf":false,"feature":"NumDealsPurchases","threshold":5.9718,"left":{"leaf":false,"feature":"Marital_Status_Single","threshold":0.6826,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Low"}},"right":{"leaf":true,"class":"High"}}}},"right":{"leaf":false,"feature":"Customer_Tenure","threshold":0.5439,"left":{"leaf":false,"feature":"Marital_Status_Single","threshold":0.6826,"left":{"leaf":false,"feature":"Recency","threshold":-1.5945,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":false,"feature":"Total_Spent","threshold":1.8148,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Low"}}},"right":{"leaf":false,"feature":"Recency","threshold":-0.8118,"left":{"leaf":false,"feature":"Total_Spent","threshold":-0.5673,"left":{"leaf":true,"class":"High"},"right":{"leaf":true,"class":"Medium"}},"right":{"leaf":false,"feature":"Customer_Tenure","threshold":0.2503,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Medium"}}}},"right":{"leaf":false,"feature":"Recency","threshold":0.2144,"left":{"leaf":false,"feature":"Recency","threshold":-1.5771,"left":{"leaf":true,"class":"High"},"right":{"leaf":false,"feature":"Education_Basic","threshold":2.9957,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"Low"}}},"right":{"leaf":false,"feature":"Recency","threshold":1.6754,"left":{"leaf":false,"feature":"Marital_Status_Single","threshold":0.6826,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Medium"}},"right":{"leaf":true,"class":"Medium"}}}}},"right":{"leaf":false,"feature":"Previous_Campaign_Score","threshold":3.2302,"left":{"leaf":false,"feature":"Recency","threshold":0.6492,"left":{"leaf":false,"feature":"Customer_Tenure","threshold":-0.1764,"left":{"leaf":false,"feature":"Recency","threshold":-1.2640,"left":{"leaf":false,"feature":"Marital_Status_Married","threshold":0.2259,"left":{"leaf":true,"class":"High"},"right":{"leaf":true,"class":"Medium"}},"right":{"leaf":false,"feature":"Total_Spent","threshold":1.5926,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Medium"}}},"right":{"leaf":false,"feature":"Total_Children","threshold":-0.6042,"left":{"leaf":false,"feature":"NumDealsPurchases","threshold":-0.9414,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"High"}},"right":{"leaf":false,"feature":"Total_Spent","threshold":0.0341,"left":{"leaf":true,"class":"High"},"right":{"leaf":true,"class":"Medium"}}}},"right":{"leaf":false,"feature":"Customer_Tenure","threshold":0.9040,"left":{"leaf":false,"feature":"Total_Purchases","threshold":0.0584,"left":{"leaf":false,"feature":"Recency","threshold":0.7710,"left":{"leaf":true,"class":"Low"},"right":{"leaf":true,"class":"Medium"}},"right":{"leaf":true,"class":"Low"}},"right":{"leaf":false,"feature":"Marital_Status_Widow","threshold":2.5901,"left":{"leaf":false,"feature":"Recency","threshold":1.6580,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"Low"}},"right":{"leaf":true,"class":"High"}}}},"right":{"leaf":false,"feature":"Recency","threshold":1.3276,"left":{"leaf":false,"feature":"Customer_Tenure","threshold":-1.3580,"left":{"leaf":false,"feature":"Previous_Campaign_Score","threshold":4.6958,"left":{"leaf":true,"class":"Medium"},"right":{"leaf":true,"class":"High"}},"right":{"leaf":true,"class":"High"}},"right":{"leaf":false,"feature":"Customer_Tenure","threshold":-0.3910,"left":{"leaf":true,"class":"Low"},"right":{"leaf":false,"feature":"Marital_Status_Together","threshold":0.5688,"left":{"leaf":true,"class":"High"},"right":{"leaf":true,"class":"Medium"}}}}}};

const scale = (v, i) => (v - S_MEAN[i]) / S_SCALE[i];
const sigmoid = x => 1 / (1 + Math.exp(-x));
const predict = scaled => sigmoid(LR_INT + scaled.reduce((s, v, i) => s + LR_COEF[i] * v, 0));
const treePredict = (node, fm) => node.leaf ? node.class : fm[node.feature] <= node.threshold ? treePredict(node.left, fm) : treePredict(node.right, fm);

const EDU_MAP = { Basic:[1,0,0], Graduation:[0,1,0], PhD:[0,0,1], Master:[0,0,0], "2n Cycle":[0,0,0] };
const MAR_MAP = { Married:[1,0,0,0], Single:[0,1,0,0], Together:[0,0,1,0], Widow:[0,0,0,1], Divorced:[0,0,0,0], YOLO:[0,1,0,0], Absurd:[0,1,0,0], Alone:[0,1,0,0] };

function infer(row) {
  const g = (k, d = 0) => parseFloat(row[k]) || d;
  const [eb,eg,ep] = EDU_MAP[row.Education] || [0,1,0];
  const [mm,ms,mt,mw] = MAR_MAP[row.Marital_Status] || [0,0,0,0];
  const tenure = row.Dt_Customer ? Math.max(0,Math.round((new Date("2016-01-01")-new Date(row.Dt_Customer))/86400000)) : 355;
  const totalSpent = g("MntWines")+g("MntFruits")+g("MntMeatProducts")+g("MntFishProducts")+g("MntSweetProducts")+g("MntGoldProds");
  const totalPurchases = g("NumWebPurchases")+g("NumCatalogPurchases")+g("NumStorePurchases");
  const totalChildren = g("Kidhome")+g("Teenhome");
  const prevScore = g("AcceptedCmp1")+g("AcceptedCmp2")+g("AcceptedCmp3")+g("AcceptedCmp4")+g("AcceptedCmp5");
  const raw = [g("Income",51972),g("Recency",49),g("NumDealsPurchases",2),tenure,totalSpent,totalPurchases,totalChildren,prevScore,eb,eg,ep,mm,ms,mt,mw];
  const scaled = raw.map((v,i) => scale(v,i));
  const prob = predict(scaled);
  const fm = Object.fromEntries(FEATURES.map((f,i) => [f,scaled[i]]));
  const priority = treePredict(TREE, fm);
  const leadScore = (totalPurchases*2)+(prevScore*10)+g("NumWebVisitsMonth")-(g("Recency")/2);
  return { prob:+(prob*100).toFixed(1), priority, leadScore:+leadScore.toFixed(1), totalSpent, totalPurchases, prevScore, recency:g("Recency"), income:g("Income",51972) };
}

function parseCSV(text) {
  const sep = text.includes(";") ? ";" : ",";
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(sep).map(h => h.replace(/^\uFEFF/,"").trim());
  return lines.slice(1).filter(l=>l.trim()).map(line => {
    const v = line.split(sep);
    return Object.fromEntries(headers.map((h,i)=>[h,v[i]?.trim()??""]));
  });
}

function processAll(rows) {
  return rows.map((row,i) => {
    const r = infer(row);
    const timeline = r.priority==="High"?"Within 24 hrs":r.priority==="Medium"?"Within 3 days":"Nurture (30 days)";
    return {...row, ID:row.ID||`L-${String(i+1).padStart(4,"0")}`, ...r, timeline};
  }).sort((a,b)=>b.prob-a.prob).map((r,i)=>({...r,_rank:i+1}));
}

// ── STYLES ─────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f9fafb;--card:#fff;--border:#e5e7eb;--text:#111827;--muted:#6b7280;--subtle:#f3f4f6;
  --accent:#4f46e5;--accent-lt:#eef2ff;
  --high:#ef4444;--high-bg:#fef2f2;--med:#f59e0b;--med-bg:#fffbeb;--low:#10b981;--low-bg:#f0fdf4;
  --font:'Inter',sans-serif;--mono:'JetBrains Mono',monospace;
}
body{font-family:var(--font);background:var(--bg);color:var(--text)}
.app{min-height:100vh}

/* topbar */
.topbar{background:#fff;border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:32px;height:32px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px}
.brand-name{font-size:17px;font-weight:700;letter-spacing:-0.3px;line-height:1.1}
.brand-sub{font-size:11px;color:var(--muted);font-family:var(--mono)}
.status-pill{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-family:var(--mono);background:var(--subtle);padding:5px 12px;border-radius:20px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--low)}

/* global search */
.global-search-wrap{position:relative;flex:1;max-width:320px}
.global-search{width:100%;background:var(--subtle);border:1px solid var(--border);border-radius:8px;padding:8px 12px 8px 32px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;transition:all .15s}
.global-search:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px #eef2ff}
.global-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}
.global-results{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:100;max-height:280px;overflow-y:auto}
.global-result-item{padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f3f4f6;transition:background .1s}
.global-result-item:last-child{border-bottom:none}
.global-result-item:hover{background:var(--accent-lt)}
.global-result-id{font-family:var(--mono);font-size:12px;font-weight:500}
.global-result-meta{font-size:11px;color:var(--muted)}
.global-no-results{padding:14px;text-align:center;font-size:12px;color:var(--muted);font-family:var(--mono)}

/* body */
.body{padding:24px 28px;max-width:1200px;margin:0 auto}

/* tabs */
.tabs{display:flex;gap:0;margin-bottom:24px;border-bottom:2px solid var(--border)}
.tab-btn{padding:10px 20px;border:none;background:none;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:500;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s}
.tab-btn.on{color:var(--accent);border-bottom-color:var(--accent)}
.tab-btn:hover:not(.on){color:var(--text)}

/* card */
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px}
.card+.card{margin-top:16px}
.card-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:18px}

/* upload */
.drop{border:2px dashed var(--border);border-radius:10px;padding:52px 32px;text-align:center;cursor:pointer;transition:all .2s}
.drop:hover,.drop.over{border-color:var(--accent);background:var(--accent-lt)}
.drop-icon{font-size:36px;margin-bottom:10px}
.drop-title{font-size:15px;font-weight:600;margin-bottom:6px}
.drop-sub{font-size:12px;color:var(--muted)}

/* metrics */
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.metric{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:18px;border-top:3px solid var(--m-color)}
.metric-label{font-size:11px;color:var(--muted);font-family:var(--mono);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px}
.metric-val{font-size:30px;font-weight:700;line-height:1;color:var(--m-color)}
.metric-sub{font-size:11px;color:var(--muted);margin-top:5px}

/* charts */
.charts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}

/* table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);font-size:10px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.8px;color:var(--muted);white-space:nowrap;font-weight:500}
td{padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafafa}

/* badges */
.badge{padding:3px 9px;border-radius:20px;font-size:11px;font-family:var(--mono);font-weight:500}
.b-High{background:var(--high-bg);color:var(--high)}
.b-Medium{background:var(--med-bg);color:var(--med)}
.b-Low{background:var(--low-bg);color:var(--low)}

/* prob bar */
.pbar{background:#f3f4f6;border-radius:3px;height:4px;margin-top:4px}
.pfill{height:100%;border-radius:3px;transition:width .5s}

/* buttons */
.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:500;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:#4338ca}
.btn-outline{background:#fff;color:var(--text);border:1px solid var(--border)}
.btn-outline:hover{background:#f9fafb}
.btn-sm{padding:5px 12px;font-size:12px}
.btn-ghost{background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:4px 8px;border-radius:6px}
.btn-ghost:hover{background:var(--subtle);color:var(--text)}

/* form */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fg{display:flex;flex-direction:column;gap:5px}
.flabel{font-size:11px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}
.finput{background:#fff;border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;transition:border-color .15s}
.finput:focus{border-color:var(--accent)}
select.finput option{background:#fff}

/* result */
.result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}
.result-box{background:var(--subtle);border-radius:10px;padding:16px}
.rlabel{font-size:11px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:6px}
.rval{font-size:22px;font-weight:700}

/* filter */
.filter-row{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.chip{padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:#fff;color:var(--muted);font-size:12px;cursor:pointer;font-family:var(--mono);transition:all .15s}
.chip.on{background:var(--accent-lt);border-color:var(--accent);color:var(--accent)}
.search{background:#fff;border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;width:200px}
.search:focus{border-color:var(--accent)}

/* pager */
.pager{display:flex;align-items:center;gap:6px;margin-top:14px;justify-content:flex-end}
.pbtn{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:#fff;color:var(--muted);font-size:12px;cursor:pointer}
.pbtn.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.pbtn:disabled{opacity:.35;cursor:not-allowed}

/* empty */
.empty{text-align:center;padding:48px;color:var(--muted)}
.empty-icon{font-size:32px;margin-bottom:8px;opacity:.4}
.empty-text{font-size:13px;margin-bottom:16px}

/* spinner */
.spin-wrap{display:flex;align-items:center;justify-content:center;padding:40px;gap:10px;color:var(--muted);font-size:13px}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* model pills */
.model-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}
.model-pill{background:var(--subtle);border-radius:10px;padding:14px}
.model-pill-title{font-weight:600;font-size:13px;margin-bottom:3px}
.model-pill-sub{font-size:11px;color:var(--muted)}

/* log */
.log{background:var(--subtle);border-radius:8px;padding:14px;font-size:13px;line-height:1.6;color:#374151;margin-top:14px}

/* ── SIMULATOR STYLES ── */
.sim-layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sim-search-wrap{position:relative;margin-bottom:14px}
.sim-search{width:100%;background:#fff;border:1px solid var(--border);border-radius:8px;padding:9px 12px 9px 34px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;transition:border-color .15s}
.sim-search:focus{border-color:var(--accent)}
.sim-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}
.sim-dropdown{position:absolute;top:calc(100%+4px);left:0;right:0;background:#fff;border:1px solid var(--border);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.08);z-index:50;max-height:200px;overflow-y:auto}
.sim-option{padding:9px 13px;cursor:pointer;font-size:12px;font-family:var(--mono);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f3f4f6}
.sim-option:last-child{border-bottom:none}
.sim-option:hover{background:var(--accent-lt)}
.sim-option-id{font-weight:500}
.sim-option-meta{color:var(--muted);font-size:11px}

.sim-selected-lead{background:var(--accent-lt);border:1px solid #c7d2fe;border-radius:10px;padding:14px;margin-bottom:14px;display:flex;align-items:center;gap:12px}
.sim-lead-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;font-weight:700;font-family:var(--mono);flex-shrink:0}
.sim-lead-id{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--accent)}
.sim-lead-sub{font-size:11px;color:#6366f1}

.slider-group{margin-bottom:16px}
.slider-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.slider-label{font-size:11px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}
.slider-value{font-size:12px;font-family:var(--mono);font-weight:600;color:var(--text)}
input[type=range]{width:100%;accent-color:var(--accent);cursor:pointer}

.score-compare{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.score-box{border-radius:10px;padding:14px;text-align:center}
.score-box.original{background:var(--subtle);border:1px solid var(--border)}
.score-box.modified{background:var(--accent-lt);border:1px solid #c7d2fe}
.score-box-label{font-size:10px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:4px}
.score-box-val{font-size:28px;font-weight:700;line-height:1}
.score-box-sub{font-size:11px;color:var(--muted);margin-top:3px}

.delta-row{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--subtle);border-radius:8px;padding:10px;margin-bottom:16px}
.delta-arrow{font-size:20px}
.delta-text{font-size:13px;font-weight:600;font-family:var(--mono)}
.delta-pos{color:#10b981}
.delta-neg{color:#ef4444}
.delta-neu{color:var(--muted)}

.upgrade-path{margin-top:16px}
.upgrade-path-title{font-size:12px;font-weight:600;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.upgrade-tip{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:8px;border-left:3px solid var(--accent);background:var(--accent-lt);margin-bottom:8px;font-size:12px;line-height:1.5;color:#374151}
.upgrade-tip-icon{font-size:14px;flex-shrink:0;margin-top:1px}

.radar-wrap{margin-top:16px}
.radar-note{font-size:11px;color:var(--muted);text-align:center;margin-top:6px}

.sim-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:var(--muted);text-align:center;gap:12px}
.sim-placeholder-icon{font-size:40px;opacity:.3}
.sim-placeholder-text{font-size:13px}

.priority-change{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-family:var(--mono);font-weight:600}
.prio-upgrade{color:#10b981}
.prio-downgrade{color:#ef4444}
.prio-same{color:var(--muted)}
`;

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontFamily:"JetBrains Mono,monospace",fontSize:11}}>
      {label && <div style={{marginBottom:4,color:"#6b7280"}}>{label}</div>}
      {payload.map((p,i)=><div key={i} style={{color:p.color||"#111"}}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const PC = { High:"#ef4444", Medium:"#f59e0b", Low:"#10b981" };
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };
const PER_PAGE = 15;

// ── WHAT-IF SIMULATOR ──────────────────────────────────────────────
function WhatIfSimulator({ leads }) {
  const [simSearch, setSimSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [sliders, setSliders] = useState({});

  const filteredLeads = useMemo(() => {
    if (!simSearch.trim()) return leads.slice(0, 20);
    return leads.filter(l =>
      String(l.ID).toLowerCase().includes(simSearch.toLowerCase())
    ).slice(0, 15);
  }, [leads, simSearch]);

  const SLIDER_CONFIG = [
    { key: "Income", label: "Annual Income ($)", min: 10000, max: 150000, step: 1000, format: v => `$${Number(v).toLocaleString()}` },
    { key: "Recency", label: "Days Since Last Purchase", min: 0, max: 90, step: 1, format: v => `${v}d` },
    { key: "MntWines", label: "Wine Spend ($)", min: 0, max: 1500, step: 10, format: v => `$${v}` },
    { key: "MntMeatProducts", label: "Meat Spend ($)", min: 0, max: 1500, step: 10, format: v => `$${v}` },
    { key: "NumWebPurchases", label: "Web Purchases", min: 0, max: 20, step: 1, format: v => v },
    { key: "NumStorePurchases", label: "Store Purchases", min: 0, max: 20, step: 1, format: v => v },
    { key: "NumDealsPurchases", label: "Deal Purchases", min: 0, max: 15, step: 1, format: v => v },
    { key: "NumWebVisitsMonth", label: "Web Visits / Month", min: 0, max: 20, step: 1, format: v => v },
  ];

  const selectLead = (lead) => {
    setSelectedLead(lead);
    const initial = {};
    SLIDER_CONFIG.forEach(({ key }) => {
      initial[key] = parseFloat(lead[key]) || 0;
    });
    setSliders(initial);
    setSimSearch(String(lead.ID));
    setShowDrop(false);
  };

  const modifiedResult = useMemo(() => {
    if (!selectedLead) return null;
    const merged = { ...selectedLead, ...sliders };
    return infer(merged);
  }, [selectedLead, sliders]);

  const delta = modifiedResult && selectedLead
    ? +(modifiedResult.prob - selectedLead.prob).toFixed(1)
    : 0;

  const priorityChange = modifiedResult && selectedLead
    ? PRIORITY_ORDER[modifiedResult.priority] - PRIORITY_ORDER[selectedLead.priority]
    : 0;

  // Radar chart data — normalized 0–100 relative scoring
  const radarData = useMemo(() => {
    if (!selectedLead || !modifiedResult) return [];
    const g = (row, k) => parseFloat(row[k]) || 0;
    return [
      { subject: "Income", original: Math.min(100, (g(selectedLead,"Income")/1500)), modified: Math.min(100, (sliders.Income||0)/1500) },
      { subject: "Engagement", original: Math.min(100, (90-g(selectedLead,"Recency"))*1.1), modified: Math.min(100, (90-(sliders.Recency||0))*1.1) },
      { subject: "Spending", original: Math.min(100, selectedLead.totalSpent/20), modified: Math.min(100, modifiedResult.totalSpent/20) },
      { subject: "Purchases", original: Math.min(100, selectedLead.totalPurchases*5), modified: Math.min(100, modifiedResult.totalPurchases*5) },
      { subject: "Campaigns", original: Math.min(100, selectedLead.prevScore*20), modified: Math.min(100, modifiedResult.prevScore*20) },
      { subject: "Web Activity", original: Math.min(100, g(selectedLead,"NumWebVisitsMonth")*5), modified: Math.min(100, (sliders.NumWebVisitsMonth||0)*5) },
    ];
  }, [selectedLead, sliders, modifiedResult]);

  // Upgrade path tips
  const upgradeTips = useMemo(() => {
    if (!selectedLead || !modifiedResult) return [];
    const tips = [];
    const recency = sliders.Recency ?? parseFloat(selectedLead.Recency) ?? 49;
    if (recency > 20) tips.push({ icon: "📅", text: `Re-engage within next ${Math.round(recency/2)} days. Cutting recency to ~${Math.max(5,Math.round(recency*0.4))} days would meaningfully boost their score.` });
    const totalSpent = modifiedResult.totalSpent;
    if (totalSpent < 300) tips.push({ icon: "💳", text: "Lifetime spend is low. A targeted campaign (e.g. a wine/meat bundle) could increase spend and conversion probability significantly." });
    if (modifiedResult.prevScore === 0) tips.push({ icon: "📧", text: "This lead has never accepted a campaign. Start with a low-commitment offer — free trial or discount — to break the ice." });
    const webVisits = sliders.NumWebVisitsMonth ?? parseFloat(selectedLead.NumWebVisitsMonth) ?? 0;
    if (webVisits < 4) tips.push({ icon: "🌐", text: "Low web engagement. Retargeting ads or a personalized email with a deep link to their top product category could raise interest." });
    if (tips.length === 0) tips.push({ icon: "✅", text: "This lead is already performing well across key dimensions. Prioritize with your highest-tier outreach." });
    return tips.slice(0, 3);
  }, [selectedLead, sliders, modifiedResult]);

  if (leads.length === 0) {
    return (
      <div className="card">
        <div className="sim-placeholder">
          <div className="sim-placeholder-icon">🔬</div>
          <div className="sim-placeholder-text">Upload a CSV dataset first, then select any lead to simulate how changing their attributes would affect their ML score.</div>
          <button className="btn btn-primary" onClick={() => {}}>📂 Go to Upload</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 4 }}>🔬 What-If Lead Simulator</div>
            <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 540 }}>
              Select any lead from your dataset, then adjust their attributes with live sliders. See instantly how changes to income, recency, or spending behaviour would shift their ML-predicted conversion probability and priority tier — before you make your next call.
            </div>
          </div>
          <span style={{ background: "#f0fdf4", color: "#10b981", fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0", whiteSpace: "nowrap" }}>✦ Unique Feature</span>
        </div>

        {/* Lead Picker */}
        <div className="sim-search-wrap">
          <span className="sim-search-icon">🔍</span>
          <input
            className="sim-search"
            placeholder="Search lead by ID…"
            value={simSearch}
            onChange={e => { setSimSearch(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 200)}
          />
          {showDrop && filteredLeads.length > 0 && (
            <div className="sim-dropdown">
              {filteredLeads.map((l, i) => (
                <div key={i} className="sim-option" onMouseDown={() => selectLead(l)}>
                  <span className="sim-option-id">{l.ID}</span>
                  <span className="sim-option-meta">
                    <span className={`badge b-${l.priority}`} style={{ marginRight: 6 }}>{l.priority}</span>
                    {l.prob}% · ${Number(l.income||0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="sim-selected-lead">
            <div className="sim-lead-avatar">{String(selectedLead.ID).slice(-2)}</div>
            <div>
              <div className="sim-lead-id">Lead {selectedLead.ID}</div>
              <div className="sim-lead-sub">
                Rank #{selectedLead._rank} · {selectedLead.Education} · {selectedLead.Marital_Status} · ${Number(selectedLead.income||0).toLocaleString()} income
              </div>
            </div>
            <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { setSelectedLead(null); setSimSearch(""); }}>✕ Clear</button>
          </div>
        )}
      </div>

      {selectedLead && modifiedResult ? (
        <div className="sim-layout">
          {/* LEFT: Sliders */}
          <div className="card">
            <div className="card-title">Adjust Attributes</div>
            {SLIDER_CONFIG.map(({ key, label, min, max, step, format }) => (
              <div className="slider-group" key={key}>
                <div className="slider-header">
                  <span className="slider-label">{label}</span>
                  <span className="slider-value">{format(sliders[key] ?? min)}</span>
                </div>
                <input
                  type="range" min={min} max={max} step={step}
                  value={sliders[key] ?? min}
                  onChange={e => setSliders(s => ({ ...s, [key]: parseFloat(e.target.value) }))}
                />
              </div>
            ))}
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 6, width: "100%" }}
              onClick={() => selectLead(selectedLead)}
            >
              ↺ Reset to Original
            </button>
          </div>

          {/* RIGHT: Live Results */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Live Score Comparison</div>
              <div className="score-compare">
                <div className="score-box original">
                  <div className="score-box-label">Original</div>
                  <div className="score-box-val" style={{ color: PC[selectedLead.priority] }}>{selectedLead.prob}%</div>
                  <div className="score-box-sub"><span className={`badge b-${selectedLead.priority}`}>{selectedLead.priority}</span></div>
                </div>
                <div className="score-box modified">
                  <div className="score-box-label">Simulated</div>
                  <div className="score-box-val" style={{ color: PC[modifiedResult.priority] }}>{modifiedResult.prob}%</div>
                  <div className="score-box-sub"><span className={`badge b-${modifiedResult.priority}`}>{modifiedResult.priority}</span></div>
                </div>
              </div>

              <div className="delta-row">
                <span className="delta-arrow">{delta > 0 ? "📈" : delta < 0 ? "📉" : "➡️"}</span>
                <span className={`delta-text ${delta > 0 ? "delta-pos" : delta < 0 ? "delta-neg" : "delta-neu"}`}>
                  {delta > 0 ? "+" : ""}{delta}% probability shift
                </span>
                {priorityChange !== 0 && (
                  <span className={`priority-change ${priorityChange > 0 ? "prio-upgrade" : "prio-downgrade"}`}>
                    {priorityChange > 0 ? "⬆ Tier Upgrade!" : "⬇ Tier Downgrade"}
                  </span>
                )}
              </div>

              {/* Radar Chart */}
              <div className="radar-wrap">
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Profile Radar</div>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontFamily: "JetBrains Mono,monospace", fill: "#6b7280" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Original" dataKey="original" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.15} strokeWidth={1.5} />
                    <Radar name="Simulated" dataKey="modified" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} strokeWidth={2} />
                    <Legend formatter={v => <span style={{ fontSize: 10, fontFamily: "JetBrains Mono,monospace", color: "#6b7280" }}>{v}</span>} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="radar-note">Radar shows how simulated changes reshape this lead's profile vs. original</div>
              </div>
            </div>

            {/* Upgrade Path */}
            <div className="card">
              <div className="upgrade-path-title">🗺️ AI Upgrade Path Suggestions</div>
              {upgradeTips.map((tip, i) => (
                <div className="upgrade-tip" key={i}>
                  <span className="upgrade-tip-icon">{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="sim-placeholder">
            <div className="sim-placeholder-icon">👆</div>
            <div className="sim-placeholder-text">Search for a lead above to start simulating</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GLOBAL SEARCH ──────────────────────────────────────────────────
function GlobalSearch({ leads, onNavigate }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!q.trim() || q.length < 1) return [];
    return leads.filter(l =>
      String(l.ID).toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
  }, [q, leads]);

  return (
    <div className="global-search-wrap">
      <span className="global-search-icon">🔍</span>
      <input
        className="global-search"
        placeholder={leads.length ? `Search ${leads.length} leads by ID…` : "Search leads…"}
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && q.length > 0 && (
        <div className="global-results">
          {results.length === 0 ? (
            <div className="global-no-results">No leads found for "{q}"</div>
          ) : results.map((l, i) => (
            <div key={i} className="global-result-item" onMouseDown={() => { onNavigate(l); setQ(""); setOpen(false); }}>
              <span className={`badge b-${l.priority}`}>{l.priority}</span>
              <div style={{ flex: 1 }}>
                <div className="global-result-id">{l.ID}</div>
                <div className="global-result-meta">{l.prob}% conv. · ${Number(l.income||0).toLocaleString()} · {l.recency}d ago</div>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>#{l._rank}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState("upload");
  const [leads, setLeads]   = useState([]);
  const [busy, setBusy]     = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage]     = useState(1);
  const [dragOn, setDragOn] = useState(false);
  const [simTarget, setSimTarget] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    Income:65000,Recency:15,Education:"Graduation",Marital_Status:"Single",
    MntWines:600,MntFruits:0,MntMeatProducts:300,MntFishProducts:0,MntSweetProducts:0,MntGoldProds:100,
    NumWebPurchases:6,NumCatalogPurchases:4,NumStorePurchases:5,
    Kidhome:0,Teenhome:0,NumWebVisitsMonth:8,
    AcceptedCmp1:1,AcceptedCmp2:0,AcceptedCmp3:0,AcceptedCmp4:0,AcceptedCmp5:0,
    NumDealsPurchases:2,Dt_Customer:"2013-06-15",
  });
  const [result, setResult] = useState(null);

  const loadFile = useCallback((file) => {
    if (!file) return;
    setBusy(true);
    const r = new FileReader();
    r.onload = e => {
      try {
        setLeads(processAll(parseCSV(e.target.result)));
        setPage(1); setTab("dashboard");
      } catch(err){ alert("Parse error: "+err.message); }
      setBusy(false);
    };
    r.readAsText(file);
  }, []);

  const handleDrop = e => { e.preventDefault(); setDragOn(false); loadFile(e.dataTransfer.files[0]); };

  const navigateToLead = (lead) => {
    setSimTarget(lead);
    setTab("simulator");
  };

  const filtered = leads.filter(l => {
    if (filter !== "All" && l.priority !== filter) return false;
    if (search) return String(l.ID).toLowerCase().includes(search.toLowerCase());
    return true;
  });
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length/PER_PAGE);

  const hi  = leads.filter(l=>l.priority==="High").length;
  const md  = leads.filter(l=>l.priority==="Medium").length;
  const lo  = leads.filter(l=>l.priority==="Low").length;
  const avgP = leads.length ? (leads.reduce((s,l)=>s+l.prob,0)/leads.length).toFixed(1) : 0;

  const pieData = [{name:"High",value:hi,color:"#ef4444"},{name:"Medium",value:md,color:"#f59e0b"},{name:"Low",value:lo,color:"#10b981"}].filter(d=>d.value>0);
  const probBuckets = Array.from({length:5},(_,i)=>({label:`${i*20}–${i*20+20}%`,count:leads.filter(l=>l.prob>=i*20&&l.prob<i*20+20).length}));

  const exportCSV = () => {
    const cols=["ID","priority","timeline","prob","leadScore","income","recency","totalSpent","totalPurchases","prevScore","Education","Marital_Status"];
    const blob = new Blob([cols.join(",")+"\n"+leads.map(l=>cols.map(c=>`"${l[c]??""}`).join(",")).join("\n")],{type:"text/csv"});
    Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:"scored_leads.csv"}).click();
  };

  const EmptyState = ({icon,text}) => (
    <div className="card"><div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{text}</div>
      <button className="btn btn-primary" onClick={()=>setTab("upload")}>📂 Upload CSV</button>
    </div></div>
  );

  return (
    <div className="app">
      <style>{css}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          {/* SVG Logo Mark */}
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="10" fill="#4f46e5"/>
            {/* Outer ring */}
            <circle cx="19" cy="19" r="11" stroke="white" strokeWidth="1.5" strokeOpacity="0.35"/>
            {/* Middle ring */}
            <circle cx="19" cy="19" r="7" stroke="white" strokeWidth="1.5" strokeOpacity="0.6"/>
            {/* Center dot */}
            <circle cx="19" cy="19" r="3" fill="white"/>
            {/* Upward arrow / signal bar */}
            <path d="M19 8 L22 13 L19 11.5 L16 13 Z" fill="white" fillOpacity="0.9"/>
            {/* Spark lines */}
            <line x1="8" y1="19" x2="10.5" y2="19" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round"/>
            <line x1="27.5" y1="19" x2="30" y2="19" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="brand-name">
              <span style={{color:"#4f46e5", fontWeight:800, letterSpacing:"-0.3px"}}>Prospect</span>
              <span style={{color:"#111827", fontWeight:700, letterSpacing:"-0.3px"}}>IQ</span>
            </div>

          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <GlobalSearch leads={leads} onNavigate={navigateToLead} />

        <div className="status-pill">
          <div className="dot" />
          {leads.length > 0 ? `${leads.length} leads scored` : "Ready — upload CSV to start"}
        </div>
      </div>

      <div className="body">
        {/* TABS */}
        <div className="tabs">
          {[
            ["upload","📂 Upload"],
            ["manual","✍️ Manual"],
            ["dashboard","📊 Dashboard"],
            ["pipeline","📋 Pipeline"],
            ["simulator","🔬 Simulator"],
          ].map(([id,lbl])=>(
            <button key={id} className={`tab-btn ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>

        {/* ── UPLOAD ── */}
        {tab==="upload" && (
          <div className="card">
            <div className="card-title">Upload Lead Dataset</div>
            {busy ? (
              <div className="spin-wrap"><div className="spinner"/>Scoring with ML models…</div>
            ) : (
              <div className={`drop ${dragOn?"over":""}`}
                onClick={()=>fileRef.current.click()}
                onDragOver={e=>{e.preventDefault();setDragOn(true)}}
                onDragLeave={()=>setDragOn(false)}
                onDrop={handleDrop}>
                <div className="drop-icon">📁</div>
                <div className="drop-title">Drop your CSV here or click to browse</div>
                <div className="drop-sub">Semicolon-separated · marketing_campaign.csv format</div>
                <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>loadFile(e.target.files[0])}/>
              </div>
            )}
            <div className="model-grid">
              {[["📐","Logistic Regression","Outputs conversion probability per lead"],
                ["🌳","Decision Tree","Classifies into High / Medium / Low priority"],
                ["⚖️","Standard Scaler","Z-score normalises 15 features before inference"],
                ["🔬","What-If Simulator","Tweak any lead's attributes and see score changes live"],
                ["🔍","Global Lead Search","Instantly find any lead by ID from anywhere in the app"],
                ["🗺️","Upgrade Path AI","Personalized action tips to move leads up priority tiers"],
              ].map(([ic,t,d])=>(
                <div className="model-pill" key={t}>
                  <div className="model-pill-title">{ic} {t}</div>
                  <div className="model-pill-sub">{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MANUAL ── */}
        {tab==="manual" && (<>
          <div className="card">
            <div className="card-title">Qualify a Single Lead</div>
            <div className="form-grid">
              {[["Income ($)","Income","number"],["Days Since Purchase","Recency","number"],
                ["Web Visits / Month","NumWebVisitsMonth","number"],["Deal Purchases","NumDealsPurchases","number"],
                ["Wine Spend ($)","MntWines","number"],["Meat Spend ($)","MntMeatProducts","number"],
                ["Web Purchases","NumWebPurchases","number"],["Store Purchases","NumStorePurchases","number"],
                ["Campaigns Accepted (1–5)","AcceptedCmp1","number"],["Kids at Home","Kidhome","number"],
              ].map(([lbl,key,type])=>(
                <div className="fg" key={key}>
                  <label className="flabel">{lbl}</label>
                  <input className="finput" type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
                </div>
              ))}
              <div className="fg">
                <label className="flabel">Education</label>
                <select className="finput" value={form.Education} onChange={e=>setForm(f=>({...f,Education:e.target.value}))}>
                  {["Graduation","PhD","Master","Basic","2n Cycle"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="flabel">Marital Status</label>
                <select className="finput" value={form.Marital_Status} onChange={e=>setForm(f=>({...f,Marital_Status:e.target.value}))}>
                  {["Married","Single","Together","Divorced","Widow"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:18}}>
              <button className="btn btn-primary" onClick={()=>setResult(infer(form))}>🔮 Predict</button>
            </div>
          </div>
          {result && (
            <div className="card">
              <div className="card-title">AI Verdict</div>
              <div className="result-grid">
                {[["Priority",<span className={`badge b-${result.priority}`}>{result.priority}</span>],
                  ["Conv. Probability",<span style={{color:"#4f46e5"}}>{result.prob}%</span>],
                  ["Lead Score",result.leadScore],
                  ["Follow-Up",result.priority==="High"?"Within 24 hrs":result.priority==="Medium"?"Within 3 days":"30-day nurture"],
                ].map(([lbl,val])=>(
                  <div className="result-box" key={lbl}><div className="rlabel">{lbl}</div><div className="rval">{val}</div></div>
                ))}
              </div>
              <div className="log">
                Last active <strong>{result.recency} days ago</strong> · Lifetime spend <strong>${result.totalSpent.toLocaleString()}</strong> · {result.totalPurchases} purchases · {result.prevScore} past campaigns accepted
              </div>
            </div>
          )}
        </>)}

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (leads.length===0
          ? <EmptyState icon="📊" text="Upload a CSV to see the dashboard"/>
          : <>
            <div className="metrics">
              {[["Total Leads",leads.length,"processed","#4f46e5"],
                ["🔥 High Priority",hi,`${((hi/leads.length)*100).toFixed(1)}% of total`,"#ef4444"],
                ["📅 Medium Priority",md,`${((md/leads.length)*100).toFixed(1)}% of total`,"#f59e0b"],
                ["Avg Conv. Prob",avgP+"%",`Top lead: ${leads[0]?.prob}%`,"#10b981"],
              ].map(([lbl,val,sub,color])=>(
                <div className="metric" key={lbl} style={{"--m-color":color}}>
                  <div className="metric-label">{lbl}</div>
                  <div className="metric-val">{val}</div>
                  <div className="metric-sub">{sub}</div>
                </div>
              ))}
            </div>
            <div className="charts">
              <div className="card">
                <div className="card-title">Priority Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip content={<Tip/>}/>
                    <Legend formatter={v=><span style={{fontSize:11,fontFamily:"JetBrains Mono,monospace",color:"#6b7280"}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-title">Probability Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={probBuckets} margin={{top:4,right:8,bottom:0,left:-24}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="label" tick={{fontSize:10,fontFamily:"JetBrains Mono,monospace",fill:"#9ca3af"}}/>
                    <YAxis tick={{fontSize:10,fontFamily:"JetBrains Mono,monospace",fill:"#9ca3af"}}/>
                    <Tooltip content={<Tip/>}/>
                    <Bar dataKey="count" name="Leads" fill="#4f46e5" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🏆 Top 5 Leads by Conversion Probability</div>
              <table>
                <thead><tr><th>#</th><th>ID</th><th>Priority</th><th>Probability</th><th>Lead Score</th><th>Follow-Up</th><th>Action</th></tr></thead>
                <tbody>
                  {leads.slice(0,5).map((l,i)=>(
                    <tr key={i}>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"#9ca3af"}}>{i+1}</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.ID}</td>
                      <td><span className={`badge b-${l.priority}`}>{l.priority}</span></td>
                      <td>
                        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.prob}%</span>
                        <div className="pbar"><div className="pfill" style={{width:`${Math.min(l.prob*2,100)}%`,background:PC[l.priority]}}/></div>
                      </td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.leadScore}</td>
                      <td style={{fontSize:12}}>{l.timeline}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => navigateToLead(l)}>🔬 Simulate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── PIPELINE ── */}
        {tab==="pipeline" && (leads.length===0
          ? <EmptyState icon="📋" text="Upload a CSV to view the pipeline"/>
          : <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div className="card-title" style={{margin:0}}>Sales Pipeline — {filtered.length} leads</div>
              <div style={{display:"flex",gap:8}}>
                <input className="search" placeholder="Search by ID…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
                <button className="btn btn-outline btn-sm" onClick={exportCSV}>📥 Export CSV</button>
              </div>
            </div>
            <div className="filter-row">
              {["All","High","Medium","Low"].map(f=>(
                <button key={f} className={`chip ${filter===f?"on":""}`} onClick={()=>{setFilter(f);setPage(1)}}>
                  {f}{f!=="All"&&` (${leads.filter(l=>l.priority===f).length})`}
                </button>
              ))}
            </div>
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>ID</th><th>Priority</th><th>Prob</th><th>Score</th><th>Follow-Up</th><th>Income</th><th>Recency</th><th>Spent</th><th>Campaigns</th><th></th></tr></thead>
                <tbody>
                  {paged.map((l,i)=>(
                    <tr key={i}>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"#9ca3af"}}>{(page-1)*PER_PAGE+i+1}</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.ID}</td>
                      <td><span className={`badge b-${l.priority}`}>{l.priority}</span></td>
                      <td>
                        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.prob}%</span>
                        <div className="pbar"><div className="pfill" style={{width:`${Math.min(l.prob*2,100)}%`,background:PC[l.priority]}}/></div>
                      </td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.leadScore}</td>
                      <td style={{fontSize:12,color:"#374151"}}>{l.timeline}</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>${Number(l.income||0).toLocaleString()}</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.recency}d</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>${Number(l.totalSpent||0).toLocaleString()}</td>
                      <td style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{l.prevScore}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" style={{whiteSpace:"nowrap"}} onClick={() => navigateToLead(l)}>🔬</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <button className="pbtn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>←</button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>(
                <button key={i} className={`pbtn ${page===i+1?"on":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>
              ))}
              {totalPages>5&&<span style={{fontSize:12,color:"#9ca3af",fontFamily:"JetBrains Mono,monospace"}}>…{totalPages}</span>}
              <button className="pbtn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>→</button>
            </div>
          </div>
        )}

        {/* ── SIMULATOR ── */}
        {tab==="simulator" && (
          <WhatIfSimulator leads={leads} initialLead={simTarget} />
        )}

      </div>
    </div>
  );
}