---
title: 7. 配方系统与配置文件
date: 2025-05-28
icon: wrench
order: 7
category:
  - Minecraft Paper 服务器插件开发
tag:
  - 自定义配方
  - YAML
  - 配置文件
  - 逻辑持久化
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 规则重定义：配方系统与灵活的配置文件

一个优秀的插件不仅要有强大的功能，还要有极高的**灵活性**。本章我们将学习如何向服务器注入自定义合成配方，以及如何利用配置文件让腐竹（服务器管理员）在不修改代码的情况下调整插件参数。

## 一、 改变生存法则：配方系统 (Recipes)

在 Paper 中，我们可以动态地向游戏添加各种类型的配方。

### 1. 核心前提：命名空间键 (NamespacedKey)
在注册配方前，必须为其指定一个唯一的“身份证”。
```java
// 格式为 插件名:配方名，例如 "test_plugin:magic_saddle"
NamespacedKey key = new NamespacedKey(plugin, "magic_saddle");
```

### 2. 有序合成 (ShapedRecipe)
有序合成要求玩家必须在工作台中按照特定的阵型摆放物品。

```java
// 示例：用羽毛和铁锭合成“轻盈之靴”
ItemStack result = new ItemStack(Material.IRON_BOOTS);
// ... 此处可以给 result 添加 Meta 或 PDC 数据 ...

ShapedRecipe recipe = new ShapedRecipe(key, result);
// 定义形状：3x3 矩阵，空格代表留空
recipe.shape(
    "   ",
    "F F",
    "I I"
);
// 绑定符号对应的材质
recipe.setIngredient('F', Material.FEATHER);
recipe.setIngredient('I', Material.IRON_INGOT);

// 注册到服务器
Bukkit.addRecipe(recipe);
```

### 3. 实战示例：腐肉烧皮革 (FurnaceRecipe)
这是你示例仓库中的经典功能。熔炉配方非常直观：输入、输出、经验值、烧炼时间。

```java
public void registerSmeltingRecipe() {
    NamespacedKey key = new NamespacedKey(plugin, "flesh_to_leather");
    ItemStack leather = new ItemStack(Material.LEATHER);

    FurnaceRecipe recipe = new FurnaceRecipe(
        key,
        leather,            // 产物
        Material.ROTTEN_FLESH, // 原料
        0.5f,               // 给予 0.5 点经验值
        200                 // 烧炼时间（单位 Tick，200 = 10秒）
    );

    Bukkit.addRecipe(recipe);
}
```

---

## 二、 让插件“活”起来：配置文件 (YAML)

如果你在代码里写死 `rocket_speed = 0.5`，那么想修改速度时就必须重新编译插件。使用配置文件可以完美解决这个问题。

### 1. 默认配置文件
在 IDEA 项目的 `resources` 文件夹下创建 `config.yml`：
```yaml
# 火箭功能配置
rocket:
  speed: 0.8
  duration_seconds: 5
  message: "你起飞了！"

# 玩家初始数据
default_settings:
  enable_welcome: true
```

### 2. 加载与保存
在插件主类的 `onEnable` 中，一行代码即可初始化默认配置：
```java
@Override
public void onEnable() {
    // 如果插件文件夹里没有 config.yml，就从 jar 包里拷一个过去
    saveDefaultConfig();

    // 加载配置
    FileConfiguration config = getConfig();
    double speed = config.getDouble("rocket.speed");
    String msg = config.getString("rocket.message");
}
```

### 3. 性能陷阱：磁盘 I/O
读取文件是一项沉重的负担。**严禁在事件响应（如 `PlayerMoveEvent`）或 `BukkitRunnable` 循环中频繁调用 `getConfig()`。**

**正确做法：**
1. 在 `onEnable` 中将配置读取到内存变量中。
2. 创建一个 `/plugin reload` 命令，执行时重新读取文件并更新内存变量。

---

## 三、 实战：可配置的火箭效果

我们将之前的 `/rocket` 命令与配置文件结合起来：

```java
public void execute(CommandSourceStack source, String[] args) {
    // 从配置中动态读取参数
    FileConfiguration config = plugin.getConfig();
    double speed = config.getDouble("rocket.speed", 0.5); // 0.5 是找不到配置时的默认值
    int duration = config.getInt("rocket.duration_seconds", 5) * 20;

    new BukkitRunnable() {
        int count = 0;
        @Override
        public void run() {
            if (count >= duration) {
                this.cancel();
                return;
            }
            player.setVelocity(new Vector(0, speed, 0));
            count++;
        }
    }.runTaskTimer(plugin, 0L, 1L);
}
```

---

## 四、 进阶：配置文件的多级拆分

当插件变得巨大时，一个 `config.yml` 显然不够用。你可以手动加载其他文件：

```java
File customFile = new File(getDataFolder(), "messages.yml");
YamlConfiguration messageConfig = YamlConfiguration.loadConfiguration(customFile);

// 像使用普通配置一样获取数据
String welcome = messageConfig.getString("welcome_text");
```

---

## 五、 总结

1.  **配方系统**让自定义物品能够自然融入生存玩法，记得给配方取个唯一的 `NamespacedKey`。
2.  **YAML 配置文件**是插件的“遥控器”，通过 `saveDefaultConfig()` 和 `getConfig()` 实现灵活参数化。
3.  **数据隔离**：逻辑写在代码里，参数留在配置里。

::: info 接下来
现在我们已经搞定了物品、逻辑和配置。但是，如果我们要改变整个世界的样貌呢？比如生成一片全是岩浆的荒原，或者在海上自动生成玩家的出生点建筑。下一章，我们将挑战插件开发的巅峰之一——**世界生成 (World Generation)**。
:::
