---
title: 4. Vue3 script & Axios
date: 2025-03-04
icon: file-code
order: 5
category:
  - Vue3 网络前端开发
tag:
  - JavaScript
  - TypeScript
---

:::tip
对于 `Vue3` 的 `script` 常用语法，显然 [Vue3 互动教程](https://cn.vuejs.org/tutorial) 是最好的学习方式，建议你去那里学习。

对于 `Element-Plus` 的组件样式和用法查询，你应当前往 [Element-Plus 官网](https://element-plus.org/zh-CN/component/overview.html) 阅读。
:::

在这里我们仅对一些易错点介绍，比如需要掌握的 `Axios` 网络请求库的用法介绍，它与你认知当中的顺序执行不太一样，也就是 `Promise` 的问题。

### Axios

在浏览器中，所有的网络请求都是*异步*的。

`异步` 这个概念在操作系统中也有学到，就是 `协程` 的概念，程序本身还是只有一个线程，但是可能会有多个协程同时运行，在一个协程中，你可能完成了一些事情，在需要等待响应或者等待其他协程的时候，程序会切换到另一个协程，等另一个协程完成之后，再切换回来。

`Axios` 发起的网络请求也是这样，当你使用类似 `Axios.get` 的方法时，它会立即返回一个 `Promise` 对象，但是这个 `Promise` 对象并不会立即得到结果，而是会等待网络请求完成之后，才会得到结果。

对于一个 `Promise` 对象，你可以这样使用它：

```ts
Axios.get('/api/user').then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.error(error);
});
```

在这个例子中，`Axios.get` 方法会立即返回一个 `Promise` 对象，然后我们使用 `then` 方法来处理这个 `Promise` 对象的结果，如果网络请求成功，那么 `then` 方法中的回调函数会被调用，并且 `response` 参数会包含服务器返回的数据（也就是 `Promise<>` 尖括号中的类型）；如果网络请求失败，那么 `catch` 方法中的回调函数会被调用，并且 `error` 参数会包含错误信息。

意识到问题所在了吗？如果你写了这样一段代码：

```ts
const fetch = () => {
  let result = null;
  Axios.get('/api/user').then((response) => {
    result = response.data;
  }).catch((error) => {
    console.error(error);
  });
  // 假设这里你想要使用 result 的结果
  console.log(result);
}
```
当你运行这段内容时，你会在开发者工具中开心地发现你请求成功了，并且返回的答案也正确，但是控制台中输出的 `result` 却是 `null`，因为 `Axios.get` 方法是异步的，它会立即返回一个 `Promise` 对象，但是并不会立即得到结果，所以 `result` 的值仍然是 `null`。

那么，如何解决这个问题呢？我们可以使用 `async/await` 语法，它会等待 `Promise` 对象的结果，然后再继续执行后面的代码：

```ts
const fetch = async () => {
  let result = null;
  await Axios.get('/api/user').then((response) => {
    result = response.data;
  }).catch((error) => {
    console.error(error);
  })
  console.log(result);
}
```

或者，你可以直接脱去 `then` 和 `catch`，直接使用 `await`：

```ts
const fetch = async () => {
  let result = null;
  try {
    result = await Axios.get('/api/user');
  } catch (error) {
    console.error(error);
  }
  console.log(result);
}
```

这样，你就可以愉快地进行网络请求了。

你也许会发现，`Axios` 发送的请求都是互相独立的，如果后端服务器尝试设置你的 `cookie`，或者你想让自己的每一条请求都附带登录信息，它总是会丢失，这应当怎么办呢？

`Axios` 提供了 `axios.create()` 方法，供你创建一个 `axios` 实例，像这样：
```ts
const instance = axios.create({
  baseURL: 'https://some-domain.com/api/', // 设置请求的根路径
  timeout: 1000, // 设置请求超时时间
  withCredentials: true, // 允许跨域请求携带 cookie
});
```
当然，还有其它的设置项，这里仅举例

同时，作为一个合格的网络请求模块，你也可以为这个实例创建 `请求拦截器` 和 `响应拦截器`：
```ts

//当前实例的拦截器，对所有要发送给后端的请求进行处理，在其中加入token
instance.interceptors.request.use(
    config => {
        if(hasToken()) {
            config.headers['token'] = sessionStorage.getItem('token')
        }
        return config
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
)

//当前实例的拦截器，对所有从后端收到的请求进行处理，检验http的状态码
instance.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response;
        } else {
            return Promise.reject();
        }
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
)
```

你可以创建一个文件，默认导出这个 `axios` 实例，在其它地方都不使用 `axios` 包本身而使用这个实例即可。

### `function` 和 `箭头函数`
在 JavaScript 中，`function` 和 `箭头函数` 是两种不同的函数定义方式，它们在语法和功能上都有一些区别。

`function` 是标准的函数定义方式，它有函数名，可以接受参数，并且可以返回值。例如：

```js
function add(a, b) {
  return a + b;
}
```

`箭头函数` 是 ES6 引入的一种新的函数定义方式，它没有函数名，只能接受参数，并且可以返回值。例如：

```js
const add = (a, b) => {
  return a + b;
};
```

箭头函数和普通函数的主要区别在于 `this` 的指向。在普通函数中，`this` 的指向取决于函数的调用方式，而在箭头函数中，`this` 的指向是固定的，始终指向函数定义时的上下文。例如：

```js
function Person() {
  this.age = 0;

  setInterval(function growUp() {
    this.age++; // 这里的 this 指向的是全局对象
  }, 1000);
}

const person = new Person();
```

在上面的例子中，`growUp` 函数是一个普通函数，它的 `this` 指向的是全局对象，而不是 `Person` 实例。因此，`this.age` 的值始终是 `undefined`。

如果我们将 `growUp` 函数改为箭头函数，那么 `this` 的指向就会始终指向 `Person` 实例：

```js
function Person() {
  this.age = 0;

  setInterval(() => {
    this.age++; // 这里的 this 指向的是 Person 实例
  }, 1000);
}

const person = new Person();
```

:::tip
如果上面的说法你看不懂，那这里可以说人话：

`function` 定义的函数只能访问全局定义的变量和方法

`箭头函数` 定义的函数同时可以访问上下文中定义的变量和方法

因此，一般建议使用 `箭头函数` 而非 `function`
:::
