export async function GET() {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) return Response.json({ error: "CLICKUP_API_KEY não definida" });

  const cu = async (path) => {
    const r = await fetch(`https://api.clickup.com/api/v2${path}`, {
      headers: { "Authorization": key, "Content-Type": "application/json" },
    });
    return r.json();
  };

  try {
    const TEAM_ID = "9011786898";
    const report = { team_id: TEAM_ID, spaces: [] };

    const spacesRes = await cu(`/team/${TEAM_ID}/space?archived=false`);
    for (const space of (spacesRes.spaces || [])) {
      const spaceInfo = { id: space.id, name: space.name, lists: [] };

      // folders
      const foldersRes = await cu(`/space/${space.id}/folder?archived=false`);
      for (const folder of (foldersRes.folders || [])) {
        const listsRes = await cu(`/folder/${folder.id}/list?archived=false`);
        for (const list of (listsRes.lists || [])) {
          const tasksRes = await cu(`/list/${list.id}/task?include_closed=false&page=0`);
          spaceInfo.lists.push({ id: list.id, name: list.name, folder: folder.name, task_count: (tasksRes.tasks||[]).length });
        }
      }

      // folderless
      const flRes = await cu(`/space/${space.id}/list?archived=false`);
      for (const list of (flRes.lists || [])) {
        const tasksRes = await cu(`/list/${list.id}/task?include_closed=false&page=0`);
        spaceInfo.lists.push({ id: list.id, name: list.name, folder: "(folderless)", task_count: (tasksRes.tasks||[]).length });
      }

      report.spaces.push(spaceInfo);
    }

    const total = report.spaces.flatMap(s => s.lists).reduce((a, l) => a + l.task_count, 0);
    report.total_tasks = total;
    return Response.json(report);
  } catch (e) {
    return Response.json({ error: e.message });
  }
}
