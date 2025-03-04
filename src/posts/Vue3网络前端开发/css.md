---
title: 3. CSS 页面元素设计基础
date: 2025-03-04
icon: style-outline
order: 4
category:
  - Vue3 网络前端开发
tag:
  - CSS
---

:::tip
如果你需要更基础的教程，请前往 [菜鸟教程](https://www.runoob.com/css/css-tutorial.html)
:::

CSS 是页面设计中最重要的部分，一个好的 CSS 设计可以使你的页面如虎添翼，让用户有更好的体验。本节将介绍 CSS 的基本概念和用法，包括选择器、盒模型、布局、动画等。

### 选择器

选择器是 CSS 中最基本的概念，用于选择页面中的元素。常用的选择器有：

- 元素选择器：选择页面中的所有指定元素，例如 `div`、`p`、`a` 等。
- 类选择器：选择页面中所有具有指定类名的元素，以 `.` 开头，例如 `.my-class`。
- ID 选择器：选择页面中具有指定 ID 的元素，以 `.` 开头，例如 `#my-id`。
- 属性选择器：选择页面中具有指定属性的元素，例如 `[type="text"]`。
- 伪类选择器：选择页面中具有指定状态的元素，例如 `:hover`（鼠标悬停）、`:active` （正处于激活状态）等。

选择器可以组合使用，例如 `div.my-class` 选择所有具有 `my-class` 类名的 `div` 元素。

当然如果你在 `.` 前面加上一个空格，变成 `div .myclass`，那么他会选择 `div` 标签包裹中的 `myclass` 类名，而忽略没有被 `div` 包裹的 `myclass` 类名。

### 布局设计

这里，我们将选择最**力大砖飞**的设计方式 `Flex` 弹性盒子。

`Flex` 是一种非常暴力的设计方式，他可以让你轻松的将元素排列成你想要的样子，并且可以轻松的调整元素的大小和位置。

首先，对于一个 `div` 元素，我们使用 `display: flex` 来将其设置为弹性盒子包装：
```css
div {
  display: flex;
}
```

然后，我们可以使用 `flex-direction` 属性来设置元素的排列方向，例如 `row`（水平排列）、`column`（垂直排列）等：

<div style="display: flex;
  flex-direction: row;
  gap: 20px">
  <div style="display: flex;
    flex-direction: row;
    height: 40px;
    width: 100px;
    background-color: #6f106e;
    gap: 4px">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 100px;
    width: 40px;
    background-color: #6f106e;
    gap: 4px">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>

```html
<div style="display: flex;
  flex-direction: row;
  gap: 20px">
  <div style="display: flex;
    flex-direction: row;
    height: 24px;
    width: 80px;
    background-color: #6f106e;
    gap: 4px">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 80px;
    width: 24px;
    background-color: #6f106e;
    gap: 4px">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>
```

啊呀？你会发现，这些元素好像都歪在一边。

不要紧！只要加上 `align-items: center` 和  `justify-content: center` 就行了：

<div style="display: flex;
  flex-direction: row;
  gap: 20px">
  <div style="display: flex;
    flex-direction: row;
    height: 40px;
    width: 100px;
    background-color: #6f106e;
    gap: 4px;
  align-items: center;
    justify-content: center;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 100px;
    width: 40px;
    background-color: #6f106e;
    gap: 4px;
  align-items: center;
    justify-content: center;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>

```html
<div style="display: flex;
  flex-direction: row;
  gap: 20px">
  <div style="display: flex;
    flex-direction: row;
    height: 24px;
    width: 80px;
    background-color: #6f106e;
    gap: 4px;
  align-items: center;
    justify-content: center;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 80px;
    width: 24px;
    background-color: #6f106e;
    gap: 4px;
  align-items: center;
    justify-content: center;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>
```

`justify-content` 指的是水平方向上的对齐方式，`align-items` 指的是垂直方向上的对齐方式。如果你的 `flex-direction` 是 `column`，那么 `justify-content` 就是指垂直方向上的对齐方式，`align-items` 就是指水平方向上的对齐方式。

如果一行不够你放下所有的元素，你可以试试 `flex-wrap: wrap;`：

<div style="display: flex;
  flex-direction: row;
  gap: 20px;">
  <div style="display: flex;
    flex-direction: row;
    height: 52px;
    width: 52px;
    background-color: #6f106e;
    gap: 4px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 52px;
    width: 52px;
    background-color: #6f106e;
    gap: 4px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>

```html
<div style="display: flex;
  flex-direction: row;
  gap: 20px;">
  <div style="display: flex;
    flex-direction: row;
    height: 52px;
    width: 52px;
    background-color: #6f106e;
    gap: 4px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
  <div style="display: flex;
    flex-direction: column;
    height: 52px;
    width: 52px;
    background-color: #6f106e;
    gap: 4px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;">
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
    <div style="background-color: #fff;
      width: 24px;
      height: 24px"></div>
  </div>
</div>
```

#### 盒子设计 & 布局精通
我现在有一个 200x200 的 `div`，它什么设计都没有！这太难看了！

<div style="width: 200px;
  height: 200px;"></div>

```html
<div style="width: 200px;
  height: 200px;"></div>
```

我如果想实现一个面板一样的，看上去像是悬浮起来一样的板块，应该用哪些东西呢？

先给它来点颜色，为它加上 `background-color: #6C6E72;`：

<div style="background-color: #6C6E72;
  width: 200px;
  height: 200px;
  margin-bottom: 20px;"></div>

它的边缘似乎有些太尖锐了，给它加上个圆角 `border-radius: 4px;`：

<div style="background-color: #6C6E72;
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-bottom: 20px;"></div>

边框和背景颜色似乎又不是很有对比度，那加上一个边框吧 `border: 1px solid #DCDFE6`

<div style="background-color: #6C6E72;
  width: 200px;
  height: 200px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  margin-bottom: 20px;"></div>

现在看起来已经不错了！但它还不够有 `悬浮` 的感觉，给它加上阴影或许会好一点？`box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.8);`
<div style="background-color: #6C6E72;
  width: 200px;
  height: 200px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  box-shadow: 2px 4px 8px rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;"></div>

这样看上去就好多了，如果你有一个好看的背景，你也可以尝试为背景色加上一定的透明度来提升观感。

#### margin & padding
`margin` 和 `padding` 是两个非常常用的属性，它们分别控制着元素的外边距和内边距。

<div style="display: flex;
  flex-direction: row;
  gap: 20px;">
  <div style="background-color: #6C6E72;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-shadow: 2px 4px 8px rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    margin: 20px;"></div>
  <div style="background-color: #6C6E72;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-shadow: 2px 4px 8px rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    padding: 20px;"></div>
</div>

```html
<div style="display: flex;
  flex-direction: row;
  gap: 20px;">
  <div style="background-color: #6C6E72;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-shadow: 2px 4px 8px rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    margin: 20px;"></div>
  <div style="background-color: #6C6E72;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-shadow: 2px 4px 8px rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    padding: 20px;"></div>
</div>
```

如果你将 `margin` 设置为 `auto`，它将根据情况自行决定外边距的大小。

比如，我们在这里设计一个导航栏：

<div style="
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
">
  <a htef="https://www.nju.edu.cn" style="
    width: 40px;
    height: 40px;
    margin-right: 10px;
  "><img src="https://www.nju.edu.cn/images/app-icon72x72@2x.png" /></a>
  <p style="
    color: #111;
    font-size: 28px;
    margin: auto 0;
  ">南京大学</p>
  <button style="
    background-color: #6f106e;
    height: 40px;
    width: 80px;
    right: 0;
    margin-left: auto;
    border: none;
    border-radius: 4px;
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.8);
  ">登录</button>
