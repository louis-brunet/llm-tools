import { ILlmToolsInfillRequest } from '../../clients';

export interface IModelAdapterInfillRequest
  extends Omit<ILlmToolsInfillRequest, 'singleLine'> {
  system?: string | undefined;
  repoName: string;
  currentFileName: string;
}

export interface IModelAdapter {
  createInfillPrompt(request: IModelAdapterInfillRequest): string;
}
