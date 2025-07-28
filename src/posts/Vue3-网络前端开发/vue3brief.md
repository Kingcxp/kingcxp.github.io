---
title: 1. Vue3 简介
date: 2025-03-04
icon: person-chalkboard
order: 2
category:
  - Vue3 网络前端开发
tag:
  - Vue3
  - HTML
  - CSS
  - JavaScript
  - TypeScript
---

:::tip
*你知道吗？*
[Vue.js 的官方文档](https://cn.vuejs.org/guide/quick-start.html)实际上也非常不错！你可以通过这个链接学习如何使用 node.js 包管理器创建 Vue 项目！
:::

Vue 是一款非常火爆的前端项目框架，它基于标准HTML、CSS和JavaScript构建，并提供了一套声明式的、组件化的编程模型，可以高效地开发用户界面。无论是简单还是复杂的界面，Vue都可以胜任。是目前生产环境中使用最广泛的JavaScript框架之一。

:::tip
在这里以 `JavaScript` 为例，`TypeScript` 的使用方式与 `JavaScript` 基本一致，只是它的静态语法属性更强，你需要为每个变量标注变量类型，但你可以通过使用 `any` 类型来跳过这个过程~~（所以这个语言也被称为 `AnyScript`）~~。
:::

它的项目结构大致如下：
```sh
.
├── index.html
├── jsconfig.json
├── package.json
├── package-lock.json
├── public/
│   └── favicon.ico
├── src/
│   ├── App.vue
│   ├── assets/
│   │   ├── base.css
│   │   └── main.css
│   ├── components/
│   ├── main.js
│   ├── router/
│   │   └── index.js
│   └── views/
└── vite.config.js
```
让我们来简单地过一下这个目录结构，只挑比较重要的部分说：

- `vite.config.js`: 这是 Vite 的配置文件，用于配置 Vite 的行为，比如端口、代理等，在这里我们不接触这个部分。
- `package.json`、`package-lock.json`: 这是 Node.js 的包管理器 `npm` 的配置文件，用于管理项目的依赖和项目的启动命令，通过观察这个文件就能看懂，这里不重复叙述了。
- `index.html`: 这就是你认为的那个 `主页`，仔细观察其中的代码就会发现：
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NYPT</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```
在 `body` 元素中，你会找到一个 `id="app"` 的 `div` 标签，这个时候我们将它与 `main.js` 关联起来：
```js
// main.js
// 这里默认你创建项目时选择了使用 vue-router
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
```
可以看到，它通过 `createApp` 创建了一个 Vue 实例，并且使用 `app.use` 方法注册了 `router`，最后通过 `app.mount` 方法将 Vue 实例挂载到 `id="app"` 的 `div` 标签上，也就是我们之前提到的那个。

至此，我们已经将 `Vue` 的 `app` 实例挂载到页面上了，但是，现在页面上还是空空如也，我们应当怎样编写页面呢？

我们首先先需要了解 `.vue` 文件的结构，理论上，一个空的 `.vue` 文件不是完全空的，它应当长这样：
```vue
<script setup>
</script>
<template>
</template>
<style scoped>
</style>
```
你会发现，其中分为 `script`、`template`、`style` 三个部分，它们分别对应了 Vue 中的三个核心概念：组件、模板、样式。

- `script`: 这是 Vue 组件的逻辑部分，你可以在这里编写组件的逻辑代码，比如数据、方法、生命周期钩子等。如果你在 `script` 之后加上了 `setup`，这证明你想要使用 [组合式 API](https://cn.vuejs.org/guide/introduction.html#composition-api)，否则，证明你想要使用 [选项式 API](https://cn.vuejs.org/guide/introduction.html#options-api)，我们软工 II 的实例项目就是使用的`组合式 API`，它的逻辑性更好，更灵活，也更易读，一般也建议使用组合式 API。

:::tip
每个 `*.vue` 文件最多可以包含一个 `<script setup>`。(不包括一般的 `<script>`)
:::

- `template`: 这是 Vue 组件的模板部分，你可以在这里编写组件的 HTML 代码，比如标签、属性、事件等。在 Vue 中，模板是声明式的，也就是说，你只需要关注你想要展示的内容，而无需关注如何展示，Vue 会自动为你处理。

:::tip
每个 `*.vue` 文件最多可以包含一个*顶层* `<template>` 块。
:::

- `style`: 这是 Vue 组件的样式部分，你可以在这里编写组件的 CSS 代码，比如选择器、属性、伪类等。在 Vue 中，如果你在 `style` 之后使用了 `scoped`，这说明你定义的样式是作用域的，也就是说，你编写的样式只会作用到当前文件中的模板设计，而不会影响到其他组件，否则，`style` 块将会对全局生效。

:::tip
每个 `*.vue` 文件可以包含多个 `<style>` 标签。

一般来说，组件内部建议都使用 `<style scoped>`，如果你需要设计全局生效的 `CSS`，你可以在 `src/assets` 中修改 `base.css` 或者 `main.css`。
:::

了解了 `.vue` 文件的结构之后，我们再来看项目的主体内容：

- `App.vue`: 这是项目的根组件，之前 `main.js` 中的 `createApp` 你会发现，其中塞的就是这个文件，它的模板部分将会被渲染到 `index.html` 中的 `id="app"` 的 `div` 标签中：
```javascript
// App.vue
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```
一般来说，你只需要这样编写你的 App.vue 就好了，因为 `vue-router` 会自动帮你处理路由，在不同的路由下，`<RouterView />` 元素将会自动为你渲染不同的内容。

- `views/` 和 `components/` 文件夹：这里就是编写你的页面和组件的地方，字面意思来看，`views/` 文件夹下存放的是页面，`components/` 文件夹下存放的是组件，你可以以你自己的理解来存放。不过一般来说，`views/` 文件夹下存放的是某一个路由的整体设计，`components/` 文件夹下存放的是一些可以在多个页面或者同一页面上多次复用的组件。

- `src/router/index.js`: 你需要在这里配置你的 `vue-router` 路由，它将自动根据你浏览器中输入的地址路由来选择展示的内容，例如我们模板项目中的 `router` 配置：
```js
import {createRouter, createWebHashHistory} from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        component: () => import('../views/user/Login.vue'),
        meta: {title: '用户登录'}
    }, {
        path: '/register',
        component: () => import('../views/user/Register.vue'),
        meta: {title: '用户注册'}
    }, {
        path: '/home',
        redirect: '/dashboard',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/user/Dashboard.vue'),
                meta: {title: '个人信息'}
            },
        ]
    }, {
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }]
})

