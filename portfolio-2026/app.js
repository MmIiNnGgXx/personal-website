const cases = {
 sea:{title:"潮汐手账",sub:"内容与视觉 / 个人作品",images:["sea","sea-note"],sections:[["作品背景","以海洋为主题的系列海报，将海浪、文学片段和手账感画面组合，形成统一的内容表达。原作品集收录了系列主视觉与精选设计。"],["表达与设计","青蓝色海浪建立主题识别；手写式文字与留白形成阅读节奏。系列通过同一视觉语言承载不同文案，便于形成持续更新的内容栏目。"],["从作品到产品思考","本次复盘：系列化设计可以减少重复排版，让内容生产更一致。若用于真实运营，应比较收藏、分享和阅读完成情况，不能只凭视觉偏好判断传播效果。"]]},
 autumn:{title:"把秋天写到诗中",sub:"内容与视觉 / 个人作品",images:["autumn","autumn-note"],sections:[["作品背景","围绕秋天与诗歌创作主题海报，把节气美学与文学意境结合。作品使用麦田、人物和暖黄色调，适合形成季节性内容系列。"],["内容与视觉的配合","文案是阅读入口，插画提供情绪和场景。不同篇目的画面保持相似色彩关系，形成统一的系列识别。"],["下一步如何验证","本次复盘：应先明确发布渠道、目标读者和传播目的，再判断字号、比例和内容密度。这里展示的是作品本身，不宣称已经带来增长或商业效果。"]]},
 photo:{title:"在场，才看得见",sub:"摄影摄像 / 个人作品",images:["sport","culture"],sections:[["作品内容","原作品集包含校园纪实、运动摄影、风光、人像与活动记录。本页选择运动会和人文活动照片，展示现场观察与画面表达。"],["我的工作","结合简历与作品集，摄影摄像是校园宣传与活动实践中的工作内容，涉及现场拍摄和宣传素材整理。"],["对产品工作的启发","本次复盘：先观察真实行为，再解释需求。摄影中的取景与时机选择，也提醒我区分亲眼观察、个人解释和未经验证的判断。"]]},
 game:{title:"AI 四子棋",sub:"产品实验 / 博弈搜索，不是大模型",sections:[["项目问题","AI 对手的决策通常藏在后台，玩家只能看到结果。这个项目尝试把棋盘、难度选择与局势分析放在同一体验中，让玩家理解判断。"],["可检查的实现","当前公开源码包含 Minimax 与 Alpha-Beta 剪枝、三档难度和局势分析。演示沿用公开仓库的原实现，本次新增作品集的组织与案例呈现。"],["产品化复盘","这是个人实验，不是已获商业验证的产品。体验价值在于：决策可见、难度可选、结果可反馈。后续可观察新用户是否理解分析说明，而非用算法名称替代用户价值。"]],links:[["体验四子棋","play/"],["查看公开源码","https://github.com/MmIiNnGgXx/personal-website/tree/main/projects/games/ai-connect4"]]},
 research:{title:"蟹呼噜美学 · 少儿美育调研",sub:"需求调研 / 团队项目成员",sections:[["项目背景","参与大学生创新创业训练计划中的少儿美育项目，探索线上课程、线下活动、展览和培训等多模式协同。"],["我的参与","根据本人提供的材料：参与问卷、访谈和实地考察，协助梳理需求、设计美育模式与整合教学资源。团队成果不等于个人独立完成。"],["从经历到产品思考","本次复盘：孩子、家长和教学机构有不同目标，需要分别理解。有效的方案应说明服务对象、场景、交付形式和反馈方式。奖项、样本规模与效果指标待原始材料核对，首版不作为成果宣传。"]]},
 content:{title:"慢游海沧 · 内容运营实践",sub:"新媒体实践 / 专栏策划助理",sections:[["实践背景","参与海沧青年相关内容实践，协助“慢游海沧”专栏的选题策划、文章创作与推广活动，将地方场景转化成读者可以理解的故事。"],["工作链路","从选题与素材收集到文章表达、社交传播和反馈整理。网站展示的是原材料中的职责，不把团队运营成果全部归于个人。"],["产品化复盘","本次复盘：内容运营也是持续理解用户的过程。应先明确读者为什么关注、下一步希望读者做什么，再选择传播渠道和反馈指标。原材料中的阅读与增长数字未独立核验，因此此处不写效果百分比。"]]}
};
const dialog=document.querySelector("#case-dialog");
const body=document.querySelector("#case-body");
let opener;
function openCase(key,button){const item=cases[key];if(!item)return;opener=button;body.replaceChildren();const article=document.createElement("article");article.className="case-copy";const sub=document.createElement("p");sub.className="eyebrow";sub.textContent=item.sub;article.append(sub);const title=document.createElement("h2");title.id="case-title";title.textContent=item.title;article.append(title);
if(item.images){const gallery=document.createElement("div");gallery.className="case-hero";for(const name of item.images){const img=document.createElement("img");img.src="assets/"+name+".jpg";img.alt=item.title+"作品";gallery.append(img)}article.append(gallery)}
for(const [heading,text]of item.sections){const h=document.createElement("h3");h.textContent=heading;const p=document.createElement("p");p.textContent=text;article.append(h,p)}
for(const [label,url]of item.links||[]){const link=document.createElement("a");link.className="button";link.textContent=label+" ↗";link.href=url;article.append(link)}
const source=document.createElement("p");source.className="case-source";source.textContent="来源：本人提供的简历、求职作品集与公开 GitHub 仓库。作品归属依据本人材料；项目复盘为本次整理，未独立核验运营指标。";article.append(source);body.append(article);dialog.showModal();dialog.scrollTop=0;}
document.querySelectorAll("[data-case]").forEach(button=>button.addEventListener("click",()=>openCase(button.dataset.case,button)));
document.querySelector("#close-case").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>opener?.focus());
dialog.addEventListener("click",event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});
document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));let count=0;document.querySelectorAll(".project").forEach(project=>{project.hidden=button.dataset.filter!=="all"&&project.dataset.category!==button.dataset.filter;if(!project.hidden)count++});document.querySelector("#filter-status").textContent="显示 "+count+" 个作品"}));
const board=document.querySelector(".mini-board");for(let i=0;i<42;i++){const cell=document.createElement("i");if([24,31,38,40].includes(i))cell.className="r";if([30,37,39].includes(i))cell.className="y";board.append(cell)}
document.querySelector("#print").addEventListener("click",()=>window.print());
