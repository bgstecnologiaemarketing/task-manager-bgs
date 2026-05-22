// Proxy seguro para a API REST do ClickUp
// A chave CLICKUP_API_KEY fica só no servidor (variável de ambiente do Vercel)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    if (!path) return Response.json({ error: "path required" }, { status: 400 });

    const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
      headers: {
        "Authorization": process.env.CLICKUP_API_KEY,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Erro ao conectar ao ClickUp" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { path, body } = await request.json();
    if (!path) return Response.json({ error: "path required" }, { status: 400 });

    const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
      method: "POST",
      headers: {
        "Authorization": process.env.CLICKUP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Erro ao conectar ao ClickUp" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { path, body } = await request.json();
    if (!path) return Response.json({ error: "path required" }, { status: 400 });

    const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
      method: "PUT",
      headers: {
        "Authorization": process.env.CLICKUP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Erro ao conectar ao ClickUp" }, { status: 500 });
  }
}
