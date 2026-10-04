function delayAt(backoff,index){if(typeof backoff==='number')return backoff;if(!backoff)return 0;return Math.min((backoff.initialMs||0)*Math.pow(backoff.factor??2,index),backoff.maxMs??Infinity)}
export function model(node,path=[]){
  if(!node||typeof node!=='object')throw new Error('plan nodes must be objects');const name=node.name||`step-${path.length+1}`,here=[...path,name];
  if(Array.isArray(node.steps)){
    if(!node.steps.length)throw new Error(`${here.join(' > ')} has no steps`);if(!['sequential','parallel'].includes(node.mode))throw new Error(`${here.join(' > ')} mode must be sequential or parallel`);
    const children=node.steps.map(step=>model(step,here)),critical=node.mode==='sequential'?children.flatMap(c=>c.criticalPath):children.reduce((a,b)=>a.worstCaseMs>=b.worstCaseMs?a:b).criticalPath;
    const combine=field=>node.mode==='sequential'?children.reduce((n,c)=>n+c[field],0):Math.max(...children.map(c=>c[field]));const overhead=Number(node.overheadMs||0);
    return {name,type:'group',mode:node.mode,firstAttemptMs:combine('firstAttemptMs')+overhead,worstCaseMs:combine('worstCaseMs')+overhead,requestCount:children.reduce((n,c)=>n+c.requestCount,0),criticalPath:node.mode==='sequential'?critical:[name,...critical],children};
  }
  const timeoutMs=Number(node.timeoutMs),attempts=Number(node.attempts??1);if(!(timeoutMs>=0)||!Number.isInteger(attempts)||attempts<1)throw new Error(`${here.join(' > ')} needs timeoutMs >= 0 and attempts >= 1`);
  const delays=Array.from({length:attempts-1},(_,i)=>delayAt(node.backoff,i));const worstCaseMs=timeoutMs*attempts+delays.reduce((a,b)=>a+b,0);
  return {name,type:'operation',timeoutMs,attempts,delays,firstAttemptMs:timeoutMs,worstCaseMs,requestCount:attempts,criticalPath:[name]};
}
export function audit(plan,{deadlineMs=plan.deadlineMs}={}){const result=model(plan),deadline=deadlineMs==null?null:Number(deadlineMs);const findings=[];if(deadline!==null&&result.worstCaseMs>deadline)findings.push({kind:'deadline-exceeded',severity:'critical',overByMs:result.worstCaseMs-deadline});return {...result,deadlineMs:deadline,slackMs:deadline===null?null:deadline-result.worstCaseMs,findings,ok:!findings.length}}
