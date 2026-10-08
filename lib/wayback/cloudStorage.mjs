import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { finished } from 'node:stream/promises'
import { S3Client, PutObjectCommand, HeadObjectCommand, HeadBucketCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand, CopyObjectCommand } from '@aws-sdk/client-s3'

const sha256 = async (file, abortSignal) => {
  const hash = createHash('sha256')
  for await (const chunk of fs.createReadStream(file)) { abortSignal?.throwIfAborted(); hash.update(chunk) }
  return hash.digest('hex')
}

export function createWaybackCloudStore(env = process.env, client = null) {
  const bucket = env.IDRIVE_E2_BUCKET
  const endpoint = env.IDRIVE_E2_ENDPOINT ?? 'https://s3.us-east-1.idrivee2.com'
  const accessKeyId = env.IDRIVE_E2_ACCESS_KEY_ID
  const secretAccessKey = env.IDRIVE_E2_SECRET_ACCESS_KEY
  const prefix = (env.IDRIVE_E2_PREFIX ?? 'wayback/raw-adaptive-blocks-20261003').replace(/^\/+|\/+$/g, '')
  if (!bucket || !accessKeyId || !secretAccessKey) throw Error('IDrive e2 bucket and access keys are required for cloud mode')
  if (!/^https:\/\//.test(endpoint)) throw Error('IDrive e2 endpoint must use HTTPS')
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(bucket)) throw Error('Invalid iDrive e2 bucket name')
  const s3 = client ?? new S3Client({ region: 'us-east-1', endpoint, forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }, maxAttempts: 3,
    requestHandler: { connectionTimeout: 10000, socketTimeout: 30000, requestTimeout: 120000, throwOnRequestTimeout: true } })
  const key = (lot, relative) => {
    if (!/^(?:aws-(?:[1-9]|1\d|2[0-2])|local)$/.test(lot)) throw Error('Invalid lot')
    const normalized = relative.replaceAll('\\', '/')
    if (normalized.startsWith('/') || normalized.split('/').some(segment => !segment || segment === '..' || segment === '.')) throw Error('Invalid cloud object key')
    return `${prefix}/${lot}/${normalized}`
  }
  const putBuffer = async (objectKey, body, contentType) => {
    const data = Buffer.isBuffer(body) ? body : Buffer.from(body)
    const digest = createHash('sha256').update(data).digest('hex')
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: data, ContentLength: data.length,
      ContentType: contentType, Metadata: { sha256: digest } }))
    await verify(objectKey, data.length, digest)
    return { key: objectKey, bytes: data.length, sha256: digest }
  }
  const verify = async (objectKey, bytes, digest, abortSignal) => {
    abortSignal?.throwIfAborted()
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),{abortSignal})
    if (Number(head.ContentLength) !== bytes || head.Metadata?.sha256 !== digest) throw Error(`iDrive e2 object verification failed: ${objectKey}`)
  }
  return {
    bucket, endpoint, prefix, key,
    async checkBucket() { return s3.send(new HeadBucketCommand({ Bucket: bucket })) },
    putBuffer,
    async putJson(objectKey, value) { return putBuffer(objectKey, JSON.stringify(value) + '\n', 'application/json') },
    async putFile(objectKey, filename, contentType = 'application/gzip', {abortSignal} = {}) {
      abortSignal?.throwIfAborted()
      const bytes = fs.statSync(filename).size, digest = await sha256(filename,abortSignal)
      for(let attempt=0;;attempt++) {
        abortSignal?.throwIfAborted()
        const body=fs.createReadStream(filename)
        try {
          await s3.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: body,
            ContentLength: bytes, ContentType: contentType, Metadata: { sha256: digest } }),
            { requestTimeout: Math.min(900000, Math.max(120000, 60000 + bytes / 524288 * 1000)), abortSignal })
          await verify(objectKey, bytes, digest,abortSignal)
          break
        } catch(error) {
          const transient=error?.$metadata?.httpStatusCode>=500 || /timeout|socket hang up|ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT|fetch failed/i.test(String(error))
          if(abortSignal?.aborted||!transient||attempt>=2)throw error
          await new Promise(resolve=>setTimeout(resolve,500*2**attempt))
        } finally { body.destroy(); await finished(body,{cleanup:true}).catch(()=>{}) }
      }
      return { key: objectKey, bytes, sha256: digest }
    },
    async putDeduplicatedCapture(filename) {
      const bytes = fs.statSync(filename).size
      const digest = await sha256(filename)
      const objectKey = `${prefix}/objects/sha256/${digest.slice(0, 2)}/${digest}.capture.gz`
      try {
        await verify(objectKey, bytes, digest)
        return { key: objectKey, bytes, sha256: digest, reused: true }
      } catch (error) {
        if (error?.$metadata?.httpStatusCode !== 404 && error?.name !== 'NotFound' && error?.name !== 'NoSuchKey') throw error
      }
      const uploaded = await this.putFile(objectKey, filename)
      return { ...uploaded, reused: false }
    },
    async promoteRemoteCapture(sourceKey, bytes, digest) {
      if (!sourceKey.startsWith(prefix + '/remote-triage/') || !Number.isSafeInteger(bytes) || bytes < 0 || !/^[a-f0-9]{64}$/.test(digest)) throw Error('Invalid remote capture promotion')
      const objectKey = `${prefix}/objects/sha256/${digest.slice(0, 2)}/${digest}.capture.gz`
      try {
        await verify(objectKey, bytes, digest)
        return {key:objectKey,bytes,sha256:digest,reused:true}
      } catch(error) {
        if (error?.$metadata?.httpStatusCode !== 404 && !['NotFound','NoSuchKey'].includes(error?.name)) throw error
      }
      // The worker has already checked the downloaded bytes against this SHA-256.
      // Copy inside iDrive instead of uploading the same compressed body again.
      await s3.send(new CopyObjectCommand({Bucket:bucket,Key:objectKey,
        CopySource:encodeURIComponent(`${bucket}/${sourceKey}`),MetadataDirective:'COPY'}))
      await verify(objectKey,bytes,digest)
      return {key:objectKey,bytes,sha256:digest,reused:false}
    },
    async head(objectKey) { return s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey })) },
    async getBuffer(objectKey) {
      const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }))
      return Buffer.from(await response.Body.transformToByteArray())
    },
    async getJson(objectKey) { return JSON.parse((await this.getBuffer(objectKey)).toString('utf8')) },
    async list(objectPrefix, token, maxKeys = 100) {
      return s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: objectPrefix, ContinuationToken: token, MaxKeys: maxKeys }))
    },
    async delete(objectKey) {
      if (!objectKey.startsWith(prefix + '/remote-triage/')) throw Error('Only remote triage temporary objects may be deleted')
      return s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }))
    },
    async deleteMany(objectKeys) {
      const keys = [...new Set(objectKeys)]
      if (keys.some(key => !key.startsWith(prefix + '/remote-triage/'))) throw Error('Only remote triage temporary objects may be deleted')
      if (!keys.length) return
      if (keys.length > 1000) throw Error('Remote cleanup batch exceeds 1000 objects')
      const result = await s3.send(new DeleteObjectsCommand({Bucket:bucket,Delete:{Objects:keys.map(Key=>({Key})),Quiet:true}}))
      if (result.Errors?.length) throw Error(`Remote cleanup batch failed for ${result.Errors.length} objects`)
      return result
    },
  }
}
