type ReplaceHyphensWithUnderscores<T extends string> =
  T extends `${infer First}-${infer Rest}`
    ? `${First}_${ReplaceHyphensWithUnderscores<Rest>}`
    : T;

declare global {
  const BUILD_APP_VERSION_SUFFIX: string | undefined;
}

const appVersionSuffix = BUILD_APP_VERSION_SUFFIX
  ? `-${BUILD_APP_VERSION_SUFFIX}`
  : '';

export const APP_CONFIG = {
  appName: 'llm-tools',
  appVersion: `0.0.1${appVersionSuffix}`,
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
