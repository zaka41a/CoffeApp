import React, { useEffect, useState } from "react";
const API = "http://localhost/CoffeApp/backend/api";
const IMG_BASE = "http://localhost/CoffeApp/backend/";

export default function MenuPage(){
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const empty = {id:null,name:"",category:"",price:"",description:"",file:null};
  const [form,setForm]=useState(empty);

  function load(){
    fetch(`${API}/menu.php`,{credentials:"include"})
      .then(async r=>{
        const data = await r.json().catch(()=>[]);
        setItems(Array.isArray(data)? data : []);
      });
  }
  useEffect(load,[]);

  function add(){ setForm(empty); setOpen(true); }

  async function save(e){
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);     // texte → back fait le lookup
    fd.append("description", form.description ?? "");
    fd.append("price", form.price);
    if(form.file) fd.append("photo", form.file);

    const r = await fetch(`${API}/menu.php`,{
      method:"POST", credentials:"include", body: fd
    });
    const d = await r.json();
    if(d.ok){ setOpen(false); load(); } else alert(d.error||"Error");
  }

  async function delItem(id){
    if(!confirm("Delete item?")) return;
    const r=await fetch(`${API}/menu.php?id=${id}`,{method:"DELETE",credentials:"include"});
    const d=await r.json(); if(d.ok) load(); else alert(d.error||"Error");
  }

  return (
    <div>
      <div className="row" style={{marginBottom:12}}>
        <h1>Menu</h1>
        <button className="btn primary" onClick={add}>Add item</button>
      </div>

      {items.length===0 && <p className="helper">No items yet.</p>}

      <div className="grid grid-3">
        {items.map(it=>(
          <div className="card" key={it.id} style={{overflow:"hidden"}}>
            {it.image_path && (
              <img src={IMG_BASE + it.image_path} alt={it.name}
                   style={{width:"100%", height:160, objectFit:"cover"}}/>
            )}
            <div className="body">
              <div className="muted" style={{fontSize:13}}>{it.category}</div>
              <h3 style={{margin:"6px 0"}}>{it.name}</h3>
              <div style={{fontWeight:700}}>{(+it.price).toFixed(2)} €</div>
              {it.description && <p className="helper">{it.description}</p>}
              <div className="row" style={{marginTop:8}}>
                {/* edit à ajouter plus tard */}
                <button className="btn danger" onClick={()=>delItem(it.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="modal-backdrop" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <header><strong>Add item</strong></header>
            <form className="grid" style={{gap:10, marginTop:8}} onSubmit={save}>
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
              </div>
              <div className="row" style={{gap:10}}>
                <div style={{flex:1}}>
                  <label className="label">Category</label>
                  <input className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required/>
                </div>
                <div style={{width:180}}>
                  <label className="label">Price (€)</label>
                  <input className="input" type="number" step="0.01" min="0"
                         value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description}
                          onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <div>
                <label className="label">Photo</label>
                <input className="file" type="file" accept="image/*"
                       onChange={e=>setForm({...form,file:e.target.files?.[0]||null})}/>
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
