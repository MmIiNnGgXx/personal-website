"use strict";
const base=structuredClone(window.DETOUR_REPORT),storeKey="detour-review:"+base.meta.title;
let report=base,selected=null,zoom=1,reviewMode=false;
try{const saved=JSON.parse(localStorage.getItem(storeKey)||"null");if(saved?.nodes)report=saved}catch{}
const $=selector=>document.querySelector(selector), $$=selector=>[...document.querySelectorAll(selector)];
const statusLabel={kept:"保留",reversed:"被推翻",abandoned:"已放弃",unverified:"未验证"};
const positions=[[70,250],[190,250],[310,250],[430,160],[550,160],[670,160],[790,250],[900,250]];
const escapeText=value=>String(value??"");

function setup(){
  renderMeta();
  $$(".filter").forEach(button=>{const stage=button.dataset.stage,count=stage==="全部"?report.nodes.length:report.nodes.filter(n=>n.stage===stage).length;button.querySelector("b").textContent=count;button.addEventListener("click",()=>filter(stage,button))});
  $("#zoom-in").addEventListener("click",()=>setZoom(.15));$("#zoom-out").addEventListener("click",()=>setZoom(-.15));
  $("#mode").addEventListener("click",toggleMode);$("#import-report").addEventListener("click",()=>$("#report-file").click());$("#report-file").addEventListener("change",importReport);$("#export-json").addEventListener("click",()=>download("detour-report.json",JSON.stringify(publicReport(),null,2),"application/json"));$("#export-md").addEventListener("click",exportMarkdown);$("#save-review").addEventListener("click",saveReview);
  renderMap();renderLessons();selectNode(report.nodes[0]?.id);
}

function renderMeta(){$("#case-title").textContent=report.meta.title;$("#period").textContent=report.meta.period;$("#case-summary").textContent=report.meta.summary||report.meta.subtitle||"等待人工复核";$("#pivot-count").textContent=report.nodes.filter(n=>["reversed","abandoned"].includes(n.status)).length+" 次";$("#all-count").textContent=report.nodes.length;$$('.filter').forEach(button=>{const stage=button.dataset.stage;button.querySelector('b').textContent=stage==="全部"?report.nodes.length:report.nodes.filter(node=>node.stage===stage).length})}

async function importReport(event){
  const file=event.target.files[0];if(!file)return;if(file.size>5*1024*1024){alert("报告超过 5 MB，请缩小扫描范围。");return}
  try{const raw=await file.text(),json=raw.replace(/^\s*window\.DETOUR_REPORT\s*=\s*/,"").replace(/;\s*$/,"");const next=JSON.parse(json);if(!next?.meta||!Array.isArray(next.nodes))throw Error("缺少 meta 或 nodes");report=next;reviewMode=true;$("#mode").setAttribute("aria-pressed","true");$("#mode").textContent="本地复核";renderMeta();renderMap();renderLessons();selectNode(report.nodes[0]?.id)}catch(error){alert("无法读取 Detour 报告："+error.message)}finally{event.target.value=""}
}

