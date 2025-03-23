import { InferType } from 'yup';
import {
  completionNoStreamResponseSchema,
  completionStreamEndResponseSchema,
  completionStreamResponseSchema,
  infillResponseSchema,
} from './schemas';

export interface ILlamaCppClientConfig {
  serverOrigin: string;
}

export interface ILlamaCppInfillRequestExtraContext {
  filename: string;
  text: string;
}

/** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-infill-for-code-infilling */
export interface ILlamaCppInfillRequest extends ILlamaCppCompletionRequest {
  /** Set the prefix of the code to infill. */
  input_prefix: string;

  /** Set the suffix of the code to infill. */
  input_suffix: string;

  /**
   * Additional context inserted before the FIM prefix. Array of `{"filename":
   * string, "text": string}` objects
   */
  input_extra?: ILlamaCppInfillRequestExtraContext[] | undefined;

  // /** Added after the FIM_MID token */
  // prompt?: string | undefined;
}
export type LlamaCppInfillResponse = InferType<typeof infillResponseSchema>;

export enum LlamaCppSamplerEnum {
  DRY = 'dry',
  TOP_K = 'top_k',
  TYP_P = 'typ_p',
  TOP_P = 'top_p',
  MIN_P = 'min_p',
  XTC = 'xtc',
  TEMPERATURE = 'temperature',
}

export type LlamaCppCompletionStreamResponse = InferType<
  typeof completionStreamResponseSchema
>;

export type LlamaCppCompletionStreamEndResponse = InferType<
  typeof completionStreamEndResponseSchema
>;

export type LlamaCppCompletionNoStreamResponse = InferType<
  typeof completionNoStreamResponseSchema
>;

export type LlamaCppCompletionResponse =
  | LlamaCppCompletionStreamResponse
  | LlamaCppCompletionStreamEndResponse
  | LlamaCppCompletionNoStreamResponse;
// export type LlamaCppCompletionResponse = InferType<
//   typeof completionResponseSchema
// >;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type LlamaCppCompletionRequestResponseField =
  KeysOfUnion<LlamaCppCompletionResponse>;

/** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-completion-given-a-prompt-it-returns-the-predicted-completion */
export interface ILlamaCppCompletionRequest {
  prompt: string | Array<number | string>;

  /** Default: 0.8 */
  temperature?: number;

  /**
   * Dynamic temperature range. The final temperature will be in the range of
   * [temperature - dynatemp_range; temperature + dynatemp_range] Default: 0.0,
   * which is disabled
   */
  dynatemp_range?: number;

  /** Dynamic temperature exponent. Default: 1.0 */
  dynatemp_exponent?: number;

  /** Limit the next token selection to the K most probable tokens. Default: 40 */
  top_k?: number;

  /**
   * Limit the next token selection to a subset of tokens with a cumulative
   * probability above a threshold P. Default: 0.95
   */
  top_p?: number;

  /**
   * The minimum probability for a token to be considered, relative to the
   * probability of the most likely token. Default: 0.05
   */
  min_p?: number;

  /**
   * Set the maximum number of tokens to predict when generating text. Note: May
   * exceed the set limit slightly if the last token is a partial multibyte
   * character. When 0, no tokens will be generated but the prompt is evaluated
   * into the cache. Default: -1, where -1 is infinity.
   */
  n_predict?: number;

  /**
   * Specify the minimum line indentation for the generated text in number of
   * whitespace characters. Useful for code completion tasks. Default: 0
   */
  n_indent?: number;

  /**
   * Specify the number of tokens from the prompt to retain when the context
   * size is exceeded and tokens need to be discarded. The number excludes the
   * BOS token. By default, this value is set to 0, meaning no tokens are kept.
   * Use -1 to retain all tokens from the prompt.
   */
  n_keep?: number;

  /**
   * Allows receiving each predicted token in real-time instead of waiting for
   * the completion to finish (uses a different response format). To enable
   * this, set to true.
   */
  stream?: boolean;

  /**
   * Specify a JSON array of stopping strings. These words will not be included
   * in the completion, so make sure to add them to the prompt for the next
   * iteration. Default: []
   */
  stop?: string[];

  /**
   * Enable locally typical sampling with parameter p. Default: 1.0, which is
   * disabled.
   */
  typical_p?: number;

  /**
   * Control the repetition of token sequences in the generated text. Default:
   * 1.1
   */
  repeat_penalty?: number;

  /**
   * Last n tokens to consider for penalizing repetition. Default: 64, where 0
   * is disabled and -1 is ctx-size.
   */
  repeat_last_n?: number;

  /** Repeat alpha presence penalty. Default: 0.0, which is disabled. */
  presence_penalty?: number;

  /** Repeat alpha frequency penalty. Default: 0.0, which is disabled. */
  frequency_penalty?: number;

  /**
   * Set the DRY (Don't Repeat Yourself) repetition penalty multiplier. Default:
   * 0.0, which is disabled.
   */
  dry_multiplier?: number;

  /** Set the DRY repetition penalty base value. Default: 1.75 */
  dry_base?: number;

  /**
   * Tokens that extend repetition beyond this receive exponentially increasing
   * penalty: multiplier * base ^ (length of repeating sequence before token -
   * allowed length). Default: 2
   */
  dry_allowed_length?: number;

  /**
   * How many tokens to scan for repetitions. Default: -1, where 0 is disabled
   * and -1 is context size.
   */
  dry_penalty_last_n?: number;

  /**
   * Specify an array of sequence breakers for DRY sampling. Only a JSON array
   * of strings is accepted. Default: ['\n', ':', '"', '*']
   */
  dry_sequence_breakers?: string[];

  /**
   * Set the chance for token removal via XTC sampler. Default: 0.0, which is
   * disabled.
   */
  xtc_probability?: number;

