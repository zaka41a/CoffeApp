// frontend/src/AdminMenu.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API, IMG, fetchJSON } from "./_api";

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ id:null, name:"", category_id:"", price:"", description:"", photo:null });
  const t = (m)=>{ setToast(m); setTimeout(()=>setToast(""),1600); };

  async function load(){
    const a = await fetchJSON(`${API}/menu.php`).catch(()=>[]);
    const b = await fetchJSON(`${API}/categories.php`).catch(()=>[]);
    setItems(Array.isArray(a)?a:[]);
    setCats(Array.isArray(b)?b:[]);
  }
  useEffect(()=>{ load(); },[]);
  const isEditing = useMemo(()=>!!form.id,[form.id]);

  const openAdd = ()=>{ setForm({id:null,name:"",category_id:"",price:"",description:"",photo:null}); setOpen(true); };
  const openEdit = (m)=>{ setForm({ id:m.id, name:m.name||"", category_id:String(m.category_id||""), price:String(m.price??""), description:m.description||"", photo:null }); setOpen(true); };
  const del = async(id)=>{ if(!confirm("Delete this item?")) return;
    const d = await fetchJSON(`${API}/menu.php?id=${id}`,{method:"DELETE"});
    if(d.ok){ t("Deleted."); load(); } else t(d.error||"Error"); };

  const save = async(e)=>{ e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category_id", form.category_id);
    fd.append("price", form.price);
    fd.append("description", form.description);
    if(form.photo){ fd.append("photo", form.photo); fd.append("image", form.photo); }
    const url = isEditing ? `${API}/menu.php?id=${form.id}&_method=PUT` : `${API}/menu.php`;
    const r = await fetch(url, { method:"POST", credentials:"include", body:fd });
    const d = await r.json().catch(()=>({}));
    if(d.ok){ setOpen(false); t(isEditing?"Updated.":"Created."); load(); } else t(d.error||"Error");
  };

  return (
    <div className="container">
      <div className="row" style={{marginBottom:12}}>
        <h1>Menu</h1>
        <button className="btn success" onClick={openAdd}>Add item</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {items.map(m=>(
          <div key={m.id} className="card" style={{overflow:"hidden"}}>
            {m.image_path && <img src={IMG+m.image_path} alt={m.name} style={{width:"100%",height:140,objectFit:"cover"}}/>}
            <div className="body">
              <div className="muted" style={{fontSize:13}}>{m.category}</div>
              <h3 style={{margin:"6px 0"}}>{m.name}</h3>
              <div style={{fontWeight:700}}>{Number(m.price).toFixed(2)} €</div>
              {m.description && <p className="muted" style={{marginTop:6}}>{m.description}</p>}
              <div className="row" style={{marginTop:8}}>
                <button className="btn" onClick={()=>openEdit(m)}>Edit</button>
                <button className="btn danger" onClick={()=>del(m.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length===0 && <p className="muted" style={{gridColumn:"1/-1"}}>No items yet.</p>}
      </div>

      {open && (
        <div className="modal-overlay" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h3 style={{margin:0}}>{isEditing?"Edit item":"Add a menu item"}</h3>
              <button className="btn ghost" onClick={()=>setOpen(false)}>✕</button>
            </div>
            <form className="vstack" onSubmit={save}>
              <label className="lbl">Name</label>
              <input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>

              <label className="lbl">Category</label>
              <select className="inp" value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))} required>
                <option value="">— choose —</option>
                {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <label className="lbl">Price (€)</label>
              <input className="inp" type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} required/>

              <label className="lbl">Description</label>
              <textarea className="inp" rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>

              <label className="lbl">Photo</label>
              <input className="inp" type="file" accept="image/*" onChange={e=>setForm(f=>({...f,photo:e.target.files?.[0]||null}))}/>

              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button type="button" className="btn ghost" onClick={()=>setOpen(false)}>Cancel</button>
                <button type="submit" className="btn success">{isEditing?"Save changes":"Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </div>
  );
}
