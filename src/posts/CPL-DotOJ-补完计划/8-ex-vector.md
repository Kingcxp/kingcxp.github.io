---
title: 南哪 2022-8-pointer EX 动态数组
date: 2022-11-21
icon: face-grin-beam-sweat
order: 14
category:
  - CPL DotOJ 补完计划
tag:
  - CPL
  - DotOJ
author: Kingcq
---

这次我们介绍一个很方便但是在 C 语言当中依然用起来有些难度的东西——动态数组。

行向量 `vector`，在 `C++STL` 当中有它，但我们更习惯称它位动态数组，它的特点就是能够动态分配数组的内存，方便我们应对未知数据量的问题。

这么好用？不，它虽然优化了空间，但它也用掉了一部分的时间用来维护这个动态数组。不过总体上来说，这个动态数组还是很推荐学一学，用一用的。

（有些人特别钟爱用 `vector` 存图，时间常数大的起飞，我不说是谁（︶^︶））

接下来就大概的看一看实现的代码，相信加上注释和清晰的变量命名，你们应该能看懂。

这次依旧没有经过检查，所以直接抄代码请你谨慎。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 建立一个行向量结构体，里面存三个指针
struct Vector {
    // 指向数组开头
    int* begin;
    // 指向数组结尾
    int* end;
    // 指向内存结尾
    int* endOfStorage;
}vec;

// 初始化动态数组
void initialize() {
    vec.begin = vec.end = vec.endOfStorage = NULL;
}

// 删除这个动态数组，释放内存
void destroy() {
    free(vec.begin);
}

// 返回指向数组开头的指针
int* begin() {
    return vec.begin;
}

// 返回指向数组结尾的指针
int* end() {
    return vec.end;
}

// 返回当前数组大小
int size() {
    return vec.end - vec.begin;
}

// 返回当前数组容量
int capacity() {
    return vec.endOfStorage - vec.begin;
}

// 特别提醒，为了节约时间成本
// 每次扩容时会把容量多扩一些
// 因为每次扩容都需要重新申请一段内存，然后把原来的移过来
// 所以这里的容量和数组大小并不相同

// 将容量扩充至 n，如果当前容量不够需要重新申请内存
void reserve(int n)
{
    if (n > capacity())
    {
        int* tmp = malloc(n * sizeof(int));
        int sz = size();
        if (vec.begin)
        {
            for (int i = 0; i < sz; ++i)
                tmp[i] = vec.begin[i];
            free(vec.begin);
        }
        vec.begin = tmp;
        vec.end = vec.begin + sz;
        vec.endOfStorage = vec.begin + n;
    }
}

// 改变数组长度至 n，其中未定义的数组元素会被赋值成 val
void resize(int n, int val) {
    if (n > capacity())
        reserve(n);
    for (int i = size(); i < n; ++i)
        vec.begin[i] = val;
    vec.end = vec.begin + n;
}

// 在数组尾部添加一个元素，值为 val
void push_back(int val) {
    if (size() == capacity()) {
        int newcapacity = size() == 0 ? sizeof(int) : capacity() * 2;
        reserve(newcapacity);
    }
    *vec.end = val;
    ++vec.end;
}

void pop_back()// 在数组尾部删除一个元素
{
    if (size() > 0)
        --vec.end;
}

// 在数组的第 pos 位插入一个元素，值为val
void insert(int pos, int val) {
    if (vec.end == vec.endOfStorage)
        reserve(size() + 1);
    for (int i = size(); i > pos; --i)
        *(vec.begin + i) = *(vec.begin + i - 1);
    *(vec.begin + pos) = val;
    ++vec.end;
}

// 删除数组的第 pos 位元素
void erase(int pos) {
    for (int i = size(); i > pos; --i)
        *(vec.begin + i - 1) = *(vec.begin + i);
    --vec.end;
}

// 获取数组的第 pos 位元素
int get(int pos) {
    return *(vec.begin + pos);
}

int main(int argc, char *argv[]) {
    initialize();
    int x;
    scanf("%d", &x);
    push_back(x);
    push_back(x);
    pop_back();
    insert(0, 1);
    erase(0);
    destroy();
    return 0;
}
```

:::warning
在之后的 `C++ 高级程序设计` 课程作业中会出现这个数据结构！

我警告过你了！
:::

题单链接：

[南哪2022-8-pointer EX 动态数组 - 题单 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/training/253705)

这次还是没有题目做……
