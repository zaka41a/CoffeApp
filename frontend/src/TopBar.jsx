import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function TopBar({ me, onLogout }) {
  const { pathname } = useLocation();

  const isAdmin = pathname.startsWith("/admin");
  const isWaiter = pathname.startsWith("/waiter") || (!isAdmin && me?.role === "waiter");

  const links = isAdmin
    ? [
        { to: "/admin", label: "Home", end: true },
        { to: "/admin/tables", label: "Tables" },
        { to: "/admin/menu", label: "Menu" },
        { to: "/admin/waiters", label: "Waiters" },
      ]
    : [
        { to: "/waiter", label: "Home", end: true },
        { to: "/waiter/tables", label: "Tables" },
        { to: "/waiter/menu", label: "Menu" },
        { to: "/orders", label: "Orders" },
      ];

  return (
    <header className="tb">
      <div className="brand">
        <span className="emoji">☕</span> CoffeApp
      </div>

      <nav className="tabs">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={!!l.end}
            className={({ isActive }) => "pill" + (isActive ? " active" : "")}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="right">
        <span className="hello">Hello, {me?.full_name || me?.name || "user"}</span>
        <button className="btn danger" onClick={onLogout}>Logout</button>
      </div>

      {/* Styles scoped au TopBar */}
      <style>{`
        .tb{
          position:sticky; top:0; z-index:40;
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; padding:10px 16px; background:#fff; border-bottom:1px solid #eef2f7;
        }
        .brand{ font-weight:800; color:#0f172a; letter-spacing:.2px; display:flex; align-items:center; gap:8px; }
        .emoji{ font-size:18px; }

        .tabs{ display:flex; gap:12px; }
        .pill{
          display:inline-flex; align-items:center; justify-content:center;
          padding:9px 18px; border:1.5px solid #cfe3ff; color:#1d4ed8; background:#f8fbff;
          border-radius:20px; font-weight:700; text-decoration:none; transition:all .15s ease;
          box-shadow: 0 0 0 0 rgba(22,163,74,0);
        }
        .pill:hover{ background:#eef6ff; }
        .pill.active{
          background:#16a34a; border-color:#16a34a; color:#fff;
          box-shadow: 0 6px 12px rgba(22,163,74,.25);
        }

        .right{ display:flex; align-items:center; gap:12px; }
        .hello{ color:#334155; }
        .btn{
          border:1px solid #e5e7eb; background:#fff; color:#111827;
          padding:8px 12px; border-radius:10px; cursor:pointer; transition:all .15s ease;
        }
        .btn:hover{ background:#f3f4f6; }
        .btn.danger{ background:#ef4444; border-color:#ef4444; color:#fff; }
        .btn.danger:hover{ background:#dc2626; border-color:#dc2626; }
      `}</style>
    </header>
  );
}
