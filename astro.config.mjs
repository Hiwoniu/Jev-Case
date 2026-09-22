import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL,
  integrations: [react()],
});
