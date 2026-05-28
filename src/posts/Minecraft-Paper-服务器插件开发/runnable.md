---
title: 4. 世界的脉搏：BukkitRunnable
date: 2025-05-28
icon: clock
order: 4
category:
  - Minecraft Paper 服务器插件开发
tag:
  - BukkitRunnable
  - 调度器
  - 异步处理
  - 游戏刻
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 世界的脉搏：掌控时间的 BukkitRunnable

在上一章中，我们学习了如何通过事件（Event）来响应瞬间发生的动作。然而，在实际开发中，我们经常会遇到需要“持续一段时间”或者“延迟执行”的需求。例如：
*   玩家喝下药水后，每秒恢复一次生命值。
*   投掷一个火球，并在 3 秒后产生爆炸。
*   制作一个华丽的粒子特效动画。

要实现这些功能，我们需要深入理解 Minecraft 的时间单位——**Tick (游戏刻)**。

## 一、 理解 Tick：世界的“心跳”

Minecraft 的服务器核心是一个巨大的循环。在理想状态下，服务器每秒钟会跳动 **20 次**，每一次跳动被称为一个 **Tick**。

*   **1 Tick = 50 毫秒 (0.05 秒)**。
*   在每一个 Tick 中，服务器会处理：玩家数据包、AI 逻辑、方块更新、插件任务以及事件广播。

::: danger 性能陷阱：主线程阻塞
Minecraft 的绝大多数逻辑运行在**单线程**上。如果在代码中写下 `Thread.sleep(1000)`，服务器主线程会直接停摆 1 秒钟。对于玩家来说，表现就是瞬间的卡顿和 TPS（Ticks Per Second）骤降。
:::

---

## 二、 BukkitRunnable：优雅的计时方案

为了在不阻塞主线程的前提下处理跨越 Tick 的逻辑，Paper 提供了 `BukkitRunnable` 调度器。它允许我们将逻辑分配到未来的某个时间点执行。

### 1. 核心运行方法
`BukkitRunnable` 提供了三种最常用的执行方式：

| 方法 | 描述 |
| :--- | :--- |
| `runTask(Plugin)` | 在**下一个 Tick** 立即执行。 |
| `runTaskLater(Plugin, long delay)` | 在指定的 **delay** 个 Tick 后执行一次。 |
| `runTaskTimer(Plugin, long delay, long period)` | 延迟执行后，每隔 **period** 个 Tick 重复执行。 |

---

## 三、 实战示例：烈焰棒火箭

核心逻辑：**当玩家右键使用烈焰棒时，会在 5 秒内持续向上冲刺。**

### 1. 逻辑分析
由于“持续向上冲刺”是一个跨越 100 个 Tick（5 秒 × 20 Tick）的过程，我们必须使用 `runTaskTimer`。同时，我们需要在任务内部记录执行了多少次，到达上限后自行停止。

### 2. 代码实现
```java
// 监听右键点击事件
@EventHandler
public void onUseRocket(PlayerInteractEvent event) {
    Player player = event.getPlayer();

    // 检查是否右键点击且手持烈焰棒
    if (event.getAction().isRightClick() && event.getMaterial() == Material.BLAZE_ROD) {

        // 创建一个匿名内部类
        new BukkitRunnable() {
            int elapsedTicks = 0; // 记录运行了多少次

            @Override
            public void run() {
                // 1. 检查停止条件：如果已经运行了 100 次 (5秒) 或者玩家离线
                if (elapsedTicks >= 100 || !player.isOnline()) {
                    player.sendMessage(Component.text("火箭燃料已耗尽！", NamedTextColor.RED));
                    this.cancel(); // 核心方法：取消定时任务
                    return;
                }

                // 2. 执行逻辑：每 tick 给予向上的速度
                player.setVelocity(new Vector(0, 0.5, 0));

                // 3. 视觉点缀：在玩家脚下生成一些火焰粒子
                player.getWorld().spawnParticle(Particle.FLAME, player.getLocation(), 5, 0.1, 0.1, 0.1, 0.02);

                elapsedTicks++;
            }
        }.runTaskTimer(plugin, 0L, 1L); // 0延迟开始，每 1 tick 执行一次

        player.sendMessage(Component.text("火箭启动！", NamedTextColor.GOLD));
    }
}
```

---

## 四、 进阶：如何安全地停止任务？

在 `BukkitRunnable` 内部，可以随时调用 `this.cancel()`。这不仅会停止逻辑的继续执行，还会将任务从服务器的调度队列中移除。

常见的停止逻辑包括：
*   **计数器到期**：如上面的火箭示例。
*   **玩家行为改变**：例如玩家脚着地了，则停止飞行任务。
*   **插件卸载**：在 `onDisable()` 中，建议手动取消所有正在运行的任务，防止内存泄漏。

---

## 五、 同步与异步 (Sync vs Async)

`BukkitRunnable` 还提供了 `runTaskAsynchronously` 等异步方法。

*   **同步任务 (Sync)**：在主线程运行。可以安全地调用几乎所有 Bukkit API（如修改方块、玩家瞬移）。
*   **异步任务 (Async)**：在独立线程运行。**严禁在异步线程调用非线程安全的 Bukkit API**。它通常用于耗时的操作，如：
    *   读取/保存数据库。
    *   发起网络请求（HTTP）。
    *   复杂的数学计算（不涉及修改游戏世界）。

::: tip 开发者建议
如果不确定一个 API 是否线程安全，那就始终使用同步任务。宁可让服务器稍微慢一点，也不要让它因为并发修改而直接崩溃报错。
:::

---

## 六、 总结

通过 `BukkitRunnable`，我们把插件的生命维度从“瞬间”扩展到了“过程”。
1.  **Tick 是核心**：记住 20 TPS 的频率。
2.  **避免阻塞**：永远不要在主线程使用 `Thread.sleep`。
3.  **状态存储**：在 `BukkitRunnable` 子类中定义变量，可以实现复杂的、带阶段性的游戏逻辑。

::: info 接下来
现在我们已经掌握了事件（感知）和调度器（过程）。但是，如何让玩家通过键盘输入来主动触发功能呢？下一章我们将探讨 **命令系统 (Commands)**，学习如何为的插件编写交互接口。
:::
