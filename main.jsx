import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

const nav = [
  ["dashboard", "⌂", "Command Center"], ["traffic", "⌁", "Traffic"], ["waste", "♻", "Waste"],
  ["parking", "▦", "Parking"], ["emergency", "!", "Emergency"], ["streetlights", "◉", "Street Lights"],
  ["complaints", "▤", "Complaints"], ["reports", "◫", "Reports"]
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setData(await api("/dashboard")); }
    catch (e) { setToast(`Backend unavailable: ${e.message}`); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  const searchAction = (e) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = nav.find(([id, , label]) => id.includes(q) || label.toLowerCase().includes(q));
    if (match) { setPage(match[0]); setSearch(""); return; }
    setToast(`No module found for “${search.trim()}”`);
  };

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><div className="logo-mark">V</div><div><b>VELIZE</b><span>SMART CITY OS</span></div></div>
      <div className="side-label">COMMAND CENTER</div>
      <div className="nav">
        {nav.map(([id, ic, label]) => <button key={id} onClick={() => setPage(id)} className={page === id ? "nav-item active" : "nav-item"}>
          <i>{ic}</i><span>{label}</span>{id === "emergency" && data?.emergency?.active ? <em>{data.emergency.active}</em> : null}
        </button>)}
      </div>
      <div className="side-bottom">
        <div className="online"><span></span>All systems operational</div>
        <div className="side-meta">C++ / DSA SIMULATION<br />Urban operations prototype</div>
      </div>
    </aside>

    <main className="content">
      <header className="top">
        <form className="search" onSubmit={searchAction}><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules, incidents, assets..." /></form>
        <div className="top-right">
          <span className="live-pill"><span></span>LIVE</span>
          <span className="time">{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <button className="emergency-top" onClick={() => setPage("emergency")}>! Emergency Mode</button>
          <button className={`icon-btn ${loading ? "spin" : ""}`} onClick={refresh} title="Refresh data">↻</button>
          <div className="profile"><span>AD</span><div><b>Admin</b><small>City Operations</small></div></div>
        </div>
      </header>
      {toast && <div className="toast">{toast}</div>}
      <div className="page-transition" key={page}>
        {page === "dashboard" && <Dashboard data={data} setPage={setPage} />}
        {page === "traffic" && <Traffic setToast={setToast} />}
        {page === "waste" && <Waste setToast={setToast} />}
        {page === "parking" && <Parking setToast={setToast} />}
        {page === "emergency" && <Emergency setToast={setToast} />}
        {page === "streetlights" && <StreetLights setToast={setToast} />}
        {page === "complaints" && <Complaints setToast={setToast} />}
        {page === "reports" && <Reports setToast={setToast} />}
      </div>
    </main>
  </div>;
}

function Kpi({ icon, label, value, delta, positive = true }) { return <div className="kpi">
  <div className="kpi-head"><span>{label}</span><i>{icon}</i></div><div className="kpi-value">{value}</div>
  <div className={positive ? "delta up" : "delta down"}>{positive ? "↗" : "↘"} {delta} <small>vs last period</small></div>
</div>; }

