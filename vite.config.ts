import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { buildTeachingIndex, TEACHING_DIR } from "./scripts/teaching-index.mjs";

// Keeps public/teaching/index.json in sync with the .md files:
// once at build/dev start, then again whenever a lecture is added, edited or removed.
const teachingIndex = (): Plugin => ({
  name: "teaching-index",
  async buildStart() {
    await buildTeachingIndex();
  },
  configureServer(server) {
    const rebuild = async (file: string) => {
      if (!file.startsWith(TEACHING_DIR) || !file.toLowerCase().endsWith(".md")) return;
      try {
        await buildTeachingIndex({ quiet: true });
        server.ws.send({ type: "full-reload" });
      } catch (err) {
        server.config.logger.error(`[teaching] index rebuild failed: ${(err as Error).message}`);
      }
    };
    server.watcher.add(TEACHING_DIR);
    server.watcher.on("add", rebuild);
    server.watcher.on("change", rebuild);
    server.watcher.on("unlink", rebuild);
  },
});

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [teachingIndex(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.md"],
}));
