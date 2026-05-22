"use client";
import TaskCard from "./TaskCard";
import { COLORS, STATUS_LABELS } from "@/lib/constants";

export default function KanbanColumn({ status, tasks, onUpdate, onDelete }) {
  const col = COLORS[status];
  return (
    <div style={{ flex:1, minWidth:190 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:10, padding:"6px 10px", borderRadius:6,
        background:col.bg, border:`1px solid ${col.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:col.dot }}/>
          <span style={{ fontWeight:700, fontSize:11, color:col.text, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span style={{ background:col.border, color:col.text, borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:700 }}>
          {tasks.length}
        </span>
      </div>
      <div style={{ minHeight:60 }}>
        {tasks.length === 0 ? (
          <div style={{ color:"#C4C2BB", fontSize:12, textAlign:"center", padding:"18px 0",
            borderRadius:6, border:"1px dashed #D3D1C7" }}>
            Vazio
          </div>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete}/>
          ))
        )}
      </div>
    </div>
  );
}
