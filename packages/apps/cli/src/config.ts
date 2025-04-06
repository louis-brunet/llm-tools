type ReplaceHyphensWithUnderscores<T extends string> =
  T extends `${infer First}-${infer Rest}`
    ? `${First}_${ReplaceHyphensWithUnderscores<Rest>}`
    : T;

const __BUILD_CONFIG = {
  APP_NAME: 'llm-tools',
  APP_VERSION: '0.0.1',
  APP_VERSION_SUFFIX: '' as string,
} as const;

const appVersionSuffix = __BUILD_CONFIG.APP_VERSION_SUFFIX
  ? `-${__BUILD_CONFIG.APP_VERSION_SUFFIX}`
  : '';

export const APP_CONFIG = {
  appName: __BUILD_CONFIG.APP_NAME,
  appVersion: `${__BUILD_CONFIG.APP_VERSION}${appVersionSuffix}`,
} as const;

const upperCaseAppName = APP_CONFIG.appName.toUpperCase() as Uppercase<
  typeof APP_CONFIG.appName
>;

const ENV_VAR_PREFIX = upperCaseAppName.replaceAll(
  '-',
  '_',
) as ReplaceHyphensWithUnderscores<typeof upperCaseAppName>;

export const ENVIRONMENT_CONFIG = {
  prefix: {
    global: ENV_VAR_PREFIX,
    cliCompletion: `${ENV_VAR_PREFIX}_CLI_COMPLETION` as const,
    infill: `${ENV_VAR_PREFIX}_INFILL` as const,
  },
} as const;
