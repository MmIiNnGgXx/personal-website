import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {redact,codexEvents,decision,applySuggestions,assertSafe} from "./detour.mjs";

const sample="联系 test@example.com，密钥 sk-1234567890abcdefghijkl，路径 C:\\Users\\demo\\repo，后来发现只是空壳所以放弃。";
const clean=redact(sample);
assert(!clean.includes("test@example.com"));assert(!clean.includes("sk-123"));assert(!clean.includes("C:\\Users\\demo"));
const dir=mkdtempSync(join(tmpdir(),"detour-")),file=join(dir,"sample.jsonl");
writeFileSync(file,JSON.stringify({timestamp:"2026-09-20T10:00:00Z",message:sample})+"\n");
const events=codexEvents(file);assert.equal(events.length,1);assert.equal(events[0].type,"pivot");
const node=decision(events[0],0);assert.equal(node.status,"abandoned");assert.equal(node.approved,false);
const suggested=applySuggestions([node],[{candidateId:node.id,title:"候选标题",reason:"候选原因",lesson:"候选教训"}])[0];assert.equal(suggested.title,"候选标题");assert.equal(suggested.status,"abandoned");assert.equal(suggested.approved,false);
assert.throws(()=>assertSafe('{"key":"sk-1234567890abcdefghijkl"}'));
rmSync(dir,{recursive:true,force:true});console.log("PASS: redaction, JSONL detection, classification, AI suggestion guard, publish gate");
