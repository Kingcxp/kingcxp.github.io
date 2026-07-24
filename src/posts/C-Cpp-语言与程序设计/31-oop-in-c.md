---
title: C 语言里的面向对象思想
date: 2026-07-08
icon: object-group
order: 31
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 面向对象
  - 函数指针
  - typedef
  - 命名规范
author: Kingcq
---

## 为什么要在 C 语言里谈面向对象

一提到面向对象，很多人第一反应是 `C++`、`Java`、`Python` 这些语言。其实，`C` 语言本身没有 `class`、`private`、`virtual` 这些关键字，但<span style="color: #E6A23C;">面向对象首先是一种思想</span>，而不是某门语言的专利。

在 `C` 语言里，我们完全可以用结构体 + 函数指针 + 命名约定来模拟面向对象的核心机制：封装、抽象、以及“把数据和行为绑定在一起”。理解了这一点，后面学习 `C++` 的 `class` 时，你就会明白：`C++` 并不是凭空创造了面向对象，它只是把 `C` 语言里“手动实现”的东西变成了语法糖。

## 学习目标

- 用 `typedef` 让结构体类型更简洁
- 理解类型名和模块前缀的命名约定
- 掌握 `C` 语言常见的命名规范
- 用函数指针把“行为”放进结构体
- 理解 `create` / `destroy` 方法的作用
- 体会面向对象思想带来的好处

## typedef：告别繁琐的 struct

前面我们写结构体时，每次定义变量都要带个 `struct` 前缀：

```c
struct Student s1;
```

`typedef` 可以给类型起别名。配合结构体定义，我们可以一次性把 `struct Student` 简化为 `Student`：

```c
typedef struct Student {
    int id;
    char name[20];
    float score;
} Student;

// 现在可以这么写
Student s1;
Student s2 = {1, "Alice", 90.5};
```

:::tip 写法也可以拆开
你也可以先定义结构体，再单独 `typedef`：

```c
struct Student { ... };
typedef struct Student Student;
```

两种写法效果一样，第一种更紧凑，第二种在需要自引用（比如链表节点）时更清晰。
:::

## 类型命名：清楚比“像系统库”更重要

在系统头文件中经常看到 `size_t`、`time_t`、`pid_t`。一些教程会建议所有自定义类型都加 `_t` 后缀，但面向 POSIX 环境时，这类名称可能落入实现或标准保留的命名空间，公共库尤其不应依赖这种习惯来“避免冲突”。

本教程采用更直接的约定：

```c
typedef struct Student Student;
typedef int Age;
```

类型使用清楚的名词，模块级函数使用统一前缀。真正避免冲突的关键不是机械加后缀，而是保持公共标识符少而有组织。

## 命名空间思想：给类型加前缀

`C` 语言没有命名空间（namespace）机制，所有全局类型、函数、宏都处在同一个“大房间”里。项目一大，名字很容易撞车。为了模拟命名空间，常见的做法是<span style="color: #409EFF;">给同一模块的类型加统一前缀</span>。

比如一个学生管理模块：

```c
typedef struct StuStudent {
    int id;
    char name[20];
    float score;
} StuStudent;

void stu_print(StuStudent* s);
void stu_set_score(StuStudent* s, float score);
```

这里 `stu_` 就是这个模块的“命名空间”。看到 `stu_` 开头的东西，你就知道它属于学生模块。

## C 与 C++ 的命名规范

命名规范没有绝对的对错，但不同语言、不同社区有各自的“主流习惯”。在 `C` 和 `C++` 里，常见的有三种：

| 风格 | 示例 | 适用场景 |
| :-- | :-- | :-- |
| <span style="color: #409EFF;">蛇形命名 snake_case</span> | `student_name`, `max_value` | `C` 语言项目、标准库、Linux 内核 |
| <span style="color: #409EFF;">小驼峰 camelCase</span> | `studentName`, `maxValue` | `C++` 项目、Java、JavaScript |
| <span style="color: #409EFF;">大驼峰 PascalCase</span> | `StudentName`, `MaxValue` | `C++` 类名、结构体名、Java 类名 |

### C 语言：基本只用蛇形

`C` 语言社区非常统一：<span style="color: #409EFF;">变量、函数、结构体类型、宏几乎都用 `snake_case`</span>。唯一的例外是宏常量，习惯全大写加下划线：

```c
#define MAX_BUFFER_SIZE 1024
#define PI 3.14159
```

