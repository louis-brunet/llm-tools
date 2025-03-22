export interface InfillRequestContextItem {
  fileName: string;
  content: string;
}

export interface InfillRequest {
  before: string;
  prompt: string;
  after: string;
  context?: InfillRequestContextItem[];
}
