export const CU_MEMBERS = [
  { id: "242640789", name: "Mateus Silva",  email: "mateus@bgsautomation.com.br",      initials: "MS" },
  { id: "81406921",  name: "Lucas Budal",   email: "performance@bgsautomation.com.br", initials: "LB" },
  { id: "158661063", name: "Bruno Silva",   email: "bruno@bgsautomation.com.br",       initials: "BS" },
];

export const CU_LISTS = [
  { id: "901107727607", name: "Mishkan Engenharia",                space: "Team Space" },
  { id: "901107727755", name: "Rotina de otimizações/atividades",  space: "Team Space" },
  { id: "901107727772", name: "Bobdi Boo",                         space: "Team Space" },
  { id: "901107728057", name: "Organização Design/Mídias",         space: "Team Space" },
  { id: "901107728203", name: "Dr Anderson",                       space: "Team Space" },
  { id: "901107728271", name: "Bendertec",                         space: "Team Space" },
  { id: "901107729150", name: "BGS Tecnologia e Marketing Digital", space: "Team Space" },
  { id: "901107724529", name: "Project 1",                         space: "Team Space / Projects" },
  { id: "901107724530", name: "Project 2",                         space: "Team Space / Projects" },
  { id: "901112195735", name: "Tarefas (BGS)",                     space: "Parceiros / BGS" },
  { id: "901112179700", name: "Tarefas (Bobdi Boo)",               space: "Parceiros / Bobdi Boo" },
  { id: "901112966587", name: "Tarefas (Bufalo CWB)",              space: "Parceiros / Bufalo CWB" },
  { id: "901112196435", name: "Tarefas (CCM)",                     space: "Parceiros / CCM" },
  { id: "901112179810", name: "Tarefas (Cicles Jaime)",            space: "Parceiros / Cicles Jaime" },
  { id: "901112360750", name: "Tarefas (Classic Oil Motor)",       space: "Parceiros / Classic Oil Motor" },
  { id: "901112179817", name: "Tarefas (Glue Hair)",               space: "Parceiros / Glue Hair" },
  { id: "901112179823", name: "Tarefas (Health Clinic)",           space: "Parceiros / Health Clinic" },
  { id: "901112218938", name: "Tarefas (Inteiramente Rico)",       space: "Parceiros / Inteiramente Rico" },
  { id: "901112179841", name: "Tarefas (Oligioiá)",                space: "Parceiros / Oligioiá" },
  { id: "901112179844", name: "Tarefas (Perfimec)",                space: "Parceiros / Perfimec" },
  { id: "901112195731", name: "Tarefas (Plok Kids)",               space: "Parceiros / Plok Kids" },
  { id: "901112179846", name: "Tarefas (Stark Multimarcas)",       space: "Parceiros / Stark Multimarcas" },
  { id: "901113710878", name: "Tarefas Techlub",                   space: "Parceiros / Techlub" },
  { id: "901112179853", name: "Tarefas (Uberserra)",               space: "Parceiros / Uberserra" },
  { id: "901113120436", name: "List (ARKAN)",                      space: "Parceiros / ARKAN" },
  { id: "901113808260", name: "List (BNI)",                        space: "Parceiros / BNI" },
  { id: "901113815395", name: "Glue hair",                         space: "Parceiros" },
];

export const PRI_MAP = { alta: "urgent", media: "high", baixa: "low" };
export const memberById = (id) => CU_MEMBERS.find((m) => m.id === id);
export const memberName = (id) => memberById(id)?.name || "";
