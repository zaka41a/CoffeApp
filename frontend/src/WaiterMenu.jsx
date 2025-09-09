import React, { useEffect, useState } from "react";

const API = "http://localhost/CoffeApp/backend/api";
const IMG = "http://localhost/CoffeApp/backend/";

export default function WaiterMenu(){
  const [items,setItems] = useState([]);

  useEffect(()=>{
    fetch(`${API}/menu.php`, { credentials:"include" })
      .then(r=>r.json()).then(setItems);
  },[]);

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1>Menu (view only)</h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))",
        gap:16
      }}>
        {items.map(m=>(
          <div key={m.id} className="card" style={{ overflow:"hidden" }}>
            {m.image_path && (
              <img
                src={IMG + m.image_path}
                alt={m.name}
                style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}
              />
            )}
            <div style={{ padding:12 }}>
              <div style={{ color:"#666", fontSize:13 }}>{m.category}</div>
              <h3 style={{ margin:"6px 0" }}>{m.name}</h3>
              <div style={{ fontWeight:700 }}>{Number(m.price).toFixed(2)} €</div>
              {m.description && <p style={{ color:"#666", fontSize:14 }}>{m.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
