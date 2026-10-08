import test from 'node:test'
import assert from 'node:assert/strict'
import {createBridgeLimiter,createStageMetrics} from '../lib/wayback/bridgePool.mjs'
test('machine-wide bound survives failures and frees slots immediately',async()=>{const p=createBridgeLimiter(2);let n=0,max=0;const order=[];const tasks=[0,1,2,3].map(i=>p.run(async()=>{n++;max=Math.max(max,n);await new Promise(r=>setTimeout(r,i===0?70:5));order.push(i);n--;if(i===1)throw Error('failed')}));const result=await Promise.allSettled(tasks);assert.equal(max,2);assert.ok(order.indexOf(2)<order.indexOf(0));assert.equal(p.active,0);assert.equal(p.waiting,0);assert.equal(result[1].status,'rejected')})
test('stage metrics record errors and timing',async()=>{const m=createStageMetrics();await m.measure('upload',async()=>1);await assert.rejects(m.measure('upload',async()=>{throw Error('failed')}));assert.equal(m.stages.upload.calls,2);assert.equal(m.stages.upload.failures,1);assert.ok(m.stages.upload.totalMs>=0)})
