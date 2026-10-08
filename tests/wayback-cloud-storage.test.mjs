import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createWaybackCloudStore } from '../lib/wayback/cloudStorage.mjs'
import { createWaybackProxyPool, proxyIdentity } from '../lib/wayback/proxyPool.mjs'

test('checkpoint upload passes its cancellation signal and never retries after shutdown', async () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wayback-checkpoint-abort-')),file=path.join(dir,'snapshot.sqlite')
  fs.writeFileSync(file,'snapshot');const controller=new AbortController();let calls=0
  const store=createWaybackCloudStore({IDRIVE_E2_BUCKET:'test',IDRIVE_E2_ACCESS_KEY_ID:'test',IDRIVE_E2_SECRET_ACCESS_KEY:'test'},{async send(command,options){
    calls++;assert.equal(options.abortSignal,controller.signal);controller.abort();throw Error('ECONNRESET')
  }})
  try {
    await assert.rejects(store.putFile('snapshot',file,'application/x-sqlite3',{abortSignal:controller.signal}),/ECONNRESET/)
    assert.equal(calls,1)
    await assert.rejects(store.putFile('snapshot',file,'application/x-sqlite3',{abortSignal:controller.signal}),/abort/i)
    assert.equal(calls,1);assert.equal(fs.readFileSync(file,'utf8'),'snapshot')
  } finally {fs.rmSync(dir,{recursive:true,force:true})}
})

test('bulk cleanup rejects permanent objects before dispatch and reports partial S3 failures', async () => {
  const calls=[];let partial=false
  const store=createWaybackCloudStore({IDRIVE_E2_BUCKET:'test',IDRIVE_E2_ACCESS_KEY_ID:'test',IDRIVE_E2_SECRET_ACCESS_KEY:'test'}, {async send(command){
    calls.push(command)
    return partial ? {Errors:[{Key:command.input.Delete.Objects[0].Key,Code:'AccessDenied'}]} : {}
  }})
  const key=store.prefix+'/remote-triage/civo-v1/tasks/local/test.json'
  await assert.rejects(store.deleteMany([key,store.prefix+'/objects/permanent']),/Only remote/)
  assert.equal(calls.length,0)
  await store.deleteMany([key,key])
  assert.equal(calls[0].constructor.name,'DeleteObjectsCommand')
  assert.deepEqual(calls[0].input.Delete.Objects,[{Key:key}])
  partial=true;await assert.rejects(store.deleteMany([key]),/batch failed/)
  await assert.rejects(store.deleteMany(Array.from({length:1001},(_,i)=>key+i)),/1000/)
})

test('Remote promotion copies inside storage, verifies it and reuses identical bodies',async()=>{
 const sha='a'.repeat(64),objects=new Map(),calls=[]
 const client={async send(c){calls.push(c.constructor.name)
  if(c.constructor.name==='HeadObjectCommand'){const value=objects.get(c.input.Key);if(!value)throw Object.assign(Error('missing'),{$metadata:{httpStatusCode:404}});return value}
  if(c.constructor.name==='CopyObjectCommand'){assert.equal(decodeURIComponent(c.input.CopySource),'test/'+source);assert.equal(c.input.MetadataDirective,'COPY');objects.set(c.input.Key,{ContentLength:12,Metadata:{sha256:sha}});return {}}
  throw Error('Unexpected upload')
 }}
 const store=createWaybackCloudStore({IDRIVE_E2_BUCKET:'test',IDRIVE_E2_ACCESS_KEY_ID:'test',IDRIVE_E2_SECRET_ACCESS_KEY:'test'},client)
 const source=store.prefix+'/remote-triage/civo-v1/bodies/local/test.capture.gz'
 const first=await store.promoteRemoteCapture(source,12,sha),second=await store.promoteRemoteCapture(source,12,sha)
 assert.equal(first.reused,false);assert.equal(second.reused,true);assert.equal(calls.filter(x=>x==='CopyObjectCommand').length,1)
 await assert.rejects(store.promoteRemoteCapture('outside',12,sha),/Invalid/)
 objects.set(first.key,{ContentLength:12,Metadata:{sha256:'bad'}})
 await assert.rejects(store.promoteRemoteCapture(source,12,sha),/verification/)
})

test('backbone slots on HTTP port 80 remain distinct without exposing usernames', async () => {
  const a='http://secret-user-1:secret-password@p.webshare.io:80/'
  const b='http://secret-user-2:secret-password@p.webshare.io:80/'
  assert.notEqual(proxyIdentity(a),proxyIdentity(b))
  assert.equal(proxyIdentity(a).includes('secret-user'),false)
  const pool=createWaybackProxyPool({WAYBACK_PROXY_URL:a})
  assert.equal(pool.identity(0),proxyIdentity(a))
  await pool.close()
})

