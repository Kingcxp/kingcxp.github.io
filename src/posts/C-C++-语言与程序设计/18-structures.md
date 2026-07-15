---
title: 结构体与自定义数据类型
date: 2026-07-07
icon: cubes
order: 18
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 结构体
  - struct
  - typedef
author: Kingcq
---

## 学习目标

学完本篇，你会理解：

- 为什么需要结构体这种复合类型。
- 如何定义和使用 `struct`。
- `typedef` 如何简化类型名。
- 如何访问结构体成员。
- 嵌套结构体的基本用法。
- 结构体数组的初步概念。

## 为什么需要结构体

之前我们学的变量都是单一类型：`int`、`char`、`double`。但现实中很多事物需要多个属性一起描述。比如一个学生，有学号、姓名、成绩，这些属性类型不同，却属于同一个人。

如果每个属性都用单独的变量，数据零散、容易混乱。结构体可以把这些属性打包成一个整体。

```c
struct Student {
    int id;
    char name[20];
    float score;
};
```

这一整包就是一个“学生”类型。

## 结构体的定义与使用

定义结构体类型的同时可以创建变量：

```c
#include <stdio.h>
#include <string.h>

struct Student {
    int id;
    char name[20];
    float score;
};

int main(void) {
    struct Student s1;

    s1.id = 1;
    strcpy(s1.name, "Alice");
    s1.score = 89.5;

    printf("学号：%d\n", s1.id);
    printf("姓名：%s\n", s1.name);
    printf("成绩：%.1f\n", s1.score);

    return 0;
}
```

注意，字符串不能直接用 `s1.name = "Alice";` 赋值，因为 `name` 是数组名，不能整体赋值。要用 `strcpy`。

## typedef 简化类型名

每次写 `struct Student` 有点啰嗦。用 `typedef` 可以给它起个短名字：

```c
typedef struct Student {
    int id;
    char name[20];
    float score;
} Student;

int main(void) {
    Student s1;  // 不用再加 struct
    s1.id = 2;
    return 0;
}
```

也可以定义时直接省略标签名：

```c
typedef struct {
    int id;
    char name[20];
    float score;
} Student;
```

两种写法都可以，第一种写法保留了 `struct Student` 这个完整名字，某些场景更灵活。

## 访问结构体成员

用 `.` 运算符访问成员：

```c
Student s;
s.id = 100;
strcpy(s.name, "Bob");
s.score = 92.0;
```

也可以在定义时直接初始化：

```c
Student s = {100, "Bob", 92.0};
```

按成员顺序写，清晰直观。

## 嵌套结构体

结构体里还可以放另一个结构体。比如学生有出生日期：

```c
typedef struct {
    int year;
    int month;
    int day;
} Date;

typedef struct {
    int id;
    char name[20];
    Date birthday;  // 嵌套结构体
    float score;
} Student;

int main(void) {
    Student s = {1, "Carol", {2005, 8, 15}, 88.0};

    printf("%s 的生日是 %d-%d-%d\n",
           s.name, s.birthday.year, s.birthday.month, s.birthday.day);

    return 0;
}
```

访问嵌套成员时，用多个 `.` 逐层深入：`s.birthday.year`。

:::tip 结构体的内存对齐
你可能注意到一个现象：一个包含 `char` 和 `int` 的结构体，其 `sizeof` 可能不等于各成员大小之和。这是因为编译器会在成员之间插入"填充字节"来对齐内存，以提高 CPU 的访问效率。

```c
struct Example {
    char c;    // 1 字节
    // 这里会填充 3 个字节
    int i;     // 4 字节
};
printf("%zu\n", sizeof(struct Example));  // 通常输出 8，而不是 5
```

初学阶段无需深究，只需要知道 `sizeof` 结构体 >= 各成员大小之和，不要凭"感觉"假设结构体的大小即可。
:::

## 结构体数组初步

既然 `int` 可以组成数组，结构体当然也可以：

```c
Student class[3] = {
    {1, "Alice", {2004, 1, 10}, 90.0},
    {2, "Bob",   {2005, 3, 22}, 85.5},
    {3, "Carol", {2005, 8, 15}, 88.0}
};
```

下一篇我们会专门讲结构体数组和结构体指针，包括如何遍历、如何传参。

## 常见错误

1. **忘记 `typedef` 时写 `Student s;`**。如果你写的是 `struct Student { ... };`，后面就必须用 `struct Student s;`。
2. **字符串直接赋值给字符数组**。`s.name = "Alice";` 是错的，用 `strcpy`。
3. **结构体之间比较**。不能直接用 `==` 比较两个结构体，要逐个成员比较。

## 小结

- 结构体把不同类型的数据打包成一个整体，便于描述复杂对象。
- 用 `.` 访问成员，定义时可以用 `typedef` 简化类型名。
- 结构体可以嵌套，也可以组成数组。

## 下一篇预告

下一篇《结构体指针与结构体数组》会讲指向结构体的指针、`->` 运算符，以及结构体数组的遍历和传参。
