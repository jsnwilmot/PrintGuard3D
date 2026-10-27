import {defineConfig} from 'vitest/config';
export default defineConfig({esbuild:{jsx:'automatic'},test:{include:['remediation-phase1/*.audit.ts','remediation-phase1/*.audit.tsx'],environment:'node',testTimeout:12000}});
