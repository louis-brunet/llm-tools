// @ts-check
/** @type {import('lint-staged').Config} */
export default {
  '*.{js,mjs,cjs,ts}': ['yarn eslint --fix', 'yarn prettier --write'],
};
