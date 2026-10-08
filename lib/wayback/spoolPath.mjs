import path from 'node:path'

export function captureSpoolPath(root, relative) {
  if (typeof relative !== 'string') throw Error('Invalid spool path')
  const file=path.resolve(root,relative.replaceAll('\\','/'))
  if(!file.startsWith(path.join(root,'spool')+path.sep)||!file.endsWith('.capture.gz'))throw Error('Invalid spool path')
  return file
}
