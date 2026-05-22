"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import CuBadge from "./CuBadge";
import { COLORS, PRI, STATUS_LABELS, isLate, daysLate, fmtDate, sel } from "@/lib/constants";
import { CU_MEMBERS, CU_LISTS } from "@/lib/clickup";
import { memberName } from "@/lib/clickup";
import { createClickUpTask } from "@/lib/api";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const late = isLate(task);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const dot = late ? COLORS.late.dot : COLORS[task.status].dot;

  const saveToClickUp = async (listId) => {
    if (!listId) return;
    setSaving(true); setSaveMsg("");
    try {
      const r = await createClickUpTask(task, listId);
      if (r.success !== false) {
        onUpdate(task.id, { clickupTaskId: r.task_id, clickupUrl: r.url, listId });
        setSaveMsg("✅ Salvo no ClickUp!");
      } else {
        setSaveMsg("❌ " + (r.error || "Tente novamente"));
      }
    } catch { setSaveMsg("❌ Falha na conexão"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      style={{ background:"#fff", border:`1px solid ${late?"#F7C1C1":"#ECEAE3"}`,
        borderLeft:`3px solid ${dot}`, borderRadius:8, padding:"10px 12px",
        marginBottom:7, cursor:"pointer", transition:"box-shadow 0.15s", fontSize:13 }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, color:"#2C2C2A", lineHeight:1.35, marginBottom:4 }}>{task.title}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            {task.assigneeId && (
              <>
                <Avatar id={task.assigneeId} size={18}/>
                <span style={{ color:"#888780", fontSize:11 }}>{memberName(task.assigneeId)}</span>
              </>
            )}
            {task.clickupTaskId && <CuBadge taskId={task.clickupTaskId} url={task.clickupUrl}/>}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
          {task.priority && (
            <span style={{ fontSize:10, fontWeight:700, color:PRI[task.priority].color, textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {PRI[task.priority].label}
            </span>
          )}
          {late && (
            <span style={{ background:"#FCEBEB", color:"#A32D2D", fontSize:10, fontWeight:700, borderRadius:4, padding:"2px 6px" }}>
              +{daysLate(task)}d
            </span>
          )}
          {task.dueDate && !late && (
            <span style={{ color:"#B4B2A9", fontSize:11 }}>{fmtDate(task.dueDate)}</span>
          )}
        </div>
      </div>

      {open && (
        <div style={{ marginTop:10, borderTop:"1px solid #F1EFE8", paddingTop:10 }} onClick={(e) => e.stopPropagation()}>
          {task.description && (
            <div style={{ color:"#5F5E5A", fontSize:12, marginBottom:10, lineHeight:1.5 }}>{task.description}</div>
          )}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            <select value={task.status} onChange={(e) => onUpdate(task.id, { status: e.target.value })} style={sel}>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={task.priority || "media"} onChange={(e) => onUpdate(task.id, { priority: e.target.value })} style={sel}>
              <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
            </select>
            <input type="date" value={task.dueDate || ""} onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })} style={sel}/>
            <select value={task.assigneeId || ""} onChange={(e) => onUpdate(task.id, { assigneeId: e.target.value })} style={sel}>
              <option value="">Sem responsável</option>
              {CU_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {!task.clickupTaskId ? (
            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
              <select defaultValue="" onChange={(e) => saveToClickUp(e.target.value)} disabled={saving}
                style={{ ...sel, fontSize:12, color:saving?"#B4B2A9":"#2C2C2A" }}>
                <option value="" disabled>{saving ? "Salvando..." : "↗ Salvar no ClickUp (escolha a lista)"}</option>
                {CU_LISTS.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.space}</option>)}
              </select>
              {saveMsg && <span style={{ fontSize:11, color:saveMsg.startsWith("✅")?"#3B6D11":"#A32D2D" }}>{saveMsg}</span>}
            </div>
          ) : (
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <CuBadge taskId={task.clickupTaskId} url={task.clickupUrl}/>
              <span style={{ fontSize:11, color:"#888780" }}>Sincronizado</span>
            </div>
          )}

          <button onClick={() => onDelete(task.id)}
            style={{ marginTop:8, fontSize:11, padding:"3px 8px", borderRadius:4,
              border:"1px solid #F7C1C1", background:"#FCEBEB", color:"#A32D2D", cursor:"pointer" }}>
            Remover
          </button>
        </div>
      )}
    </div>
  );
}
