import React, { useEffect, useState } from "react";
const API = "http://localhost/CoffeApp/backend/api";

export default function TablesPage(){
  const [rows,setRows]=useState([]);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({id:null, number:1, seats:2, status:"free"});

  function load(){
    fetch(`${API}/tables.php`,{credentials:"include"})
      .then(r=>r.json()).then(setRows);
  }
  useEffect(load,[]);

  function edit(r){ setForm(r); setOpen(true); }
  function add(){ setForm({id:null, number:1, seats:2, status:"free"}); setOpen(true); }

  async function save(e){
    e.preventDefault();
    const method = form.id? "PUT":"POST";
    const r = await fetch(`${API}/tables.php`,{
      method, credentials:"include",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    const d = await r.json();
    if(d.ok){ setOpen(false); load(); } else alert(d.error||"Error");
  }

  async function del(id){
    if(!confirm("Delete table?")) return;
    const r=await fetch(`${API}/tables.php?id=${id}`,{method:"DELETE",credentials:"include"});
    const d=await r.json(); if(d.ok) load(); else alert(d.error||"Error");
  }

  async function toggle(id,status){
    const r=await fetch(`${API}/tables.php`,{
      method:"PUT", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id, status})
    });
    const d=await r.json(); if(d.ok) load(); else alert(d.error||"Error");
  }

  return (
    <div>
      <div className="row" style={{marginBottom:12}}>
        <h1>Tables</h1>
        <button className="btn primary" onClick={add}>Add table</button>
      </div>

      <div className="grid grid-3">
        {rows.map(r=>(
          <div className="card" key={r.id}>
            <div className="body">
              <h3>Table {r.number}</h3>
              <p className="helper">Seats: {r.seats}</p>
              <span className="badge" style={{background:r.status==="free"?"var(--brand-weak)":"var(--primary-weak)", borderColor:r.status==="free"?"var(--brand)":"var(--primary)"}}>
                {r.status}
              </span>
              <div className="row" style={{marginTop:10}}>
                <button className="btn" onClick={()=>edit(r)}>Edit</button>
                <button className="btn" onClick={()=>toggle(r.id, r.status==="free"?"occupied":"free")}>
                  {r.status==="free"?"Set occupied":"Set free"}
                </button>
                <button className="btn danger" onClick={()=>del(r.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {rows.length===0 && <p className="helper">No tables yet.</p>}
      </div>

      {open && (
        <div className="modal-backdrop" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <header><strong>{form.id? "Edit table":"Add table"}</strong></header>
            <form className="grid" style={{gap:10, marginTop:8}} onSubmit={save}>
              <div>
                <label className="label">Number</label>
                <input className="input" type="number" min="1" value={form.number}
                       onChange={e=>setForm({...form,number:+e.target.value||1})} required/>
              </div>
              <div>
                <label className="label">Seats</label>
                <input className="input" type="number" min="1" value={form.seats}
                       onChange={e=>setForm({...form,seats:+e.target.value||1})}/>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="free">free</option>
                  <option value="occupied">occupied</option>
                </select>
              </div>
              <div className="row">
                <button className="btn primary" type="submit">Save</button>
                <button className="btn" type="button" onClick={()=>setOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
