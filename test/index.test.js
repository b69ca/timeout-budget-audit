import test from 'node:test';import assert from 'node:assert/strict';import { audit,model } from '../src/index.js';
test('models retry attempts and exponential backoff',()=>assert.equal(model({name:'api',timeoutMs:100,attempts:3,backoff:{initialMs:10,factor:2}}).worstCaseMs,330));
test('adds sequential steps',()=>assert.equal(model({name:'flow',mode:'sequential',steps:[{name:'a',timeoutMs:10},{name:'b',timeoutMs:20}]}).worstCaseMs,30));
test('uses longest parallel critical path',()=>{const r=model({name:'fanout',mode:'parallel',steps:[{name:'a',timeoutMs:10},{name:'b',timeoutMs:20}]});assert.equal(r.worstCaseMs,20);assert.deepEqual(r.criticalPath,['fanout','b'])});
test('flags a blown deadline',()=>{const r=audit({name:'api',timeoutMs:100,attempts:2,deadlineMs:150});assert.equal(r.ok,false);assert.equal(r.slackMs,-50)});
