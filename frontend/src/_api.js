// frontend/src/_api.js  (nouveau helper – importez-le où besoin)
const HOST =
  window.location.hostname === "127.0.0.1" ? "http://127.0.0.1" : "http://localhost";
// ⚠️ mettez le NOM EXACT du dossier PHP ci-dessous (sensible à la casse si votre FS l’est)
const APP_DIR = "CoffeApp"; // ou "coffeeapp" si votre dossier s'appelle ainsi

export const API = `${HOST}/${APP_DIR}/backend/api`;
export const IMG = `${HOST}/${APP_DIR}/backend/`;
export const fetchJSON = (url, opts = {}) =>
  fetch(url, { credentials: "include", ...opts }).then((r) =>
    r.json().catch(() => ({}))
  );
