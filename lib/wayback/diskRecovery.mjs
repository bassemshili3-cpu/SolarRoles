export function canResumeAfterDiskPause(freeBytes, floorBytes) {
  return freeBytes >= floorBytes + 1024 ** 3
}
export function createSerialCheckpointQueue() {
  let tail = Promise.resolve()
  return task => {
    const result = tail.then(task)
    tail = result.catch(() => {})
    return result
  }
}
