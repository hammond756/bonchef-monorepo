npx ts-unused-exports \
    tsconfig.json src/**/*.{tsx,ts} \
    --findCompletelyUnusedFiles \
    --excludePathsFromReport="(src/app|src/middleware.ts|src/lib/types.ts|src/components/ui)"