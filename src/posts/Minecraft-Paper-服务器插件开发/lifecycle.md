---
title: 2. 环境搭建与生命周期
date: 2025-05-28
icon: terminal
order: 2
category:
  - Minecraft Paper 服务器插件开发
tag:
  - Java
  - IntelliJ IDEA
  - 生命周期
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 搭建基石：环境配置与插件生命周期

在上一章中，我们了解了为什么 Paper 插件是服务器开发的最优解。现在，我们将撸起袖子，正式开始搭建开发环境，并编写你的第一个插件。

## 一、 开发环境准备：工欲善其事

要编写现代化的 Java 插件，需要的不是记事本，而是一套工业级的工具链。

### 1. 安装 IntelliJ IDEA
IntelliJ IDEA 是目前全球最流行的 Java 集成开发环境（IDE）。它对代码补全、错误检测和插件开发的支持远超 Eclipse。
*   **下载地址**：[JetBrains 官网](https://www.jetbrains.com/idea/)
*   **版本建议**：社区版（Community）完全够用，专业版（Ultimate）体验更佳。

### 2. 神器：Minecraft Development 插件
为了简化开发流程，我们必须在 IDEA 中安装 **Minecraft Development** 插件。它能帮你自动生成项目骨架、`plugin.yml` 文件以及处理依赖关系。
*   **安装步骤**：打开 IDEA -> Settings -> Plugins -> Marketplace -> 搜索 `Minecraft Development` -> 点击安装并重启。

### 3. Java SDK (JDK)
Paper 1.20.x+ 版本通常需要 **Java 17** 或更高版本（1.21 需要 **Java 21**）。建议通过 IDEA 的项目设置直接下载对应的 JDK 镜像。

---

## 二、 创建你的第一个插件项目

打开 IDEA，选择 **New Project**，在左侧列表中你会看到 **Minecraft** 选项。

### 1. 项目参数设置
*   **Platform**: 选择 **Paper**。
*   **Version**: 选择你想支持的 Minecraft 版本（建议选择最新稳定版）。
*   **Group ID**: 你的组织或个人标识（如 `me.kingcq`）。
*   **Artifact ID**: 插件的名字（如 `MyFirstPlugin`）。
*   **Build System**: 推荐使用 **gradle**，它更方便管理依赖。

::: tip 关于“魔法”
由于 Minecraft 的仓库（Repository）服务器大多在海外，如果你在加载依赖时卡住了，可能需要配置国内镜像源，或者开启全局加速代理，可以去看看 `ikuuu`。
:::

---

## 三、 插件的生命周期：从出生到谢幕

一个 Paper 插件并不是运行后就一直死板地呆在那。它像生物一样有自己的生命周期，由服务器主线程调用对应的钩子函数（Hooks）。

### 1. 核心类：JavaPlugin
所有的插件主类都必须继承 `org.bukkit.plugin.java.JavaPlugin`。这个类是你的插件与服务器沟通的桥梁。

### 2. 三大生命周期阶段

#### A. onLoad() —— 预加载
*   **执行时机**：插件被读取到内存，但尚未被完全加载。
*   **用途**：极少使用。通常用于在其他插件加载前初始化一些特殊的底层逻辑，或者设置全局 API。

#### B. onEnable() —— 启动执行
*   **执行时机**：插件正式启动。
*   **用途**：**最核心的阶段。** 在这里你需要完成：
    *   注册事件监听器（Listener）。
    *   注册命令处理器（Command）。
    *   初始化配置文件（Config）。
    *   建立数据库连接。

#### C. onDisable() —— 卸载清理
*   **执行时机**：服务器关闭或使用 `/reload` 命令卸载插件时。
*   **用途**：**安全退出的保障。** 在这里你需要完成：
    *   保存尚未写入磁盘的玩家数据。
    *   关闭打开的数据库连接。
    *   取消正在运行的异步任务（Tasks）。

---

## 四、 实战演练：在生命周期中留下足迹

让我们修改主类代码，让它在不同阶段向控制台输出信息。

```java
package me.kingcq.testplugin;

import org.bukkit.plugin.java.JavaPlugin;

public final class TestPlugin extends JavaPlugin {

    // 插件启动时调用
    @Override
    public void onEnable() {
        // 使用 getLogger() 可以输出带有插件前缀的日志
        getLogger().info("----------------------------------");
        getLogger().info("   TestPlugin 已成功启动！");
        getLogger().info("   作者: Kingcq");
        getLogger().info("----------------------------------");
    }

    // 插件卸载时调用
    @Override
    public void onDisable() {
        getLogger().warning("TestPlugin 正在关闭... 正在保存数据...");
        // 此处模拟保存数据逻辑
        savePluginData();
        getLogger().info("数据保存成功，插件已安全退出。");
    }

    private void savePluginData() {
        // 实际开发中这里会写保存逻辑
    }
}
```

### 为什么要注意 `onDisable`？
很多新手开发者会忽略 `onDisable`。想象一下：如果你的插件在内存里记录了玩家赚取的金币，但服务器突然关机或重载，而你没有在 `onDisable` 中写保存逻辑，那么这些金币数据就会随着内存的释放而烟消云散。**良好的清理习惯是区分“入门”与“专业”的分水岭。**

---

## 五、 编译与测试

在 IDEA 右侧的 Maven 面板中，双击 `lifecycle` -> `package`。编译完成后，在项目根目录的 `target` 文件夹下会生成一个 `.jar` 文件。

将这个文件放入 Paper 服务器的 `plugins` 文件夹，启动服务器。你会看到控制台跳出了你在 `onEnable` 中写的欢迎信息！

::: info 接下来
我们已经让插件“活”了过来，但它现在还是个“闷葫芦”，不会对外界做出任何反应。在下一章，我们将学习 **事件响应系统**，赋予插件感知世界的能力。
:::
