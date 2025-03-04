import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "C/C++",
        icon: "pen-to-square",
        prefix: "",
        children: [
          { text: "C 语言学习分享", icon: "c", link: "C-语言学习分享/random" },
          { text: "DotOJ 补完计划", icon: "chart-line", link: "DotOJ-补完计划/challenges" },
          { text: "C++ SFML 游戏开发", icon: "screwdriver-wrench", link: "C++-SFML-游戏开发/1" },
          { text: "Vue3 网络前端开发", icon: "code", link: "Vue3网络前端开发/intro.md" },
        ],
      },
    ],
  }
]);
