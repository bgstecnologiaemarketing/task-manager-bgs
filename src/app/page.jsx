"use client";
import { useState } from "react";
import KanbanColumn from "@/components/KanbanColumn";
import ManualForm from "@/components/ManualForm";
import BulkImport from "@/components/BulkImport";
import Avatar from "@/components/Avatar";
import { CU_MEMBERS, CU_LISTS } from "@/lib/clickup";
import { memberName } from "@/lib/clickup";
import { COLORS, STATUS_LABELS, PRI, uid, isLate, daysLate, fmtDate, EMPTY_FORM, DEMO_TASKS, sel } from "@/lib/constants";

const TABS = [
  { key:"kanban", label:"📋 Kanban" },
  { key:"late",   label:"🔴 Atrasos" },
  { key:"add",    label:"➕ Adicionar" },
  { key:"import", label:"✨ Bloco" },
];

export default function Home() {
  const [tasks, setTasks] = useState(() => DEMO_TASKS.map((t) => ({ ...EMPTY_FORM, ...t, id: uid() })));
  const [view, setView]   = useState("kanban");

  const lateTasks = tasks.filter(isLate);
  const updateTask = (id, ch) => setTasks((p) => p.map((t) => t.id === id ? { ...t, ...ch } : t));
  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));
  const addTasks   = (list) => {
    setTasks((p) => [...p, ...list.map((t) => ({ ...EMPTY_FORM, ...t, id: uid() }))]);
    setView("kanban");
  };

  const stats = [
    { label:"Total",        value:tasks.length,                               bg:"#F1EFE8", color:"#5F5E5A", border:"#D3D1C7" },
    { label:"Em andamento", value:tasks.filter((t)=>t.status==="doing").length, bg:"#E6F1FB", color:"#185FA5", border:"#B5D4F4" },
    { label:"Atrasadas",    value:lateTasks.length,                           bg:"#FCEBEB", color:"#A32D2D", border:"#F7C1C1" },
    { label:"Concluídas",   value:tasks.filter((t)=>t.status==="done").length,  bg:"#EAF3DE", color:"#3B6D11", border:"#C0DD97" },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#F7F6F2", minHeight:"100vh", paddingBottom:48 }}>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E8E6DF", padding:"12px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#2C2C2A", letterSpacing:"-0.02em" }}>Task Manager</div>
            <div style={{ fontSize:11, color:"#888780" }}>BGS Automation</div>
          </div>
          <div style={{ display:"flex" }}>
            {CU_MEMBERS.map((m, i) => (
              <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                <Avatar id={m.id} size={26}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {TABS.map(({ key, label }) => {
            const active = view === key;
            const badge = key === "late" && lateTasks.length > 0 ? lateTasks.length : 0;
            return (
              <button key={key} onClick={() => setView(key)} style={{
                fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:7, cursor:"pointer",
                border: active ? "1.5px solid #378ADD" : "1px solid #D3D1C7",
                background: active ? "#E6F1FB" : "#fff",
                color: active ? "#185FA5" : "#5F5E5A",
                display:"flex", alignItems:"center", gap:5, transition:"all 0.12s" }}>
                {label}
                {badge > 0 && (
                  <span style={{ background:"#E24B4A", color:"#fff", borderRadius:10,
                    padding:"1px 5px", fontSize:10, fontWeight:800 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:10, padding:"12px 20px", flexWrap:"wrap" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ flex:1, minWidth:80, background:s.bg,
            border:`1px solid ${s.border}`, borderRadius:10, padding:"10px 14px" }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:10, fontWeight:700, color:s.color, opacity:0.65,
              marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div style={{ padding:"0 20px" }}>
          <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8 }}>
            {Object.keys(STATUS_LABELS).map((s) => (
              <KanbanColumn key={s} status={s}
                tasks={tasks.filter((t) => t.status === s)}
                onUpdate={updateTask} onDelete={deleteTask}/>
            ))}
          </div>
          <p style={{ color:"#C4C2BB", fontSize:11, textAlign:"center", marginTop:14 }}>
            Clique em qualquer card para editar · Borda vermelha = atrasado · Badge azul = sincronizado com ClickUp
          </p>
        </div>
      )}

      {/* Atrasos */}
      {view === "late" && (
        <div style={{ padding:"0 20px" }}>
          {lateTasks.length === 0 ? (
            <div style={{ textAlign:"center", padding:48, color:"#3B6D11" }}>
              <div style={{ fontSize:44 }}>✅</div>
              <div style={{ fontWeight:700, fontSize:15, marginTop:12 }}>Nenhuma tarefa atrasada!</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:14, padding:"10px 14px", background:"#FCEBEB",
                borderRadius:8, border:"1px solid #F7C1C1", color:"#A32D2D", fontSize:13, fontWeight:600 }}>
                ⚠️ {lateTasks.length} {lateTasks.length === 1 ? "tarefa atrasada" : "tarefas atrasadas"}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
                {[...lateTasks].sort((a,b) => daysLate(b) - daysLate(a)).map((t) => (
                  <div key={t.id} style={{ background:"#fff", border:"1px solid #F7C1C1",
                    borderLeft:"3px solid #E24B4A", borderRadius:8, padding:"12px 14px", fontSize:13 }}>
                    <div style={{ fontWeight:700, color:"#2C2C2A", marginBottom:4 }}>{t.title}</div>
                    {t.assigneeId && (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                        <Avatar id={t.assigneeId} size={18}/>
                        <span style={{ color:"#888780", fontSize:12 }}>{memberName(t.assigneeId)}</span>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ color:"#888780", fontSize:11 }}>Prazo: {fmtDate(t.dueDate)}</span>
                      <span style={{ background:"#FCEBEB", color:"#A32D2D", fontSize:11, fontWeight:700, borderRadius:4, padding:"2px 7px" }}>
                        +{daysLate(t)} dia{daysLate(t) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <select value={t.status} onChange={(e) => updateTask(t.id,{status:e.target.value})}
                        style={{ ...sel, flex:1 }}>
                        {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <input type="date" defaultValue={t.dueDate}
                        onChange={(e) => updateTask(t.id,{dueDate:e.target.value})} style={sel}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Adicionar manual */}
      {view === "add" && (
        <div style={{ padding:"0 20px", maxWidth:680 }}>
          <ManualForm onAdd={addTasks}/>
        </div>
      )}

      {/* Importar em bloco */}
      {view === "import" && (
        <div style={{ padding:"0 20px", maxWidth:700 }}>
          <BulkImport onAdd={addTasks}/>
        </div>
      )}
    </div>
  );
}
