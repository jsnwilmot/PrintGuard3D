import {defineConfig} from 'vitest/config';
export default defineConfig({esbuild:{jsx:'automatic'},test:{include:['acceptance-review/*.audit.ts','acceptance-review/*.audit.tsx'],environment:'node',testTimeout:12000}});
