// src/pages/WaiterTables.jsx
import React, { useEffect, useState } from "react";

const API = "http://localhost/CoffeApp/backend/api";

export default function WaiterTables() {
  const [tables, setTables] = useState([]);
  const [openMap, setOpenMap] = useState({});
  const [toast, setToast] = useState("");

  const t = (m) => { setToast(m); setTimeout(() => setToast(""), 1700); };

  async function load() {
    try {
      // 1) liste de toutes les tables
      const r1 = await fetch(`${API}/tables.php`, { credentials: "include" });
      const list = await r1.json().catch(() => []);
      setTables(Array.isArray(list) ? list : []);

      // 2) commandes "ouvertes" (l'API renvoie une ligne par commande)
      const r2 = await fetch(`${API}/orders.php?scope=open_tables`, { credentials: "include" });
      const rows = await r2.json().catch(() => []);

      // 3) agréger par table -> somme des totaux + liste d'IDs
      const map = {};
      (Array.isArray(rows) ? rows : []).forEach(r => {
        const tid = r.table_id;
        if (!tid) return;
        if (!map[tid]) map[tid] = { order_ids: [], total: 0 };
        map[tid].order_ids.push(r.order_id);
        map[tid].total += Number(r.total || 0);
      });
      setOpenMap(map);
    } catch {
      setTables([]);
      setOpenMap({});
    }
  }

  useEffect(() => { load(); }, []);

  // Changer le statut (free/occupied)
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

  // Clôturer toutes les commandes ouvertes d'une table
  async function markFree(orderIds) {
    const ids = Array.isArray(orderIds) ? orderIds : (orderIds ? [orderIds] : []);
    if (ids.length === 0) return;

    try {
      const results = await Promise.all(
        ids.map(id =>
          fetch(`${API}/orders.php?id=${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "paid" }),
          }).then(r => r.json().catch(() => ({})))
        )
      );

      const ok = results.every(r => r && r.ok);
      if (ok) {
        t("Table marked free.");
      } else {
        t("Some bills failed to close.");
      }
      load();
    } catch {
      t("Error");
    }
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
                    <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                      ({open.order_ids.length} order{open.order_ids.length > 1 ? "s" : ""} open)
                    </div>
                    <button
                      className="btn primary"
                      style={{ marginTop: 8 }}
                      onClick={() => markFree(open.order_ids)}
                    >
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
