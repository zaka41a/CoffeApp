import React, { useEffect, useState } from "react";
const API = "http://localhost/CoffeApp/backend/api";

export default function AdminTables() {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, number: "", seats: "", status: "free" });
  const [confirmDel, setConfirmDel] = useState(null); // {id, label}

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  async function load() {
    try {
      const r = await fetch(`${API}/tables.php`, { credentials: "include" });
      const d = await r.json().catch(() => []);
      setList(Array.isArray(d) ? d : []);
    } catch { setList([]); }
  }
  useEffect(() => { load(); }, []);

  // ---------- CRUD ----------
  function openAdd() {
    setForm({ id: null, number: "", seats: "", status: "free" });
    setShowForm(true);
  }
  function openEdit(t) {
    setForm({ id: t.id, number: t.number, seats: t.seats, status: t.status });
    setShowForm(true);
  }

  async function saveForm(e) {
    e.preventDefault();
    const payload = {
      number: Number(form.number),
      seats: Number(form.seats),
      status: form.status || "free",
      ...(form.id ? { id: form.id } : {}),
    };
    // ⚠️ backend/tables.php doit accepter PATCH (ou mets "PUT" si tu n'as pas mis à jour le backend)
    const method = form.id ? "PATCH" : "POST";

    const r = await fetch(`${API}/tables.php`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      setShowForm(false);
      notify(form.id ? "Table updated ✅" : "Table created ✅");
      load();
    } else notify(d.error || "Error");
  }

  async function toggleStatus(id, status) {
    const r = await fetch(`${API}/tables.php`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) { notify("Status updated ✅"); load(); } else notify(d.error || "Error");
  }

  async function doDelete(id) {
    const r = await fetch(`${API}/tables.php?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const d = await r.json().catch(() => ({}));
    setConfirmDel(null);
    if (d.ok) { notify("Table deleted 🗑️"); load(); } else notify(d.error || "Error");
  }

  return (
    <>
      <h1>Tables</h1>

      <button className="btn primary" style={{ marginBottom: 14 }} onClick={openAdd}>
        Add table
      </button>

      <div className="grid-3">
        {list.map((tab) => (
          <div className="card" key={tab.id}>
            <div className="body">
              <h3>Table {tab.number ?? tab.id}</h3>
              <p>Seats: {tab.seats}</p>
              <p>
                {tab.status === "free"
                  ? <span className="badge free">Free</span>
                  : <span className="badge occupied">Occupied</span>}
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn success" onClick={() => openEdit(tab)}>Edit</button>

                {tab.status === "free" ? (
                  <button className="btn ghost" onClick={() => toggleStatus(tab.id, "occupied")}>
                    Set occupied
                  </button>
                ) : (
                  <button className="btn ghost" onClick={() => toggleStatus(tab.id, "free")}>
                    Set free
                  </button>
                )}

                <button
                  className="btn danger"
                  onClick={() => setConfirmDel({ id: tab.id, label: `Table ${tab.number ?? tab.id}` })}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------- Modal Form (Add/Edit) -------- */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{form.id ? "Edit table" : "Add table"}</h3>

            <form onSubmit={saveForm} className="vstack">
              <label className="lbl">Number</label>
              <input
                className="inp"
                type="number"
                min="1"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                required
              />

              <label className="lbl">Seats</label>
              <input
                className="inp"
                type="number"
                min="1"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                required
              />

              <label className="lbl">Status</label>
              <select
                className="inp"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="free">free</option>
                <option value="occupied">occupied</option>
              </select>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn primary" type="submit">
                  {form.id ? "Save changes" : "Create"}
                </button>
                <button type="button" className="btn ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- Confirm Delete Modal -------- */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Delete table</h3>
            <p>Are you sure you want to delete <strong>{confirmDel.label}</strong>?</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn danger" onClick={() => doDelete(confirmDel.id)}>Delete</button>
              <button className="btn ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* -------- Toast -------- */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      )}
    </>
  );
}
