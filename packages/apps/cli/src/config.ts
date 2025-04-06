type ReplaceHyphensWithUnderscores<T extends string> =
  T extends `${infer First}-${infer Rest}`
    ? `${First}_${ReplaceHyphensWithUnderscores<Rest>}`
    : T;

const buildConfig = {
  appName: process.env.LLM_TOOLS_BUILD_APP_NAME || 'llm-tools',
  appVersion: process.env.LLM_TOOLS_BUILD_APP_VERSION || '0.0.1',
  appVersionSuffix: process.env.LLM_TOOLS_BUILD_APP_VERSION_SUFFIX || '',
};

const appVersionSuffix = buildConfig.appVersionSuffix
  ? `-${buildConfig.appVersionSuffix}`
  : '';

export const APP_CONFIG = {
  appName: buildConfig.appName,
  appVersion: `${buildConfig.appVersion}${appVersionSuffix}`,
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
