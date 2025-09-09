import React, { useEffect, useMemo, useState } from "react";
import { API, fetchJSON } from "./_api";

function iso(d){ return d.toISOString().slice(0,10); }

export default function WaiterHome(){
  const [date, setDate] = useState(iso(new Date()));
  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState("");

  const t=(m)=>{ setToast(m); setTimeout(()=>setToast(""),1600); };

  async function load(){
    const d = await fetchJSON(`${API}/orders.php?scope=today_waiter&date=${date}`).catch(()=>[]);
    setRows(Array.isArray(d)?d:[]);
  }
  useEffect(()=>{ load(); },[date]);

  const totalToRemit = useMemo(
    () => rows.filter(r=>r.status==='paid').reduce((s,r)=>s+Number(r.total||0),0),
    [rows]
  );

  return (
    <div className="container">
<div className="hero">
  <div className="hero-inner">
    <h1 className="hero-title">Waiter Home</h1>
    <div className="hero-sub">Welcome to the waiter area</div>
  </div>
</div>

      <div className="row" style={{gap:10, alignItems:"center"}}>
        <span className="muted">Day</span>
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="card" style={{marginTop:14}}>
        <div className="body">
          <h3 style={{marginTop:0}}>Daily summary</h3>
          {rows.length===0 ? (
            <p className="muted">No orders for this day.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Time</th><th>Table</th><th>Status</th><th style={{textAlign:"right"}}>Amount (€)</th></tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id}>
                    <td>{(r.created_at||'').slice(11,16)}</td>
                    <td>Table {r.table_number ?? r.table_id}</td>
                    <td>{r.status}</td>
                    <td style={{textAlign:"right"}}>{Number(r.total||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} style={{textAlign:"right"}}>Total to remit</th>
                  <th style={{textAlign:"right"}}>{totalToRemit.toFixed(2)} €</th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </div>
  );
}
