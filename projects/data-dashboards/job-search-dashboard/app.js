"use strict";
const $ = id => document.getElementById(id);
const stages = {Saved:"待投递",Applied:"已投递",Interview:"面试中",Offer:"已录用",Rejected:"已结束"};
const priorities = {high:"高优先级",normal:"中优先级",low:"低优先级"};
const fields = ["company","role","city","salary","status","priority","next","deadline","source","notes"];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const icon = name => `<img src="icons/${name}.svg" alt="">`;
const uid = () => crypto.randomUUID();
const dayString = date => [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
const today = dayString(new Date());
const offsetDay = offset => { const d = new Date(); d.setDate(d.getDate()+offset); return dayString(d); };
const active = job => !["Offer","Rejected"].includes(job.status);
const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value+"T12:00:00").getTime()) && dayString(new Date(value+"T12:00:00")) === value;
const validId = value => typeof value === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(value);
const formatDate = value => value ? value.replace("T"," ").slice(0,16) : "未安排日期";
let jobs = [], editing = null, selected = null, editingInterview = null, mode = "board", toastTimer;

function notify(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").hidden = true, 4200);
}

function normalizeJob(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.company !== "string" || !raw.company.trim() || typeof raw.role !== "string" || !raw.role.trim()) throw Error("职位必须包含公司和岗位");
  if (raw.status && !Object.hasOwn(stages,raw.status)) throw Error("投递阶段无效");
  const job = {id:validId(raw.id) ? raw.id : uid()};
  for(const key of fields) job[key] = typeof raw[key] === "string" ? raw[key].trim().slice(0,key==="notes"?4000:240) : "";
  job.status = raw.status || "Saved";
  job.priority = Object.hasOwn(priorities,raw.priority) ? raw.priority : "normal";
  if(job.deadline && !validDay(job.deadline)) throw Error("跟进日期无效");
  job.created = Number.isFinite(raw.created) ? raw.created : Date.now();
  job.history = Array.isArray(raw.history) ? raw.history.filter(h => h && Number.isFinite(h.at) && typeof h.text === "string").slice(-100).map(h => ({at:h.at,text:h.text.slice(0,240)})) : [];
  job.interviews = Array.isArray(raw.interviews) ? raw.interviews.slice(0,100).map(i => {
    if(!i || typeof i.title !== "string" || !i.title.trim() || typeof i.at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(i.at) || !validDay(i.at.slice(0,10)) || !Number.isFinite(new Date(i.at).getTime())) throw Error("面试记录无效");
    return {id:validId(i.id)?i.id:uid(),title:i.title.slice(0,100),at:i.at,notes:typeof i.notes==="string"?i.notes.slice(0,4000):"",done:i.done===true};
  }) : [];
  return job;
}

function sampleJobs() {
  return [
    ["星辰科技（示例）","前端开发工程师","厦门","12–18K · 13薪","Interview","high","准备组件设计案例",0],
    ["知序数据（示例）","数据可视化工程师","杭州","15–22K","Applied","high","发送数据看板作品",1],
    ["青禾设计（示例）","产品型前端工程师","厦门","10–16K","Saved","normal","整理岗位要求",2],
    ["云际实验室（示例）","AI 应用开发工程师","远程","12–20K","Interview","high","补充接口联调说明",-1],
    ["轻舟软件（示例）","Web 前端工程师","福州","10–15K","Applied","normal","确认简历接收状态",3],
    ["拾光产品（示例）","交互开发工程师","深圳","14–20K","Saved","low","调整项目展示顺序",5],
    ["映山科技（示例）","前端开发工程师","厦门","11–16K","Offer","high","",0],
    ["木川工作室（示例）","前端实习生","厦门","面议","Rejected","low","",0]
  ].map(([company,role,city,salary,status,priority,next,days],i) => normalizeJob({company,role,city,salary,status,priority,next,deadline:next?offsetDay(days):"",source:i%2?"官网":"内推",notes:"示例职位，可编辑或删除。",created:Date.now()-i*86400000,history:[{at:Date.now()-i*86400000,text:"添加职位"}]}));
}

try {
  const stored = localStorage.getItem("jobs");
  const raw = stored === null ? sampleJobs() : JSON.parse(stored);
  if(!Array.isArray(raw) || raw.length > 2000) throw Error("数据格式无效");
  jobs = raw.map(normalizeJob);
  const ids = new Set();
  jobs.forEach(j => {if(ids.has(j.id)) j.id=uid(); ids.add(j.id);});
} catch {
  jobs = [];
  notify("无法读取旧数据，原始存储未修改。请先导出备份。");
}

