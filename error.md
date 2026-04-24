E:\test\php-version-manager>npm run build

> php-version-manager@1.0.0 build
> npm run typecheck && electron-vite build

> php-version-manager@1.0.0 typecheck
> npm run typecheck:node && npm run typecheck:web

> php-version-manager@1.0.0 typecheck:node
> tsc --noEmit -p tsconfig.node.json --composite false

node_modules/@types/node/test.d.ts:794:32 - error TS1005: '{' expected.

794 interface TestPass ext

```

node_modules/@types/node/test.d.ts:794:35 - error TS1005: '}' expected.

794 interface TestPass ext

Found 2 errors in the same file, starting at: node_modules/@types/node/test.d.ts:794
```