</div>

`html` 代码：
```html
<div class="header">
  <a class="header-logo" href="https://www.nju.edu.cn">
    <img stc="https://www.nju.edu.cn/images/app-icon72x72@2x.png" />
  </a>
  <p class="header-title">
    南京大学
  </p>
  <button class="header-btn">
    登录
  </button>
</div>
```

`css` 代码：
```css
.header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.header-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.header-title {
  color: #111;
  font-size: 28px;
  margin: auto 0;
}

.header-btn {
  background-color: #6f106e;
  height: 40px;
  width: 80px;
  right: 0;
  margin-left: auto;
  border: none;
  border-radius: 4px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.8);
}
```

其中的按钮就是使用 `auto` 外边距实现的，首先指定它的 `right` 为 0，也就是靠最右边，但是你会发现它并没有靠到最右边，那是因为它的外边距决定了它距离左边的距离，而不设置的情况下，它是 0，与我们想要的结果冲突，所以我们需要将它的外边距设置为 `auto`，这样它就会自动调整外边距，使得它靠在最右边。

大致了解这些内容之后，你应当对如何编写 `CSS` 有了更深入的了解。

### 动画

如果你追求更强力的表现，你也可以尝试应用一些简单的动画。比如，我们可以让之前设计的那个卡片在鼠标悬浮时改变一些状态，使它看上去有鼠标移过去之后就浮起来的效果：

对它应用 `CSS`：
```css
div {
  background-color: #FFFFFF;
}

div:hover {
  cursor: pointer;
  background-color: #F2F3F5;
  box-shadow: #E6E8EB;
  border: 1px solid #A8ABB2;
  transition: background-color .3s ease-in-out, box-shadow .3s ease-in-out, border .3s ease-in-out;
}
```
通过指定 `hover` 状态的一些属性，并借助 `transition` 属性来指定它的动画过程，我们可以实现一个简单的动画效果。

其它动画效果可以自行查阅如何编写，找一个大模型（如 deepseek），跟它描述你的需求，它会告诉你的，只需要自行再调试修改一下就好了。
