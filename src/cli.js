#!/usr/bin/env node
import { readFile } from 'node:fs/promises';import { audit } from './index.js';
const a=process.argv.slice(2),file=a.find(x=>!x.startsWith('--')),at=a.indexOf('--deadline'),deadline=at>=0?Number(a[at+1]):undefined;
if(!file||a.includes('--help')){console.log('Usage: timeout-budget-audit PLAN.json [--deadline MS] [--json]');process.exit(file?0:2)}
try{const r=audit(JSON.parse(await readFile(file,'utf8')),{deadlineMs:deadline});if(a.includes('--json'))console.log(JSON.stringify(r,null,2));else{console.log(`worst ${r.worstCaseMs}ms; first-attempt ${r.firstAttemptMs}ms; ${r.requestCount} request(s); critical path ${r.criticalPath.join(' > ')}`);if(r.deadlineMs!==null)console.log(`deadline ${r.deadlineMs}ms; slack ${r.slackMs}ms`)}process.exitCode=r.ok?0:1}catch(e){console.error(`timeout-budget-audit: ${e.message}`);process.exitCode=2}
