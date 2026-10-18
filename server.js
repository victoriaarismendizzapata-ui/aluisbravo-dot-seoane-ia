const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

function send(res, status, type, body) {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/status") {
    return send(res, 200, "application/json; charset=utf-8", JSON.stringify({
      ok: true,
      app: "SeoaIA",
      aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      note: process.env.OPENAI_API_KEY ? "Proveedor configurado" : "Falta configurar OPENAI_API_KEY en Render"
    }));
  }

  if (url.pathname === "/api/chat" && req.method === "POST") {
    if (!process.env.OPENAI_API_KEY) {
      return send(res, 503, "application/json; charset=utf-8", JSON.stringify({
        error: "La IA todavía no está configurada. El administrador debe añadir OPENAI_API_KEY en Render."
      }));
    }
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 100000) req.destroy(); });
    req.on("end", async () => {
      try {
        const body = JSON.parse(raw || "{}");
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        if (!messages.length) return send(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Escribe una consulta." }));
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres SeoaIA, asistente educativo del IESTP Manuel Seoane Corrales en Perú. Responde en español claro. No inventes horarios, sílabos, notas, trámites ni datos institucionales. Si no tienes información verificada, dilo con claridad. No afirmes que accedes a datos privados de estudiantes." },
              ...messages.filter(m => ["user", "assistant"].includes(m.role) && typeof m.content === "string").map(m => ({ role: m.role, content: m.content.slice(0, 8000) }))
            ]
          })
        });
        const data = await response.json();
        if (!response.ok) return send(res, response.status, "application/json; charset=utf-8", JSON.stringify({ error: data.error?.message || "El proveedor de IA devolvió un error." }));
        return send(res, 200, "application/json; charset=utf-8", JSON.stringify({ reply: data.choices?.[0]?.message?.content || "No recibí una respuesta." }));
      } catch (err) {
        return send(res, 500, "application/json; charset=utf-8", JSON.stringify({ error: "No se pudo procesar la consulta." }));
      }
    });
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const target = path.resolve(ROOT, "." + pathname);
  if (!target.startsWith(ROOT + path.sep) && target !== ROOT) return send(res, 403, "text/plain; charset=utf-8", "Acceso denegado");
  fs.readFile(target, (err, data) => {
    if (err) return send(res, 404, "text/plain; charset=utf-8", "Página no encontrada");
    send(res, 200, MIME[path.extname(target)] || "application/octet-stream", data);
  });
});

server.listen(PORT, "0.0.0.0", () => console.log("SeoaIA activo en el puerto " + PORT));
