// ─────────────────────────────────────────────────────────────────────────────
// API Route segura — a chave da Anthropic NUNCA vai para o navegador
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "mcp-client-2025-04-04",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
