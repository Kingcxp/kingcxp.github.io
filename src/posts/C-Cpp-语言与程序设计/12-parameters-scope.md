---
title: 形参与实参、局部变量与全局变量
date: 2026-07-02
icon: code-compare
order: 12
category:
  - C/C++ 语言与程序设计
tag:
  - 参数传递
  - 作用域
  - 变量
author: Kingcq
---

## 引入：函数之间是怎么传数据的

上一篇我们学会了定义和调用函数。但你可能会问：调用函数时，括号里的值到底是怎么跑到函数里面去的？函数里改的变量，会不会影响外面的变量？

这些问题都关系到<span style="color: #409EFF;">参数传递</span>和<span style="color: #409EFF;">变量作用域</span>。搞懂它们，你才能避免很多“看起来对，运行却错”的 bug。

## 形参和实参的区别

先看一段代码：

```c
#include <stdio.h>

void swap(int a, int b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    int x = 3, y = 5;
    swap(x, y);
    printf("x = %d, y = %d\n", x, y);
    return 0;
}
```

你可能期望它交换 `x` 和 `y`，但运行结果是：

```text
x = 3, y = 5
```

完全没变化。要理解为什么，得先分清两个概念：

- <span style="color: #E6A23C;">形参</span>（形式参数）：函数定义时括号里的变量，比如上面的 `a` 和 `b`。
- <span style="color: #E6A23C;">实参</span>（实际参数）：函数调用时传进去的值或变量，比如上面的 `x` 和 `y`。

## C 语言中的值传递

在 C 语言中，函数参数默认采用<span style="color: #409EFF;">值传递</span>（pass by value）。调用 `swap(x, y)` 时，编译器会把 `x` 的值复制一份给 `a`，把 `y` 的值复制一份给 `b`。函数内部修改的是 `a` 和 `b` 这两个“副本”，和 `x`、`y` 本身没关系。

这就像你复印了一份文件给别人，别人在复印件上涂涂画画，原件不会受影响。

如果想真正交换 `x` 和 `y`，需要用到指针——那是后面要讲的内容。现在你只需要记住：<span style="color: #409EFF;">普通变量作为参数时，函数里修改的是副本，不会影响原变量</span>。

```c
#include <stdio.h>

void change(int a) {
    a = 100;
    printf("函数内部 a = %d\n", a);
}

int main() {
    int x = 1;
    change(x);
    printf("函数外部 x = %d\n", x);
    return 0;
}
```

输出：

```text
函数内部 a = 100
函数外部 x = 1
```

## 局部变量与全局变量

### 局部变量

在函数内部定义的变量叫<span style="color: #409EFF;">局部变量</span>。它只在函数执行期间存在，函数结束后就“消失”了。

```c
#include <stdio.h>

void foo(void) {
    int local = 10;
    printf("local = %d\n", local);
}

int main() {
    foo();
    // printf("%d\n", local);  // 错误！main 里访问不到 foo 里的 local
    return 0;
}
```

不同函数里可以有同名的局部变量，它们互不影响，因为各自生活在自己的“作用域”里。

### 全局变量

在所有函数外面定义的变量叫<span style="color: #409EFF;">全局变量</span>。从定义的位置开始，到整个文件结束，所有函数都能访问它。

```c
#include <stdio.h>

int count = 0;  // 全局变量

void add_one(void) {
    count = count + 1;
}

int main() {
    add_one();
    add_one();
    printf("count = %d\n", count);
    return 0;
}
```

输出：

```text
count = 2
```

全局变量看起来方便，但用多了会让程序难以追踪。哪个函数改了它、什么时候改的，都变得不透明，所以<span style="color: #67C23A;">建议尽量少用全局变量</span>。优先用参数和返回值来传递数据。

## 作用域与生命周期

- <span style="color: #E6A23C;">作用域</span>：变量在代码的哪些区域可见、可以被访问。
- <span style="color: #E6A23C;">生命周期</span>：变量在内存中存在多久。

