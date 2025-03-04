---
title: 2. 页面模板 HTML 元素设计基础
date: 2025-03-04
icon: html
order: 3
category:
  - Vue3 网络前端开发
tag:
  - HTML
---

:::tip
这里不准备提供最基础的 `HTML` 知识，而是针对 `Vue` 项目中常用的语法进行介绍。如果你真的一点 `HTML` 都不会，你可以前往 [菜鸟教程](https://www.runoob.com/html/html-tutorial.html) 先行学习。
:::

跳过了 `HTML` 的基础知识，这里其实没多少好说的，主要明确一些概念。

### 尽量使用 `div` 或其它替代容器来包裹内容。

打开浏览器中的一个网页，摁下你的 `F12` 键打开开发者工具，你会发现网页是由一个一个小方块组成的，这些小方块就是 `HTML` 元素，它们被 `div` 或其它元素包裹起来，形成一个树状结构，这就是 `HTML` 的基本结构。

`div` 及类似容器起到一个包裹的作用，本身没有任何的样式，但可以包裹其它元素，并调整自己内部元素的排版，使用 `div` 包裹元素可以提高代码的可读性、可拓展性，并且可以方便地调整元素的位置。

当然，任何事情都是有度的，如果你使用了大量的 `div`，那你大概一定是在做错事罢。

### 标签属性
`HTML` 标签的属性可以用来控制标签的样式、行为等，比如 `class`、`id`、`style`、`src`、`href` 等。

#### class
`class` 属性可以用来给元素添加一个或多个类名，类名可以用来控制元素的样式，也可以用来控制元素的交互行为。

```html
<div class="container">
  <h1 class="title">Hello, world!</h1>
  <p class="content">This is a paragraph.</p>
</div>
```

#### id
`id` 属性可以用来给元素添加一个唯一的标识符，`id` 属性的值必须是唯一的，不能重复。

```html
<div id="container">
  <h1 id="title">Hello, world!</h1>
  <p id="content">This is a paragraph.</p>
</div>
```

#### style
`style` 属性可以用来给元素添加内联样式，内联样式可以直接在标签中定义，也可以在 CSS 文件中定义。

```html
<div style="color: red;">This is a div with inline style.</div>
```

#### src
`src` 属性可以用来指定图片、音频、视频等资源的路径。

```html
<img src="image.jpg" alt="Image">
<audio src="audio.mp3" controls></audio>
<video src="video.mp4" controls></video>
```

#### href
`href` 属性可以用来指定链接的目标地址。

```html
<a href="https://www.example.com">Visit Example.com</a>
```

### 标签应当尽量语义化

`HTML` 标签的语义化是指使用合适的标签来表示内容的含义，而不是仅仅为了布局和样式。

```html
<h1>Heading</h1>
<p>Paragraph</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

对于页面特殊位置的内容，你也应当使用 `div` 以外的语义容器：
```html
<header>Header</header>
<nav>Navigation</nav>
<main>Main content</main>
<footer>Footer</footer>
```
