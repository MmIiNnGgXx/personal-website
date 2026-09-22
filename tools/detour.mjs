#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import {readFileSync, writeFileSync, mkdirSync, statSync} from "node:fs";
import {resolve, dirname, basename} from "node:path";
import {fileURLToPath} from "node:url";

const args=process.argv.slice(2);
const value=name=>{const i=args.indexOf(name);return i<0?null:args[i+1]};
const has=name=>args.includes(name);
const repo=resolve(value("--repo")||".");
const out=resolve(value("--out")||"projects/tools/detour/generated-report.js");
const codex=value("--codex");

function redact(input){
  return String(input??"")
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g,"[API_KEY_REDACTED]")
    .replace(/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{12,}\b/g,"[SUPABASE_KEY_REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}(?:\.[A-Za-z0-9_-]{10,})?\b/g,"[TOKEN_REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[EMAIL_REDACTED]")
    .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g,"[PHONE_REDACTED]")
    .replace(/\b[A-Za-z]:\\Users\\[^\\\s]+/g,"[USER_HOME]")
    .replace(/\b[A-Za-z]:\\[^\r\n"']+/g,"[LOCAL_PATH]")
    .slice(0,1200);
}

function git(...gitArgs){return execFileSync("git",["-C",repo,...gitArgs],{encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim()}

function gitEvents(){
  const raw=git("log","-n","80","--date=iso-strict","--pretty=format:%H%x1f%aI%x1f%s%x1e");
  return raw.split("\x1e").filter(Boolean).map((row,index)=>{
    const [hash,date,subject]=row.trim().split("\x1f");
    let stat="";try{stat=git("diff-tree","--no-commit-id","--shortstat","-r",hash)}catch{}
    return {id:`git-${hash.slice(0,8)}`,source:"git",timestamp:date,type:"change",summary:redact(subject),evidence:redact(`${hash.slice(0,8)} ${stat}`),index};
  });
}

function strings(value,result=[]){
  if(typeof value==="string")result.push(value);
  else if(Array.isArray(value))value.forEach(item=>strings(item,result));
  else if(value&&typeof value==="object")Object.entries(value).forEach(([key,item])=>{if(!/thinking|encrypted|image|blob|base64/i.test(key))strings(item,result)});
  return result;
}

function codexEvents(file){
  const path=resolve(file);if(statSync(path).size>25*1024*1024)throw Error("JSONL 超过 25 MB，请先导出相关会话片段");
  const signals=/(失败|错误|放弃|不做|停止|下线|换一个|不适合|成本太大|空壳|摆设|验证|测试|通过|failed|error|timeout|abandon|rollback|revert)/i;
  return readFileSync(path,"utf8").split(/\r?\n/).filter(Boolean).slice(0,20000).flatMap((line,index)=>{
    let item;try{item=JSON.parse(line)}catch{return []}
    const text=strings(item).find(value=>signals.test(value));if(!text)return [];
    const timestamp=item.timestamp||item.created_at||item.payload?.timestamp||new Date(0).toISOString();
    return [{id:`session-${index}`,source:"session",timestamp,type:/放弃|停止|下线|换一个|abandon|rollback|revert/i.test(text)?"pivot":/失败|错误|空壳|摆设|failed|error|timeout/i.test(text)?"failure":"verification",summary:redact(text),evidence:`${basename(path)}:${index+1}`}];
  });
}

function decision(event,index){
  const status=event.type==="pivot"?"abandoned":event.type==="failure"?"reversed":event.type==="verification"?"kept":"unverified";
  return {id:`candidate-${index+1}`,stage:event.type==="change"?"实现":event.type==="verification"?"验证":"转向",title:event.summary.slice(0,72)||"未命名事件",goal:"等待人工补充",assumption:"由扫描规则发现，尚未人工确认",outcome:event.type==="failure"?"发现失败信号":event.type==="pivot"?"发现方向调整信号":"发现代码变化",reason:"扫描器只提出候选，不替用户下结论。",cost:event.source==="git"?event.evidence:"未评估",status,approved:false,evidence:[{label:event.source==="git"?"Git 记录":"会话片段",detail:event.evidence,kind:event.source}],lesson:"等待人工复核",timestamp:event.timestamp};
}

function applySuggestions(nodes,suggestions=[]){
  const byId=new Map(suggestions.map(item=>[item.candidateId,item]));
  return nodes.map(node=>{const suggestion=byId.get(node.id);if(!suggestion)return node;return {...node,title:redact(suggestion.title||node.title),reason:redact(suggestion.reason||node.reason),lesson:redact(suggestion.lesson||node.lesson),approved:false}});
}

async function aiSuggest(nodes){
  const apiKey=process.env.DEEPSEEK_API_KEY;if(!apiKey)throw Error("使用 --ai 时需要在本机环境变量设置 DEEPSEEK_API_KEY");
  const schema={type:"object",additionalProperties:false,required:["suggestions"],properties:{suggestions:{type:"array",items:{type:"object",additionalProperties:false,required:["candidateId","title","reason","lesson"],properties:{candidateId:{type:"string"},title:{type:"string"},reason:{type:"string"},lesson:{type:"string"}}}}}};
  const input=nodes.slice(0,80).map(({id,stage,title,outcome})=>({id,stage,title,outcome}));
  const response=await fetch("https://api.deepseek.com/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.DEEPSEEK_MODEL||"deepseek-flash",input:`只根据输入事实，为每个候选生成简短中文标题、原因和教训。不得判断验证状态，不得补充输入外的事实。\n${JSON.stringify(input)}`,text:{format:{type:"json_schema",name:"detour_suggestions",schema}}})});
  if(!response.ok)throw Error(`DeepSeek 请求失败 (${response.status})`);const body=await response.json(),text=body.output_text||body.output?.flatMap(item=>item.content||[]).find(item=>item.type==="output_text")?.text;if(!text)throw Error("DeepSeek 返回空结果");return JSON.parse(text).suggestions||[];
}

function assertSafe(serialized){
  const secret=/(sk-[A-Za-z0-9_-]{12,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{12,}|\beyJ[A-Za-z0-9_-]{20,}\.)/;
  if(secret.test(serialized))throw Error("发布文件仍包含疑似密钥，已停止写入");
}

async function main(){
  if(!has("--scan")&&!has("--help")){console.log("用法: node tools/detour.mjs --scan --repo . [--codex session.jsonl] --out report.js");return}
  if(has("--help"))return;
  const events=[...gitEvents(),...(codex?codexEvents(codex):[])].sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp)));
  let nodes=events.map(decision),aiStatus="disabled";if(has("--ai"))try{nodes=applySuggestions(nodes,await aiSuggest(nodes));aiStatus="suggested"}catch(error){aiStatus=`fallback: ${redact(error.message)}`;console.warn(`Detour AI: ${aiStatus}`)}
  const report={meta:{title:`${basename(repo)} · 扫描候选`,subtitle:"本地扫描结果，发布前必须人工复核",period:events.length?`${events[0].timestamp.slice(0,10)} — ${events.at(-1).timestamp.slice(0,10)}`:"无记录",mode:"private-review",verified:false,aiStatus},nodes,lessons:[]};
  const serialized=JSON.stringify(report,null,2).replaceAll("<","\\u003c");assertSafe(serialized);mkdirSync(dirname(out),{recursive:true});writeFileSync(out,`window.DETOUR_REPORT=${serialized};\n`,`utf8`);console.log(`Detour: ${events.length} 条事件，${report.nodes.length} 个候选节点 -> ${out}`);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(`Detour: ${error.message}`);process.exitCode=1});
export {redact, codexEvents, decision, applySuggestions, assertSafe};
