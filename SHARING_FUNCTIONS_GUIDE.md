# 共享功能系统 (Sharing Functions) 使用指南 v2.0

## 概述
共享功能系统为所有模板提供通用的交互功能，通过在模板中添加 `data-function` 属性来声明性地定义交互行为。

## 🎯 设计理念
- **声明性交互** - 通过HTML属性定义功能，无需编写JavaScript
- **模块化复用** - 所有模板都能使用相同的功能集
- **易于扩展** - 新功能只需添加到共享模块即可
- **视觉反馈** - 自动为交互元素添加视觉提示
- **🔥 内容处理** - 智能处理Markdown格式和复杂文本内容

## 📚 功能分类

### 1. 基础交互功能

#### `toggle-wrapper(targetId, initShow?, animation?)`
切换指定容器的显示/隐藏状态

**参数:**
- `targetId`: 目标容器的ID
- `initShow`: 初始显示状态 (`init_show=true` 或 `init_show=false`)
- `animation`: 动画效果 (`fade`, `slide`, `none`)

**示例:**
```html
<!-- 最简单的用法 - 默认展开 -->
<div class="section-header" data-function="toggle-wrapper(character-content-wrapper)">
    <span class="toggle-indicator">▼</span>
    <span class="section-title">CHARACTER</span>
</div>

<!-- 设置初始状态 - 默认折叠 -->
<div class="section-header" data-function="toggle-wrapper(user-content-wrapper, init_show=false)">
    <span class="toggle-indicator">▶</span>
    <span class="section-title">USER STATUS</span>
</div>

<!-- 完整参数 - 设置初始状态和动画 -->
<div class="section-header" data-function="toggle-wrapper(character-content-wrapper, init_show=true, slide)">
    <span class="toggle-indicator">▼</span>
    <span class="section-title">CHARACTER</span>
</div>

<div id="character-content-wrapper">
    <!-- 内容将被切换显示/隐藏 -->
</div>
```

#### `expand-section(targetId, effect?)`
展开/收起区域

**参数:**
- `targetId`: 目标区域ID
- `effect`: 效果类型 (`slide-down`, `fade-in`, `expand`)

#### `slide-toggle(targetId, direction?)`
滑动切换效果

**参数:**
- `targetId`: 目标元素ID
- `direction`: 滑动方向 (`up`, `down`, `left`, `right`)

### 2. 信息展示功能

#### `popup-info(npcName, template?)`
显示NPC信息弹窗

**参数:**
- `npcName`: NPC名称 (通常从模板变量获取)
- `template`: 模板类型 (`basic`, `detailed`)

**示例:**
```html
<div class="npc-avatar-wrapper" data-function="popup-info({{name}}, detailed)">
    <img src="{{avatar}}" alt="{{name}} Avatar" class="npc-avatar">
</div>
```

#### `tooltip-show(content, position?)`
显示工具提示

**参数:**
- `content`: 提示内容
- `position`: 位置 (`top`, `bottom`, `left`, `right`)

#### `modal-display(templateId, data?)`
显示模态窗口

**参数:**
- `templateId`: 模板ID或HTML内容
- `data`: 数据对象

### 3. 🔥 内容处理功能 (v2.0新增)

#### `show_markdown()`
自动将元素内容转换为Markdown格式并显示

**用途:**
- 自动处理LLM生成的Markdown内容
- 支持粗体、斜体、引用块、代码块等格式
- 完美兼容SillyTavern的内容处理机制

**示例:**
```html
<div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
```

**支持的Markdown格式:**
- **粗体文本**: `**粗体**` → **粗体**
- *斜体文本*: `*斜体*` → *斜体*
- 引用块: `> 这是引用` → 
  > 这是引用
- 代码块: `` `code` `` → `code`
- 删除线: `~~删除~~` → ~~删除~~
- 列表、链接等其他Markdown语法

**重要特性:**
- **自动执行**: 在模板渲染完成后自动处理所有带有此功能的元素
- **安全转换**: 使用SillyTavern内置的Markdown转换器
- **性能优化**: 只处理实际包含内容的元素

### 4. 数据交互功能

#### `filter-list(targetClass, filterValue)`
过滤列表项

**参数:**
- `targetClass`: 目标项的类名
- `filterValue`: 过滤值

#### `sort-items(targetClass, sortBy)`
排序项目

**参数:**
- `targetClass`: 目标项的类名
- `sortBy`: 排序依据 (`name`, `date`, `type`)

#### `search-highlight(keyword)`
搜索高亮

**参数:**
- `keyword`: 搜索关键词

## 🎨 视觉特性

### 自动样式
- 带有 `data-function` 的元素自动获得指针光标
- 悬停时添加高亮效果
- 点击时提供视觉反馈

### 切换指示器
```html
<span class="toggle-indicator">▼</span>
```
- `▼` - 展开状态
- `▶` - 收起状态

