import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "C 语言",
        icon: "pen-to-square",
        prefix: "",
        children: [
          { text: "C 语言学习分享", icon: "pen-to-square", link: "C-语言学习分享/random" },
          { text: "DotOJ 补完计划", icon: "pen-to-square", link: "DotOJ-补完计划/challenges" },
        ],
      },
    ],
  }
]);
