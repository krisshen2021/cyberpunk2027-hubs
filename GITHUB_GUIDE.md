# GitHub仓库创建和管理指南 v2.0

## 🚀 第一步：在GitHub上创建仓库

1. **登录GitHub**
   - 访问 [github.com](https://github.com)
   - 登录你的账户

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`cyberpunk2027-hubs`
   - 描述：`A comprehensive cyberpunk-themed extension for SillyTavern with advanced template system`
   - 设置为 **Public**（推荐）
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经创建了）
   - **不要**选择 License（我们已经有MIT许可证）
   - 点击 "Create repository"

## 💻 第二步：本地Git初始化

在你的扩展目录中打开终端，执行以下命令：

```bash
# 进入扩展目录
cd /home/kris/Projects/SillyTavern/public/scripts/extensions/cyberpunk2027-hubs

# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 创建第一次提交
git commit -m "🎉 Initial release: Cyberpunk 2027 Hubs v3.1.0

✨ Core Features:
- Advanced cyberpunk theme system with multiple layouts
- Dynamic background system (video, character, AI-generated)  
- RPG-style combat interface with real-time health bars
- Data type processing system with configuration-driven templates
- Sharing functions module for interactive components
- Responsive design for all screen sizes

🎨 Visual Themes:
- Decker's Dream layout with enhanced UI
- Tyrell Cockpit layout with dynamic character backgrounds
- Matrix Terminal and Neural Holographic chat styles
- Neon Noir and Rust Chrome visual themes

🛠️ Technical Architecture:
- Handlebars template rendering system
- Advanced data type processing with auto-property derivation
- Smart content handling with SillyTavern Markdown compatibility
- Resource management tools and performance optimizations
- Comprehensive documentation and troubleshooting guides

🔥 v3.1 Major Breakthrough:
- Discovered SillyTavern Markdown processor behavior
- Implemented div wrapper solution for content protection
- Added intelligent Markdown processing with show_markdown() function
- Enhanced data input best practices with real-world validation

📚 Documentation:
- Complete setup and usage guides
- Advanced customization examples
- Troubleshooting and debugging resources
- Developer API reference"

# 添加GitHub远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/krisshen2021/cyberpunk2027-hubs.git

# 推送到GitHub
git push -u origin main
```

## 🔄 第三步：日常Git操作

### 添加和提交更改
```bash
# 查看文件状态
git status

# 添加特定文件
git add 文件名.js

# 或添加所有更改
git add .

# 提交更改（使用有意义的提交信息）
git commit -m "✨ Add new feature: enhanced combat animations

- Improved health bar transitions
- Added critical hit visual effects
- Optimized performance for smooth animations"

# 推送到GitHub
git push
```

### 创建版本标签
```bash
# 创建版本标签
git tag -a v3.1.0 -m "Version 3.1.0: Major content processing breakthrough

🔥 Major Features:
- div wrapper solution for SillyTavern compatibility
- Smart Markdown processing system
- Enhanced data input best practices
- Improved debugging and troubleshooting guides

🐛 Bug Fixes:
- Fixed content display issues with multi-line input
- Resolved Markdown format corruption
- Enhanced template rendering stability"

# 推送标签到GitHub
git push origin v3.1.0

# 推送所有标签
git push --tags
```

### 查看提交历史
```bash
# 查看提交日志
git log --oneline

# 查看详细提交历史
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'

# 查看文件更改
git diff

# 查看特定文件的历史
git log --follow -- filename.js
```

## 📋 第四步：GitHub仓库管理

### 设置仓库描述和标签
1. 进入你的仓库页面
2. 点击右侧的设置齿轮图标
3. 添加描述和标签：
   - **Description**: `🎮 Advanced Cyberpunk-themed extension for SillyTavern featuring dynamic backgrounds, RPG combat interface, smart template system, and intelligent Markdown processing`
   - **Topics**: `sillytavern`, `cyberpunk`, `extension`, `theme`, `ai`, `chatbot`, `ui`, `javascript`, `handlebars`, `rpg`, `gaming`, `markdown`, `templates`

### 🔥 创建Release版本 (v3.1.0重大发布)
1. 在仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 标签版本：`v3.1.0`
4. 标题：`🔥 Cyberpunk 2027 Hubs v3.1.0 - Content Processing Breakthrough`
5. 发布说明：
```markdown
# 🔥 重大突破：内容处理革命

## 🌟 主要更新

### 重大发现与解决方案
- **SillyTavern兼容性突破**: 发现并解决了Markdown处理器对span标签的影响
- **div包装解决方案**: 简单而优雅的内容保护机制
- **智能内容处理**: 新增 `show_markdown()` 功能，完美处理复杂文本格式

### 新增功能
- ✨ 数据输入最佳实践指南
- ✨ 增强的故障排除文档
- ✨ 实战验证的输入格式规范
- ✨ 智能Markdown转换和显示

### 改进项目
- 🚀 模板系统稳定性大幅提升
- 🚀 支持多行复杂内容输入
- 🚀 完美兼容引用块、代码块等Markdown格式
- 🚀 优化了调试和开发体验

### 技术亮点
- 🛠️ 配置驱动的数据类型系统
- 🛠️ 先进的模板渲染引擎
- 🛠️ 智能属性派生机制
- 🛠️ 现代化的响应式设计

## 📦 安装方法

### 自动安装（推荐）
1. 在SillyTavern中打开扩展管理器
2. 点击"从URL安装"
3. 输入：`https://github.com/krisshen2021/cyberpunk2027-hubs`
4. 点击安装并启用

### 手动安装
1. 下载并解压到 `public/scripts/extensions/cyberpunk2027-hubs/`
2. 重启SillyTavern
3. 在扩展页面启用主题

## 🎯 使用指南

### 快速开始
1. 启用扩展并选择喜欢的布局（Decker's Dream 或 Tyrell Cockpit）
2. 选择视觉主题（Neon Noir 或 Rust Chrome）
3. 在对话中使用以下格式输入数据：
```html
<div>
<span data-type="scene-container" data-location="夜之城" data-npc-list="杰克,V">
**激烈的战斗正在进行中！**

> 杰克正在掩护你的撤退
> V专注地瞄准着敌人

空气中弥漫着*硝烟*的味道...
</span>
</div>
```

### 高级功能
- 🎮 启用AI背景生成获得动态场景
- 🎬 开启视频背景体验沉浸式主页
- 🏷️ 使用模板渲染系统创建复杂UI组件
- ⚔️ 启用战斗界面模块进行RPG游戏

## 📚 完整文档
- [数据类型系统指南](./DATA_TYPE_SYSTEM_GUIDE.md)
- [共享功能使用指南](./SHARING_FUNCTIONS_GUIDE.md)  
- [故障排除和调试](./DATA_TYPE_SYSTEM_GUIDE.md#故障排除)

## 💝 特别致谢
感谢那个充满调试与发现的深夜，让我们找到了完美的解决方案！

---
**开发团队**: Kris & Claude AI 💕  
**发布日期**: 2025年8月23日
```
6. 选择 "Set as the latest release"
7. 点击 "Publish release"

### 设置仓库特性
在仓库设置中启用：
- **Issues** - 用于bug报告和功能请求
- **Wiki** - 用于详细文档
- **Discussions** - 用于社区交流
- **Projects** - 用于功能规划和版本管理

### 创建Issue模板
创建 `.github/ISSUE_TEMPLATE/` 文件夹并添加模板：

**bug-report.yml**:
```yaml
name: 🐛 Bug报告
description: 报告系统bug或异常行为
labels: ["bug", "需要确认"]
body:
  - type: markdown
    attributes:
      value: |
        感谢你的bug报告！请详细描述遇到的问题。
  - type: input
    attributes:
      label: SillyTavern版本
      placeholder: "例如: staging-1.12.0"
    validations:
      required: true
  - type: textarea
    attributes:
      label: 问题描述
      placeholder: 描述你遇到的具体问题...
    validations:
      required: true
  - type: textarea
    attributes:
      label: 重现步骤
      placeholder: |
        1. 打开扩展设置...
        2. 点击...
        3. 看到错误...
    validations:
      required: true
```

## 🌟 第五步：推广和维护

### README优化建议
- 添加功能演示GIF或截图
- 创建详细的安装视频教程
- 提供实际使用示例和模板
- 添加常见问题解答

### 社区建设策略
- **Discord推广**: 在SillyTavern官方Discord的扩展频道分享
- **Reddit宣传**: 在r/SillyTavernAI等相关社区发布
- **文档完善**: 持续更新使用指南和最佳实践
- **用户反馈**: 积极回应Issues和Pull Requests

### 持续更新计划
- **每月一次**小版本更新，修复bug和添加小功能
- **每季度一次**大版本更新，添加重要功能
- **及时响应**SillyTavern主版本更新，确保兼容性
- **文档同步**：所有代码更改都要同步更新文档

### 📊 发布策略

#### 版本命名规则
- `vX.Y.Z` - 主要.次要.修补
- `vX.Y.Z-beta` - 测试版本
- `vX.Y.Z-alpha` - 开发版本

#### 发布检查清单
- [ ] 代码完成并测试
- [ ] 更新版本号和日期
- [ ] 更新CHANGELOG.md
- [ ] 更新文档
- [ ] 创建Release Notes
- [ ] 测试安装流程
- [ ] 发布到GitHub

## 🔧 常用Git命令速查

```bash
# 克隆仓库
git clone https://github.com/你的用户名/cyberpunk2027-hubs.git

# 检查远程仓库
git remote -v

# 拉取最新更改
git pull origin main

# 查看分支
git branch -a

# 创建新分支进行功能开发
git checkout -b feature/new-combat-system

# 切换分支
git checkout main

# 合并分支
git merge feature/new-combat-system

# 删除已合并的分支
git branch -d feature/new-combat-system

# 查看文件变更统计
git diff --stat

# 查看特定作者的提交
git log --author="Kris"

# 撤销最近的提交（保留更改）
git reset --soft HEAD~1

# 强制推送（谨慎使用）
git push --force-with-lease
```

## 📈 高级GitHub功能

### GitHub Actions自动化
创建 `.github/workflows/test.yml`：
```yaml
name: 测试和验证
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: 验证JSON配置文件
        run: |
          find . -name "*.json" -exec python -m json.tool {} \; > /dev/null
      - name: 检查文档完整性
        run: |
          test -f README.md
          test -f DATA_TYPE_SYSTEM_GUIDE.md
          test -f SHARING_FUNCTIONS_GUIDE.md
```

### 项目看板管理
在Projects中创建看板：
- **Backlog**: 待开发功能
- **In Progress**: 正在开发
- **Review**: 等待测试
- **Done**: 已完成

## 📞 获取帮助

### 学习资源
1. **GitHub文档**: https://docs.github.com/
2. **Git教程**: https://git-scm.com/docs
3. **在线Git练习**: https://learngitbranching.js.org/
4. **GitHub Desktop**: GUI工具，适合不习惯命令行的用户

### 社区支持
- **GitHub Discussions**: 项目相关讨论
- **SillyTavern Discord**: 技术支持
- **开发者邮件**: 直接联系维护者

---

## 🎉 成功秘诀

### 📝 好的提交习惯
- **使用表情符号**: ✨新功能 🐛修复bug 📚更新文档 🚀性能优化
- **简洁明了**: 第一行简短描述，详细内容放在后面
- **及时提交**: 小步快跑，频繁提交

### 🌟 项目维护建议
- **定期备份**: 重要版本打标签
- **文档同步**: 代码变更立即更新文档  
- **用户反馈**: 积极回应社区建议
- **代码质量**: 持续重构和优化

**记住：好的版本控制不仅是代码管理，更是团队协作和项目成长的记录！** 🚀💕

---

*最后更新：2025年8月23日*  
*版本：v2.0*  
*特别纪念：我们一起走过的每一个版本 🌙✨*
