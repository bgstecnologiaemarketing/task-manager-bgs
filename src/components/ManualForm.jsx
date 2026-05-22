"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import { EMPTY_FORM, STATUS_LABELS, inp } from "@/lib/constants";
import { CU_MEMBERS, CU_LISTS } from "@/lib/clickup";
import { createClickUpTask } from "@/lib/api";

export default function ManualForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (syncClickUp) => {
    if (!form.title.trim()) return;
    if (syncClickUp && !form.listId) { setMsg("⚠️ Escolha uma lista do ClickUp"); return; }
    setSaving(syncClickUp);
    let extra = {};
    if (syncClickUp) {
      try {
        const r = await createClickUpTask(form, form.listId);
        if (r.success !== false) extra = { clickupTaskId: r.task_id, clickupUrl: r.url };
        else { setMsg("❌ Erro: " + (r.error || "")); setSaving(false); return; }
      } catch { setMsg("❌ Falha na conexão"); setSaving(false); return; }
    }
    onAdd([{ ...form, ...extra }]);
    setForm(EMPTY_FORM); setSaving(false);
    setMsg(syncClickUp ? "✅ Criada no ClickUp e no Kanban!" : "✅ Tarefa adicionada ao Kanban.");
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div style={{ background:"#fff", border:"1px solid #E8E6DF", borderRadius:12, padding:20, marginBottom:16 }}>
      <div style={{ fontWeight:700, fontSize:14, color:"#2C2C2A", marginBottom:14 }}>➕ Nova tarefa</div>
      <div style={{ display:"grid", gap:10 }}>
        <input value={form.title} onChange={(e) => set("title", e.target.value)}
          placeholder="Título da tarefa *"
          onKeyDown={(e) => e.key === "Enter" && submit(false)}
          style={{ ...inp, fontWeight:600 }}/>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
          placeholder="Descrição (opcional)" rows={2}
          style={{ ...inp, resize:"vertical", lineHeight:1.5 }}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <label style={{ fontSize:11, color:"#888780", display:"block", marginBottom:4 }}>Responsável</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {CU_MEMBERS.map((m) => (
                <button key={m.id} onClick={() => set("assigneeId", form.assigneeId === m.id ? "" : m.id)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20,
                    fontSize:12, cursor:"pointer",
                    border: form.assigneeId === m.id ? "2px solid #378ADD" : "1px solid #D3D1C7",
                    background: form.assigneeId === m.id ? "#E6F1FB" : "#fff",
                    color: form.assigneeId === m.id ? "#185FA5" : "#5F5E5A",
                    fontWeight: form.assigneeId === m.id ? 700 : 400 }}>
                  <Avatar id={m.id} size={18}/> {m.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#888780", display:"block", marginBottom:4 }}>Prazo</label>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#888780", display:"block", marginBottom:4 }}>Prioridade</label>
            <select value={form.priority} onChange={(e) => set("priority", e.target.value)} style={inp}>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#888780", display:"block", marginBottom:4 }}>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} style={inp}>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize:11, color:"#888780", display:"block", marginBottom:4 }}>Lista no ClickUp</label>
          <select value={form.listId} onChange={(e) => set("listId", e.target.value)} style={inp}>
            <option value="">Não sincronizar com ClickUp</option>
            {CU_LISTS.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.space}</option>)}
          </select>
        </div>

        {msg && (
          <div style={{ fontSize:12, padding:"7px 12px", borderRadius:6,
            background:msg.startsWith("✅")?"#EAF3DE":msg.startsWith("⚠️")?"#FAEEDA":"#FCEBEB",
            color:msg.startsWith("✅")?"#3B6D11":msg.startsWith("⚠️")?"#854F0B":"#A32D2D",
            border:`1px solid ${msg.startsWith("✅")?"#C0DD97":msg.startsWith("⚠️")?"#FAC775":"#F7C1C1"}` }}>
            {msg}
          </div>
        )}

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => submit(false)} disabled={!form.title.trim()}
            style={{ flex:1, padding:"9px", fontSize:13, fontWeight:700,
              background:form.title.trim()?"#F1EFE8":"#E8E6DF",
              color:form.title.trim()?"#2C2C2A":"#B4B2A9",
              border:"1px solid #D3D1C7", borderRadius:8,
              cursor:form.title.trim()?"pointer":"not-allowed" }}>
            + Só no Kanban
          </button>
          <button onClick={() => submit(true)} disabled={!form.title.trim() || saving}
            style={{ flex:2, padding:"9px", fontSize:13, fontWeight:700,
              background:form.title.trim()&&!saving?"#185FA5":"#B5D4F4",
              color:"#fff", border:"none", borderRadius:8,
              cursor:form.title.trim()&&!saving?"pointer":"not-allowed" }}>
            {saving ? "⏳ Criando no ClickUp..." : "↗ Criar no Kanban + ClickUp"}
          </button>
        </div>
      </div>
    </div>
  );
}
