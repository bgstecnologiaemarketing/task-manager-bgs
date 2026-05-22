import { PRI_MAP, memberById, CU_MEMBERS } from "./clickup";

// ── Claude API (para IA / importação em bloco) ────────────────────────────────
export async function callClaude(body) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Erro na API Claude");
  return res.json();
}

// ── ClickUp REST API (via proxy seguro) ───────────────────────────────────────
async function cuGet(path) {
  const res = await fetch(`/api/clickup?path=${encodeURIComponent(path)}`);
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
async function cuPut(path, body) {
  const res = await fetch("/api/clickup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, body }),
  });
  return res.json();
}

// Mapeia prioridade ClickUp → app
function mapPriority(p) {
  if (!p) return "media";
  const v = typeof p === "object" ? String(p.priority) : String(p);
  if (v === "1" || v === "urgent") return "alta";
  if (v === "2" || v === "high")   return "alta";
  if (v === "3" || v === "normal") return "media";
  if (v === "4" || v === "low")    return "baixa";
  return "media";
}

// Mapeia status ClickUp → app
function mapStatus(s) {
  if (!s) return "todo";
  const v = (typeof s === "object" ? s.status || s.type || "" : s).toLowerCase();
  if (v.includes("progress") || v.includes("progresso") || v.includes("andamento") || v === "active") return "doing";
  if (v.includes("review")   || v.includes("revisão")   || v.includes("revisao"))  return "review";
  if (v.includes("done")     || v.includes("complete")  || v.includes("concluí")   || v === "closed") return "done";
  return "todo";
}

// Primeiro assignee que seja membro conhecido
function mapAssignee(assignees) {
  if (!assignees || assignees.length === 0) return "";
  const known = ["242640789", "81406921", "158661063"];
  for (const a of assignees) {
    if (known.includes(String(a.id))) return String(a.id);
  }
  return "";
}

// Converte timestamp ms → YYYY-MM-DD
function msToDate(ms) {
  if (!ms) return "";
  try { return new Date(Number(ms)).toISOString().slice(0, 10); } catch { return ""; }
}

// ── Buscar tarefas reais do ClickUp ───────────────────────────────────────────
export async function fetchClickUpTasks() {
  const SPACE_IDS = ["90112854264", "90113957085"];
  const allTasks = [];

  for (const spaceId of SPACE_IDS) {
    try {
      // Busca listas do space
      const spaceTasks = await cuGet(`/space/${spaceId}/task?include_closed=false&subtasks=false&order_by=due_date&page=0`);
      if (spaceTasks.tasks) allTasks.push(...spaceTasks.tasks);
    } catch {}
  }

  // Se não veio nada por space, tenta por team (workspace)
  if (allTasks.length === 0) {
    try {
      const teamData = await cuGet("/team");
      const teamId = teamData.teams?.[0]?.id;
      if (teamId) {
        const res = await cuGet(`/team/${teamId}/task?include_closed=false&subtasks=false&order_by=due_date&page=0`);
        if (res.tasks) allTasks.push(...res.tasks);
      }
    } catch {}
  }

  return allTasks.map((t) => ({
    id:            t.id,
    title:         t.name,
    description:   t.description || "",
    assigneeId:    mapAssignee(t.assignees),
    dueDate:       msToDate(t.due_date),
    priority:      mapPriority(t.priority),
    status:        mapStatus(t.status),
    listId:        t.list?.id || "",
    clickupTaskId: t.id,
    clickupUrl:    t.url,
  }));
}

// ── Criar tarefa no ClickUp ───────────────────────────────────────────────────
export async function createClickUpTask(task, listId) {
  const member = memberById(task.assigneeId);
  const body = {
    name:        task.title,
    description: task.description || "",
    priority:    { alta: 1, media: 3, baixa: 4 }[task.priority] || 3,
    ...(task.dueDate && { due_date: new Date(task.dueDate + "T12:00:00").getTime() }),
    ...(member && { assignees: [Number(member.id)] }),
  };
  const res = await cuPost(`/list/${listId}/task`, body);
  if (res.id) return { success: true, task_id: res.id, url: res.url };
  return { success: false, error: res.err || "Erro desconhecido" };
}

// ── Parser de texto com IA ────────────────────────────────────────────────────
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
  const raw   = data.content?.find((b) => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("["); const e = clean.lastIndexOf("]");
  return JSON.parse(clean.slice(s, e + 1));
}
