import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Kingcq's Blog",
  description: "Kingcq's Blog for GitHub",

  theme,
});
