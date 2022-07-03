#!/usr/bin/env node

import {
  displayError,
  displaySuccess,
} from '../logic/cli/console/console.messages';
import { generateTypesFromFile } from '../workflows/generate-types-from-file';
import { validateFileArguments } from './args/validate-file-arguments';

/* istanbul ignore file */

(async (): Promise<void> => {
  try {
    const args = await validateFileArguments();

    const generationResult = await generateTypesFromFile(args);

    displaySuccess(args.outputPath, generationResult);
    process.exit(0);
  } catch (err) {
    displayError(err);
    process.exit(1);
  }
})();