Linux 内核、`glibc`、`nginx`、`redis` 这些著名 `C` 项目，基本都是清一色的 `snake_case`。

### C++：相对混乱

`C++` 因为兼容 `C`，又吸收了很多面向对象的习惯，命名风格比较“杂”：

- <span style="color: #409EFF;">类名 / 结构体名</span>：通常用大驼峰 `PascalCase`，比如 `class StudentManager`。
- <span style="color: #409EFF;">变量、函数</span>：标准库用 `snake_case`（`std::vector`、`std::find_if`），但很多项目用 `camelCase`（`getStudentName`）。
- <span style="color: #409EFF;">成员变量</span>：有人喜欢加 `m_` 前缀（`m_name`），有人喜欢加下划线后缀（`name_`），也有人什么都不加。
- <span style="color: #409EFF;">宏常量</span>：和 `C` 一样，全大写加下划线。

:::tip 我的建议
初学阶段，先养成一种稳定的习惯：

- 写 `C` 时，全局使用 `snake_case`，宏用全大写。
- 写 `C++` 时，类名用 `PascalCase`，变量和函数用 `snake_case` 或 `camelCase` 都可以，但<span style="color: #409EFF;">同一个项目里要统一</span>。
:::

## 把函数塞进结构体：函数指针

面向对象的核心是“数据 + 行为”打包。`C` 语言里，数据用结构体打包很容易，行为怎么打包呢？答案是<span style="color: #409EFF;">函数指针</span>。

函数指针就是“指向函数的指针”。你可以把它存到结构体里，让这个结构体拥有某种“能力”。

下面是一个简单的例子：我们定义一个“计数器”结构体，它知道自己怎么增加、怎么重置。

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Counter Counter;

struct Counter {
    int value;

    // 函数指针：指向一个接收 Counter* 参数、无返回值的函数
    void (*increment)(Counter* self);
    void (*reset)(Counter* self);
    int  (*get)(Counter* self);
};

void counter_increment(Counter* self) {
    self->value++;
}

void counter_reset(Counter* self) {
    self->value = 0;
}

int counter_get(Counter* self) {
    return self->value;
}

int main(void) {
    Counter c;
    c.value = 0;
    c.increment = counter_increment;
    c.reset = counter_reset;
    c.get = counter_get;

    c.increment(&c);
    c.increment(&c);
    printf("%d\n", c.get(&c));  // 输出 2

    c.reset(&c);
    printf("%d\n", c.get(&c));  // 输出 0

    return 0;
}
```

这里每个函数都接收一个 `self` 指针，指向当前对象。这其实就和 `C++` 里的 `this` 指针是一个思想。

:::tip 函数指针的声明容易写错
`void (*increment)(Counter* self);` 里的括号不能少。去掉括号变成 `void* increment(...)` 就是完全不同的意思了。记不住的时候可以这样理解：`*increment` 先结合成一个指针，然后后面 `(Counter* self)` 表示它指向的函数签名。
:::

## 手动绑定：create 和 destroy

上面的例子有一个问题：每次创建 `Counter` 变量，我们都要手动把三个函数指针赋值一遍。这不仅麻烦，还容易遗漏。

解决办法是写一个专门的<span style="color: #409EFF;">构造函数</span>（create）来帮我们完成初始化：

```c
Counter* counter_create(int initial_value) {
    Counter* c = malloc(sizeof(Counter));
    if (c == NULL) return NULL;

    c->value = initial_value;
    c->increment = counter_increment;
    c->reset = counter_reset;
    c->get = counter_get;

    return c;
}

