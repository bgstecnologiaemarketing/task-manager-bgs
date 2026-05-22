// ─────────────────────────────────────────────────────────────────────────────
// Todas as chamadas de IA passam por /api/claude (server-side)
// A chave da Anthropic nunca fica no browser
// ─────────────────────────────────────────────────────────────────────────────
import { PRI_MAP, memberById } from "./clickup";

export async function callClaude(body) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function createClickUpTask(task, listId) {
  const member = memberById(task.assigneeId);
  const data = await callClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    mcp_servers: [{ type: "url", url: "https://mcp.clickup.com/mcp", name: "clickup" }],
    messages: [{
      role: "user",
      content: `Create a ClickUp task with these details:
- list_id: ${listId}
- name: ${task.title}
- description: ${task.description || ""}
- priority: ${PRI_MAP[task.priority] || "normal"}
${task.dueDate ? `- due_date: ${task.dueDate}` : ""}
${member ? `- assignees: ["${member.id}"]` : ""}

Reply ONLY with JSON: {"success":true,"task_id":"<id>","url":"<url>"}
On failure: {"success":false,"error":"<reason>"}`,
    }],
  });
  try {
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const s = clean.indexOf("{"); const e = clean.lastIndexOf("}");
    if (s !== -1 && e !== -1) return JSON.parse(clean.slice(s, e + 1));
  } catch {}
  return { success: true };
}

export async function parseTasks(text) {
  const { CU_MEMBERS } = await import("./clickup");
  const memberList = CU_MEMBERS.map((m) => `"${m.name}" → "${m.id}"`).join(", ");
  const data = await callClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `Analise o texto e extraia TODAS as tarefas. Para cada uma retorne JSON com:
- title: string (max 80 chars)
- description: string (ou "")
- assigneeId: string (ID do membro se identificado pelo nome, senão "")
  Membros: ${memberList}
- dueDate: YYYY-MM-DD ou ""
- priority: "alta"|"media"|"baixa"
- status: "todo"
- listId: ""

Retorne APENAS array JSON válido, sem texto extra.
Texto: ${text}`,
    }],
  });
  const raw = data.content?.find((b) => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("["); const e = clean.lastIndexOf("]");
  return JSON.parse(clean.slice(s, e + 1));
}
