import test from 'node:test'
import assert from 'node:assert/strict'
import {canResumeAfterDiskPause,createSerialCheckpointQueue} from '../lib/wayback/diskRecovery.mjs'
test('disk resume keeps one GiB of hysteresis',()=>{const g=1024**3;assert.equal(canResumeAfterDiskPause(6.9*g,6*g),false);assert.equal(canResumeAfterDiskPause(7*g,6*g),true)})
test('snapshots never overlap and failure does not block the queue',async()=>{const q=createSerialCheckpointQueue();let active=0,max=0,completed=0;const tasks=[0,1,2].map(i=>q(async()=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,10));active--;if(i===1)throw Error('upload failed');completed++}));const result=await Promise.allSettled(tasks);assert.equal(max,1);assert.equal(completed,2);assert.equal(result[1].status,'rejected')})
