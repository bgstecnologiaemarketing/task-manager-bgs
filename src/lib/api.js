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

async function cuGet(path) {
  const res = await fetch(`/api/clickup?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`ClickUp ${path} → ${res.status}`);
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

function mapPriority(p) {
  if (!p) return "media";
  const v = typeof p === "object" ? String(p.priority ?? p.id ?? "") : String(p);
  if (v === "1" || v === "urgent") return "alta";
  if (v === "2" || v === "high")   return "alta";
  if (v === "4" || v === "low")    return "baixa";
  return "media";
}

function mapStatus(s) {
  if (!s) return "todo";
  const v = (typeof s === "object" ? (s.status || s.type || "") : s).toLowerCase();
  if (v.includes("progress") || v.includes("progresso") || v.includes("andamento")) return "doing";
  if (v.includes("review")   || v.includes("revisão")   || v.includes("revisao"))   return "review";
  if (v.includes("done")     || v.includes("complete")  || v.includes("concluí")    || v === "closed") return "done";
  return "todo";
}

function mapAssignee(assignees) {
  if (!assignees?.length) return "";
  const known = ["242640789", "81406921", "158661063"];
  for (const a of assignees) {
    if (known.includes(String(a.id))) return String(a.id);
  }
  return "";
}

function msToDate(ms) {
  if (!ms) return "";
  try { return new Date(Number(ms)).toISOString().slice(0, 10); } catch { return ""; }
}

function toAppTask(t, listName) {
  return {
    id:            t.id,
    title:         t.name || "",
    description:   t.description || "",
    assigneeId:    mapAssignee(t.assignees),
    dueDate:       msToDate(t.due_date),
    priority:      mapPriority(t.priority),
    status:        mapStatus(t.status),
    listId:        t.list?.id || "",
    listName:      listName || t.list?.name || "",
    clickupTaskId: t.id,
    clickupUrl:    t.url || "",
  };
}

// Busca todas as páginas de uma list, ignorando listas de "Subelementos"
async function fetchListTasks(listId, listName) {
  if (listName?.toLowerCase().startsWith("subelement")) return [];
  const tasks = [];
  let page = 0;
  while (true) {
    try {
      const res = await cuGet(
        `/list/${listId}/task?include_closed=false&subtasks=false&order_by=due_date&page=${page}`
      );
      const batch = res.tasks || [];
      tasks.push(...batch);
      if (batch.length < 100) break;
      page++;
      if (page > 9) break; // máx 1000 por lista
    } catch { break; }
  }
  return tasks;
}

export async function fetchClickUpTasks() {
  const TEAM_ID = "9011786898";
  const allTasks = [];
  const seenIds = new Set();

  const spacesRes = await cuGet(`/team/${TEAM_ID}/space?archived=false`);
  const spaces = spacesRes.spaces || [];

  for (const space of spaces) {
    // Folders → lists → tasks
    const foldersRes = await cuGet(`/space/${space.id}/folder?archived=false`);
    for (const folder of (foldersRes.folders || [])) {
      const listsRes = await cuGet(`/folder/${folder.id}/list?archived=false`);
      for (const list of (listsRes.lists || [])) {
        const tasks = await fetchListTasks(list.id, list.name);
        for (const t of tasks) {
          if (!seenIds.has(t.id)) {
            seenIds.add(t.id);
            allTasks.push(toAppTask(t, `${folder.name} / ${list.name}`));
          }
        }
      }
    }

    // Folderless lists → tasks (ignorar "Subelementos de ...")
    const flRes = await cuGet(`/space/${space.id}/list?archived=false`);
    for (const list of (flRes.lists || [])) {
      if (list.name?.toLowerCase().startsWith("subelement")) continue;
      const tasks = await fetchListTasks(list.id, list.name);
      for (const t of tasks) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          allTasks.push(toAppTask(t, list.name));
        }
      }
    }
  }

  // Ordena: sem prazo por último, depois por data mais próxima
  allTasks.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return allTasks;
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
