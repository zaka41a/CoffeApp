import React, { useEffect, useState } from "react";

const API = "http://localhost/CoffeApp/backend/api";
const IMG = "http://localhost/CoffeApp/backend/";

export default function OrdersPage() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tableId, setTableId] = useState("");
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");

  const toastify = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  useEffect(() => {
    async function load() {
      try {
        const [rT, rM] = await Promise.all([
          fetch(`${API}/tables.php`, { credentials: "include" }),
          fetch(`${API}/menu.php`,   { credentials: "include" }),
        ]);
        const t = await rT.json().catch(() => []);
        const m = await rM.json().catch(() => []);
        setTables(Array.isArray(t) ? t : []);
        setMenu(Array.isArray(m) ? m : []);
      } catch {
        setTables([]); setMenu([]);
      }
    }
    load();
  }, []);

  function addItem(m) {
    setCart(cs => {
      const i = cs.findIndex(x => x.id === m.id);
      if (i >= 0) {
        const copy = [...cs];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...cs, { id: m.id, name: m.name, price: Number(m.price), qty: 1 }];
    });
  }
  const dec = (id) => setCart(cs => cs.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty - 1) } : c));
  const remove = (id) => setCart(cs => cs.filter(c => c.id !== id));
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  async function submit() {
    if (!tableId) { toastify("Please choose a table."); return; }
    if (cart.length === 0) { toastify("Cart is empty."); return; }
    const r = await fetch(`${API}/orders.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_id: Number(tableId),
        items: cart.map(c => ({ menu_item_id: c.id, qty: c.qty })),
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      setCart([]);
      toastify("Order placed successfully.");
    } else {
      toastify(d.error || "Error");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* ---------------- Left: Menu ---------------- */}
        <div>
          <h2 style={{ marginTop: 0 }}>Create order</h2>

          <div style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <label className="muted">Table</label>
            <select className="select" value={tableId} onChange={e => setTableId(e.target.value)}>
              <option value="">-- choose --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Table {t.number} ({t.seats}) — {t.status}
                </option>
              ))}
            </select>
          </div>

          {menu.length === 0 ? (
            <p className="muted">No items.</p>
          ) : (
            <div className="grid-3">
              {menu.map(m => (
                <div key={m.id} className="card" style={{ overflow: "hidden" }}>
                  {m.image_path && (
                    <img
                      src={IMG + m.image_path}
                      alt={m.name}
                      style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div className="body" style={{ paddingBottom: 12 }}>
                    <div className="muted" style={{ fontSize: 12 }}>{m.category}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: "6px 0" }}>{m.name}</h3>
                      <strong>{Number(m.price).toFixed(2)} €</strong>
                    </div>
                    {m.description && <div className="muted" style={{ fontSize: 13 }}>{m.description}</div>}
                    <div style={{ marginTop: 10 }}>
                      <button className="btn success" onClick={() => addItem(m)}>Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- Right: Cart ---------------- */}
        <aside>
          <div className="card">
            <div className="body">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="cart">🧺</span>
                <strong>Cart</strong>
              </div>

              {cart.length === 0 ? (
                <p className="muted" style={{ marginTop: 8 }}>Empty</p>
              ) : (
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {cart.map(c => (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <div>
                        <div>{c.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {c.qty} × {c.price.toFixed(2)} €
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn ghost" onClick={() => dec(c.id)}>-</button>
                        <button className="btn ghost" onClick={() => addItem({ id: c.id, name: c.name, price: c.price })}>+</button>
                        <button className="btn danger" onClick={() => remove(c.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Total:</strong>
                <strong>{total.toFixed(2)} €</strong>
              </div>

              <button className="btn primary" style={{ marginTop: 10 }} onClick={submit}>
                Validate order
              </button>
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
