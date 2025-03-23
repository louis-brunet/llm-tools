import { array, boolean, number, object, string } from 'yup';

export const infillResponseSchema = object({
  content: string().defined().strict(true),
  tokens_predicted: number().integer().required(),
});

export const completionNoStreamResponseSchema = object({
  content: string().defined().strict(true),
  generation_settings: object().required(),
  model: string().required(),
  prompt: string().defined().strict(true),
  stop_type: string()
    .oneOf(['none', 'eos', 'limit', 'word'] as const)
    .required(),
  stopping_word: string().defined().strict(true),
  timings: object().required(),
  tokens_cached: number().required(),
  tokens_evaluated: number().required(),
  truncated: boolean().required(),
});

export const completionStreamResponseSchema = object({
  content: string().defined().strict(true),
  tokens: array().of(number().required()).required(),
  stop: boolean().isFalse().required(),
});

export const completionStreamEndResponseSchema = completionStreamResponseSchema
  .concat(completionNoStreamResponseSchema)
  .concat(
    object({
      stop: boolean().isTrue().required(),
    }),
  );
