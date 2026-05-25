import { memberById, CU_MEMBERS } from "./clickup";

export async function callClaude(body) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Erro na API Claude");
  return res.json();
}

async function cuPost(path, body) {
  const res = await fetch("/api/clickup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, body }),
  });
  return res.json();
}

// Busca tarefas via rota server-side /api/tasks (sem timeout de browser)
export async function fetchClickUpTasks() {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error(`/api/tasks falhou: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.tasks || [];
}

export async function createClickUpTask(task, listId) {
  const member = memberById(task.assigneeId);
  const body = {
    name:        task.title,
    description: task.description || "",
    priority:    { alta: 2, media: 3, baixa: 4 }[task.priority] ?? 3,
    ...(task.dueDate && { due_date: new Date(task.dueDate + "T12:00:00").getTime(), due_date_time: false }),
    ...(member   && { assignees: [Number(member.id)] }),
  };
  const res = await cuPost(`/list/${listId}/task`, body);
  if (res.id) return { success: true, task_id: res.id, url: res.url };
  return { success: false, error: res.err || JSON.stringify(res) };
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
- assigneeId: string (ID se identificado, senão ""). Membros: ${memberList}
- dueDate: YYYY-MM-DD ou ""
- priority: "alta"|"media"|"baixa"
- status: "todo"
- listId: ""
Retorne APENAS array JSON válido, sem texto extra.
Texto: ${text}`,
    }],
  });
  const raw   = data.content?.find((b) => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("["); const e = clean.lastIndexOf("]");
  return JSON.parse(clean.slice(s, e + 1));
}
