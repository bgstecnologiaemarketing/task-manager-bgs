import { PRI_MAP, memberById, CU_MEMBERS } from "./clickup";

export async function callClaude(body) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

// Mapeia prioridade do ClickUp para o padrão do app
function mapPriority(p) {
  if (!p) return "media";
  const v = typeof p === "object" ? p.priority : p;
  if (v === "urgent" || v === "1") return "alta";
  if (v === "high" || v === "2") return "alta";
  if (v === "normal" || v === "3") return "media";
  if (v === "low" || v === "4") return "baixa";
  return "media";
}

// Mapeia status do ClickUp para o padrão do app
function mapStatus(s) {
  if (!s) return "todo";
  const v = (typeof s === "object" ? s.status : s).toLowerCase();
  if (v.includes("progress") || v.includes("progresso") || v.includes("andamento") || v === "active") return "doing";
  if (v.includes("review") || v.includes("revisão") || v.includes("revisao")) return "review";
  if (v.includes("done") || v.includes("complete") || v.includes("concluí") || v.includes("closed")) return "done";
  return "todo";
}

// Busca tarefas reais do ClickUp via Claude MCP
export async function fetchClickUpTasks() {
  const data = await callClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    mcp_servers: [{ type: "url", url: "https://mcp.clickup.com/mcp", name: "clickup" }],
    messages: [{
      role: "user",
      content: `Use the ClickUp MCP to filter tasks from space IDs 90112854264 and 90113957085. Include open tasks only, ordered by due_date. Return ONLY a JSON array with no extra text, no markdown, no backticks. Each item must have exactly these fields:
{
  "id": "<clickup task id>",
  "title": "<task name>",
  "description": "",
  "assigneeId": "<member id as string, or empty string if none - use ONLY these IDs: 242640789=Mateus, 81406921=Lucas, 158661063=Bruno>",
  "dueDate": "<YYYY-MM-DD or empty string>",
  "priority": "<alta|media|baixa>",
  "status": "<todo|doing|review|done>",
  "listId": "<list id>",
  "clickupTaskId": "<same as id>",
  "clickupUrl": "<task url>"
}`
    }],
  });

  try {
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const s = clean.indexOf("[");
    const e = clean.lastIndexOf("]");
    if (s === -1 || e === -1) throw new Error("no array");
    return JSON.parse(clean.slice(s, e + 1));
  } catch {
    return [];
  }
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
