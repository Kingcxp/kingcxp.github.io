---
title: 二叉搜索树：让查找沿分支缩小范围
date: 2026-07-11
icon: magnifying-glass-chart
order: 43
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 二叉搜索树
  - 查找
  - 删除
author: Kingcq
---

二叉搜索树在普通二叉树上增加顺序不变量。对每个节点：

```text
左子树中的值 < 当前值 < 右子树中的值
```

如果允许重复值，还必须额外规定重复值放在哪边，或在节点里记录计数。

## 查找

```c
TreeNode *bst_find(TreeNode *root, int value)
{
    while (root != NULL) {
        if (value < root->value) {
            root = root->left;
        } else if (value > root->value) {
            root = root->right;
        } else {
            return root;
        }
    }
    return NULL;
}
```

每次比较排除一整棵子树。如果树比较平衡，查找约为 `O(log n)`；如果树退化成链表，则为 `O(n)`。

## 插入

使用二级指针可以统一处理“修改根”和“修改某个孩子指针”：

```c
int bst_insert(TreeNode **root, int value)
{
    while (*root != NULL) {
        if (value < (*root)->value) {
            root = &(*root)->left;
        } else if (value > (*root)->value) {
            root = &(*root)->right;
        } else {
            return 1; // 本实现忽略重复值
        }
    }

    *root = tree_node_create(value);
    return *root != NULL;
}
```

`root` 始终指向“当前需要检查或修改的那个节点指针”。最终到达空位置时，直接把新节点写进去。

## 中序遍历为何有序

节点左侧都更小，右侧都更大，因此：

```text
中序 = 左子树 → 当前节点 → 右子树
```

自然得到升序序列。这也可以用来检查搜索树不变量是否被破坏。

## 删除的三种情况

删除节点比插入复杂：

1. 没有孩子：直接释放并把父链接设为空；
2. 只有一个孩子：让父链接绕过当前节点，指向唯一孩子；
3. 有两个孩子：用中序后继或前驱替换，再删除那个最多只有一个孩子的节点。

## 删除实现

```c
int bst_remove(TreeNode **root, int value)
{
    while (*root != NULL && (*root)->value != value) {
        if (value < (*root)->value) {
            root = &(*root)->left;
        } else {
            root = &(*root)->right;
        }
    }

    if (*root == NULL) return 0;

    TreeNode *target = *root;

    if (target->left == NULL) {
        *root = target->right;
        free(target);
        return 1;
    }

    if (target->right == NULL) {
        *root = target->left;
        free(target);
        return 1;
    }

    TreeNode **successor_link = &target->right;
    while ((*successor_link)->left != NULL) {
        successor_link = &(*successor_link)->left;
    }

    TreeNode *successor = *successor_link;
    target->value = successor->value;
    *successor_link = successor->right;
    free(successor);
    return 1;
}
```

本例节点只保存一个整数，所以复制后继值很简单。如果节点拥有复杂资源，不能随意做浅复制，可能需要移动整个节点或定义明确的值复制函数。

## 验证搜索树不变量

只比较节点和直接孩子不够，因为右子树深处的某个值也可能小于根。可以向递归传递允许范围：

```c
#include <limits.h>
#include <stdbool.h>

bool bst_validate_range(const TreeNode *root,
                        long long low,
                        long long high)
{
    if (root == NULL) return true;
    if (root->value <= low || root->value >= high) return false;

    return bst_validate_range(root->left, low, root->value) &&
           bst_validate_range(root->right, root->value, high);
}

bool bst_validate(const TreeNode *root)
{
    return bst_validate_range(root, LLONG_MIN, LLONG_MAX);
}
```

使用更宽的边界类型，避免 `INT_MIN - 1` 之类的溢出技巧。

## 平衡为何重要

按升序依次插入：

```text
1, 2, 3, 4, 5
```

会得到：

```text
1
 \
  2
   \
    3
     \
      4
       \
        5
```

查找不再比链表好。AVL 树、红黑树等自平衡树会在插入删除后旋转，保持高度为 `O(log n)`。本教程不完整实现它们，但要知道标准库有序容器通常不会使用普通未平衡 BST。

## 何时使用

普通 BST 适合：

- 学习递归结构和有序不变量；
- 数据插入顺序较随机且规模有限；
- 需要按序遍历。

生产代码通常优先使用成熟容器，例如 C++ 的 `std::set`、`std::map`，或根据需求使用哈希表和排序数组。

搜索树支持按键查找，但获取当前最大或最小元素仍依赖树高。下一篇学习二叉堆，它只维护父子优先级，以更低约束换取高效的优先队列操作。
