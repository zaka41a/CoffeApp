// frontend/src/AdminWaiters.jsx
import React, { useEffect, useState } from "react";
import { API, fetchJSON } from "./_api";

export default function AdminWaiters(){
  const [list,setList] = useState([]);
  const [toast,setToast] = useState("");
  const [form,setForm] = useState({ full_name:"", email:"", password:"", phone:"" });
  const [editOpen,setEditOpen] = useState(false);
  const [edit,setEdit] = useState({ id:0, full_name:"", email:"", phone:"", password:"" });
  const t=(m)=>{ setToast(m); setTimeout(()=>setToast(""),1600); };

  const load = async()=>{ const d = await fetchJSON(`${API}/waiters.php`).catch(()=>[]); setList(Array.isArray(d)?d:[]); };
  useEffect(()=>{ load(); },[]);

  const create = async(e)=>{ e.preventDefault();
    const d = await fetchJSON(`${API}/waiters.php`,{
      method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form)
    });
    if(d.ok){ setForm({full_name:"",email:"",password:"",phone:""}); t("Waiter created."); load(); } else t(d.error||"Error"); };

  const del = async(id)=>{ if(!confirm("Delete this waiter?")) return;
    const d = await fetchJSON(`${API}/waiters.php?id=${id}`,{method:"DELETE"});
    if(d.ok){ t("Deleted."); load(); } else t(d.error||"Error"); };

  const saveEdit = async(e)=>{ e.preventDefault();
    const d = await fetchJSON(`${API}/waiters.php?id=${edit.id}`,{
      method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(edit)
    });
    if(d.ok){ setEditOpen(false); t("Updated."); load(); } else t(d.error||"Error"); };

  return (
    <>
      <h1>Waiters</h1>

      <form className="card" onSubmit={create} style={{maxWidth:640}}>
        <div className="body">
          <h3 style={{marginTop:0}}>Add a waiter</h3>
          <input className="input" placeholder="Full name" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} required/>
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <button className="btn primary" type="submit">Create waiter</button>
        </div>
      </form>

      <h3 style={{marginTop:18}}>Existing waiters</h3>
      {list.length===0 ? <p className="muted">No waiter yet.</p> : (
        <div className="card">
          <div className="body" style={{overflowX:"auto"}}>
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {list.map(w=>(
                  <tr key={w.id}>
                    <td>{w.full_name}</td>
                    <td>{w.email}</td>
                    <td>{w.phone || "-"}</td>
                    <td>{w.created_at || ""}</td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button className="btn" onClick={()=>{setEdit({id:w.id,full_name:w.full_name,email:w.email,phone:w.phone||"",password:""});setEditOpen(true);}}>Edit</button>
                        <button className="btn danger" onClick={()=>del(w.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="modal-overlay" onClick={()=>setEditOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h3 style={{margin:0}}>Edit waiter</h3>
              <button className="btn ghost" onClick={()=>setEditOpen(false)}>✕</button>
            </div>
            <form className="vstack" onSubmit={saveEdit}>
              <label className="lbl">Full name</label>
              <input className="inp" value={edit.full_name} onChange={e=>setEdit({...edit,full_name:e.target.value})} required/>
              <label className="lbl">Email</label>
              <input className="inp" type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} required/>
              <label className="lbl">Phone</label>
              <input className="inp" value={edit.phone} onChange={e=>setEdit({...edit,phone:e.target.value})}/>
              <label className="lbl">New password (optional)</label>
              <input className="inp" type="password" value={edit.password} onChange={e=>setEdit({...edit,password:e.target.value})}/>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button type="button" className="btn ghost" onClick={()=>setEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn success">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </>
  );
}