router.beforeEach((to, _, next) => {
    const token: string | null = sessionStorage.getItem('token');
    const role: string | null = sessionStorage.getItem('role')

    if (to.meta.title) {
        document.title = to.meta.title
    }

    if (token) {
        if (to.meta.permission) {
            if (to.meta.permission.includes(role!)) {
                next()
            } else {
                next('/404')
            }
        } else {
            next()
        }
    } else {
        if (to.path === '/login') {
            next();
        } else if (to.path === '/register') {
            next()
        } else {
            next('/login')
        }
    }
})

export {router}
```
其中，你会发现，配置了每个路由所对应的 `views` 文件夹中的页面，并将剩余未定义的路由都重定向到 `404` 页面，并且，在路由跳转之前添加了拦截器，会检查当前用户是否已经登录，如果已经登录，则根据用户的权限来决定是否可以访问该页面，否则，重定向到登录页面。

这里还有高手进阶用法，其中 `/home` 页面为它指定了 `children`

如果打开 `/home` 对应页面的 `.vue` 文件，你就会发现原因：
```js
// src/views/Home.vue
<script setup lang="ts">
import Header from "../components/Header.vue"
</script>


<template>
  <Header/>
  <router-view />
</template>


<style scoped>
</style>
```
在这里首先放上了 `Header` 子组件，并在之后添加 `router-view`，表明先渲染一个 `Header`，再渲染子路由的具体内容，这样编写，如果你访问 `/dashboard`，你会发现，原先的 `dashboard` 设计中并未包含 `Header`，但是，因为 `Home.vue` 中已经包含 `Header`，所以，`Header` 会被渲染到 `dashboard` 的页面中。

:::tip
`meta` 字段指定了页面的元数据，你可以在其中添加一些你需要的字段，例如 `title`，`permission` 等，在 `router.beforeEach` 中，你可以根据这些字段来处理跳转逻辑。
:::

这样，你应该对 `Vue` 项目结构和每个部分的作用有一定的具体了解了，接下来，你将学习一些有关页面元素设计的基础内容，以及网络请求的一些必需知识，以方便你之后的作业开发。
