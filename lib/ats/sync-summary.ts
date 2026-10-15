export type AtsSeedSummary = {
  newOnly: boolean; providerName?: string; phase: 'loading_existing' | 'fetching' | 'processing' | 'complete';
  companiesAttempted: number; companiesCompleted: number; received: number; matched: number;
  created: number; updated: number; skippedNonUS: number; skippedOld: number; skippedExisting: number;
  skippedPublicationWindow: number; skippedMissingPublication: number; skippedOutsidePublicationWindow: number; failedCompanies: number;
};
