import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";
import mammoth from "npm:mammoth@1.9.1";
import pdf from "npm:pdf-parse@1.1.1";
import {Buffer} from "node:buffer";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const schema={type:"object",additionalProperties:false,required:["score","summary","evidence","missing","actions","application_pack"],properties:{score:{type:"integer",minimum:0,maximum:100},summary:{type:"string"},evidence:{type:"array",items:{type:"string"}},missing:{type:"array",items:{type:"string"}},actions:{type:"array",items:{type:"string"}},application_pack:{type:"object",additionalProperties:false,required:["headline","cover_letter","field_answers"],properties:{headline:{type:"string"},cover_letter:{type:"string"},field_answers:{type:"array",items:{type:"object",additionalProperties:false,required:["field","answer"],properties:{field:{type:"string"},answer:{type:"string"}}}}}}}};
async function extract(file:{name:string;type:string;data:string}){const bytes=Uint8Array.from(atob(file.data),c=>c.charCodeAt(0));if(file.name.toLowerCase().endsWith(".pdf"))return (await pdf(Buffer.from(bytes))).text;if(file.name.toLowerCase().endsWith(".docx"))return (await mammoth.extractRawText({buffer:Buffer.from(bytes)})).value;throw Error("仅支持 PDF 或 DOCX")}
Deno.serve(async request=>{
  if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const auth=request.headers.get("Authorization")||"",supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
    const {data:{user}}=await supabase.auth.getUser();if(!user)return json({error:"请先登录"},401);
    const {role,company="",jobDescription,sourceUrl="",file}=await request.json();if(!file?.data||!jobDescription?.trim()||!role?.trim())return json({error:"请提供简历、岗位名称和 JD"},400);if(file.data.length>14_000_000)return json({error:"文件不能超过 10 MB"},413);
    const resumeText=(await extract(file)).trim().slice(0,50000);if(!resumeText)return json({error:"未能从简历中提取文本"},422);
    const apiKey=Deno.env.get("DEEPSEEK_API_KEY");if(!apiKey)return json({error:"DeepSeek 尚未配置"},503);const model=Deno.env.get("DEEPSEEK_MODEL")||"deepseek-flash";
    const prompt=`请仅依据提供的真实简历和岗位描述进行中文分析，不得虚构经历。输出必须符合给定 JSON schema。\n岗位：${role}\n公司：${company}\nJD：${jobDescription.slice(0,20000)}\n简历：${resumeText}`;
    let result:any;for(let attempt=0;attempt<2;attempt++){const response=await fetch("https://api.deepseek.com/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model,input:[{role:"system",content:"你是严谨的求职匹配助手。输出 json，只使用输入中的事实。"},{role:"user",content:prompt}],text:{format:{type:"json_schema",name:"job_match",schema}}})});if(!response.ok)throw Error(`DeepSeek 请求失败 (${response.status})`);const body=await response.json(),text=body.output_text||body.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==="output_text")?.text;if(text){result=JSON.parse(text);break}}if(!result)throw Error("DeepSeek 返回空结果");
    const {data:resume,error:resumeError}=await supabase.from("resumes").insert({user_id:user.id,file_name:String(file.name).slice(0,160),content_text:resumeText}).select().single();if(resumeError)throw resumeError;
    const {data:job,error:jobError}=await supabase.from("jobs").insert({user_id:user.id,company:String(company).slice(0,160),role:String(role).slice(0,160),source_url:String(sourceUrl).slice(0,1000),description:String(jobDescription).slice(0,30000)}).select().single();if(jobError)throw jobError;
    await Promise.all([supabase.from("matches").insert({user_id:user.id,resume_id:resume.id,job_id:job.id,score:result.score,result,model}),supabase.from("application_packs").insert({user_id:user.id,resume_id:resume.id,job_id:job.id,content:result.application_pack,model}),supabase.from("audit_logs").insert({user_id:user.id,action:"analyze",resource_type:"job",resource_id:job.id,metadata:{model}})]);
    return json({result,resumeId:resume.id,jobId:job.id,model});
  }catch(error){return json({error:error instanceof Error?error.message:"分析失败"},500)}
});