function commit(nextJobs, message) {
  try { localStorage.setItem("jobs",JSON.stringify(nextJobs)); }
  catch { notify("保存失败，浏览器存储不可用或空间不足。原记录未修改。"); return false; }
  jobs = nextJobs;
  render();
  if(message) notify(message);
  return true;
}
function update(id, patch, message) {
  const job = jobs.find(j => j.id === id);
  if(!job) return false;
  const updated = {...job,...patch,history:[...job.history,{at:Date.now(),text:message}].slice(-100)};
  return commit(jobs.map(j => j.id === id ? updated : j),message);
}
function priorityBadge(job) { return `<span class="priority ${job.priority}">${priorities[job.priority]}</span>`; }
function stageBadge(job) { return `<span class="stage-badge"><span class="dot ${job.status}"></span>${stages[job.status]}</span>`; }
function empty(text) { return `<div class="empty">${icon("briefcase-business")}${text}</div>`; }
function actionButton(action,id,title,iconName,disabled=false) {
  return `<button class="icon-button" data-action="${action}" data-id="${id}" title="${title}" aria-label="${title}" ${disabled?"disabled":""}>${icon(iconName)}</button>`;
}
function jobCard(job) {
  return `<article class="job"><div class="job-top"><span class="company-mark">${esc(job.company.slice(0,1))}</span><div><h3><button data-action="detail" data-id="${job.id}">${esc(job.company)}</button></h3><p class="role-name">${esc(job.role)}</p></div></div><div class="meta"><span>${esc(job.city || "城市待定")}</span><span class="salary">${esc(job.salary || "薪资待定")}</span></div>${priorityBadge(job)}
  <div class="job-task">${icon("clock")}<div><span>${esc(job.next || "暂无跟进事项")}</span>${job.next && job.deadline ? `<p class="${job.deadline<today&&active(job)?"overdue":""}">${esc(job.deadline)}${job.deadline<today&&active(job)?" · 已逾期":""}</p>`:""}</div></div>
  <div class="job-actions">${actionButton("edit",job.id,"编辑","pencil")}${actionButton("prev",job.id,"退回上一阶段","arrow-left",job.status==="Saved")}${actionButton("next",job.id,"推进下一阶段","arrow-right",job.status==="Rejected")}${actionButton("delete",job.id,"删除","trash-2")}</div></article>`;
}
function filteredJobs() {
  const query = $("search").value.trim().toLowerCase(), stage = $("stageFilter").value, priority = $("priorityFilter").value;
  const rows = jobs.filter(j => (!query || [j.company,j.role,j.city].join(" ").toLowerCase().includes(query)) && (!stage || j.status===stage) && (!priority || j.priority===priority));
  const rank = {high:0,normal:1,low:2};
  rows.sort((a,b) => $("sort").value==="priority" ? rank[a.priority]-rank[b.priority] || b.created-a.created : $("sort").value==="deadline" ? (a.deadline||"9999").localeCompare(b.deadline||"9999") : b.created-a.created);
  $("clearFilters").hidden = !query && !stage && !priority;
  return rows;
}
function tasks() {
  return jobs.filter(active).flatMap(job => [
    ...(job.next ? [{job,id:"follow",title:job.next,at:job.deadline,type:"跟进"}] : []),
    ...job.interviews.filter(i => !i.done).map(i => ({job,id:i.id,title:i.title,at:i.at,type:"面试"}))
  ]).sort((a,b) => (a.at||"9999").localeCompare(b.at||"9999"));
}
function taskRow(task) {
  return `<div class="task-row"><div class="task-date ${task.at && task.at.slice(0,10)<today?"overdue":""}">${task.at?esc(task.at.slice(5).replace("T"," ")):"待安排"}</div><div class="task-content"><strong>${esc(task.title)}</strong><p>${esc(task.job.company)} · ${task.type}</p></div><button class="text-button" data-action="detail" data-id="${task.job.id}">查看</button><button data-action="complete" data-id="${task.job.id}" data-task="${task.id}">${icon("check")}完成</button></div>`;
}
function render() {
  const current = ["jobs","schedule","overview"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "jobs";
  const names = {jobs:["职位管理","OPPORTUNITIES"],schedule:["跟进日程","FOLLOW-UPS"],overview:["求职概览","OVERVIEW"]};
  $("pageTitle").textContent = $("breadcrumb").textContent = names[current][0];
  $("eyebrow").textContent = names[current][1];
  document.querySelectorAll("[data-view]").forEach(a => { if(a.dataset.view===current) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  ["jobs","schedule","overview"].forEach(v => $(v+"View").hidden = v!==current);
  $("today").textContent = new Date().toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long"});
  $("total").textContent = $("navCount").textContent = jobs.length;
  const interviewCount = jobs.filter(j=>j.status==="Interview").length, offers = jobs.filter(j=>j.status==="Offer").length;
  $("interviews").textContent = interviewCount;
  $("offers").textContent = offers;
  $("activeCount").textContent = jobs.filter(active).length+" 个进行中";
  const submitted = jobs.filter(j=>j.status!=="Saved").length;
  $("rate").textContent = (submitted?Math.round((interviewCount+offers)/submitted*100):0)+"%";
  const allTasks = tasks();
  $("dueCount").textContent = allTasks.filter(t => t.at && t.at.slice(0,10)<=today).length;
  const rows = filteredJobs();
  $("resultCount").textContent = "显示 "+rows.length+" / "+jobs.length+" 个职位";
  $("board").hidden = mode!=="board";
  $("jobTable").hidden = mode!=="list";
  ["board","list"].forEach(v => { const button=document.querySelector('[data-action="'+v+'"]'); button.classList.toggle("active",mode===v);button.setAttribute("aria-pressed",String(mode===v)); });
  const visibleStages = $("stageFilter").value ? [$("stageFilter").value] : Object.keys(stages);
  $("board").innerHTML = visibleStages.map(stage => {const items=rows.filter(j=>j.status===stage); return `<section class="column"><h2 class="column-head"><span class="dot ${stage}"></span>${stages[stage]}<span class="count">${items.length}</span></h2>${items.length?items.map(jobCard).join(""):empty("暂无职位")}</section>`;}).join("");
  $("jobRows").innerHTML = rows.length ? rows.map(j => `<tr><td><button class="text-button" data-action="detail" data-id="${j.id}">${esc(j.company)}</button><small>${esc(j.role)}</small></td><td>${esc(j.city||"—")}</td><td>${esc(j.salary||"—")}</td><td>${stageBadge(j)}</td><td>${priorityBadge(j)}</td><td>${esc(j.deadline||"未安排")}<small>${esc(j.next)}</small></td><td>${actionButton("edit",j.id,"编辑","pencil")}</td></tr>`).join("") : '<tr><td colspan="7">没有匹配职位</td></tr>';
  const filter=$("scheduleFilter").value;
  const scheduled = allTasks.filter(t => filter==="all" || (t.at && (filter==="today"?t.at.slice(0,10)===today:filter==="overdue"?t.at.slice(0,10)<today:t.at.slice(0,10)>=today&&t.at.slice(0,10)<=offsetDay(7))));
  $("scheduleList").innerHTML=scheduled.length?scheduled.map(taskRow).join(""):empty("该范围内暂无待办");
  $("stageChart").innerHTML=Object.entries(stages).map(([key,label])=>{const count=jobs.filter(j=>j.status===key).length;return `<div class="chart-row"><span>${label}</span><div class="chart-track"><div class="chart-bar" style="width:${jobs.length?count/jobs.length*100:0}%"></div></div><strong>${count}</strong></div>`;}).join("");
  const focus=allTasks.filter(t=>t.job.priority==="high" || (t.at&&t.at.slice(0,10)<=today)).slice(0,5);
  $("focusList").innerHTML=focus.length?focus.map(taskRow).join(""):empty("暂无优先跟进事项");
  const activity=jobs.flatMap(j=>j.history.map(h=>({...h,company:j.company}))).sort((a,b)=>b.at-a.at).slice(0,10);
  $("activityList").innerHTML=activity.length?activity.map(h=>`<div class="activity"><time>${esc(new Date(h.at).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}))}</time><div><strong>${esc(h.text)}</strong><small>${esc(h.company)}</small></div></div>`).join(""):empty("暂无操作记录");
}

function openEditor(id=null) {
  const job=jobs.find(j=>j.id===id);
  editing=job?.id||null;
  $("form").reset();
  fields.forEach(key=>$(key).value=job?.[key] || (key==="status"?"Saved":key==="priority"?"normal":""));
  $("editorTitle").textContent=job?"编辑职位":"新增职位";
  $("formError").textContent="";
  $("detail").close();
  $("editor").showModal();
}
function openDetail(id) {
  const job=jobs.find(j=>j.id===id);
  if(!job) return;
  selected=id;
  editingInterview=null;
  $("detailBody").innerHTML=`<h2 class="detail-title" id="detailTitle">${esc(job.company)}</h2><p>${esc(job.role)}</p><div class="detail-meta"><span>${esc(job.city||"城市待定")}</span><span>${esc(job.salary||"薪资待定")}</span><span>${esc(job.source||"渠道待补充")}</span></div>${stageBadge(job)} ${priorityBadge(job)}
  <div class="detail-actions"><button data-action="edit" data-id="${id}">${icon("pencil")}编辑职位</button><select id="detailStage" aria-label="修改投递阶段">${Object.entries(stages).map(([value,label])=>`<option value="${value}" ${value===job.status?"selected":""}>${label}</option>`).join("")}</select><button class="icon-button danger" data-action="delete" data-id="${id}" title="删除职位" aria-label="删除职位">${icon("trash-2")}</button></div>
  <section class="detail-section"><h3>下次跟进</h3><p>${esc(job.next||"暂无跟进事项")}</p><small>${esc(job.deadline||"日期待安排")}</small></section>
  <section class="detail-section"><h3>职位备注</h3><p>${esc(job.notes||"暂无备注")}</p></section>
  <section class="detail-section"><h3>面试记录 · ${job.interviews.length}</h3><div>${job.interviews.map(i=>`<article class="interview"><div class="interview-head"><strong>${esc(i.title)}</strong><button class="icon-button" data-action="edit-interview" data-id="${id}" data-task="${i.id}" title="编辑面试复盘" aria-label="编辑面试复盘">${icon("pencil")}</button><button class="icon-button" data-action="remove-interview" data-id="${id}" data-task="${i.id}" title="删除面试记录" aria-label="删除面试记录">${icon("trash-2")}</button></div><time>${esc(formatDate(i.at))} · ${i.done?"已完成":"待进行"}</time><p>${esc(i.notes||"暂无复盘")}</p><button class="text-button" data-action="toggle-interview" data-id="${id}" data-task="${i.id}">${i.done?"标记待进行":"标记已完成"}</button></article>`).join("")||'<p class="muted">暂无面试记录</p>'}</div></section>
  <section class="detail-section"><h3>添加面试记录</h3><form id="interviewForm" class="interview-form"><label>面试主题<input name="title" required maxlength="100" placeholder="例如：技术一面"></label><label>面试时间<input name="at" required type="datetime-local"></label><label>准备与复盘<textarea name="notes" rows="3" maxlength="4000" placeholder="记录问题、回答和待改进项"></textarea></label><button class="primary" type="submit">保存面试记录</button></form></section>`;
  if(!$("detail").open) $("detail").showModal();
}

$("form").addEventListener("submit",event=>{
  event.preventDefault();
  const raw=Object.fromEntries(fields.map(key=>[key,$(key).value]));
  if(!raw.company.trim() || !raw.role.trim()) {$("formError").textContent="请填写公司名称和应聘岗位。";return;}
  if(raw.deadline && !raw.next.trim()) {$("formError").textContent="设置跟进日期时，请填写跟进事项。";return;}
  try {
    if(editing) {
      const old=jobs.find(j=>j.id===editing);
      if(!old) throw Error("该职位已不存在");
      const next=normalizeJob({...old,...raw});
      if(!update(editing,next,"更新职位资料")) return;
    } else {
      if(jobs.length>=2000) throw Error("最多保存 2000 个职位，请先导出整理");
      const job=normalizeJob({...raw,history:[{at:Date.now(),text:"添加职位"}]});
      if(!commit([job,...jobs],"职位已保存")) return;
    }
    $("editor").close();
    editing=null;
  } catch(e) {$("formError").textContent=e.message;}
});

document.addEventListener("submit",event=>{
  if(event.target.id!=="interviewForm") return;
  event.preventDefault();
  const job=jobs.find(j=>j.id===selected);
  if(!job) return;
  const data=new FormData(event.target);
  if(!String(data.get("title")).trim()) {notify("请填写面试主题");return;}
  if(job.interviews.length>=100 && !editingInterview) {notify("单个职位最多保存 100 条面试记录");return;}
  const existing=job.interviews.find(i=>i.id===editingInterview);
  const interview={id:existing?.id||uid(),title:String(data.get("title")).trim(),at:String(data.get("at")),notes:String(data.get("notes")).trim(),done:existing?.done||false};
  try {
    const normalized=normalizeJob({...job,interviews:existing?job.interviews.map(i=>i.id===existing.id?interview:i):[...job.interviews,interview]});
    if(update(job.id,{interviews:normalized.interviews},existing?"更新面试复盘":"添加面试记录")) openDetail(job.id);
  } catch(e) {notify(e.message);}
});

document.addEventListener("change",event=>{
  if(event.target.id==="detailStage" && selected) {
    if(update(selected,{status:event.target.value},"阶段更新为"+stages[event.target.value])) openDetail(selected);
  }
});

function exportData() {
  // Preserve unreadable source data rather than exporting an empty recovery screen.
  let content;
  try { content=JSON.stringify({version:1,exportedAt:new Date().toISOString(),jobs},null,2); if(!jobs.length) {const raw=localStorage.getItem("jobs");if(raw && raw!=="[]") content=raw;} }
  catch {content=JSON.stringify({version:1,jobs},null,2);}
  const url=URL.createObjectURL(new Blob([content],{type:"application/json;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="求职工作台备份-"+today+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

$("importFile").addEventListener("change",async event=>{
  const file=event.target.files[0];
  if(!file) return;
  try {
    if(file.size>5*1024*1024) throw Error("备份文件不能超过 5 MB");
    const data=JSON.parse(await file.text());
    const raw=Array.isArray(data)?data:data.version===1?data.jobs:null;
    if(!Array.isArray(raw)||raw.length>2000) throw Error("备份格式无效");
    const incoming=raw.map(normalizeJob), ids=new Set(jobs.map(j=>j.id));
    const additions=[];
    incoming.forEach(j=>{if(!ids.has(j.id)){additions.push(j);ids.add(j.id);}});
    if(jobs.length+additions.length>2000) throw Error("合并后超过 2000 个职位");
    if(!additions.length) {notify("没有新记录，相同编号的职位已保留");return;}
    if(confirm("导入 "+additions.length+" 个新职位？现有同编号记录不会覆盖。")) commit([...additions,...jobs],"导入完成");
  } catch(e) {notify("导入失败："+e.message);}
  finally {event.target.value="";}
});

document.addEventListener("click",event=>{
  const button=event.target.closest("[data-action]");
  if(!button || button.disabled) return;
  const {action,id,task}=button.dataset;
  if(action==="new") return openEditor();
  if(action==="edit") return openEditor(id);
  if(action==="detail") return openDetail(id);
  if(action==="close-editor") return $("editor").close();
  if(action==="close-detail") return $("detail").close();
  if(action==="board"||action==="list") {mode=action;render();return;}
  if(action==="export") return exportData();
  if(action==="import") return $("importFile").click();
  if(action==="clear") {["search","stageFilter","priorityFilter"].forEach(key=>$(key).value="");render();return;}
  const job=jobs.find(j=>j.id===id);
  if(!job) return;
  if(action==="edit-interview") {
    const interview=job.interviews.find(i=>i.id===task);
    if(!interview) return;
    editingInterview=interview.id;
    const form=$("interviewForm");
    ["title","at","notes"].forEach(key=>form.elements[key].value=interview[key]);
    form.querySelector("button").textContent="更新面试记录";
    form.elements.notes.focus();
    return;
  }
  if(action==="delete") {
    if(confirm("删除「"+job.company+"」及其面试记录？") && commit(jobs.filter(j=>j.id!==id),"职位已删除")) $("detail").close();
  } else if(action==="next"||action==="prev") {
    const keys=Object.keys(stages), index=keys.indexOf(job.status), next=keys[Math.max(0,Math.min(keys.length-1,index+(action==="next"?1:-1)))];
    update(id,{status:next},"阶段更新为"+stages[next]);
  } else if(action==="complete" && task==="follow") {
    update(id,{next:"",deadline:""},"完成跟进："+job.next);
  } else if(["complete","toggle-interview","remove-interview"].includes(action)) {
    if(action==="remove-interview" && !confirm("删除这条面试记录？")) return;
    const interviews=action==="remove-interview"?job.interviews.filter(i=>i.id!==task):job.interviews.map(i=>i.id===task?{...i,done:action==="complete"?true:!i.done}:i);
    if(update(id,{interviews},action==="remove-interview"?"删除面试记录":"更新面试状态") && $("detail").open) openDetail(id);
  }
});

const options=Object.entries(stages).map(([value,label])=>`<option value="${value}">${label}</option>`).join("");
$("status").innerHTML=options;
$("stageFilter").insertAdjacentHTML("beforeend",options);
["search","stageFilter","priorityFilter","sort","scheduleFilter"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",render));
window.addEventListener("hashchange",render);
render();
