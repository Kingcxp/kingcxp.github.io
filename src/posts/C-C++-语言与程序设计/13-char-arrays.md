---
title: 字符数组与基础字符串操作
date: 2026-07-05
icon: font
order: 14
category:
  - C/C++ 语言与程序设计
tag:
  - 字符数组
  - 字符串
  - string.h
author: Kingcq
---

## 引入：C 语言怎么表示文字

前面我们处理的大多是数字，但程序经常要处理文字，比如用户名、密码、文件名等。C 语言本身没有专门的“字符串类型”，字符串是用**字符数组**来表示的。

理解字符数组，对后面学习字符串处理、文件读写都很重要。

## 字符数组与字符串的关系

字符数组就是元素类型为 `char` 的数组：

```c
char s[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
```

这个数组表示字符串 `"Hello"`。注意最后一个字符 `\0`，它是字符串的**结束标志**。

更方便的写法是：

```c
char s[6] = "Hello";
```

编译器会自动在末尾加上 `\0`。如果写 `char s[] = "Hello";`，编译器会自动算出长度为 6。

## \0 结束符

`\0` 是一个特殊的字符，ASCII 码值为 0，表示字符串到此结束。所有处理字符串的函数都靠它来知道字符串在哪里结束。

```c
#include <stdio.h>

int main(void)
{
    char s[] = "Hello";
    printf("%s\n", s);
    return 0;
}
```

输出：

```text
Hello
```

:::tip 字符串长度 vs 数组长度
字符串 `"Hello"` 有 5 个可见字符，但存放它的数组至少需要 6 个字节，因为还要留一个位置给 `\0`。
:::

## 常用字符串函数

C 语言提供了很多字符串处理函数，声明在 `<string.h>` 中。

### strlen：求字符串长度

返回字符串中 `\0` 之前的字符个数，不算 `\0`。

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[] = "Hello";
    printf("长度：%zu\n", strlen(s));
    return 0;
}
```

输出：

```text
长度：5
```

### strcpy：复制字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char src[] = "Hello";
    char dest[20];

    strcpy(dest, src);
    printf("dest = %s\n", dest);
    return 0;
}
```

:::tip strcpy 有风险
如果 `dest` 数组不够大，`strcpy` 会越界。更安全的做法是使用 `strncpy`。
:::

### strncpy：安全复制

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char src[] = "Hello, World!";
    char dest[10];

    strncpy(dest, src, sizeof(dest) - 1);
    dest[sizeof(dest) - 1] = '\0';  // 手动确保结尾

    printf("dest = %s\n", dest);
    return 0;
}
```

`strncpy` 的第三个参数指定最多复制多少字符。注意它不会自动补 `\0`，所以最后一行我们手动加了结束符。

### strcmp：比较字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[] = "apple";
    char b[] = "banana";

    int result = strcmp(a, b);

    if (result < 0) {
        printf("a 在字典序上小于 b\n");
    } else if (result > 0) {
        printf("a 在字典序上大于 b\n");
    } else {
        printf("a 和 b 相等\n");
    }

    return 0;
}
```

:::tip 不要用 == 比较字符串
`if (a == b)` 比较的是地址，不是内容。比较字符串内容必须用 `strcmp`。
:::

### strcat：连接字符串

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[20] = "Hello";
    strcat(s, " World");
    printf("%s\n", s);
    return 0;
}
```

输出：

```text
Hello World
```

同样要注意目标数组要有足够空间。

## scanf 读字符串的注意事项

用 `scanf` 读取字符串很方便，但也有坑：

```c
#include <stdio.h>

int main(void)
{
    char name[20];
    printf("请输入你的名字：");
    scanf("%s", name);
    printf("你好，%s\n", name);
    return 0;
}
```

注意 `name` 前面不需要加 `&`，因为数组名本身就是地址。

但 `scanf("%s", ...)` 遇到空格就会停止。如果输入 "Kingcq Lee"，它只会读到 "Kingcq"。要读取带空格的字符串，可以用 `fgets`：

```c
#include <stdio.h>

int main(void)
{
    char line[100];
    printf("请输入一行文字：");
    fgets(line, sizeof(line), stdin);
    printf("你输入了：%s", line);
    return 0;
}
```

### sprintf 与 sscanf：字符串中的格式化

`sprintf` 和 `sscanf` 与 `printf`、`scanf` 作用类似，但操作对象是字符串而不是控制台：

```c
#include <stdio.h>

int main() {
    // 把格式化的数据写入字符串
    char buffer[100];
    int age = 20;
    double score = 89.5;
    sprintf(buffer, "年龄：%d，成绩：%.1f", age, score);
    printf("%s\n", buffer);  // 年龄：20，成绩：89.5

    // 从字符串中解析数据
    char data[] = "42 3.14";
    int a;
    double b;
    sscanf(data, "%d %lf", &a, &b);
    printf("a = %d, b = %.2f\n", a, b);  // a = 42, b = 3.14

    return 0;
}
```

`sprintf` 在拼接字符串时特别有用，但要注意目标缓冲区必须足够大，否则会越界。更安全的替代是 `snprintf`，它可以指定最大写入长度。

## 字符数组越界问题

字符数组越界是 C 语言最容易出 bug 的地方之一。

```c
char s[5] = "Hello";  // 错误！需要 6 个字节
```

这个例子中，`"Hello"` 需要 6 个字节（5 个字母加 `\0`），但数组只有 5 个字节，`\0` 被写到了数组外面，可能破坏其他数据。

使用 `strcpy`、`strcat` 时尤其要留心目标数组的大小。如果把握不准，就用 `strncpy` 并手动补 `\0`。

## 常见错误与注意事项

1. **忘记给 `\0` 留位置**：声明数组时长度要比可见字符多 1。
2. **用 `==` 比较字符串**：应该使用 `strcmp`。
3. **`scanf` 读入带空格的字符串**：会截断，需要用 `fgets`。
4. **`strcpy`/`strcat` 越界**：确保目标数组足够大，或改用带长度限制的版本。
5. **修改字符串常量**：`char *s = "Hello"; s[0] = 'h';` 是未定义行为，可能崩溃。

## 小结与下一篇预告

今天我们学习了字符数组和字符串的关系、结束符 `\0` 的作用，以及 `<string.h>` 中几个最常用的函数。字符数组是 C 语言处理文本的基础，越界问题需要格外小心。

下一篇我们将进入**指针**的世界——指针是 C 语言最核心的概念之一，刚开始可能有点抽象，但理解之后会让你的编程能力上一个台阶。
