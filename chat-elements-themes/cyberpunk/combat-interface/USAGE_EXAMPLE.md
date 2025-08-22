# RPG战斗界面使用示例

## 🎯 使用方法

在你的聊天对话中，让AI输出包含以下span标签的内容：

### 基础战斗示例
```html
<span data-type="combat-interface" 
      data-npc-name="钢铁恶魔" 
      data-npc-hp="75" 
      data-npc-max-hp="100"
      data-npc-atk="65" 
      data-npc-def="40" 
      data-npc-skl="55"
      data-npc-weapon="等离子炮" 
      data-npc-skill="雷电冲击"
      data-npc-status="激战中"
      data-user-hp="90" 
      data-user-max-hp="100"
      data-user-atk="58" 
      data-user-def="45" 
      data-user-skl="62"
      data-user-weapon="赛博刀" 
      data-user-skill="闪电斩"
      data-user-status="战斗中"
      data-llm-msg="钢铁恶魔咆哮着挥舞等离子炮，你迅速闪避并准备反击！"
      data-combat-damage="15"
      data-combat-critical="是"
      data-combat-accuracy="命中">
</span>
```

### 高级战斗示例（血量危险）
```html
<span data-type="combat-interface" 
      data-npc-name="网络幽灵" 
      data-npc-hp="20" 
      data-npc-max-hp="80"
      data-npc-atk="75" 
      data-npc-def="25" 
      data-npc-skl="85"
      data-npc-weapon="数据尖刺" 
      data-npc-skill="病毒感染"
      data-npc-status="重伤"
      
      data-user-hp="30" 
      data-user-max-hp="100"
      data-user-atk="70" 
      data-user-def="50" 
      data-user-skl="80"
      data-user-weapon="量子手套" 
      data-user-skill="系统修复"
      data-user-status="危险"
      
      data-llm-msg="网络幽灵发出最后的尖啸，释放了强力病毒攻击！你的系统开始报警..."
      data-combat-damage="25"
      data-combat-critical="是"
      data-combat-accuracy="暴击命中">
</span>
```

## ✨ 界面特色功能

### 🩸 血量条系统
- **动态颜色变化**：根据血量百分比自动切换颜色
  - 100%-60%：蓝色/红色系（正常）
  - 30%：橙色系（警告闪烁）
  - 20%以下：红色系（危险脉动）

### ⚔️ 战斗数值显示
- **攻击力 (ATK)**：影响伤害输出
- **防御力 (DEF)**：减少受到的伤害
- **技能力 (SKL)**：影响技能效果和暴击率
- **当前武器**：显示使用的装备
- **当前技能**：显示释放的技能

### 💫 特效系统
- **暴击指示**：金色闪烁效果
- **伤害数值**：动态伤害显示
- **状态动画**：扫描线、数据流背景
- **血量警告**：低血量时的闪烁提醒

### 🎮 交互功能
- **可折叠详情**：点击底部可查看战斗统计
- **响应式设计**：适配手机、平板、桌面
- **悬停效果**：鼠标悬停查看详细信息

## 📱 响应式布局

### 桌面版 (>1200px)
- 三区域布局：顶部血量条、中间对话、底部左右对战面板
- **消息框内全宽全高**：充分利用ST聊天窗口空间
- 完整动画效果

### 平板版 (768px-1200px)
- 垂直堆叠布局
- 保持核心功能
- 优化触屏操作

### 手机版 (<768px)
- 单列布局
- 压缩显示元素
- 优化小屏阅读

## 🎨 视觉设计亮点

1. **赛博朋克美学**：霓虹色彩，科技感边框
2. **动画效果**：扫描线，数据流，脉动光效
3. **颜色编码**：
   - 🔴 NPC/敌方：红色系
   - 🔵 用户/己方：蓝色系
   - 🟡 暴击/特殊：金色系
   - 🟢 正常状态：绿色系

## 🔧 自定义建议

### 修改血量条颜色
在CSS中找到`.npc-hp`和`.user-hp`类进行自定义

### 调整界面尺寸
修改`.rpg-combat-interface`的`width`和`height`属性

### 添加新的状态效果
在CSS中添加新的`[data-status="你的状态"]`选择器

## 🚀 下一步升级

- [ ] 添加音效支持
- [ ] 增加粒子特效
- [ ] 支持技能冷却显示
- [ ] 添加经验值条
- [ ] 支持多人战斗界面

---

**开发团队**：Claude & Kris  
**版本**：v2.0.0 - 消息框内RPG战斗界面  
**更新时间**：2025年8月
