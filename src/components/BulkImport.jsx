"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import { EMPTY_FORM, STATUS_LABELS, PRI, COLORS, inp, fmtDate } from "@/lib/constants";
import { CU_LISTS } from "@/lib/clickup";
import { memberName } from "@/lib/clickup";
import { parseTasks, createClickUpTask } from "@/lib/api";

export default function BulkImport({ onAdd }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState([]);
  const [editing, setEditing] = useState(null);
  const [defaultList, setDefaultList] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const analyse = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setParsed([]);
    try {
      const result = await parseTasks(text);
      if (!Array.isArray(result)) throw new Error();
      setParsed(result.map((t) => ({ ...EMPTY_FORM, ...t })));
    } catch { setError("Não consegui interpretar. Tente reformular o texto."); }
    setLoading(false);
  };

  const upd = (i, ch) => setParsed((p) => p.map((t, idx) => idx === i ? { ...t, ...ch } : t));
  const del = (i) => setParsed((p) => p.filter((_, idx) => idx !== i));

  const confirm = async (syncClickUp) => {
    if (syncClickUp && !defaultList) { setSaveMsg("⚠️ Escolha uma lista do ClickUp."); return; }
    setSaving(true); setSaveMsg("");
    const enriched = [];
    for (const t of parsed) {
      let extra = {};
      if (syncClickUp) {
        try {
          const r = await createClickUpTask(t, defaultList);
          if (r.success !== false) extra = { clickupTaskId: r.task_id, clickupUrl: r.url, listId: defaultList };
        } catch {}
      }
      enriched.push({ ...t, ...extra });
    }
    onAdd(enriched);
    setSaving(false); setParsed([]); setText(""); setSaveMsg("");
  };

  return (
    <div>
      {parsed.length === 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8E6DF", borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#2C2C2A", marginBottom:6 }}>✨ Importar em bloco com IA</div>
          <div style={{ color:"#888780", fontSize:12, marginBottom:14, lineHeight:1.6 }}>
            Cole qualquer formato — lista, ata de reunião, Slack, e-mail. A IA separa e estrutura cada tarefa,
            identificando automaticamente <strong>Mateus</strong>, <strong>Lucas</strong> e <strong>Bruno</strong>.
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder={"Exemplos:\n\n• Criar landing page BGS — Mateus, urgente, até sexta\n• Fix bug login mobile (crítico) - Bruno\n• Reunião de alinhamento Q3 com Lucas\n\nOu texto corrido de reunião, Slack, e-mail..."}
            style={{ ...inp, minHeight:160, resize:"vertical", lineHeight:1.6, marginBottom:10 }}/>
          {error && (
            <div style={{ color:"#A32D2D", fontSize:12, marginBottom:10, padding:"8px 12px", background:"#FCEBEB", borderRadius:6 }}>
              ⚠️ {error}
            </div>
          )}
          <button onClick={analyse} disabled={loading || !text.trim()}
            style={{ padding:"9px 22px", fontSize:13, fontWeight:700, border:"none", borderRadius:8,
              cursor:loading||!text.trim()?"not-allowed":"pointer",
              background:loading||!text.trim()?"#B5D4F4":"#185FA5", color:"#fff" }}>
            {loading ? "⏳ Analisando..." : "✨ Identificar Tarefas"}
          </button>
        </div>
      )}

      {parsed.length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #C0DD97", borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#3B6D11", marginBottom:4 }}>
            ✅ {parsed.length} {parsed.length === 1 ? "tarefa identificada" : "tarefas identificadas"}
          </div>
          <div style={{ fontSize:12, color:"#888780", marginBottom:14 }}>Revise e edite antes de confirmar</div>

          <div style={{ marginBottom:14, padding:"12px 14px", background:"#F1EFE8", borderRadius:8, border:"1px solid #D3D1C7" }}>
            <label style={{ fontSize:12, color:"#5F5E5A", fontWeight:600, display:"block", marginBottom:6 }}>
              Lista do ClickUp para sincronizar (opcional)
            </label>
            <select value={defaultList} onChange={(e) => setDefaultList(e.target.value)} style={inp}>
              <option value="">Não sincronizar com ClickUp</option>
              {CU_LISTS.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.space}</option>)}
            </select>
          </div>

          {parsed.map((t, i) => (
            <div key={i} style={{ border:"1px solid #E8E6DF",
              borderLeft:`3px solid ${PRI[t.priority||"media"].color}`,
              borderRadius:8, padding:"10px 12px", marginBottom:8, fontSize:13 }}>
              {editing === i ? (
                <div style={{ display:"grid", gap:8 }}>
                  <input value={t.title} onChange={(e) => upd(i,{title:e.target.value})} style={{...inp,fontWeight:600}}/>
                  <textarea value={t.description} onChange={(e) => upd(i,{description:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <select value={t.assigneeId||""} onChange={(e) => upd(i,{assigneeId:e.target.value})} style={inp}>
                      <option value="">Sem responsável</option>
                      {[{id:"242640789",name:"Mateus Silva"},{id:"81406921",name:"Lucas Budal"},{id:"158661063",name:"Bruno Silva"}]
                        .map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input type="date" value={t.dueDate} onChange={(e) => upd(i,{dueDate:e.target.value})} style={inp}/>
                    <select value={t.priority} onChange={(e) => upd(i,{priority:e.target.value})} style={inp}>
                      <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
                    </select>
                    <select value={t.status} onChange={(e) => upd(i,{status:e.target.value})} style={inp}>
                      {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setEditing(null)}
                    style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:"none", background:"#185FA5", color:"#fff", cursor:"pointer", alignSelf:"flex-start" }}>
                    ✓ Ok
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:"#2C2C2A", marginBottom:3 }}>{t.title}</div>
                    {t.description && <div style={{ color:"#5F5E5A", fontSize:12, marginBottom:4 }}>{t.description}</div>}
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      {t.assigneeId && (
                        <>
                          <Avatar id={t.assigneeId} size={16}/>
                          <span style={{ color:"#888780", fontSize:11 }}>{memberName(t.assigneeId)}</span>
                        </>
                      )}
                      {t.dueDate && <span style={{ color:"#888780", fontSize:11 }}>📅 {fmtDate(t.dueDate)}</span>}
                      <span style={{ color:PRI[t.priority||"media"].color, fontWeight:700, fontSize:10, textTransform:"uppercase" }}>
                        {PRI[t.priority||"media"].label}
                      </span>
                      <span style={{ color:COLORS[t.status||"todo"].text, background:COLORS[t.status||"todo"].bg, borderRadius:4, padding:"1px 6px", fontSize:11 }}>
                        {STATUS_LABELS[t.status||"todo"]}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => setEditing(i)}
                      style={{ fontSize:11, padding:"3px 9px", borderRadius:5, border:"1px solid #D3D1C7", background:"#fff", color:"#5F5E5A", cursor:"pointer" }}>
                      Editar
                    </button>
                    <button onClick={() => del(i)}
                      style={{ fontSize:11, padding:"3px 9px", borderRadius:5, border:"1px solid #F7C1C1", background:"#FCEBEB", color:"#A32D2D", cursor:"pointer" }}>
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {saveMsg && (
            <div style={{ fontSize:12, marginBottom:10, padding:"8px 12px", borderRadius:6,
              background:saveMsg.startsWith("⚠️")?"#FAEEDA":"#FCEBEB",
              color:saveMsg.startsWith("⚠️")?"#854F0B":"#A32D2D" }}>
              {saveMsg}
            </div>
          )}

          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={() => setParsed([])}
              style={{ fontSize:12, padding:"7px 14px", borderRadius:7, border:"1px solid #D3D1C7", background:"#fff", color:"#5F5E5A", cursor:"pointer" }}>
              ↩ Refazer
            </button>
            <button onClick={() => confirm(false)} disabled={saving}
              style={{ fontSize:13, fontWeight:700, padding:"8px 16px", borderRadius:7,
                border:"1px solid #D3D1C7", background:"#F1EFE8", color:"#2C2C2A",
                cursor:saving?"not-allowed":"pointer" }}>
              + Só no Kanban
            </button>
            <button onClick={() => confirm(true)} disabled={saving}
              style={{ flex:1, fontSize:13, fontWeight:700, padding:"8px 18px", borderRadius:7,
                border:"none", background:saving?"#B5D4F4":"#185FA5", color:"#fff",
                cursor:saving?"not-allowed":"pointer" }}>
              {saving ? `⏳ Criando no ClickUp (${parsed.length})...` : `↗ Criar no Kanban + ClickUp (${parsed.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
