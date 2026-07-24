---
title: 结构体指针与结构体数组
date: 2026-07-07
icon: diagram-project
order: 30
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 结构体
  - 指针
  - 数组
author: Kingcq
---

## 学习目标

学完本篇，你会掌握：

- 如何定义指向结构体的指针。
- `->` 运算符的用法。
- 结构体数组的遍历。
- 用结构体指针遍历数组。
- 结构体作为函数参数时，传值和传指针的区别与选择。

## 指向结构体的指针

指针不仅可以指向 `int`、`char`，也可以指向结构体。用法和之前学的指针一样：

```c
#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[20];
    float score;
} Student;

int main(void) {
    Student s = {1, "Alice", 90.5};
    Student *p = &s;  // p 指向 s

    // 通过 *p 访问成员
    printf("学号：%d\n", (*p).id);
    printf("姓名：%s\n", (*p).name);
    printf("成绩：%.1f\n", (*p).score);

    return 0;
}
```

<span style="color: #67C23A;">因为 `.` 的优先级比 `*` 高，所以必须写成 `(*p).id`，不能写成 `*p.id`。</span>

## -> 运算符

每次写 `(*p).xxx` 有点麻烦，C 语言提供了 `->` 运算符，专门用于通过指针访问结构体成员：

```c
p->id    // 等价于 (*p).id
p->name  // 等价于 (*p).name
p->score // 等价于 (*p).score
```

上面的代码可以改写成：

```c
printf("学号：%d\n", p->id);
printf("姓名：%s\n", p->name);
printf("成绩：%.1f\n", p->score);
```

简洁很多。初学阶段记住这个口诀：<span style="color: #409EFF;">指针用 `->`，变量用 `.`</span>。

## 结构体数组

<span style="color: #E6A23C;">结构体数组和基本类型数组没什么本质区别：</span>

```c
#include <stdio.h>

typedef struct {
    int id;
    char name[20];
    float score;
} Student;

int main(void) {
    Student class[3] = {
        {1, "Alice", 90.0},
        {2, "Bob",   85.5},
        {3, "Carol", 88.0}
    };

    for (int i = 0; i < 3; i++) {
        printf("%d %s %.1f\n", class[i].id, class[i].name, class[i].score);
    }

    return 0;
}
```

## 用结构体指针遍历数组

数组名 `class` 是首元素地址，类型是 `Student *`。所以可以用指针遍历：

```c
#include <stdio.h>

typedef struct {
    int id;
    char name[20];
    float score;
} Student;

int main(void) {
    Student class[3] = {
        {1, "Alice", 90.0},
        {2, "Bob",   85.5},
        {3, "Carol", 88.0}
    };

    Student *p = class;
    for (int i = 0; i < 3; i++) {
        printf("%d %s %.1f\n", p->id, p->name, p->score);
        p++;
    }

    return 0;
}
```

这里 `p++` 不是加 1 个字节，而是加一个 `Student` 的大小，自动跳到下一个学生。

## 结构体作为函数参数

结构体传给函数有两种方式：传值和传指针。

### 传值

```c
void print_student(Student s) {
    printf("%d %s %.1f\n", s.id, s.name, s.score);
}
```

传值会把整个结构体复制一份给函数。优点是函数内部改不动原数据，安全；缺点是如果结构体很大，复制开销高。

### 传指针

```c
void add_score(Student *s, float bonus) {
    s->score += bonus;
}
```

传指针只复制一个地址，效率高，而且函数能修改原结构体。如果你不希望函数修改，可以加 `const`：

```c
void print_student(const Student *s) {
    printf("%d %s %.1f\n", s->id, s->name, s->score);
}
```

:::tip 怎么选择
只读访问用 `const Student *`，需要修改用 `Student *`。结构体很大时优先传指针，避免复制开销。
:::

## 完整示例

```c
#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[20];
    float score;
} Student;

void add_score(Student *s, float bonus) {
    s->score += bonus;
}

void print_student(const Student *s) {
    printf("%d %-10s %.1f\n", s->id, s->name, s->score);
}

int main(void) {
    Student class[3] = {
        {1, "Alice", 90.0},
        {2, "Bob",   85.5},
        {3, "Carol", 88.0}
    };

    for (int i = 0; i < 3; i++) {
        add_score(&class[i], 5.0);
    }

    printf("加分后：\n");
    Student *p = class;
    for (int i = 0; i < 3; i++, p++) {
        print_student(p);
    }

    return 0;
}
```

输出：

```text
加分后：
1 Alice      95.0
2 Bob        90.5
3 Carol      93.0
```

## 常见错误

1. <span style="color: #F56C6C;">把 `.` 和 `->` 用混</span>。`s.id` 用于变量，`p->id` 用于指针。
2. <span style="color: #F56C6C;">漏写 `*`</span>。`(*p).id` 不能省略括号，否则优先级会出错。直接用 `p->id` 更省心。
3. <span style="color: #F56C6C;">修改 const 指针指向的内容</span>。加了 `const` 后还写 `s->score += 10;` 会编译报错。

## 先问指针成员“拥有还是借用”

```c
struct Person {
    char *name;
};
```

仅看类型无法知道 `name` 指向字符串字面量、调用者缓冲区，还是本结构体拥有的动态副本。接口必须建立不变量：

- 若拥有，构造时复制，销毁时释放；
- 若借用，借用对象必须比结构体活得更久；
- 复制结构体时，要决定共享、深拷贝还是禁止复制。

## 修改头指针常需要二级指针

链表插入头部会改变调用者保存的头指针：

```c
bool push_front(Node **head, int value);
```

另一种接口是直接返回新头：

```c
Node *push_front(Node *head, int value);
```

前者可以用返回值表示成功失败，后者调用简单但失败语义需要仔细设计。接口风格应保持一致。

## `->` 只是语法糖

```c
pointer->member
(*pointer).member
```

两者等价。括号不可省略，因为 `.` 的优先级高于一元 `*`。理解这个等价关系后，就不必把 `->` 当成一种新的内存机制。

## 指向结构体数组的指针仍要带长度

```c
void sort_students(Student *students, size_t count);
```

函数不能从指针本身知道有多少元素。任何遍历接口都应把起点和边界一起传递。

## 小结

- 结构体指针用 `->` 访问成员，等价于 `(*p).member`。
- 结构体数组可以用指针遍历，`p++` 跳到下一个元素。
- 结构体传参：只读用 `const Student *`，需要修改用 `Student *`。

## 下一篇预告

到这里，C 语言中复合数据与指针的基础概念已经讲完了。但在进入链表之前，我们先停一停，看看怎么用这些基础工具在 C 语言里模拟面向对象的思想。
