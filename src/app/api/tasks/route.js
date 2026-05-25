// Rota server-side — busca todas as tarefas do ClickUp no servidor
// Timeout de 60s (muito mais que os 10s do browser)

const SKIP_LIST_IDS = new Set([
  "901107728057",
  "901107728271",
  "901107729150",
  "901107728398",
  "901107727779",
  "901107727612",
]);

function mapPriority(p) {
  if (!p) return "media";
  const v = typeof p === "object" ? String(p.priority ?? p.id ?? "") : String(p);
  if (v === "1" || v === "urgent" || v === "2" || v === "high") return "alta";
  if (v === "4" || v === "low") return "baixa";
  return "media";
}

function mapStatus(s) {
  if (!s) return "todo";
  const v = (typeof s === "object" ? (s.status || s.type || "") : s).toLowerCase();
  if (v.includes("progress") || v.includes("progresso") || v.includes("andamento")) return "doing";
  if (v.includes("review") || v.includes("revisão") || v.includes("revisao")) return "review";
  if (v.includes("done") || v.includes("complete") || v.includes("concluí") || v === "closed") return "done";
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

async function cuGet(key, path) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    headers: { "Authorization": key, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`ClickUp ${path} → ${res.status}`);
  return res.json();
}

async function fetchListTasks(key, listId, listLabel) {
  if (!listLabel || listLabel.toLowerCase().startsWith("subelement")) return [];
  if (SKIP_LIST_IDS.has(listId)) return [];
  const tasks = [];
  let page = 0;
  while (true) {
    try {
      const res = await cuGet(key, `/list/${listId}/task?include_closed=false&subtasks=false&order_by=due_date&page=${page}`);
      const batch = res.tasks || [];
      tasks.push(...batch);
      if (batch.length < 100) break;
      page++;
      if (page > 4) break;
    } catch { break; }
  }
  return tasks;
}

export async function GET() {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) return Response.json({ error: "CLICKUP_API_KEY não definida" }, { status: 500 });

  try {
    const TEAM_ID = "9011786898";
    const allTasks = [];
    const seenIds = new Set();

    const addTasks = (tasks, label) => {
      for (const t of tasks) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          allTasks.push({
            id:            t.id,
            title:         t.name || "",
            description:   t.description || "",
            assigneeId:    mapAssignee(t.assignees),
            dueDate:       msToDate(t.due_date),
            priority:      mapPriority(t.priority),
            status:        mapStatus(t.status),
            listId:        t.list?.id || "",
            listName:      label || t.list?.name || "",
            clickupTaskId: t.id,
            clickupUrl:    t.url || "",
          });
        }
      }
    };

    const spacesRes = await cuGet(key, `/team/${TEAM_ID}/space?archived=false`);
    for (const space of (spacesRes.spaces || [])) {
      // Folders
      const foldersRes = await cuGet(key, `/space/${space.id}/folder?archived=false`);
      for (const folder of (foldersRes.folders || [])) {
        const listsRes = await cuGet(key, `/folder/${folder.id}/list?archived=false`);
        for (const list of (listsRes.lists || [])) {
          const tasks = await fetchListTasks(key, list.id, list.name);
          addTasks(tasks, `${folder.name} / ${list.name}`);
        }
      }
      // Folderless
      const flRes = await cuGet(key, `/space/${space.id}/list?archived=false`);
      for (const list of (flRes.lists || [])) {
        if (list.name?.toLowerCase().startsWith("subelement")) continue;
        const tasks = await fetchListTasks(key, list.id, list.name);
        addTasks(tasks, list.name);
      }
    }

    allTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    return Response.json({ tasks: allTasks, count: allTasks.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