function renderMap(){
  const svg=$("#decision-map");svg.querySelectorAll(".route,.node").forEach(node=>node.remove());
  const ns="http://www.w3.org/2000/svg",path=document.createElementNS(ns,"path");path.setAttribute("class","route kept");path.setAttribute("d","M70 250 H310 C365 250 375 160 430 160 H670 C725 160 735 250 790 250 H900");svg.append(path);
  const dropped=document.createElementNS(ns,"path");dropped.setAttribute("class","route dropped");dropped.setAttribute("d","M310 250 C365 250 375 370 440 370 H710 C755 370 770 300 790 250");svg.append(dropped);
  report.nodes.forEach((node,index)=>{const [x,y]=positions[index]||[70+index*105,250],g=document.createElementNS(ns,"g");g.setAttribute("class","node");g.dataset.id=node.id;g.dataset.stage=node.stage;g.setAttribute("transform",`translate(${x} ${y})`);g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",`${node.stage}：${node.title}，${statusLabel[node.status]}`);g.innerHTML=`<circle r="14"></circle><text text-anchor="middle" y="-31">${escapeXml(short(node.title,12))}</text><text class="date" text-anchor="middle" y="36">${escapeXml(node.timestamp.slice(5))}</text>`;g.addEventListener("click",()=>selectNode(node.id));g.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectNode(node.id)}});svg.append(g)});
  renderMobile();
}

function renderMobile(){const panel=$(".map-panel"),old=$(".mobile-timeline");if(old)old.remove();const list=document.createElement("div");list.className="mobile-timeline";report.nodes.forEach(node=>{const button=document.createElement("button");button.type="button";button.className="mobile-node";button.dataset.id=node.id;button.dataset.stage=node.stage;button.dataset.status=node.status;button.innerHTML=`<i></i><span><small>${escapeHtml(node.timestamp)} · ${escapeHtml(node.stage)}</small><strong>${escapeHtml(node.title)}</strong></span>`;button.addEventListener("click",()=>selectNode(node.id));list.append(button)});panel.prepend(list)}

function selectNode(id){selected=report.nodes.find(node=>node.id===id);if(!selected)return;$$(`[data-id]`).forEach(node=>node.classList.toggle("selected",node.dataset.id===id));const proofs=selected.evidence.map(item=>`<article class="proof ${escapeHtml(item.kind)}"><b>${escapeHtml(item.label)}</b><p>${escapeHtml(item.detail)}</p></article>`).join("");$("#evidence").innerHTML=`<header><p class="eyebrow">${escapeHtml(selected.timestamp)} · ${escapeHtml(selected.stage)}</p><h3>${escapeHtml(selected.title)}</h3><div class="stage-status"><span class="tag ${escapeHtml(selected.status)}">${escapeHtml(statusLabel[selected.status])}</span><span class="tag">${selected.approved?"已批准公开":"待人工批准"}</span></div></header><dl><dt>当时目标</dt><dd>${escapeHtml(selected.goal)}</dd><dt>原始假设</dt><dd>${escapeHtml(selected.assumption)}</dd><dt>实际结果</dt><dd>${escapeHtml(selected.outcome)}</dd><dt>为什么改变</dt><dd>${escapeHtml(selected.reason)}</dd><dt>影响</dt><dd>${escapeHtml(selected.cost)}</dd></dl><div class="proofs">${proofs}</div><div class="lesson-callout"><b>带走的规则</b><br>${escapeHtml(selected.lesson)}</div>${reviewMode?'<button type="button" class="button review-button" id="review-node">复核这个节点</button>':""}`;$("#review-node")?.addEventListener("click",openReview)}

function filter(stage,button){$$(".filter").forEach(item=>item.classList.toggle("active",item===button));$$(`[data-stage]`).filter(item=>item.classList.contains("node")||item.classList.contains("mobile-node")).forEach(item=>item.classList.toggle("hidden",stage!=="全部"&&item.dataset.stage!==stage))}
function setZoom(delta){zoom=Math.min(1.6,Math.max(.7,zoom+delta));$("#decision-map").style.width=`${zoom*100}%`;$("#zoom-value").textContent=Math.round(zoom*100)+"%"}
function toggleMode(){reviewMode=!reviewMode;const button=$("#mode");button.setAttribute("aria-pressed",String(reviewMode));button.textContent=reviewMode?"本地复核":"公开预览";selectNode(selected?.id)}
function openReview(){const dialog=$("#review-dialog");$("#review-title").value=selected.title;$("#review-reason").value=selected.reason;$("#review-lesson").value=selected.lesson;$("#review-approved").checked=selected.approved;dialog.showModal()}
function saveReview(event){event.preventDefault();selected.title=$("#review-title").value.trim()||selected.title;selected.reason=$("#review-reason").value.trim()||selected.reason;selected.lesson=$("#review-lesson").value.trim()||selected.lesson;selected.approved=$("#review-approved").checked;localStorage.setItem(storeKey,JSON.stringify(report));$("#review-dialog").close();renderMap();selectNode(selected.id)}
function renderLessons(){$("#lesson-list").innerHTML=report.lessons.map((lesson,index)=>`<li><span class="lesson-index">0${index+1}</span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.body)}</p><button type="button" data-source="${escapeHtml(lesson.source)}">查看来源节点 →</button></li>`).join("");$$(`[data-source]`).forEach(button=>button.addEventListener("click",()=>{selectNode(button.dataset.source);$("#map").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}))}
function publicReport(){return {...report,nodes:report.nodes.filter(node=>node.approved)}}
function exportMarkdown(){const data=publicReport(),text=`# ${data.meta.title}\n\n${data.meta.summary}\n\n## 决策节点\n\n${data.nodes.map(node=>`### ${node.timestamp} · ${node.title}\n\n- 状态：${statusLabel[node.status]}\n- 假设：${node.assumption}\n- 结果：${node.outcome}\n- 教训：${node.lesson}`).join("\n\n")}\n\n## 防错规则\n\n${data.lessons.map(item=>`- **${item.title}**：${item.body}`).join("\n")}\n`;download("detour-review.md",text,"text/markdown")}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type:`${type};charset=utf-8`})),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),0)}
function short(value,max){return value.length>max?value.slice(0,max-1)+"…":value}
function escapeHtml(value){return escapeText(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
function escapeXml(value){return escapeHtml(value)}
setup();