### 状态类
- `.expanded` - 展开状态
- `.collapsed` - 收起状态
- `.filter-active` - 过滤激活
- `.sort-active` - 排序激活

## 🛠️ 实际使用示例

### 场景容器模板示例

```html
<!-- 可折叠的角色信息区域 -->
<div class="section-header" data-function="toggle-wrapper(character-content-wrapper)">
    <span class="toggle-indicator">▼</span>
    <span class="section-icon">👤</span>
    <span class="section-title">CHARACTER</span>
</div>
<div class="section-content" id="character-content-wrapper">
    <!-- 角色详细信息 -->
</div>

<!-- 可点击显示详情的NPC -->
{{#each NPC_LIST_CHAR}}
<div class="npc-item">
    <div class="npc-avatar-wrapper" data-function="popup-info({{name}}, detailed)">
        <img src="{{avatar}}" alt="{{name}} Avatar" class="npc-avatar">
    </div>
    <div class="npc-name">{{name}}</div>
</div>
{{/each}}

<!-- 🔥 新增：Markdown内容显示 -->
<div class="dialogue-section">
    <h3>对话内容</h3>
    <div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
</div>

<!-- 可折叠的环境信息 -->
<div class="section-header" data-function="toggle-wrapper(environment-content-wrapper, fade)">
    <span class="toggle-indicator">▼</span>
    <span class="section-title">ENVIRONMENT</span>
</div>
<div id="environment-content-wrapper">
    <!-- 环境详细信息 -->
</div>
```

### 战斗界面模板示例
```html
<!-- 战斗对话区域 -->
<div class="combat-dialogue-area">
    {{#ifNotEmpty LLM_DIALOGUE}}
    <div class="dialogue-container">
        <div class="dialogue-content" data-function="show_markdown()">{{{LLM_DIALOGUE}}}</div>
    </div>
    {{/ifNotEmpty}}
</div>

<!-- 可折叠的详细战斗信息 -->
<div class="combat-details-toggle">
    <div class="toggle-header" data-function="toggle-wrapper(combat-extended-info, init_show=false)">
        <div class="toggle-indicator">▼</div>
        <div class="toggle-label">DETAILED COMBAT INFO</div>
    </div>
    
    <div class="extended-info-container" id="combat-extended-info">
        <div class="extended-stats">
            <div class="debug-info">
                <h4>战斗统计详情</h4>
                <div class="debug-grid">
                    <div>命中状态: {{COMBAT_ACCURACY}}</div>
                    <div>暴击状态: {{COMBAT_CRITICAL}}</div>
                    <div>伤害数值: {{COMBAT_DAMAGE}}</div>
                </div>
            </div>
        </div>
    </div>
</div>
```

## 🔧 开发者信息

### 系统架构
- `SharingFunctions` 类：核心功能模块
- 自动事件绑定：扫描并绑定所有 `data-function` 元素
- 参数解析：支持多参数和引号包裹的参数
- 错误处理：完善的错误捕获和日志记录

### v2.0 新增特性
- **智能内容处理**: 自动Markdown转换
- **性能优化**: 批量处理和缓存机制
- **错误恢复**: 更强的容错能力
- **调试增强**: 更详细的日志信息

### 扩展新功能
要添加新功能，在 `SharingFunctions` 类的 `executeFunction` 方法中添加新的 case：

```javascript
case 'my-new-function':
    this.myNewFunction(parameters[0], parameters[1], sourceElement);
    break;
```

### 清理机制
- 自动清理绑定和状态
- 防止重复绑定
- 内存泄漏预防

## 🐛 调试功能

### 调试模式
在body上添加 `sharing-functions-debug` 类可以显示所有功能元素的边框和标签：

```javascript
document.body.classList.add('sharing-functions-debug');
```

### 控制台日志
所有功能操作都有详细的控制台日志，便于调试和监控。

### v2.0 调试增强
- **Markdown处理日志**: 显示内容转换过程
- **性能监控**: 记录处理时间和性能指标
- **错误详情**: 更详细的错误信息和堆栈跟踪

## 🎉 成长历程

### v1.0 - 基础功能
建立了声明式交互功能的基础架构，实现了基本的切换和弹窗功能。

### v2.0 - 内容处理革命 🔥
通过一整晚的调试和发现，我们实现了重大突破：
- 发现了SillyTavern Markdown处理器的特性
- 实现了智能内容处理和格式保护
- 添加了 `show_markdown()` 功能，完美解决内容显示问题
- 优化了系统稳定性和用户体验

这个共享功能系统是我们的"baby"又一次华丽成长！💕

---

**联合开发**: Kris & Claude AI  
**版本**: 2.0.0  
**最后更新**: 2025年8月23日  
**特别纪念**: 那个充满发现的调试之夜 🌙✨