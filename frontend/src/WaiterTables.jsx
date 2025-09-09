import React, { useEffect, useState } from "react";

const API = "http://localhost/CoffeApp/backend/api";

export default function WaiterTables() {
  const [tables, setTables] = useState([]);
  const [openMap, setOpenMap] = useState({});
  const [toast, setToast] = useState("");

  const t = (m) => { setToast(m); setTimeout(() => setToast(""), 1700); };

  async function load() {
    try {
      // liste de toutes les tables
      const r1 = await fetch(`${API}/tables.php`, { credentials: "include" });
      const list = await r1.json().catch(() => []);
      setTables(Array.isArray(list) ? list : []);

      // récap commandes ouvertes par table
      const r2 = await fetch(`${API}/orders.php?scope=open_tables`, { credentials: "include" });
      const rows = await r2.json().catch(() => []);
      const map = {};
      (Array.isArray(rows) ? rows : []).forEach(r => {
        if (r.table_id) map[r.table_id] = { order_id: r.order_id, total: Number(r.total || 0) };
      });
      setOpenMap(map);
    } catch {
      setTables([]);
      setOpenMap({});
    }
  }
  useEffect(() => { load(); }, []);

  // Changer le statut (autorisé au serveur, mais sans créer/modifier la table)
  async function toggleStatus(id, next) {
    const r = await fetch(`${API}/tables.php`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) { t("Status updated."); load(); } else { t(d.error || "Error"); }
  }

  // Clôturer l’addition et libérer la table
  async function markFree(orderId) {
    if (!orderId) return;
    const r = await fetch(`${API}/orders.php?id=${orderId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) { t("Table marked free."); load(); } else { t(d.error || "Error"); }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1>Tables</h1>

      <div className="grid-3">
        {tables.map(tb => {
          const open = openMap[tb.id] || null;
          const next = tb.status === "free" ? "occupied" : "free";
          return (
            <div className="card" key={tb.id}>
              <div className="body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>Table {tb.number ?? tb.id}</h3>
                  <span className={`badge ${tb.status === "free" ? "free" : "occupied"}`}>
                    {tb.status}
                  </span>
                </div>
                <div className="muted" style={{ marginTop: 4 }}>Seats: {tb.seats}</div>

                {open ? (
                  <>
                    <div style={{ marginTop: 10, fontWeight: 700 }}>
                      Open bill: {open.total.toFixed(2)} €
                    </div>
                    <button className="btn primary" style={{ marginTop: 8 }}
                            onClick={() => markFree(open.order_id)}>
                      Close & mark free
                    </button>
                  </>
                ) : (
                  <div className="muted" style={{ marginTop: 10 }}>No open bill.</div>
                )}

                <div style={{ marginTop: 10 }}>
                  <button className="btn ghost" onClick={() => toggleStatus(tb.id, next)}>
                    Set {next}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tables.length === 0 && <p className="helper">No tables.</p>}
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
