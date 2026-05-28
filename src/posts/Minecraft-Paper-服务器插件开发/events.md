---
title: 3. 监听万物：事件响应系统
date: 2025-05-28
icon: bolt
order: 3
category:
  - Minecraft Paper 服务器插件开发
tag:
  - 事件监听
  - EventHandler
  - 动态注册
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 监听万物：让插件拥有“感知”

在上一章中，我们让插件成功在服务器中运行了。但现在的它就像一个没有感官的躯壳。要让插件变得“聪明”，我们需要引入 Minecraft 插件开发的核心机制——**事件系统 (Event System)**。

## 一、 什么是事件？（观察者模式）

想象一下，如果我们要实现“玩家砍树时掉落金子”，我们该怎么做？
*   **错误做法**：写一个无限循环，不停地检查服务器里成千上万个方块是否被破坏。这会瞬间卡死服务器。
*   **正确做法（观察者模式）**：当“方块被破坏”这一动作发生时，服务器会大喊一声：“嘿！有人破坏了方块！”。如果插件正在“听”这个消息，它就会立即执行对应的逻辑。

在 Paper/Bukkit 中，这种“喊声”被称为 **Event（事件）**，而插件就是 **Listener（监听者）**。

---

## 二、 基础：如何编写一个监听器

编写监听器需要遵循三个核心步骤：

### 1. 实现 Listener 接口
类必须实现 `org.bukkit.event.Listener`。这只是一个标记接口，不需要实现任何方法，但它告诉服务器：“这个类里藏着监听器”。

### 2. 使用 @EventHandler 注解
在处理事件的方法上添加该注解，并指定事件类型。

### 3. 注册监听器
在 `onEnable()` 中完成注册，否则服务器不会把消息发给类。

---

## 三、 实战示例：史莱姆块的守护

**当玩家手持史莱姆块时，被攻击会免伤并弹飞攻击者。**

```java
public class SlimeShieldEvent implements Listener {
    @EventHandler
    public void onPlayerHit(EntityDamageByEntityEvent event) {
        // 如果不是玩家被攻击，直接返回
        if (!(event.getEntity() instanceof Player victim)) {
            return;
        }
        Entity entity = event.getDamager();
        ItemStack item = victim.getInventory().getItemInMainHand();

        // 如果玩家手持史莱姆块
        if (item.getType().equals(Material.SLIME_BLOCK)) {
            // 取消原本的攻击事件
            event.setCancelled(true);

            // 播放声音
            victim.playSound(victim.getLocation(), Sound.BLOCK_SLIME_BLOCK_BREAK, 1f, 1.2f);

            // 消耗史莱姆块
            if (item.getAmount() == 1) {
                victim.getInventory().setItemInMainHand(null);
            } else {
                item.setAmount(item.getAmount() - 1);
            }

            // 弹飞攻击者，速度单位是 格/tick
            Vector direction = entity.getLocation().getDirection();
            direction.multiply(-1);
            direction.normalize();
            direction.multiply(15);
            entity.setVelocity(direction);
        }
    }
}
```

### 关键概念：setCancelled(true)
许多事件实现了 `Cancellable` 接口。调用 `setCancelled(true)` 就像按下停止键，告诉服务器：“不要执行这个原本要发生的动作”（比如不要扣血、不要破坏方块）。

---

## 四、 进阶：事件优先级与忽略已取消

`@EventHandler` 注解里其实大有乾坤：

```java
@EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
```

1.  **EventPriority (优先级)**：分为从 `LOWEST` 到 `MONITOR` 六个等级。
    *   `LOWEST` 最先执行，`HIGHEST` 最后执行（拥有最终决定权）。
    *   `MONITOR` 只能看，不能改，用于记录日志。
2.  **ignoreCancelled**：如果设置为 `true`，当别的插件已经取消了这个事件时，方法就不会被触发。

---

## 五、 高阶技巧：动态注册与卸载

举个例子：**铁剑右键获得 3 次抵消伤害的机会。**

这种“状态”类的功能，如果一直开着监听器会造成性能浪费。我们可以利用 **动态注册**，只在玩家激活技能时才启动监听，次数用完后立即注销。

### 1. 动态注销的秘密武器：HandlerList
每个事件类都有一个静态的 `getHandlerList()` 方法，或者可以直接使用 `HandlerList.unregisterAll(listener)`。

### 2. 实战代码逻辑

先定义特定玩家受击时触发的格挡事件：

```java
public class SwordBlockEvent implements Listener {
    Player player = null;

    SwordBlockEvent(Player player) {
        this.player = player;
    }

    @EventHandler
    public void onBlock(EntityDamageByEntityEvent event) {
        if (!(event.getEntity() instanceof Player victim)) {
            return;
        }
        if (!victim.equals(player)) {
            return;
        }
        victim.setLevel(victim.getLevel() - 1);
        victim.playSound(victim.getLocation(), Sound.BLOCK_ANVIL_PLACE, 1f, 2f);
        event.setCancelled(true);
        if (victim.getLevel() == 0) {
            HandlerList.unregisterAll(this);
        }
    }
}
```

然后，注册从铁剑中获取格挡的事件（在这里，我们暂时使用经验等级来记录格挡次数），注意要为对应的玩家注册格挡事件：

```java
public class GainBlockEvent implements Listener {
    @EventHandler
    public void onGainBlock(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        ItemStack item = player.getInventory().getItemInMainHand();
        if (
            !event.getAction().equals(Action.RIGHT_CLICK_AIR)
            && !event.getAction().equals(Action.RIGHT_CLICK_BLOCK)
        ) {
            return;
        }
        if (!item.getType().equals(Material.IRON_SWORD) || player.getLevel() == 3) {
            return;
        }
        player.playSound(player.getLocation(), Sound.BLOCK_ANVIL_BREAK, 1f, 2f);
        player.setLevel(3);
        PluginManager manager = Bukkit.getPluginManager();
        manager.registerEvents(new SwordBlockEvent(player), TestPlugin.plugin);
    }
}
```

---

## 六、 总结

事件系统是插件与世界交互的“触角”。通过本章，你应该掌握了：
1.  如何通过三个步骤建立基本的事件监听。
2.  利用 `setCancelled` 拦截原版行为。
3.  通过 `HandlerList` 实现精准的动态监听控制，这对于开发高性能的 RPG 插件至关重要。

::: info 接下来
虽然事件能让我们响应瞬间的动作，但如果我们要实现一个“持续 10 秒的飞行过程”呢？下一章，我们将学习 **BukkitRunnable**，掌握时间的掌控权。
:::
