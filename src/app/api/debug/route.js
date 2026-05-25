export async function GET() {
  const key = process.env.CLICKUP_API_KEY;

  if (!key) {
    return Response.json({ error: "CLICKUP_API_KEY não definida" });
  }

  // Testa endpoint /team
  try {
    const res = await fetch("https://api.clickup.com/api/v2/team", {
      headers: { "Authorization": key, "Content-Type": "application/json" },
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return Response.json({
      key_preview: key.slice(0, 12) + "...",
      status: res.status,
      ok: res.ok,
      response: data,
    });
  } catch (e) {
    return Response.json({ fetch_error: e.message });
  }
}
