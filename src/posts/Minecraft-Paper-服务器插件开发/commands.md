---
title: 5. 命令系统：与玩家直接对话
date: 2025-05-28
icon: keyboard
order: 5
category:
  - Minecraft Paper 服务器插件开发
tag:
  - 命令注册
  - BasicCommand
  - 自动补全
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 命令系统：赋予玩家“主动权”

在前几章中，我们通过事件监听器让插件能够“感知”世界，通过调度器让逻辑能够“持续”运行。但是，玩家如何主动告诉插件要做什么呢？这就需要用到 **命令系统 (Command System)**。

## 一、 两种时代的博弈：Bukkit vs Paper

在 Minecraft 插件开发史中，命令的注册方式经历了一次重大的进化。

### 1. 传统 Bukkit 方式（繁琐且僵硬）
在过去，你必须经历三个痛苦的步骤：
1.  **在 `plugin.yml` 中静态注册**：如果你漏写了一个指令，插件运行时会直接报错。
2.  **实现接口**：需要同时实现 `CommandExecutor` 和 `TabCompleter` 两个接口。
3.  **手动关联**：在代码中通过 `getCommand("name").setExecutor(...)` 进行关联。

### 2. 现代 Paper 方式：BasicCommand（优雅且灵活）
Paper 引入了 `BasicCommand` 接口，它将命令逻辑、补全提示、权限检查整合到了一个类中，且支持代码动态注册，不再强依赖于 `plugin.yml`。

---

## 二、 拆解 BasicCommand：四大核心方法

当你实现 `BasicCommand` 接口时，你可以重写以下几个关键方法：

```java
public class MyCommand implements BasicCommand {

    // 1. 执行逻辑（核心：必填）
    @Override
    public void execute(CommandSourceStack source, String[] args) {
        // source 包含了执行者（玩家或控制台）的信息
        source.getSender().sendMessage("你执行了命令！");
    }

    // 2. 自动补全（可选）
    @Override
    public Collection<String> suggest(CommandSourceStack source, String[] args) {
        // 当玩家按下 Tab 键时，返回的补全列表
        return List.of("sub1", "sub2", "help");
    }

    // 3. 权限判断（可选：返回布尔值）
    @Override
    public boolean canUse(CommandSender sender) {
        return sender.hasPermission("myplugin.use");
    }

    // 4. 指定权限名称（可选：更简洁的权限定义）
    @Override
    public String permission() {
        return "myplugin.use";
    }
}
```

---

## 三、 注册命令

在 `onEnable()` 中，你只需要一行代码即可完成注册：

```java
@Override
public void onEnable() {
    // 这里的 "rocket" 就是玩家输入的指令名（无需在 plugin.yml 注册）
    registerCommand("rocket", new RocketCommand());
}
```

::: info 进阶写法：Lambda 快速指令
对于逻辑非常简单的命令（如：`/hello`），你甚至不需要单独写一个类：
```java
registerCommand("hello", (source, args) -> {
    source.getSender().sendMessage(Component.text("你好，世界！", NamedTextColor.GREEN));
});
```
:::

---

## 四、 实战示例：/rocket 指令

让我们把上一章中“烈焰棒火箭”的逻辑封装进一个命令中。这样玩家不需要寻找烈焰棒，直接输入 `/rocket` 就能原地起飞。

```java
public class RocketCommand implements BasicCommand {

    private final JavaPlugin plugin;

    public RocketCommand(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void execute(CommandSourceStack source, String[] args) {
        CommandSender sender = source.getSender();

        // 1. 检查执行者是否为玩家
        if (!(sender instanceof Player player)) {
            sender.sendMessage(Component.text("该命令仅玩家可执行！", NamedTextColor.RED));
            return;
        }

        // 2. 触发火箭逻辑（复用上一章的定时任务）
        new BukkitRunnable() {
            int count = 0;
            @Override
            public void run() {
                if (count >= 100 || !player.isOnline()) {
                    this.cancel();
                    return;
                }
                player.setVelocity(new Vector(0, 0.5, 0));
                count++;
            }
        }.runTaskTimer(plugin, 0L, 1L);

        player.sendMessage(Component.text("指令火箭已启动！", NamedTextColor.AQUA));
    }

    @Override
    public String permission() {
        return "testplugin.command.rocket";
    }
}
```

---

## 五、 关于命令参数的处理 (Args)

命令后面的空格分隔符会被自动切分为 `args` 数组。
例如玩家输入：`/rocket set speed 2.0`
*   `args[0]` = "set"
*   `args[1]` = "speed"
*   `args[2]` = "2.0"

**注意：** 永远要检查数组长度（`args.length`），否则会触发 `ArrayIndexOutOfBoundsException` 导致插件报错。

---

## 六、 总结

通过本章的学习，你应该能够：
1.  理解为什么 Paper 的 `BasicCommand` 优于传统的注册方式。
2.  编写一个包含**执行逻辑**、**权限检查**和**自动补全**的完整命令类。
3.  利用 `CommandSourceStack` 灵活处理玩家与控制台的不同需求。

::: info 接下来
现在我们已经可以通过命令主动操作玩家了。但是，如果我们要给玩家发一些“牛逼的装备”，甚至是拥有自定义属性的“霜之哀伤”，该怎么办？下一章我们将深入探讨 **物品 (ItemStack) 与容器 (Inventory)** 的奥秘。
:::