局部变量的作用域是它所在的大括号 `{}` 内，生命周期从进入大括号开始，到离开大括号结束。

全局变量的作用域是从定义处到文件末尾（如果其他文件也想用，需要 `extern` 声明），生命周期贯穿整个程序运行期间。

## static 局部变量

有时候你希望局部变量能“记住”上次的值，下次进入函数时不用重新初始化。这时可以加 `static`。

```c
#include <stdio.h>

void counter(void) {
    static int n = 0;  // 只初始化一次
    n = n + 1;
    printf("第 %d 次调用\n", n);
}

int main() {
    counter();
    counter();
    counter();
    return 0;
}
```

输出：

```text
第 1 次调用
第 2 次调用
第 3 次调用
```

`static` 局部变量虽然定义在函数内部，但它的生命周期和全局变量一样长，只是作用域仍然限制在函数内。

### extern 关键字与多文件共享

全局变量的作用域默认仅限于定义它的源文件。如果想让其他文件也能访问，需要使用 `extern` 声明：

```c
// file_a.c
int shared_value = 100;  // 定义全局变量

// file_b.c
extern int shared_value;  // 声明来自其他文件
void func() {
    shared_value = 200;   // 可以修改 file_a.c 里的变量
}
```

`extern` 告诉编译器"这个变量在其他地方已经定义了，你先别分配空间，链接时会找到它"。初学者暂时了解即可，后面多文件编程时会再遇到。不过要小心：跨文件共享全局变量容易导致代码耦合，能用函数参数和返回值解决的问题，尽量不靠全局变量。

## 变量命名冲突

当局部变量和全局变量同名时，<span style="color: #409EFF;">局部变量会“遮蔽”全局变量</span>，即在函数内部优先使用局部变量。

```c
#include <stdio.h>

int value = 100;

void test(void) {
    int value = 10;
    printf("函数内部 value = %d\n", value);
}

int main() {
    test();
    printf("函数外部 value = %d\n", value);
    return 0;
}
```

输出：

```text
函数内部 value = 10
函数外部 value = 100
```

为了避免混淆，尽量不要让局部变量和全局变量同名。

## 常见错误与注意事项

1. <span style="color: #F56C6C;">以为值传递能修改原变量</span>：这是初学者最常踩的坑，记住普通参数传的是副本。
2. <span style="color: #F56C6C;">全局变量滥用</span>：方便一时，维护痛苦一时。
3. <span style="color: #F56C6C;">局部变量未初始化就使用</span>：局部变量不会自动清零，里面可能是随机值。
4. <span style="color: #F56C6C;">`static` 理解错</span>：它不是“常量”，只是生命周期延长了，值仍然可以被修改。

## 局部优先于全局

写函数时有一个简单的原则：<span style="color: #409EFF;">能用参数传递的就不要用全局变量</span>。

全局变量虽然用起来方便，但是会造成一个问题——你在代码的任何一个地方都可能修改它，很难追踪是谁改了它、什么时候改的。这会给你排查 bug 增加很多麻烦。

如果一段逻辑需要被多个函数共享，优先通过参数把数据传给它们，而不是把数据放在全局变量里。这样做的好处是：

1. **函数之间的依赖更加明确**——看一眼参数列表就知道这个函数需要什么数据。
2. **容易复用**——同样的函数可以用不同的数据调用多次。
3. **容易调试**——如果结果出错了，可以更快地定位到具体是哪个环节的问题。

```c
// ❌ 不推荐：用全局变量传递数据
int value;

void add_one(void) {
    value = value + 1;
}

void print_value(void) {
    printf("%d\n", value);
}

// ✅ 推荐：通过参数和返回值传递
int add_one(int v) {
    return v + 1;
}

void print_value(int v) {
    printf("%d\n", v);
}
```

:::tip 关于指针和结构体
你可能会在项目里看到用指针间接修改函数外部的变量，或者把多个相关的变量放到结构体里一起传递。这些内容我们会分别在指针章节和结构体章节中详细讲解，这里先记住“能用参数传的尽量参数传”这个原则就行。
:::
