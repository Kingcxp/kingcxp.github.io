import { hopeTheme, prismjs } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  fullscreen: true,

  hostname: "https://kingcxp.github.io",

  author: {
    name: "Kingcq",
    url: "https://github.com/Kingcxp",
  },

  logo: "https://avatars.githubusercontent.com/u/117030255",

  repo: "https://github.com/Kingcxp/kingcxp.github.io",

  docsDir: "src",

  // 导航栏
  navbar,

  // 侧边栏
  sidebar,

  // 页脚
  footer: "哎呀我去，太好看了~",
  displayFooter: true,

  // 博客相关
  blog: {
    description: "“啥都想学，啥也不会”",
    intro: "https://github.com/Kingcxp",
    medias: {
      Email: "mailto:404291187@qq.com",
      QQ: "https://user.qzone.qq.com/404291187",
      BiliBili: "https://space.bilibili.com/289059164",
      GitHub: "https://github.com/Kingcxp",
      Steam: "https://steamcommunity.com/id/kingcq/",
    },
  },

  // 多语言配置
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  // 如果想要实时查看任何改变，启用它。注: 这对更新性能有很大负面影响
  // hotReload: true,

  // 此处开启了很多功能用于演示，你应仅保留用到的功能。
  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,

    highlighter: "prismjs",

    math: {
      // install katex before enabling it
      type: "katex",
    },

    // 如果你需要幻灯片，安装 @vuepress/plugin-revealjs 并取消下方注释
    revealjs: {
      plugins: ["highlight", "math", "search", "notes", "zoom"],
      themes: ["night"]
    },

    // 在启用之前安装 mermaid
    mermaid: true,
  },

  // 在这里配置主题提供的插件
  plugins: {
    blog: true,

    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      prefix: "fa6-solid:",
    },

    slimsearch: true,
  },
});