void counter_destroy(Counter* c) {
    free(c);
}
```

使用的时候就清爽多了：

```c
Counter* c = counter_create(0);
c->increment(c);
printf("%d\n", c->get(c));
counter_destroy(c);
```

这个模式在 `C` 语言项目里非常常见：`xxx_create` 负责构造对象，`xxx_destroy` 负责清理资源。它对应了 `C++` 里的构造函数和析构函数。

## 一个更完整的例子：学生对象

我们把上面的技巧综合起来，写一个更像“类”的 `C` 语言结构：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct StuStudent StuStudent;

struct StuStudent {
    int  id;
    char name[20];
    float score;

    void (*set_score)(StuStudent* self, float score);
    void (*print)(StuStudent* self);
};

void stu_student_set_score(StuStudent* self, float score) {
    if (score < 0 || score > 100) {
        printf("成绩不合法\n");
        return;
    }
    self->score = score;
}

void stu_student_print(StuStudent* self) {
    printf("id: %d, name: %s, score: %.1f\n", self->id, self->name, self->score);
}

StuStudent* stu_student_create(int id, const char* name, float score) {
    StuStudent* s = malloc(sizeof(StuStudent));
    if (s == NULL) return NULL;

    s->id = id;
    strncpy(s->name, name, sizeof(s->name) - 1);
    s->name[sizeof(s->name) - 1] = '\0';
    s->score = score;

    s->set_score = stu_student_set_score;
    s->print = stu_student_print;

    return s;
}

void stu_student_destroy(StuStudent* s) {
    free(s);
}

int main(void) {
    StuStudent* alice = stu_student_create(1, "Alice", 85.0);
    alice->print(alice);
    alice->set_score(alice, 92.5);
    alice->print(alice);
    stu_student_destroy(alice);
    return 0;
}
```

这个例子里有什么？

- `StuStudent`：带命名空间前缀的类型名
- 数据成员：`id`、`name`、`score`
- 行为成员：`set_score`、`print`（函数指针）
- 构造函数：`stu_student_create`
- 析构函数：`stu_student_destroy`
- 方法里做了合法性检查：成绩不能越界

虽然语法上比 `C++` 的 `class` 啰嗦很多，但思想已经完全一样了。

## 面向对象到底好在哪

把代码组织成“对象”的形式，带来的好处至少有这几个：

1. <span style="color: #409EFF;">封装</span>：把数据和对数据的操作放在一起，外界不需要知道内部细节。比如调用者只用 `set_score`，不用关心分数范围检查写在哪里。
2. <span style="color: #409EFF;">代码复用</span>：一个 `Counter` 创建出来后，可以在很多地方复用，而且行为一致。
3. <span style="color: #409EFF;">易于维护</span>：修改内部实现时，只要接口不变，调用者就不用改代码。
4. <span style="color: #409EFF;">更接近人类思维</span>：我们自然会用“学生”“计数器”这种对象来思考问题，而不是一堆零散的变量和函数。

:::tip C 与 C++ 的关系
你现在在 `C` 语言里手动实现了：类型别名、命名空间前缀、构造函数、析构函数、方法绑定。<span style="color: #409EFF;">等到 `C++` 部分，你会发现 `class` 本质上就是把这堆手动操作自动化了。</span>
:::

## C 中更实用的封装：不透明结构体

把结构体完整定义放在 `.c` 文件，只在头文件暴露前置声明，可以阻止调用者直接依赖内部字段：

```c
// counter.h
typedef struct Counter Counter;

Counter *counter_create(void);
void counter_destroy(Counter *counter);
void counter_add(Counter *counter, int amount);
int counter_value(const Counter *counter);
```

```c
// counter.c
struct Counter {
    int value;
};
```

这比把每个函数指针都塞进每个实例更节省空间，也更接近许多成熟 C 库的接口风格。

## 函数指针适合表达可替换行为

当不同对象确实需要不同策略时，才把操作表单独保存：

```c
typedef struct {
    void (*draw)(void *self);
    void (*destroy)(void *self);
} ShapeOps;
```

多个实例可以共享同一张操作表，而不是每个对象重复保存相同函数地址。`void *self` 会牺牲静态类型检查，因此实现和文档必须严格约定实际类型。

## “面向对象”不是把函数藏进结构体

更重要的是：维护不变量、隐藏表示、明确生命周期、通过窄接口操作状态。C 能实现这些思想，只是缺少语言级访问控制、自动构造析构和虚函数语法，需要程序员用模块边界和约定手动维护。

## 小结

- `typedef` 可以让 `struct` 前缀消失，类型名更简洁。
- 类型名应清楚表达概念；公共 C 接口还应使用模块前缀避免全局命名冲突。
- 给类型和函数加统一前缀，可以模拟命名空间，避免名字冲突。
- `C` 项目基本用 `snake_case`；`C++` 项目更混乱，类名常用 `PascalCase`。
- 函数指针可以把行为塞进结构体，再配合 `create` / `destroy` 方法，就能模拟出面向对象的基本形态。
- 面向对象的好处是封装、复用、易维护和贴近思维。

## 下一篇预告

下一篇先用通讯录项目把结构体、动态内存、文件和错误传播组合起来；随后再建立算法复杂度的尺子，进入数据结构。
