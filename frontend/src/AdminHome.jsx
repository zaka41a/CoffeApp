// frontend/src/AdminHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API, fetchJSON } from "./_api";

function iso(d){ return d.toISOString().slice(0,10); }

export default function AdminHome(){
  const [day,setDay] = useState(iso(new Date()));
  const [rows,setRows] = useState([]); // [{waiter_id, full_name, day, total_paid}]

  async function load(){
    const url = `${API}/orders.php?scope=totals_by_waiter&from=${day}&to=${day}`;
    const d = await fetchJSON(url).catch(()=>[]);
    setRows(Array.isArray(d)?d:[]);
  }
  useEffect(()=>{ load(); },[]);

  // Groupé PAR JOUR (ici, un seul jour)
  const byDay = useMemo(()=>{
    const m = new Map();
    rows.forEach(r=>{
      const d = r.day;
      const total = Number(r.total_paid||0);
      if(!m.has(d)) m.set(d, {rows:[], total:0});
      m.get(d).rows.push({waiter_id:r.waiter_id, full_name:r.full_name, total});
      m.get(d).total += total;
    });
    return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  },[rows]);

  const grandTotal = rows.reduce((s,r)=>s+Number(r.total_paid||0),0);

  return (
    <div className="container">
      <div className="hero">
  <div className="hero-inner">
    <h1 className="hero-title">Admin Dashboard</h1>
    <div className="hero-sub">Overview & daily totals</div>
  </div>
</div>


      {/* Une seule barre: date + Refresh */}
      <div className="row" style={{gap:10, alignItems:"center"}}>
        <input className="input" type="date" value={day} onChange={e=>setDay(e.target.value)} />
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="card" style={{marginTop:14}}>
        <div className="body">
          <h3 style={{marginTop:0}}>Daily totals per waiter</h3>

          {byDay.length === 0 ? (
            <p className="muted">No data for {day}.</p>
          ) : (
            byDay.map(([d, group])=>(
              <div key={d} style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:"10px 0"}}>{d}</h4>
                  <div><strong>Day total: {group.total.toFixed(2)} €</strong></div>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Waiter</th>
                      <th style={{textAlign:"right"}}>Total to remit (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows
                      .sort((a,b)=>a.full_name.localeCompare(b.full_name))
                      .map(w=>(
                        <tr key={w.waiter_id}>
                          <td>{w.full_name}</td>
                          <td style={{textAlign:"right"}}>{w.total.toFixed(2)} €</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          <hr />
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <div><strong>Grand total: {grandTotal.toFixed(2)} €</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
