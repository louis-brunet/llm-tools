type ReplaceHyphensWithUnderscores<T extends string> =
  T extends `${infer First}-${infer Rest}`
    ? `${First}_${ReplaceHyphensWithUnderscores<Rest>}`
    : T;

export const APP_CONFIG = {
  appName: 'llm-tools',
  appVersion: '0.0.1',
} as const;

const upperCaseAppName = APP_CONFIG.appName.toUpperCase() as Uppercase<
  typeof APP_CONFIG.appName
>;

const ENV_VAR_PREFIX = upperCaseAppName.replaceAll(
  '-',
  '_',
) as ReplaceHyphensWithUnderscores<typeof upperCaseAppName>;
// const CLI_COMPLETION_ENV_VAR_PREFIX =
//   `${ENV_VAR_PREFIX}_CLI_COMPLETION` as const;

export const ENVIRONMENT_CONFIG = {
  prefix: {
    global: ENV_VAR_PREFIX,
    cliCompletion: `${ENV_VAR_PREFIX}_CLI_COMPLETION` as const,
    infill: `${ENV_VAR_PREFIX}_INFILL` as const,
  },
} as const;
