---
title: 测试、断言与 Sanitizer
date: 2026-07-07
icon: vial
order: 28
category:
  - C/C++ 语言与程序设计
tag:
  - C
  - 测试
  - assert
  - Sanitizer
author: Kingcq
---

调试是在错误暴露后寻找原因；测试是在代码变化时主动验证行为。两者都重要，但不能互相替代。

## 测试从需求开始

假设函数用于把整数限制到闭区间：

```c
int clamp(int value, int low, int high);
```

测试之前先写清契约：

- 前置条件：`low <= high`；
- 若 `value < low`，返回 `low`；
- 若 `value > high`，返回 `high`；
- 否则返回 `value`；
- 不修改任何外部状态。

测试只是把这些规则变成可重复执行的例子。

## 最小测试程序

```c
#include <assert.h>

int clamp(int value, int low, int high) {
    assert(low <= high);
    if (value < low) return low;
    if (value > high) return high;
    return value;
}

int main(void) {
    assert(clamp(5, 0, 10) == 5);
    assert(clamp(-1, 0, 10) == 0);
    assert(clamp(11, 0, 10) == 10);
    assert(clamp(0, 0, 10) == 0);
    assert(clamp(10, 0, 10) == 10);
    return 0;
}
```

测试通过时没有输出；某个断言失败时，程序会报告位置并终止。

## `assert` 不是用户输入验证

编译时定义 `NDEBUG` 后，`assert` 可以完全被移除：

```bash
gcc test.c -DNDEBUG -o test
```

因此下面的写法错误：

```c
assert(scanf("%d", &value) == 1); // 发布构建中可能根本不执行 scanf
```

`assert` 适合检查程序员应当维护的不变量，不适合处理文件损坏、网络失败或用户输错等正常运行时情况。

## 测试用例分类

每个函数至少考虑：

1. <span style="color: #409EFF;">正常值</span>：最常见输入；
2. <span style="color: #E6A23C;">边界值</span>：最小、最大、空、单元素；
3. <span style="color: #E6A23C;">边界两侧</span>：刚小于、刚大于；
4. <span style="color: #F56C6C;">无效输入</span>：不满足前置条件；
5. <span style="color: #409EFF;">重复和特殊结构</span>：全相同、已排序、逆序；
6. <span style="color: #409EFF;">规模变化</span>：小数据和较大数据。

例如二分查找应测试：

- 空数组；
- 单元素找到和找不到；
- 目标在首尾；
- 中间找到；
- 小于全部元素；
- 大于全部元素；
- 有重复元素时函数承诺返回哪一个。

## 表驱动测试

```c
#include <assert.h>
#include <stddef.h>

int clamp(int value, int low, int high) {
    assert(low <= high);
    if (value < low) return low;
    if (value > high) return high;
    return value;
}

typedef struct {
    int value;
    int low;
    int high;
    int expected;
} ClampCase;

int main(void) {
    const ClampCase cases[] = {
        {5, 0, 10, 5},
        {-1, 0, 10, 0},
        {11, 0, 10, 10},
        {0, 0, 10, 0},
        {10, 0, 10, 10},
    };

    for (size_t i = 0; i < sizeof(cases) / sizeof(cases[0]); ++i) {
        assert(clamp(cases[i].value, cases[i].low, cases[i].high)
               == cases[i].expected);
    }
    return 0;
}
```

当输入输出组合很多时，表驱动比复制多段相似测试更清楚。

## 测试数据结构的不变量

对链表，不只检查输出内容，还可以检查：

- `head == NULL` 是否与长度为 0 一致；
- 遍历节点数是否等于记录长度；
- 尾节点的 `next` 是否为空；
- 删除后剩余节点仍可达；
- 所有分配最终都被释放。

对循环队列，检查：

- `size <= capacity`；
- `front`、`rear` 始终在合法下标范围；
- 入队再出队保持顺序；
- 满和空状态不会混淆。

## 回归测试

每修复一个错误，都添加一个能够复现旧错误的测试。这样以后重构时，测试会阻止同一问题再次出现。

## AddressSanitizer 与 UndefinedBehaviorSanitizer

GCC 或 Clang 常用：

```bash
gcc demo.c -std=c11 -Wall -Wextra -Wpedantic \
    -fsanitize=address,undefined -fno-omit-frame-pointer -g -o demo
```

它们可以帮助发现：

- 越界访问；
- 释放后使用；
- 重复释放；
- 部分内存泄漏；
- 有符号溢出；
- 非法移位；
- 对齐错误等未定义行为。

Sanitizer 只能发现实际执行到的路径，因此仍需要好的测试输入。

## MemorySanitizer 与 Valgrind

<span style="color: #67C23A;">MemorySanitizer 主要检查未初始化读取，但通常要求 Clang 及配套运行库，并且最好让依赖也经过插桩。</span>Valgrind 在部分 Unix 平台上可用于内存检查，但速度较慢，平台支持也不同。

<span style="color: #F56C6C;">不要把“工具没有报告”理解成“程序已经证明正确”。</span>

## 静态分析

编译器警告、`clang-tidy`、`cppcheck` 等工具可以在不运行程序时发现可疑代码。它们适合补充测试，尤其能发现：

- 未使用值；
- 可疑条件；
- 资源路径不完整；
- 类型转换风险；
- C++ 中不必要复制或生命周期问题。

## 测试与实现分离

小项目可以这样组织：

```text
project/
├── include/math_utils.h
├── src/math_utils.c
├── src/main.c
└── tests/test_math_utils.c
```

分别构建：

```bash
gcc -Iinclude src/math_utils.c tests/test_math_utils.c -o test_math
gcc -Iinclude src/math_utils.c src/main.c -o app
```

测试程序拥有自己的 `main`，不与正式程序的 `main` 同时链接。

## 可测试性的设计

下面的函数很难测试：

```c
void calculate(void) {
    int a, b;
    scanf("%d%d", &a, &b);
    printf("%d\n", a + b);
}
```

把纯计算拆开后更容易验证：

```c
int add(int a, int b) {
    return a + b;
}
```

输入输出层负责解析与展示，核心函数只处理明确的数据。这样的结构也更容易复用。

## 一套最低测试流程

提交代码前：

1. 使用完整警告编译；
2. 运行正常、边界和无效输入；
3. 用 Sanitizer 再运行一次测试；
4. 检查错误路径是否释放资源；
5. 修复错误后添加回归测试；
6. 再以普通构建运行，避免只在插桩环境中测试。

后面的结构体和数据结构章节都会给出适合写测试的不变量。