function Dashboard({ data, setPage }) {
  if (!data) return <Loading />;
  const parkingPct = data.parking.total ? Math.round(data.parking.occupied / data.parking.total * 100) : 0;
  return <div className="page">
    <div className="page-title"><div><div className="overline">CITY OPERATIONS / LIVE</div><h1>Command Center</h1><p className="subtitle">One operational view for traffic, safety, infrastructure and citizen services.</p></div><div className="date">{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div></div>
    <div className="kpis">
      <Kpi icon="⌁" label="Traffic Flow Index" value={`${data.traffic.congestion}/100`} delta="8%" positive={false}/>
      <Kpi icon="◈" label="Public Safety Score" value={`${Math.max(0, 100 - data.emergency.active * 3)}/100`} delta="5%"/>
      <Kpi icon="◌" label="Air Quality Index" value="43 AQI" delta="12%"/>
      <Kpi icon="▦" label="Parking Occupancy" value={`${parkingPct}%`} delta={`${data.parking.available} free`} positive={parkingPct < 80}/>
    </div>
    <div className="quick-actions">
      <button onClick={() => setPage("parking")}><b>▦</b><span><strong>Parking</strong><small>{data.parking.available} spaces available</small></span><i>→</i></button>
      <button onClick={() => setPage("reports")}><b>◫</b><span><strong>Reports</strong><small>View operational snapshot</small></span><i>→</i></button>
      <button onClick={() => setPage("emergency")}><b>!</b><span><strong>Emergency</strong><small>{data.emergency.active} active response</small></span><i>→</i></button>
      <button onClick={() => setPage("complaints")}><b>▤</b><span><strong>Complaints</strong><small>{data.complaints.pending} need attention</small></span><i>→</i></button>
    </div>
    <div className="main-grid">
      <div className="panel map-panel"><div className="panel-title"><div><span>LIVE CITY PULSE</span><h2>Urban Operations Map</h2></div><div className="map-tools"><button>All layers⌄</button><button>＋</button><button>−</button></div></div><CityMap/><div className="legend"><span><b className="dot cyan"></b>Traffic</span><span><b className="dot red"></b>Emergency</span><span><b className="dot yellow"></b>Infrastructure</span><span><b className="dot green"></b>Environment</span></div></div>
      <Alerts setPage={setPage}/>
    </div>
    <div className="charts-grid">
      <ChartCard title="Traffic Flow Trend" value={`${data.traffic.congestion}`} unit="index" delta="8% vs yesterday" tone="green" points={[28,38,34,46,41,54,49,58,52,61,57,63]}/>
      <ChartCard title="Emergency Response" value="6.24" unit="min" delta="5% vs yesterday" tone="green" points={[62,54,57,45,52,40,48,43,37,44,35,39]}/>
      <ChartCard title="Citizen Satisfaction" value="4.6" unit="/5" delta="2.1% vs last month" tone="orange" points={[25,29,24,34,39,31,42,48,43,53,49,57]}/>
      <div className="panel mini-health"><div className="panel-title"><div><span>SERVICE HEALTH</span><h2>City systems</h2></div></div><Health name="Traffic" value={82}/><Health name="Waste" value={91}/><Health name="Parking" value={76}/><Health name="Street lights" value={88}/></div>
    </div>
  </div>;
}

function CityMap() { const pts = [["14%","22%","cyan","Traffic"],["31%","44%","yellow","Infrastructure"],["48%","30%","red","Emergency"],["62%","55%","green","Environment"],["73%","25%","cyan","Traffic"],["81%","67%","red","Emergency"],["38%","72%","yellow","Infrastructure"],["58%","77%","green","Environment"]]; return <div className="city-map"><div className="roads r1"></div><div className="roads r2"></div><div className="roads r3"></div><div className="roads r4"></div><div className="river"></div><div className="district d1">NORTH DISTRICT</div><div className="district d2">CENTRAL</div><div className="district d3">EAST ZONE</div>{pts.map((p,i)=><span key={i} className={`map-point ${p[2]}`} style={{left:p[0],top:p[1]}} title={p[3]}>{p[3][0]}</span>)}</div>; }

function Alerts({ setPage }) { const alerts = [["10:32 AM","Air Quality Warning","North District","PM2.5 concentration above limit","red"],["10:22 AM","Power Grid Disruption","Power Grid","Localized outage impacting...","yellow"],["10:28 AM","Flood Monitoring","Riverside Area","Water levels continue to rise","cyan"],["10:15 AM","Public Safety Incident","West District","Emergency response required","red"],["09:58 AM","Road Closure","South District","Temporary road closure due...","yellow"],["09:48 AM","Traffic Congestion","Downtown Corridor","Traffic volume exceeds normal","cyan"],["09:39 AM","CCTV Network Offline","Sector 8","Three surveillance cameras...","yellow"]]; return <div className="panel alerts"><div className="panel-title"><div><span>REAL-TIME ALERTS</span><h2>Active events</h2></div><button className="viewall" onClick={() => setPage("emergency")}>View All →</button></div><div className="alert-tabs"><b>All 12</b><span>Critical 2</span><span>Warning 5</span><span>Info 5</span></div><div className="alert-list">{alerts.map((a,i)=><div className="alert" key={i}><time>{a[0]}</time><b><i className={`alert-dot ${a[4]}`}></i>{a[1]}</b><span>{a[2]}</span><p>{a[3]}</p></div>)}</div></div>; }
function ChartCard({ title, value, unit, delta, tone, points }) { return <div className="panel chart-card"><div className="panel-title"><div><span>{title}</span><h2>{value} <small>{unit}</small></h2></div><span className={`chart-delta ${tone}`}>↗ {delta}</span></div><Spark points={points} tone={tone}/><div className="axis"><span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span></div></div>; }
function Spark({ points, tone }) { const w=320,h=90,max=Math.max(...points),min=Math.min(...points); const pts=points.map((v,i)=>`${(i/(points.length-1))*w},${h-((v-min)/(max-min||1))*68-10}`).join(" "); return <svg className={`spark ${tone}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts}/><polyline points={`0,${h} ${pts} ${w},${h}`} className="area"/></svg>; }
function Health({ name, value }) { return <div className="health"><span>{name}</span><div><b style={{width:`${value}%`}}></b></div><strong>{value}%</strong></div>; }

function ModuleShell({ kicker, title, desc, children, action }) { return <div className="page"><div className="page-title"><div><div className="overline">{kicker}</div><h1>{title}</h1><p className="subtitle">{desc}</p></div>{action}</div>{children}</div>; }
function Card({ title, children, action }) { return <div className="panel"><div className="panel-title"><h2>{title}</h2>{action}</div>{children}</div>; }
function Loading() { return <div className="loading"><div className="loader"></div>Connecting to city operations…</div>; }
function Table({ columns, rows }) { return <div className="table-scroll"><table><thead><tr>{columns.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div>; }
function Field({ label, children }) { return <label className="field">{label}{children}</label>; }

function Traffic({ setToast }) { const [loc,setLoc]=useState([]),[from,setFrom]=useState("City Center"),[to,setTo]=useState("Airport"),[route,setRoute]=useState(null),[t,setT]=useState(null); useEffect(()=>{Promise.all([api("/locations"),api("/traffic")]).then(([a,b])=>{setLoc(a);setT(b)}).catch(e=>setToast(e.message))},[]); return <ModuleShell kicker="GRAPH / DIJKSTRA" title="Traffic Management" desc="Weighted road graph with shortest-path routing."><div className="two"><Card title="Route planner"><Field label="From"><select value={from} onChange={e=>setFrom(e.target.value)}>{loc.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="To"><select value={to} onChange={e=>setTo(e.target.value)}>{loc.map(x=><option key={x}>{x}</option>)}</select></Field><button className="accent-btn" onClick={async()=>{try{setRoute(await api("/traffic/route",{method:"POST",body:JSON.stringify({from,to})}))}catch(e){setToast(e.message)}}}>Find Shortest Route</button>{route&&<div className="result"><b>{route.distance} km</b><span>{route.path?.join(" → ")}</span></div>}</Card><Card title="Live traffic"><div className="big-number">{t?.congestion ?? "—"}<small>/100 congestion</small></div><Table columns={["Route","Status","Congestion"]} rows={(t?.routes||[]).map(x=>[x.id,x.status,`${x.congestion}%`])}/></Card></div></ModuleShell>; }

function Waste({ setToast }) { const [items,setItems]=useState([]),[area,setArea]=useState(""),[type,setType]=useState("Garbage Pickup"),[priority,setPriority]=useState(2); const load=()=>api("/waste").then(setItems).catch(e=>setToast(e.message)); useEffect(load,[]); return <ModuleShell kicker="QUEUE" title="Waste Management" desc="FIFO service-request processing with priority indicators."><div className="two"><Card title="New collection request"><Field label="Area"><input value={area} onChange={e=>setArea(e.target.value)} placeholder="Area"/></Field><Field label="Type"><select value={type} onChange={e=>setType(e.target.value)}><option>Garbage Pickup</option><option>Recycling</option><option>Overflow Bin</option></select></Field><Field label="Priority"><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="1">Low</option><option value="2">Normal</option><option value="3">High</option></select></Field><button className="accent-btn" onClick={async()=>{try{await api("/waste",{method:"POST",body:JSON.stringify({area,type,priority})});setArea("");load()}catch(e){setToast(e.message)}}}>Add to Queue</button></Card><QueuePanel title="Queue" items={items} action={async()=>{try{await api("/waste/process",{method:"POST"});load()}catch(e){setToast(e.message)}}}/></div><Card title="Requests"><Table columns={["ID","Area","Type","Priority","Status"]} rows={items.map(x=>[x.id,x.area,x.type,x.priority,x.status])}/></Card></ModuleShell>; }

function Parking({ setToast }) {
  const [slots,setSlots]=useState([]),[filter,setFilter]=useState("All"),[selected,setSelected]=useState(null),[loading,setLoading]=useState(false);
  const load=()=>api("/parking").then(setSlots).catch(e=>setToast(`Parking: ${e.message}`));
  useEffect(load,[]);
  const zones=useMemo(()=>Array.from(new Set(slots.map(s=>s.zone))),[slots]);
  const free=slots.filter(x=>!x.occupied).length, occupied=slots.length-free, pct=slots.length?Math.round(occupied/slots.length*100):0;
  const visible=filter==="All"?slots:slots.filter(s=>s.zone===filter);
  const zoneStats=zones.map(z=>{const a=slots.filter(s=>s.zone===z);const o=a.filter(s=>s.occupied).length;return {z,total:a.length,occupied:o,free:a.length-o,pct:a.length?Math.round(o/a.length*100):0};});
  const toggle=async id=>{setLoading(true);try{const updated=await api("/parking/toggle",{method:"POST",body:JSON.stringify({id})});setSlots(s=>s.map(x=>x.id===updated.id?updated:x));setSelected(updated);setToast(`${updated.id} is now ${updated.occupied?"occupied":"available"}`)}catch(e){setToast(`Parking: ${e.message}`)}finally{setLoading(false)}};
  return <ModuleShell kicker="ARRAY / VECTOR" title="Smart Parking" desc="Live capacity, zone utilization and one-click slot allocation." action={<button className="ghost-btn top-action" onClick={load}>↻ Refresh</button>}>
    <div className="parking-overview"><div className="parking-hero"><div><span className="eyebrow">CURRENT CAPACITY</span><strong>{pct}%</strong><small>{occupied} occupied · {free} available</small></div><div className="capacity-ring" style={{"--pct":`${pct}%`}}><span>{pct}%</span></div></div><div className="parking-zone-list">{zoneStats.map(s=><button key={s.z} onClick={()=>setFilter(s.z)} className={filter===s.z?"zone-card active":"zone-card"}><span>{s.z}</span><b>{s.free}<small> free</small></b><div><i style={{width:`${s.pct}%`}}></i></div><small>{s.pct}% occupied · {s.total} total</small></button>)}</div></div>
    <div className="parking-toolbar"><div><b>Parking inventory</b><span>{visible.length} spaces shown</span></div><div className="filter-pills"><button className={filter==="All"?"active":""} onClick={()=>setFilter("All")}>All</button>{zones.map(z=><button key={z} className={filter===z?"active":""} onClick={()=>setFilter(z)}>{z}</button>)}</div></div>
    <div className="parking-layout"><Card title={filter==="All"?"All parking spaces":`${filter} spaces`}><div className="slots">{visible.map(s=><button key={s.id} className={s.occupied?"slot busy":"slot"} onClick={()=>toggle(s.id)} disabled={loading} title={`Toggle ${s.id}`}><b>{s.id}</b><small>{s.zone}</small><em>{s.occupied?"OCCUPIED":"AVAILABLE"}</em></button>)}{!visible.length&&<div className="empty">No parking spaces found.</div>}</div></Card><Card title={selected?`Space ${selected.id}`:"Select a space"}>{selected?<div className="parking-detail"><div className={`status-chip ${selected.occupied?"busy":"free"}`}>{selected.occupied?"● OCCUPIED":"● AVAILABLE"}</div><h3>{selected.id}</h3><p>{selected.zone}</p><div className="detail-grid"><span>Zone<strong>{selected.zone}</strong></span><span>Status<strong>{selected.occupied?"Occupied":"Available"}</strong></span></div><button className={selected.occupied?"red-btn":"accent-btn"} onClick={()=>toggle(selected.id)}>Mark as {selected.occupied?"available":"occupied"}</button></div>:<div className="empty large-empty">Click any parking slot to inspect or change its status.</div>}</Card></div>
  </ModuleShell>;
}

function Emergency({setToast}) { const [items,setItems]=useState([]),[type,setType]=useState("Ambulance"),[location,setLocation]=useState("Hospital"),[priority,setPriority]=useState(5); const load=()=>api("/emergency").then(setItems).catch(e=>setToast(e.message)); useEffect(load,[]); return <ModuleShell kicker="PRIORITY QUEUE" title="Emergency Services" desc="Highest-priority requests are dispatched first."><div className="two"><Card title="Dispatch request"><Field label="Service"><select value={type} onChange={e=>setType(e.target.value)}><option>Ambulance</option><option>Fire</option><option>Police</option></select></Field><Field label="Location"><input value={location} onChange={e=>setLocation(e.target.value)}/></Field><Field label="Priority"><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="5">Critical · 5</option><option value="4">High · 4</option><option value="3">Medium · 3</option></select></Field><button className="red-btn" onClick={async()=>{try{await api("/emergency",{method:"POST",body:JSON.stringify({type,location,priority})});load()}catch(e){setToast(e.message)}}}>Dispatch Emergency</button></Card><QueuePanel title="Priority queue" items={items} priority action={async()=>{try{await api("/emergency/process",{method:"POST"});load()}catch(e){setToast(e.message)}}}/></div><Card title="Emergency queue"><Table columns={["ID","Type","Location","Priority","Status"]} rows={items.map(x=>[x.id,x.type,x.location,x.priority,x.status])}/></Card></ModuleShell>; }

function StreetLights({setToast}) { const [items,setItems]=useState([]),[location,setLocation]=useState(""),[issue,setIssue]=useState("Light not working"); const load=()=>api("/streetlights").then(setItems).catch(e=>setToast(e.message)); useEffect(load,[]); return <ModuleShell kicker="QUEUE" title="Street-Light Maintenance" desc="Fault reports move through a maintenance queue."><div className="two"><Card title="Report a fault"><Field label="Location"><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Road / landmark"/></Field><Field label="Issue"><select value={issue} onChange={e=>setIssue(e.target.value)}><option>Light not working</option><option>Flickering</option><option>Pole damaged</option></select></Field><button className="accent-btn" onClick={async()=>{try{await api("/streetlights",{method:"POST",body:JSON.stringify({location,issue})});setLocation("");load()}catch(e){setToast(e.message)}}}>Add Maintenance Request</button></Card><QueuePanel title="Maintenance queue" items={items} action={async()=>{try{await api("/streetlights/process",{method:"POST"});load()}catch(e){setToast(e.message)}}}/></div><Card title="Maintenance requests"><Table columns={["ID","Location","Issue","Status"]} rows={items.map(x=>[x.id,x.location,x.issue,x.status])}/></Card></ModuleShell>; }

function Complaints({setToast}) { const [items,setItems]=useState([]),[citizen,setCitizen]=useState(""),[category,setCategory]=useState("Waste"),[description,setDescription]=useState(""),[priority,setPriority]=useState("Medium"),[search,setSearch]=useState(""),[found,setFound]=useState(null); const load=()=>api("/complaints").then(setItems).catch(e=>setToast(e.message)); useEffect(load,[]); return <ModuleShell kicker="LINKED LIST / SEARCH / SORT" title="Citizen Complaints" desc="Dynamic complaint records with ID search and sorted reporting."><div className="two"><Card title="Register complaint"><Field label="Citizen"><input value={citizen} onChange={e=>setCitizen(e.target.value)}/></Field><Field label="Category"><select value={category} onChange={e=>setCategory(e.target.value)}><option>Waste</option><option>Street Light</option><option>Parking</option><option>Traffic</option><option>Other</option></select></Field><Field label="Description"><textarea value={description} onChange={e=>setDescription(e.target.value)}/></Field><Field label="Priority"><select value={priority} onChange={e=>setPriority(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></Field><button className="accent-btn" onClick={async()=>{try{await api("/complaints",{method:"POST",body:JSON.stringify({citizen,category,description,priority})});setCitizen("");setDescription("");load()}catch(e){setToast(e.message)}}}>Submit Complaint</button></Card><Card title="Search by complaint ID"><div className="search-inline"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="C-501"/><button className="accent-btn" onClick={async()=>{try{setFound(await api(`/complaints/search/${search}`))}catch(e){setFound(null);setToast(e.message)}}}>Search</button></div>{found&&<div className="result"><b>{found.id}</b><span>{found.category} · {found.status}</span><p>{found.description}</p></div>}</Card></div><Card title="Complaint records"><Table columns={["ID","Citizen","Category","Priority","Status","Description"]} rows={items.map(x=>[x.id,x.citizen,x.category,x.priority,x.status,x.description])}/></Card></ModuleShell>; }

function Reports({setToast}) {
  const [d,setD]=useState(null),[tab,setTab]=useState("overview"),[loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);try{setD(await api("/reports"))}catch(e){setToast(`Reports: ${e.message}`)}finally{setLoading(false)}};
  useEffect(load,[]);
  if(loading&&!d)return <Loading/>;
  if(!d)return <ModuleShell kicker="ANALYTICS / EXPORT" title="Reports" desc="Operational reporting is temporarily unavailable."><Card title="Connection required"><div className="empty large-empty">Start the backend and click refresh to load live reports.</div></Card></ModuleShell>;
  const s=d.summary, parkingPct=s.parking.total?Math.round(s.parking.occupied/s.parking.total*100):0;
  const exportJson=()=>{const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});downloadBlob(blob,"velize-operational-report.json");};
  const exportCsv=()=>{const rows=[['Metric','Value'],['Traffic congestion',s.traffic.congestion],['Waste queued',s.waste.pending],['Emergency active',s.emergency.active],['Emergency queue',s.emergency.queue],['Parking occupancy %',parkingPct],['Parking available',s.parking.available],['Complaints total',s.complaints.total],['Complaints pending',s.complaints.pending],['Street lights pending',s.streetLights.pending]]; const csv=rows.map(r=>r.map(csvCell).join(',')).join('\n');downloadBlob(new Blob([csv],{type:'text/csv'}),'velize-city-summary.csv');};
  return <ModuleShell kicker="ANALYTICS / EXPORT" title="Reports" desc="A live operational snapshot with service health, queues and exportable records." action={<div className="report-actions"><button className="ghost-btn" onClick={load}>↻ Refresh</button><button className="ghost-btn" onClick={exportCsv}>↓ CSV</button><button className="accent-btn" onClick={exportJson}>↓ JSON</button></div>}>
    <div className="report-meta"><span>Generated {new Date(d.generatedAt).toLocaleString()}</span><span className="live-dot"><i></i> Live data</span></div>
    <div className="kpis"><Kpi icon="⌁" label="Traffic" value={`${s.traffic.congestion}%`} delta="congestion"/><Kpi icon="♻" label="Waste" value={s.waste.pending} delta="queued"/><Kpi icon="!" label="Emergency" value={s.emergency.queue} delta="priority items"/><Kpi icon="▦" label="Parking" value={`${parkingPct}%`} delta={`${s.parking.available} free`}/></div>
    <div className="report-tabs"><button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Overview</button><button className={tab==="complaints"?"active":""} onClick={()=>setTab("complaints")}>Complaints</button><button className={tab==="parking"?"active":""} onClick={()=>setTab("parking")}>Parking</button><button className={tab==="queues"?"active":""} onClick={()=>setTab("queues")}>Service Queues</button></div>
    {tab==="overview"&&<div className="report-grid"><Card title="Service performance"><ReportBar label="Traffic" value={Math.max(0,100-s.traffic.congestion)}/><ReportBar label="Parking availability" value={s.parking.total?Math.round(s.parking.available/s.parking.total*100):0}/><ReportBar label="Complaint resolution" value={s.complaints.total?Math.round(s.complaints.resolved/s.complaints.total*100):100}/><ReportBar label="System health" value={86}/></Card><Card title="Operational summary"><Table columns={["Area","Status","Volume"]} rows={[["Traffic",s.traffic.activeIncidents?"Active":"Clear",s.traffic.activeIncidents+" incidents"],["Waste",s.waste.pending?"Queued":"Clear",s.waste.pending+" requests"],["Emergency",s.emergency.active?"Active":"Clear",s.emergency.active+" active"],["Street Lights",s.streetLights.pending?"Pending":"Clear",s.streetLights.pending+" requests"],["Complaints",s.complaints.pending?"Attention":"Clear",s.complaints.pending+" pending"]]}/></Card></div>}
    {tab==="complaints"&&<Card title="Complaint report"><Table columns={["ID","Citizen","Category","Priority","Status"]} rows={d.complaints.map(x=>[x.id,x.citizen,x.category,x.priority,x.status])}/></Card>}
    {tab==="parking"&&<Card title="Parking inventory report"><Table columns={["Slot","Zone","Status"]} rows={d.parking.map(x=>[x.id,x.zone,x.occupied?"Occupied":"Available"])}/></Card>}
    {tab==="queues"&&<div className="report-grid"><Card title="Waste queue"><QueueRows items={d.wasteQueue}/></Card><Card title="Emergency queue"><QueueRows items={d.emergencyQueue}/></Card><Card title="Street-light queue"><QueueRows items={d.streetLights}/></Card></div>}
  </ModuleShell>;
}
function ReportBar({label,value}){return <div className="report-bar"><div><span>{label}</span><b>{value}%</b></div><div><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}></i></div></div>}
function QueueRows({items=[]}){return <div className="queue">{items.map((x,i)=><div className="qrow" key={x.id}><b>{i+1}</b><div><strong>{x.id}</strong><span>{x.area||x.location||x.type} · {x.status}</span></div></div>)}{!items.length&&<div className="empty">Queue is empty.</div>}</div>}
function csvCell(v){const s=String(v??"");return `"${s.replaceAll('"','""')}"`;}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function QueuePanel({title,items,action,priority}){return <Card title={title}><div className="queue">{items.map((x,i)=><div className="qrow" key={x.id}><b>{i+1}</b><div><strong>{x.id}</strong><span>{x.area||x.location||x.type} · {x.status}</span></div>{priority&&<em>P{x.priority}</em>}</div>)}{!items.length&&<div className="empty">Queue is empty.</div>}</div><button className="ghost-btn" onClick={action}>Process next →</button></Card>}

createRoot(document.getElementById("root")).render(<App/>);
