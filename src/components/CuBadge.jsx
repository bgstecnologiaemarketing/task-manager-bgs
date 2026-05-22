"use client";
export default function CuBadge({ taskId, url }) {
  if (!taskId && !url) return null;
  return (
    <span
      onClick={(e) => { e.stopPropagation(); if (url) window.open(url, "_blank"); }}
      title="Ver no ClickUp"
      style={{
        display:"inline-flex", alignItems:"center", gap:3,
        fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4,
        background:"#E6F1FB", color:"#185FA5",
        cursor:url?"pointer":"default", border:"1px solid #B5D4F4",
      }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M3 12.5L8.5 18L21 6" stroke="#185FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      ClickUp{taskId ? ` #${String(taskId).slice(-5)}` : ""}
    </span>
  );
}
