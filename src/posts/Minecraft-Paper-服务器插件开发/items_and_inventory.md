---
title: 6. 物品、容器与数据持久化
date: 2025-05-28
icon: box
order: 6
category:
  - Minecraft Paper 服务器插件开发
tag:
  - ItemStack
  - ItemMeta
  - PDC
  - GUI
---

:::warning
本文档内容大部分由 ai 基于 [讲座 PPT](https://github.com/Kingcxp/paper-plugin-tutorial) 生成，讲座对应的示例代码在 [这里](https://github.com/Kingcxp/paper-plugin-tutorial-examples)。
:::

# 物品与容器：打造你的专属神兵与交互界面

在 Minecraft 中，物品（Item）是玩家与世界交互最直接的媒介。无论是砍树的斧头，还是开启副本的钥匙，本质上都是数据。本章将带你深入了解如何操纵这些数据，并利用容器（Inventory）制作精美的交互菜单。

## 一、 物品的构造：身体与灵魂

在 Paper API 中，一个物品被拆分为两个核心部分：

1.  **ItemStack（身体）**：决定了物品的物理属性，比如它是“石头”还是“钻石剑”，以及它有多少个（Amount）。
2.  **ItemMeta（灵魂）**：决定了物品的个性化属性，比如它的名字、描述（Lore）、附魔、以及是否发光。

::: danger 核心铁律：注入与提取
修改物品属性时，你必须遵循以下三步，否则修改将不会生效：
1.  **提取**：`ItemMeta meta = item.getItemMeta();`
2.  **修改**：`meta.displayName(...);`
3.  **注入**：`item.setItemMeta(meta);`（这一步最容易被新手忽略！）
:::

---

## 二、 赋予物品超能力：属性与组件

除了改名，我们还能赋予物品更强大的能力。

### 1. 属性词条 (AttributeModifiers)
想让一把铲子拥有 +100 攻击力，且只有握在主手时生效？
```java
meta.addAttributeModifier(
    Attribute.ATTACK_DAMAGE,
    new AttributeModifier(
        new NamespacedKey(plugin, "op_damage"),
        100.0,
        AttributeModifier.Operation.ADD_NUMBER,
        EquipmentSlotGroup.MAINHAND
    )
);
```

### 2. 趣味数据组件 (Data Components - 1.21+)
在最新的版本中，你可以让非食物物品变得可以食用，甚至改变堆叠上限：
```java
// 让铁镐可以被吃掉！
item.setData(
    DataComponentTypes.CONSUMABLE,
    Consumable.consumable().consumeSeconds(1.6f).build()
);
item.setData(
    DataComponentTypes.FOOD,
    FoodProperties.food().canAlwaysEat(true).nutrition(100).saturation(100).build()
);
// 突破 64 堆叠限制（最高可设为 99）
meta.setMaxStackSize(99);
```

---

## 三、 持久化数据容器 (PDC)：真正的“暗号”

**痛点**：如果你做了一个“传送符咒”，你是靠判断名字叫“传送符咒”来触发逻辑吗？
**风险**：玩家可以在铁砧上把普通纸改名为“传送符咒”来骗过你的插件！

**解法**：使用 **PersistentDataContainer (PDC)**。它允许你在物品中隐藏玩家看不见的键值对，且这些数据会随物品保存到存档中。

```java
NamespacedKey key = new NamespacedKey(plugin, "item_type");
// 存入数据
meta.editPersistentDataContainer(container -> container.set(key, PersistentDataType.STRING, "teleport_scroll"));

// 读取数据
String type = meta.getPersistentDataContainer().get(key, PersistentDataType.STRING);
if ("teleport_scroll".equals(type)) { /* 触发传送逻辑 */ }
```

---

## 四、 实战示例：5 次使用的治疗药水

核心逻辑：**创建一个水瓶，喝下后恢复生命，且一共能喝 5 次。**

```java
// 1. 通过命令获得物品
public class GetHealthPotion implements BasicCommand {

    public static NamespacedKey usesLeft = new NamespacedKey("test_plugin", "health_potion_uses_left");
    public static NamespacedKey maxUses = new NamespacedKey("test_plugin", "health_potion_max_uses");

    @Override
    public void execute(CommandSourceStack commandSourceStack, String[] args) {
        CommandSender sender = commandSourceStack.getSender();
        if (!(sender instanceof Player player)) {
            return;
        }
        ItemStack potion = new ItemStack(Material.HONEY_BOTTLE);
        potion.editPersistentDataContainer(container -> {
            container.set(
                    usesLeft,
                    PersistentDataType.INTEGER,
                    5
            );
            container.set(
                    maxUses,
                    PersistentDataType.INTEGER,
                    5
            );
        });
        ItemMeta meta = potion.getItemMeta();
        meta.displayName(Component.text("Health Potion", NamedTextColor.GREEN));
        meta.lore(List.of(
                Component.text("A simple health potion", NamedTextColor.LIGHT_PURPLE),
                Component.text("Uses left : 5 / 5")
        ));
        potion.setItemMeta(meta);
        player.getInventory().addItem(potion);
    }
}

// 2. 监听消耗事件
public class DrinkHealthPotion implements Listener {

    @EventHandler
    public void onHealthPotionDrink(PlayerItemConsumeEvent event) {
        Player player = event.getPlayer();
        ItemStack item = event.getItem();
        if (!item.getType().equals(Material.HONEY_BOTTLE)) {
            return;
        }
        player.heal(6d);
        if (item.getPersistentDataContainer().get(GetHealthPotion.maxUses, PersistentDataType.INTEGER) != null) {
            int maxUses = item.getPersistentDataContainer().get(
                    GetHealthPotion.maxUses,
                    PersistentDataType.INTEGER
            );
            int useLeft = item.getPersistentDataContainer().get(
                    GetHealthPotion.maxUses,
                    PersistentDataType.INTEGER
            );
            useLeft -= 1;
            if (useLeft == 0) {
                player.sendMessage(Component.text("The potion has been used up!", NamedTextColor.GREEN));
                player.playSound(player.getLocation(), Sound.BLOCK_GLASS_BREAK, 1f, 1f);
                event.setReplacement(new ItemStack(Material.AIR));
            } else {
                item.lore(List.of(
                        Component.text("A simple health potion", NamedTextColor.LIGHT_PURPLE),
                        Component.text("Uses left : " + useLeft + " / " + maxUses)
                ));
                int finalUseLeft = useLeft;
                item.editPersistentDataContainer((container) -> container.set(
                        Objects.requireNonNull(GetHealthPotion.usesLeft),
                        PersistentDataType.INTEGER,
                        finalUseLeft
                ));
                event.setReplacement(item);
            }
        }
    }
}
```

---

## 五、 容器 (Inventory)：不仅仅是箱子

在插件开发中，我们把容器当成 **GUI (图形用户界面)** 来使用。

### 1. 创建虚拟 GUI
```java
// 创建一个 3 行 (27格) 的菜单
Inventory gui = Bukkit.createInventory(null, 27, Component.text("服务器礼包菜单"));

// 在第 13 格（中间）放入刚才做的药水
gui.setItem(13, createHealingPotion());

// 打开界面
player.openInventory(gui);
```

### 2. 响应点击事件
为了防止玩家把 GUI 里的图标“偷”走，你需要监听 `InventoryClickEvent` 并取消它：
```java
@EventHandler
public void onGuiClick(InventoryClickEvent event) {
    if (event.getView().title().equals(Component.text("服务器礼包菜单"))) {
        event.setCancelled(true); // 禁止拿取
        if (event.getRawSlot() == 13) {
            event.getWhoClicked().sendMessage("你点击了药水！");
        }
    }
}
```

---

## 六、 总结

1.  **ItemStack** 是物品实例，**ItemMeta** 是物品属性。
2.  **PDC** 是识别自定义物品的唯一标准，千万不要依赖名字判断。
3.  **Inventory** 是插件与玩家进行视觉交互的核心手段。

::: info 接下来
我们已经学会了如何制作精美的物品和界面。但是，这些物品如何让玩家在生存中获得呢？下一章我们将学习 **配方系统 (Recipes)**，让你的自定义物品走进工作台。
:::