  /**
   * Set a minimum probability threshold for tokens to be removed via XTC
   * sampler. Default: 0.1 (> 0.5 disables XTC)
   */
  xtc_threshold?: number;

  /**
   * Enable Mirostat sampling, controlling perplexity during text generation.
   * Default: 0, where 0 is disabled, 1 is Mirostat, and 2 is Mirostat 2.0.
   */
  mirostat?: number;

  /** Set the Mirostat target entropy, parameter tau. Default: 5.0 */
  mirostat_tau?: number;

  /** Set the Mirostat learning rate, parameter eta. Default: 0.1 */
  mirostat_eta?: number;

  /** Set grammar for grammar-based sampling. Default: no grammar */
  grammar?: string;

  /**
   * Set a JSON schema for grammar-based sampling (e.g. {"items": {"type":
   * "string"}, "minItems": 10, "maxItems": 100} of a list of strings, or {} for
   * any JSON). See tests for supported features. Default: no JSON schema.
   */
  json_schema?: string;

  /**
   * Set the random number generator (RNG) seed. Default: -1, which is a random
   * seed.
   */
  seed?: number;

  /** Ignore end of stream token and continue generating. Default: false */
  ignore_eos?: boolean;

  /**
   * Modify the likelihood of a token appearing in the generated text
   * completion. For example, use "logit_bias": [[15043,1.0]] to increase the
   * likelihood of the token 'Hello', or "logit_bias": [[15043,-1.0]] to
   * decrease its likelihood. Setting the value to false, "logit_bias":
   * [[15043,false]] ensures that the token Hello is never produced. The tokens
   * can also be represented as strings, e.g. [["Hello, World!",-0.5]] will
   * reduce the likelihood of all the individual tokens that represent the
   * string Hello, World!, just like the presence_penalty does. Default: []
   */
  logit_bias?: Array<[number | string, number]>;

  /**
   * If greater than 0, the response also contains the probabilities of top N
   * tokens for each generated token given the sampling settings. Note that for
   * temperature < 0 the tokens are sampled greedily but token probabilities are
   * still being calculated via a simple softmax of the logits without
   * considering any other sampler settings. Default: 0
   */
  n_probs?: number;

  /**
   * If greater than 0, force samplers to return N possible tokens at minimum.
   * Default: 0
   */
  min_keep?: number;

  /**
   * Set a time limit in milliseconds for the prediction (a.k.a.
   * text-generation) phase. The timeout will trigger if the generation takes
   * more than the specified time (measured since the first token was generated)
   * and if a new-line character has already been generated. Useful for FIM
   * applications. Default: 0, which is disabled.
   */
  t_max_predict_ms?: number;

  /**
   * An array of objects to hold base64-encoded image data and its ids to be
   * reference in prompt. You can determine the place of the image in the prompt
   * as in the following: USER:[img-12]Describe the image in
   * detail.\nASSISTANT:. In this case, [img-12] will be replaced by the
   * embeddings of the image with id 12 in the following image_data array: {...,
   * "image_data": [{"data": "<BASE64_STRING>", "id": 12}]}. Use image_data only
   * with multimodal models, e.g., LLaVA.
   */
  image_data?: [{ data: string; id: number }];

  /**
   * Assign the completion task to an specific slot. If is -1 the task will be
   * assigned to a Idle slot. Default: -1
   */
  id_slot?: number;

  /**
   * Re-use KV cache from a previous request if possible. This way the common
   * prefix does not have to be re-processed, only the suffix that differs
   * between the requests. Because (depending on the backend) the logits are not
   * guaranteed to be bit-for-bit identical for different batch sizes (prompt
   * processing vs. token generation) enabling this option can cause
   * nondeterministic results. Default: true
   */
  cache_prompt?: boolean;

  /**
   * Return the raw generated token ids in the tokens field. Otherwise tokens
   * remains empty. Default: false
   */
  return_tokens?: boolean;

  /**
   * The order the samplers should be applied in. An array of strings
   * representing sampler type names. If a sampler is not set, it will not be
   * used. If a sampler is specified more than once, it will be applied multiple
   * times. Default: ["dry", "top_k", "typ_p", "top_p", "min_p", "xtc",
   * "temperature"] - these are all the available values.
   */
  samplers?: LlamaCppSamplerEnum[];

  /**
   * Include prompt processing and text generation speed information in each
   * response. Default: false
   */
  timings_per_token?: boolean;

  /**
   * Returns the probabilities of top n_probs tokens after applying sampling
   * chain.
   */
  post_sampling_probs?: boolean;

  /**
   * A list of response fields, for example: "response_fields": ["content",
   * "generation_settings/n_predict"]. If the specified field is missing, it
   * will simply be omitted from the response without triggering an error. Note
   * that fields with a slash will be unnested; for example,
   * generation_settings/n_predict will move the field n_predict from the
   * generation_settings object to the root of the response and give it a new
   * name.
   */
  response_fields?: LlamaCppCompletionRequestResponseField[];

  /**
   * A list of LoRA adapters to be applied to this specific request. Each object
   * in the list must contain id and scale fields. For example: [{"id": 0,
   * "scale": 0.5}, {"id": 1, "scale": 1.1}]. If a LoRA adapter is not specified
   * in the list, its scale will default to 0.0. Please note that requests with
   * different LoRA configurations will not be batched together, which may
   * result in performance degradation.
   */
  lora?: { id: number; scale: number }[];
}

export type ILlamaCppCompletionStreamRequest = ILlamaCppCompletionRequest & {
  stream: true;
};

export type ILlamaCppCompletionNoStreamRequest = ILlamaCppCompletionRequest & {
  stream?: false | undefined;
};