test('reopens the file stream after a transient upload interruption', async () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wayback-upload-retry-'))
  const file=path.join(dir,'capture.gz');fs.writeFileSync(file,'complete capture bytes')
  let attempts=0,metadata,bytes
  const client={async send(command){
    if(command.constructor.name==='PutObjectCommand'){
      const chunks=[];for await(const chunk of command.input.Body)chunks.push(chunk)
      attempts++;if(attempts===1)throw Error('ECONNRESET: socket hang up')
      bytes=Buffer.concat(chunks);metadata=command.input.Metadata;return {}
    }
    return {ContentLength:bytes.length,Metadata:metadata}
  }}
  try {
    const store=createWaybackCloudStore({IDRIVE_E2_BUCKET:'test',IDRIVE_E2_ACCESS_KEY_ID:'test',IDRIVE_E2_SECRET_ACCESS_KEY:'test'},client)
    await store.putFile('test/capture.gz',file)
    assert.equal(attempts,2);assert.equal(bytes.toString(),'complete capture bytes')
  } finally {fs.rmSync(dir,{recursive:true,force:true})}
})

test('cloud store uploads and verifies raw bytes before acknowledging them', async () => {
  const objects = new Map()
  let corruptHead = false
  let uploads = 0
  const client = { async send(command) {
    const name = command.constructor.name
    if (name === 'PutObjectCommand') {
      uploads++
      const body = command.input.Body
      const chunks = []
      if (Buffer.isBuffer(body)) chunks.push(body)
      else for await (const chunk of body) chunks.push(chunk)
      const value = Buffer.concat(chunks)
      objects.set(command.input.Key, { value, metadata: command.input.Metadata })
      return {}
    }
    if (name === 'HeadObjectCommand') {
      const object = objects.get(command.input.Key)
      if (!object) { const error = Error('Missing object'); error.$metadata = { httpStatusCode: 404 }; throw error }
      return { ContentLength: object.value.length, Metadata: corruptHead ? { sha256: 'bad' } : object.metadata }
    }
    throw Error(`Unexpected command: ${name}`)
  } }
  const store = createWaybackCloudStore({ IDRIVE_E2_BUCKET: 'test-bucket', IDRIVE_E2_ACCESS_KEY_ID: 'test',
    IDRIVE_E2_SECRET_ACCESS_KEY: 'test' }, client)
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wayback-cloud-test-'))
  try {
    const file = path.join(temp, 'capture.gz')
    fs.writeFileSync(file, Buffer.from('raw archive bytes'))
    const key = store.key('aws-2', 'raw/ab/capture.gz')
    const stored = await store.putFile(key, file)
    assert.equal(stored.bytes, 17)
    assert.deepEqual(objects.get(key).value, fs.readFileSync(file))
    assert.equal(store.key('aws-2', 'cdx/part/page-1.json').endsWith('/aws-2/cdx/part/page-1.json'), true)
    assert.throws(() => store.key('aws-2', '../escape'), /Invalid cloud object key/)
    const json = await store.putJson(store.key('aws-2', 'checkpoint/report.json'), { done: 1 })
    assert.deepEqual(JSON.parse(objects.get(json.key).value.toString()), { done: 1 })
    const first = await store.putDeduplicatedCapture(file)
    const beforeReuse = uploads
    const second = await store.putDeduplicatedCapture(file)
    assert.equal(first.key, second.key)
    assert.equal(second.reused, true)
    assert.equal(uploads, beforeReuse)
    corruptHead = true
    await assert.rejects(store.putFile(key, file), /verification failed/)
  } finally { fs.rmSync(temp, { recursive: true, force: true }) }
})

test('proxy pool keeps credentials out of status and rotates available endpoints', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wayback-proxy-test-'))
  try {
    const list = path.join(temp, 'proxies.txt')
    fs.writeFileSync(list, '# test\nhttp://user1:pass1@localhost:8001\nhttp://user2:pass2@localhost:8002\n')
    const pool = createWaybackProxyPool({ WAYBACK_PROXY_URLS_FILE: list })
    assert.equal(pool.count, 2)
    assert.notEqual(pool.next(), pool.next())
    fs.appendFileSync(list, 'http://user3:pass3@localhost:8003\n')
    pool.refresh(true)
    assert.equal(pool.count, 3)
    fs.writeFileSync(list, 'http://user9:pass9@localhost:8009\n')
    assert.throws(() => pool.refresh(true), /only grow/)
    await pool.close()
  } finally { fs.rmSync(temp, { recursive: true, force: true }) }
})

test('managed slots replace one proxy while preserving the other slot and the retired agent', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wayback-managed-proxy-test-'))
  try {
    const list = path.join(temp, 'proxies.txt')
    fs.writeFileSync(list, 'http://user:pass@localhost:8001\nhttp://user:pass@localhost:8002\n')
    const pool = createWaybackProxyPool({ WAYBACK_PROXY_URLS_FILE: list, WAYBACK_MANAGED_PROXY_SLOTS: '1' })
    const old = pool.at(0), other = pool.at(1)
    fs.writeFileSync(list, 'http://user:pass@localhost:8003\nhttp://user:pass@localhost:8002\n')
    pool.refresh(true)
    assert.notEqual(pool.at(0), old)
    assert.equal(pool.at(1), other)
    assert.equal(pool.identity(0), 'localhost:8003')
    await pool.close()
  } finally { fs.rmSync(temp, { recursive: true, force: true }) }
})
