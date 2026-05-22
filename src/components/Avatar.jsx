"use client";
import { memberById } from "@/lib/clickup";

const AVATAR_COLORS = ["#378ADD","#BA7517","#639922","#E24B4A","#7B6BE0"];

export default function Avatar({ id, size = 22 }) {
  const m = memberById(id);
  if (!m) return null;
  const color = AVATAR_COLORS[m.name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <span title={m.name} style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:size, height:size, borderRadius:"50%",
      background:color, color:"#fff",
      fontSize:size * 0.42, fontWeight:700, flexShrink:0,
    }}>
      {m.initials}
    </span>
  );
}
