#!/usr/bin/env node

import { runCli } from './cli';

runCli()
  .then()
  .catch((error: unknown) => {
    console.error('Error:', error);
    process.exit(1);
  });
