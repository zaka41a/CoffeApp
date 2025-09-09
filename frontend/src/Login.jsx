import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost/CoffeApp/backend/api";

export default function Login({ onLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/login.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && (data.success || data.ok) && data.user) {
        onLoggedIn?.(data.user);
        navigate(data.user.role === "admin" ? "/admin" : "/waiter", { replace: true });
      } else {
        setErr(data.message || data.error || "Login failed");
      }
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        display: "grid",
        placeItems: "center",
        backgroundImage: "url('/img/back_home.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* voile / gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.45))",
        }}
      />

      {/* carte de login */}
      <form
        onSubmit={submit}
        style={{
          width: 420,
          background: "rgba(255,255,255,0.94)",
          color: "#111",
          borderRadius: 14,
          padding: 26,
          boxShadow: "0 18px 50px rgba(0,0,0,.25)",
          backdropFilter: "blur(2px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 6 }}>☕ CoffeApp</h2>
        <p style={{ marginTop: 0, color: "#666" }}>Secure access</p>

        {err && (
          <div
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: "8px 10px",
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {err}
          </div>
        )}

        <label style={{ fontSize: 14 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #dcdcdc",
            marginBottom: 12,
            outline: "none",
          }}
        />

        <label style={{ fontSize: 14 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 74px 10px 10px",
              borderRadius: 8,
              border: "1px solid #dcdcdc",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 8,
              top: 7,
              border: 0,
              background: "transparent",
              color: "#555",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 6,
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <button
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: "#16a34a",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.8 : 1,
            transition: "opacity .15s ease",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: "#e7e7e7", textAlign: "center" }}>
          © 2025 CoffeApp
        </div>
      </form>
    </div>
  );
}
