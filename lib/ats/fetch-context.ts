/** A connector stages its cursor; the seed commits it only after processing its jobs. */
export interface AtsFetchContext {
  deadline: number;
  cursor?: unknown;
  isKnown: (source: string, url: string) => boolean;
  checkpoint: (cursor: unknown) => void;
}

export interface AtsCheckpoints {
  load: (key: string) => Promise<unknown>;
  save: (key: string, cursor: unknown) => Promise<void>;
}
