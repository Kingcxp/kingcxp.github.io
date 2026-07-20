---
title: 二叉树与前中后序遍历
date: 2026-07-11
icon: tree
order: 42
category:
  - C/C++ 语言与程序设计
tag:
  - 数据结构
  - 二叉树
  - 递归
  - 遍历
author: Kingcq
---

链表让每个节点指向下一个节点。二叉树让每个节点最多指向两个子节点，于是数据可以形成分支层次。

## 节点定义

```c
#include <stdlib.h>

typedef struct TreeNode {
    int value;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

TreeNode *tree_node_create(int value)
{
    TreeNode *node = malloc(sizeof(*node));
    if (node == NULL) return NULL;

    node->value = value;
    node->left = NULL;
    node->right = NULL;
    return node;
}
```

二叉树并不要求左边比右边小。那是二叉搜索树附加的顺序规则，下一篇再讲。

## 基本术语

```text
        1
       / \
      2   3
     / \
    4   5
```

- `1` 是根；
- `2` 和 `3` 是 `1` 的子节点；
- `4`、`5`、`3` 是叶节点；
- 节点 `2` 与其后代组成一棵子树；
- 深度通常指从根到节点的边数；
- 高度通常指节点到最深叶子的最长边数。

不同资料对“空树高度”和“单节点高度”可能采用不同约定，写算法前要先说明。

## 手动连接一棵树

```c
TreeNode *root = tree_node_create(1);
root->left = tree_node_create(2);
root->right = tree_node_create(3);
root->left->left = tree_node_create(4);
root->left->right = tree_node_create(5);
```

真实程序必须检查每次分配是否成功。教学示例省略检查时，要知道一旦某次返回空指针，后续解引用就会出错。

## 前序遍历

顺序：根、左、右。

```c
#include <stdio.h>

void preorder(const TreeNode *root)
{
    if (root == NULL) return;
    printf("%d ", root->value);
    preorder(root->left);
    preorder(root->right);
}
```

输出：`1 2 4 5 3`。

适合复制树、输出结构前缀表示等场景。

## 中序遍历

顺序：左、根、右。

```c
void inorder(const TreeNode *root)
{
    if (root == NULL) return;
    inorder(root->left);
    printf("%d ", root->value);
    inorder(root->right);
}
```

输出：`4 2 5 1 3`。对二叉搜索树，中序遍历会得到非递减序列。

## 后序遍历

顺序：左、右、根。

```c
void postorder(const TreeNode *root)
{
    if (root == NULL) return;
    postorder(root->left);
    postorder(root->right);
    printf("%d ", root->value);
}
```

输出：`4 5 2 3 1`。释放树时必须先释放子树，再释放当前节点，因此天然使用后序顺序。

## 释放整棵树

```c
void tree_destroy(TreeNode *root)
{
    if (root == NULL) return;
    tree_destroy(root->left);
    tree_destroy(root->right);
    free(root);
}
```

调用后，外部根指针仍保存旧地址。可以提供二级指针版本把它设为空，或要求调用者随后手动写 `root = NULL`。

## 统计节点与高度

```c
#include <stddef.h>

size_t tree_size(const TreeNode *root)
{
    if (root == NULL) return 0;
    return 1 + tree_size(root->left) + tree_size(root->right);
}

int tree_height(const TreeNode *root)
{
    if (root == NULL) return -1; // 约定空树高度为 -1

    int left = tree_height(root->left);
    int right = tree_height(root->right);
    return 1 + (left > right ? left : right);
}
```

这里单节点高度为 0。若你选择空树高度为 0，则单节点高度会是 1；两种约定都可以，但不能混用。

## 层序遍历

层序遍历使用队列：

```text
1
2 3
4 5
```

算法：

1. 根不为空则入队；
2. 队列不空时取出队首；
3. 访问节点；
4. 左右孩子非空则入队。

它正是 BFS 在树上的具体形式。队列容量可设为节点总数，或使用可增长队列。

## 递归深度风险

平衡树高度约为 `O(log n)`，递归通常很浅；极端退化树可能像链表一样高度为 `n`，递归遍历会消耗 `O(n)` 调用栈并可能栈溢出。

需要处理不可信大输入时，可以使用显式栈实现迭代遍历。

## 所有权必须明确

最简单的拥有关系是：

- 根指针拥有整棵树；
- 每个节点拥有左右子树；
- `tree_destroy(root)` 释放全部节点；
- 外部不得单独释放仍挂在树中的节点。

如果节点还保存父指针，父指针只是反向借用，不应递归释放父节点。

## 测试清单

- 空树遍历不访问内存；
- 单节点树；
- 只有左子树或只有右子树；
- 完全平衡树；
- 深度很大的退化树；
- `tree_size` 与实际分配节点数一致；
- 后序释放后 Sanitizer 不报告泄漏。

普通二叉树只规定形状，没有规定值的顺序。下一篇加入搜索树不变量，观察有序关系如何缩小查找范围。
