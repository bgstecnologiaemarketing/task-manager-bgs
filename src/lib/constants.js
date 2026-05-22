export const COLORS = {
  todo:   { bg:"#F1EFE8", text:"#5F5E5A", border:"#D3D1C7", dot:"#888780" },
  doing:  { bg:"#E6F1FB", text:"#185FA5", border:"#B5D4F4", dot:"#378ADD" },
  review: { bg:"#FAEEDA", text:"#854F0B", border:"#FAC775", dot:"#BA7517" },
  done:   { bg:"#EAF3DE", text:"#3B6D11", border:"#C0DD97", dot:"#639922" },
  late:   { bg:"#FCEBEB", text:"#A32D2D", border:"#F7C1C1", dot:"#E24B4A" },
};

export const PRI = {
  alta:  { color:"#E24B4A", label:"Alta" },
  media: { color:"#BA7517", label:"Média" },
  baixa: { color:"#639922", label:"Baixa" },
};

export const STATUS_LABELS = {
  todo:   "A Fazer",
  doing:  "Em Andamento",
  review: "Em Revisão",
  done:   "Concluído",
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
export const today = () => new Date(new Date().toDateString());
export const isLate = (t) => !!(t.dueDate && t.status !== "done" && new Date(t.dueDate) < today());
export const daysLate = (t) => t.dueDate ? Math.floor((today() - new Date(t.dueDate)) / 86400000) : 0;
export const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"short" }) : "";

export const EMPTY_FORM = {
  title:"", description:"", assigneeId:"", dueDate:"", priority:"media", status:"todo", listId:""
};

export const inp = {
  fontSize:13, padding:"8px 10px", borderRadius:7,
  border:"1px solid #D3D1C7", background:"#FAFAF8",
  color:"#2C2C2A", fontFamily:"inherit", outline:"none",
  width:"100%", boxSizing:"border-box",
};

export const sel = {
  fontSize:12, padding:"3px 6px", borderRadius:4,
  border:"1px solid #D3D1C7", background:"#fff", cursor:"pointer"
};

export const DEMO_TASKS = [
  { title:"Revisar proposta comercial BGS", assigneeId:"242640789", dueDate: new Date(Date.now()-2*86400000).toISOString().slice(0,10), priority:"alta",  status:"doing",  description:"Proposta para cliente XYZ" },
  { title:"Atualizar documentação da API",  assigneeId:"81406921",  dueDate: new Date(Date.now()+3*86400000).toISOString().slice(0,10), priority:"media", status:"todo",   description:"" },
  { title:"Deploy em produção v2.1",        assigneeId:"158661063", dueDate: new Date(Date.now()-1*86400000).toISOString().slice(0,10), priority:"alta",  status:"review", description:"" },
  { title:"Corrigir bug login OAuth",       assigneeId:"158661063", dueDate: new Date(Date.now()-4*86400000).toISOString().slice(0,10), priority:"alta",  status:"todo",   description:"Erro no Google OAuth" },
  { title:"Design telas mobile",            assigneeId:"81406921",  dueDate: new Date(Date.now()+1*86400000).toISOString().slice(0,10), priority:"media", status:"doing",  description:"" },
  { title:"Onboarding novo dev",            assigneeId:"242640789", dueDate: "",                                                        priority:"baixa", status:"done",   description:"" },
];
