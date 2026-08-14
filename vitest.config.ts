import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/board/boardReducer.ts",
        "src/board/boardLimits.ts",
        "src/board/boardValidation.ts",
        "src/board/boardMigrations.ts",
        "src/board/storage.ts",
        "src/board/dragProjection.ts",
        "src/board/exporters/nativeBoardExporter.ts",
        "src/board/workspaceReducer.ts",
        "src/board/workspaceValidation.ts",
        "src/board/workspaceMigrations.ts",
        "src/board/hooks.ts",
      ],
      thresholds: { branches: 80, functions: 85, lines: 85, statements: 85 },
    },
  },
});
