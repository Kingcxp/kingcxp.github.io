---
title: 哈希表：从键快速找到值
date: 2026-07-12
icon: table-cells
order: 45
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 哈希表
  - 散列
  - 冲突
author: Kingcq
---

数组通过整数下标 `O(1)` 访问，但现实中的键往往是姓名、字符串或其他离散值。哈希表通过哈希函数把键映射到桶下标，在平均情况下实现接近 `O(1)` 的插入、查找和删除。

## 哈希函数

哈希函数把任意长度的键转换为整数哈希值：

```c
#include <stddef.h>
#include <stdint.h>

uint64_t hash_string(const char *text)
{
    uint64_t hash = UINT64_C(14695981039346656037);
    while (*text != '\0') {
        hash ^= (unsigned char)*text++;
        hash *= UINT64_C(1099511628211);
    }
    return hash;
}
```

好的通用哈希函数希望：

- 相同键总得到相同值；
- 键的小变化能较充分影响结果；
- 结果在桶中尽量均匀；
- 计算成本可接受。

它不是加密哈希。面对攻击者可控输入时，还要考虑哈希洪泛攻击。

## 冲突无法避免

桶数量有限，键空间通常无限，因此不同键必然可能映射到同一桶。哈希表必须设计冲突处理策略。

常见方法：

- 链地址法：每个桶保存链表或动态数组；
- 开放寻址：冲突后继续探测其他槽位。

本篇使用链地址法。

## 节点和表

```c
#include <stddef.h>

typedef struct HashNode {
    char *key;
    int value;
    struct HashNode *next;
} HashNode;

typedef struct {
    HashNode **buckets;
    size_t bucket_count;
    size_t size;
} HashTable;
```

`buckets` 是一个“指针数组”：每个元素指向该桶链表的首节点。

## 创建表

```c
#include <stdlib.h>

int hash_table_init(HashTable *table, size_t bucket_count)
{
    if (bucket_count == 0) return 0;

    table->buckets = calloc(bucket_count, sizeof(table->buckets[0]));
    if (table->buckets == NULL) return 0;

    table->bucket_count = bucket_count;
    table->size = 0;
    return 1;
}
```

`calloc` 把所有桶指针初始化为空。

## 复制键

表若要拥有键字符串，必须复制：

```c
#include <string.h>

char *duplicate_string(const char *text)
{
    size_t length = strlen(text);
    char *copy = malloc(length + 1);
    if (copy == NULL) return NULL;
    memcpy(copy, text, length + 1);
    return copy;
}
```

如果只保存调用者的指针，就必须保证调用者字符串在表的整个使用期间都有效。拥有副本通常更容易维护。

## 查找

```c
HashNode *hash_table_find_node(HashTable *table, const char *key)
{
    size_t index = (size_t)(hash_string(key) % table->bucket_count);

    for (HashNode *node = table->buckets[index];
         node != NULL;
         node = node->next) {
        if (strcmp(node->key, key) == 0) return node;
    }
    return NULL;
}
```

哈希值相同不代表键相同，最终仍必须用 `strcmp` 验证。

## 插入或更新

```c
int hash_table_set(HashTable *table, const char *key, int value)
{
    HashNode *existing = hash_table_find_node(table, key);
    if (existing != NULL) {
        existing->value = value;
        return 1;
    }

    size_t index = (size_t)(hash_string(key) % table->bucket_count);
    HashNode *node = malloc(sizeof(*node));
    if (node == NULL) return 0;

    node->key = duplicate_string(key);
    if (node->key == NULL) {
        free(node);
        return 0;
    }

    node->value = value;
    node->next = table->buckets[index];
    table->buckets[index] = node;
    ++table->size;
    return 1;
}
```

## 删除

二级指针可以统一删除桶首和中间节点：

```c
int hash_table_remove(HashTable *table, const char *key)
{
    size_t index = (size_t)(hash_string(key) % table->bucket_count);
    HashNode **link = &table->buckets[index];

    while (*link != NULL) {
        if (strcmp((*link)->key, key) == 0) {
            HashNode *removed = *link;
            *link = removed->next;
            free(removed->key);
            free(removed);
            --table->size;
            return 1;
        }
        link = &(*link)->next;
    }
    return 0;
}
```

## 负载因子与扩容

负载因子：

```text
load_factor = size / bucket_count
```

链地址法允许负载因子大于 1，但链越长，查找越慢。常见做法是在超过某个阈值时增加桶数量并**重新散列**所有节点。

不能只 `realloc` 桶数组，因为桶下标取决于 `% bucket_count`。桶数量变化后，每个键都要重新计算位置。

## 销毁

```c
void hash_table_destroy(HashTable *table)
{
    for (size_t i = 0; i < table->bucket_count; ++i) {
        HashNode *node = table->buckets[i];
        while (node != NULL) {
            HashNode *next = node->next;
            free(node->key);
            free(node);
            node = next;
        }
    }

    free(table->buckets);
    table->buckets = NULL;
    table->bucket_count = 0;
    table->size = 0;
}
```

## 复杂度不是无条件 `O(1)`

| 情况 | 查找复杂度 |
| :-- | :-- |
| 哈希分布良好、负载受控 | 平均接近 `O(1)` |
| 大量冲突 | 可能退化为 `O(n)` |
| 恶意构造输入 | 若无防护可能持续退化 |

因此，哈希函数、负载因子、扩容策略和输入模型都属于性能保证的一部分。

## 哈希表与树的选择

哈希表：

- 平均查找快；
- 不自然保留有序性；
- 需要哈希与相等比较。

平衡搜索树：

- 查找 `O(log n)`；
- 按键有序；
- 支持范围查询和有序遍历。

“哪个更快”没有脱离操作需求和数据分布的统一答案。

树、堆和哈希表都对关系施加了特定约束。下一篇进入更一般的图结构，学习邻接矩阵、邻接表和边数组怎样表达任意连接。
