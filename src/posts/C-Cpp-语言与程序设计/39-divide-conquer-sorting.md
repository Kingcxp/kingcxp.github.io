---
title: 分治排序：归并排序与快速排序
date: 2026-07-10
icon: code-merge
order: 39
category:
  - C/C++ 语言与程序设计
tag:
  - 排序
  - 归并排序
  - 快速排序
  - 分治
author: Kingcq
---

冒泡、选择和插入排序最坏通常需要 `O(n²)` 时间。数据量增大后，需要更高效的策略。归并排序和快速排序都使用分治思想：把大问题拆成小问题，解决后再组合。

## 分治的三步

1. **分解**：把规模为 `n` 的问题拆成较小子问题；
2. **解决**：递归处理子问题；
3. **合并**：把子问题结果组成原问题结果。

递归不等于分治，但分治算法经常用递归表达。

## 归并排序

归并排序把数组一分为二，分别排序，再合并两个有序区间。

```text
[7 2 6 3 5 1 4 8]
        ↓ 分开
[7 2 6 3] [5 1 4 8]
        ↓ 继续
[7 2] [6 3] [5 1] [4 8]
        ↓ 排序并合并
[2 7] [3 6] [1 5] [4 8]
        ↓
[2 3 6 7] [1 4 5 8]
        ↓
[1 2 3 4 5 6 7 8]
```

## 合并两个有序区间

```c
#include <stddef.h>

void merge(int a[], int temp[], size_t left, size_t mid, size_t right)
{
    size_t i = left;
    size_t j = mid;
    size_t out = left;

    while (i < mid && j < right) {
        if (a[i] <= a[j]) {
            temp[out++] = a[i++];
        } else {
            temp[out++] = a[j++];
        }
    }

    while (i < mid) temp[out++] = a[i++];
    while (j < right) temp[out++] = a[j++];

    for (size_t k = left; k < right; ++k) {
        a[k] = temp[k];
    }
}
```

这里使用半开区间 `[left, right)`。左半是 `[left, mid)`，右半是 `[mid, right)`，长度计算和空区间都更自然。

## 完整归并排序

```c
#include <stdint.h>
#include <stdlib.h>

void merge_sort_range(int a[], int temp[], size_t left, size_t right)
{
    if (right - left <= 1) return;

    size_t mid = left + (right - left) / 2;
    merge_sort_range(a, temp, left, mid);
    merge_sort_range(a, temp, mid, right);
    merge(a, temp, left, mid, right);
}

int merge_sort(int a[], size_t count)
{
    if (count < 2) return 1;
    if (count > SIZE_MAX / sizeof(a[0])) return 0;

    int *temp = malloc(count * sizeof(a[0]));
    if (temp == NULL) return 0;

    merge_sort_range(a, temp, 0, count);
    free(temp);
    return 1;
}
```

### 复杂度

- 每一层合并总共处理 `n` 个元素；
- 递归深度约为 `log n`；
- 时间复杂度稳定为 `O(n log n)`；
- 额外数组占 `O(n)` 空间；
- 上面的实现是稳定排序，因为相等时优先取左侧元素。

## 快速排序

快速排序选择一个基准值，把较小元素放到左边，较大元素放到右边，再递归处理两部分。

关键操作叫**划分**。

## Lomuto 划分示例

```c
#include <stddef.h>

static void swap_int(int *a, int *b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

size_t partition(int a[], size_t left, size_t right)
{
    int pivot = a[right - 1];
    size_t boundary = left;

    for (size_t i = left; i + 1 < right; ++i) {
        if (a[i] < pivot) {
            swap_int(&a[i], &a[boundary]);
            ++boundary;
        }
    }

    swap_int(&a[boundary], &a[right - 1]);
    return boundary;
}
```

返回后：

```text
[left, pivot_index) < pivot
pivot_index          == pivot
(pivot_index, right) >= pivot
```

## 避免无符号下标下溢

直接递归 `[left, pivot)` 和 `[pivot+1, right)`：

```c
void quick_sort_range(int a[], size_t left, size_t right)
{
    while (right - left > 1) {
        size_t pivot = partition(a, left, right);

        /* 先递归较小的一边，较大一边用循环处理，限制栈深度 */
        if (pivot - left < right - (pivot + 1)) {
            quick_sort_range(a, left, pivot);
            left = pivot + 1;
        } else {
            quick_sort_range(a, pivot + 1, right);
            right = pivot;
        }
    }
}

void quick_sort(int a[], size_t count)
{
    quick_sort_range(a, 0, count);
}
```

半开区间避免了 `pivot - 1` 在 `pivot == 0` 时下溢。

## 快速排序的复杂度

- 平均时间：`O(n log n)`；
- 最坏时间：`O(n²)`；
- 原地划分只需少量额外空间，但递归仍消耗调用栈；
- 通常不稳定。

如果每次选到最小或最大元素，划分会极不平衡。常见改进包括随机基准、三数取中、三路划分和小区间改用插入排序。

## 为什么标准库排序通常更复杂

实际库实现需要处理：

- 小数组常数开销；
- 重复元素；
- 最坏情况保证；
- 缓存局部性；
- 用户比较函数；
- 异常和移动语义。

C++ 的 `std::sort` 常采用 introsort 思想，在快速排序退化时转向堆排序，并对小区间使用插入排序。学习基础算法的目的不是替代标准库，而是理解复杂度和实现权衡。

## 怎样选择

| 场景 | 更适合 |
| :-- | :-- |
| 需要稳定排序 | 归并排序 |
| 内存非常紧张、平均性能重要 | 快速排序或库排序 |
| 链表排序 | 归并排序常更自然 |
| 数据很少或接近有序 | 插入排序可能很好 |
| 生产 C++ 代码 | 优先 `std::sort` / `std::stable_sort` |

## 测试排序

至少检查：

- 空数组和单元素；
- 已排序、逆序；
- 全部相同；
- 大量重复；
- 含负数；
- 与可信实现结果比较；
- 排序后每个相邻元素满足 `a[i-1] <= a[i]`；
- 元素总数和多重集合没有变化。

有序数据不仅便于展示，还能支持更快查找。下一篇比较顺序查找和二分查找，并继续训练半开区间与边界不变量。
