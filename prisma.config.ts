import { defineConfig } from "prisma/config";

export default defineConfig({
  seed: {
    run: async () => {
      await import("./prisma/seed.ts");
    },
  },
});


