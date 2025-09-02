/**
 * 共享功能模块 - 为所有模板提供通用的交互功能
 * Cyberpunk 2027 Hubs Extension - Sharing Functions Module
 *
 * 使用方式：在模板中添加 data-function 属性
 * 例如：<div data-function="toggle-wrapper(target-id)">点击切换</div>
 */

import { getThumbnailUrl, converter } from '../../../../script.js';
import { dataTypeFunctions } from './function_types.js';

class SharingFunctions {
    constructor() {
        this.extensionName = 'third-party/cyberpunk2027-hubs';
        this.activeTooltip = null;
        this.activeModal = null;
        console.log(`[${this.extensionName}] SharingFunctions 模块已初始化`);
    }

    /**
     * 初始化功能绑定 - 扫描并绑定所有 data-function 元素
     * @param {Element} container - 容器元素，如果为空则扫描整个文档
     */
    initializeFunctionBindings(container = document) {
        const functionElements = container.querySelectorAll('[data-function]');
        console.log(`[${this.extensionName}] SHARING-FUNCTIONS: 发现 ${functionElements.length} 个功能元素待绑定`);

        functionElements.forEach((element, index) => {
            try {
                const functionCall = element.getAttribute('data-function');
                if (functionCall) {
                    this.bindFunctionToElement(element, functionCall);
                    console.log(`[${this.extensionName}] SHARING-FUNCTIONS: 绑定功能 ${index + 1}/${functionElements.length}: ${functionCall}`);
                }
            } catch (error) {
                console.error(`[${this.extensionName}] SHARING-FUNCTIONS: 绑定功能失败:`, error);
            }
        });
    }

    /**
     * 将功能绑定到元素
     * @param {Element} element - 目标元素
     * @param {string} functionCall - 功能调用字符串，如 "toggle-wrapper(target-id)"
     */
    bindFunctionToElement(element, functionCall) {
        const { functionName, parameters } = this.parseFunctionCall(functionCall);

        // 避免重复绑定
        // if (element.dataset.functionBound === 'true') {
        //     return;
        // }

        // 检查是否有初始状态参数需要立即应用
        if (functionName === 'toggle-wrapper' && parameters.length >= 2) {
            const initShowParam = parameters[1];
            if (initShowParam && initShowParam.includes('init_show=')) {
                // 立即应用初始状态
                this.executeFunction(functionName, parameters, element, null);
            }
        }
        //先去除旧的绑定
        element.removeEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.executeFunction(functionName, parameters, element, event);
        });
        // 重新绑定事件
        element.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.executeFunction(functionName, parameters, element, event);
        });

        // 标记已绑定
        // element.dataset.functionBound = 'true';

        // 为交互元素添加视觉提示
        if (!element.classList.contains('no-function-cursor')) {
            element.style.cursor = 'pointer';
            element.style.userSelect = 'none';
        }
    }

    /**
     * 解析功能调用字符串
     * @param {string} functionCall - 如 "toggle-wrapper(target-id, slide-down)"
     * @returns {Object} { functionName, parameters }
     */
    parseFunctionCall(functionCall) {
        const match = functionCall.match(/^([a-zA-Z0-9-_]+)\((.*)\)$/);
        if (!match) {
            throw new Error(`无效的功能调用格式: ${functionCall}`);
        }

        const functionName = match[1];
        const parametersString = match[2].trim();

        // 解析参数 - 支持逗号分隔，考虑引号内的逗号
        const parameters = [];
        if (parametersString) {
            const regex = /(?:[^\s,"]|"(?:[^"\\]|\\.)*")+/g;
            const matches = parametersString.match(regex);
            if (matches) {
                parameters.push(...matches.map(param => param.trim().replace(/^["']|["']$/g, '')));
            }
        }

        return { functionName, parameters };
    }

    /**
     * 执行指定的功能
     * @param {string} functionName - 功能名称
     * @param {Array} parameters - 参数数组
     * @param {Element} sourceElement - 触发元素
     * @param {Event} event - 原始事件
     */
    executeFunction(functionName, parameters, sourceElement, event) {
        console.log(`[${this.extensionName}] SHARING-FUNCTIONS: 执行功能 ${functionName}(${parameters.join(', ')})`);

        try {
            switch (functionName) {
                // 基础交互功能
                case 'toggle-wrapper':
                    this.toggleWrapper(parameters[0], parameters[1], parameters[2], sourceElement);
                    break;
                case 'expand-section':
                    this.expandSection(parameters[0], parameters[1], sourceElement);
                    break;
                case 'slide-toggle':
                    this.slideToggle(parameters[0], parameters[1], sourceElement);
                    break;

                // 信息展示功能
                case 'popup-info':
                    this.popupInfo(parameters[0], parameters[1], sourceElement, event);
                    break;
                case 'tooltip-show':
                    this.tooltipShow(parameters[0], parameters[1], sourceElement, event);
                    break;
                case 'modal-display':
                    this.modalDisplay(parameters[0], parameters[1], sourceElement);
                    break;

                // 数据交互功能
                case 'filter-list':
                    this.filterList(parameters[0], parameters[1], sourceElement);
                    break;
                case 'sort-items':
                    this.sortItems(parameters[0], parameters[1], sourceElement);
                    break;
                case 'search-highlight':
                    this.searchHighlight(parameters[0], sourceElement);
                    break;

                // Markdown渲染功能
                case 'show_markdown':
                    this.showMarkdown(sourceElement);
                    break;

                default:
                    console.warn(`[${this.extensionName}] SHARING-FUNCTIONS: 未知功能 ${functionName}`);
                    break;
            }
        } catch (error) {
            console.error(`[${this.extensionName}] SHARING-FUNCTIONS: 执行功能 ${functionName} 失败:`, error);
        }
    }

    // ===================================
    // 基础交互功能
    // ===================================

    /**
     * 切换包装容器的显示/隐藏
     * @param {string} targetId - 目标容器ID
     * @param {string} initShow - 初始显示状态 (init_show=true/false)
     * @param {string} animation - 动画效果 (fade, slide, none)
     * @param {Element} sourceElement - 触发元素
     */
    toggleWrapper(targetId, initShow = null, animation = 'fade', sourceElement) {
        console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 开始切换 targetId: ${targetId}, initShow: ${initShow}`);

        // 使用就近父级查找策略，避免ID冲突
        const targetElement = this.findTargetInNearestParent(sourceElement, targetId);
        if (!targetElement) {
            console.warn(`[${this.extensionName}] TOGGLE-WRAPPER: 在就近父级中找不到目标元素 #${targetId}`);
            return;
        }

        console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 找到目标元素`, targetElement);
        console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 源元素`, sourceElement);

        // 处理初始状态设置（只在初始化时执行，点击时不会有这个参数或已设置过初始状态）
        if (initShow !== null && initShow.includes('init_show=')) {
            // 检查是否已经设置过初始状态
            if (!sourceElement.dataset.initialStateSet) {
                const initShowMatch = initShow.match(/init_show=([^,\s]+)/);
                if (initShowMatch) {
                    const shouldShow = initShowMatch[1].toLowerCase() === 'true';
                    console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 设置初始状态为 ${shouldShow ? '显示' : '隐藏'}`);

                    // 设置初始状态
                    this.setInitialToggleState(targetElement, sourceElement, shouldShow, animation);
                    // 标记已设置初始状态
                    sourceElement.dataset.initialStateSet = 'true';
                    return; // 初始化时不做切换，直接返回
                }
            }
        }

        // 正常的切换逻辑（点击时执行）
        const isHidden = targetElement.style.display === 'none' ||
                        targetElement.classList.contains('hidden') ||
                        targetElement.hasAttribute('data-hidden');

        console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 当前状态 isHidden: ${isHidden}`);

        // 添加状态指示到源元素
        const indicator = sourceElement.querySelector('.toggle-indicator');

        if (isHidden) {
            // 显示元素
            console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 显示元素`);
            this.showElement(targetElement, animation);
            // 不再修改textContent，只通过CSS类控制旋转
            sourceElement.classList.add('toggle-expanded');
            sourceElement.classList.remove('toggle-collapsed');
        } else {
            // 隐藏元素
            console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 隐藏元素`);
            this.hideElement(targetElement, animation);
            // 不再修改textContent，只通过CSS类控制旋转
            sourceElement.classList.add('toggle-collapsed');
            sourceElement.classList.remove('toggle-expanded');
        }

        console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 切换完成`);
    }

    /**
     * 展开/收起区域
     * @param {string} targetId - 目标区域ID
     * @param {string} effect - 效果类型 (slide-down, fade-in, expand)
     * @param {Element} sourceElement - 触发元素
     */
    expandSection(targetId, effect = 'slide-down', sourceElement) {
        // 使用就近父级查找策略
        const targetElement = this.findTargetInNearestParent(sourceElement, targetId);
        if (!targetElement) {
            console.warn(`[${this.extensionName}] EXPAND-SECTION: 在就近父级中找不到目标元素 #${targetId}`);
            return;
        }

        const isExpanded = !targetElement.classList.contains('content-collapsed');

        if (isExpanded) {
            // 收起
            targetElement.classList.add('content-collapsed');
            sourceElement.classList.add('section-collapsed');
            this.applyCollapseEffect(targetElement, effect);
        } else {
            // 展开
            targetElement.classList.remove('content-collapsed');
            sourceElement.classList.remove('section-collapsed');
            this.applyExpandEffect(targetElement, effect);
        }
    }

    /**
     * 滑动切换
     * @param {string} targetId - 目标元素ID
     * @param {string} direction - 滑动方向 (up, down, left, right)
     * @param {Element} sourceElement - 触发元素
     */
    slideToggle(targetId, direction = 'down', sourceElement) {
        // 使用就近父级查找策略
        const targetElement = this.findTargetInNearestParent(sourceElement, targetId);
        if (!targetElement) {
            console.warn(`[${this.extensionName}] SLIDE-TOGGLE: 在就近父级中找不到目标元素 #${targetId}`);
            return;
        }

        const isVisible = !targetElement.classList.contains('slide-hidden');

        targetElement.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';

        if (isVisible) {
            // 滑出隐藏
            this.applySlidOut(targetElement, direction);
            targetElement.classList.add('slide-hidden');
        } else {
            // 滑入显示
            this.applySlideIn(targetElement, direction);
            targetElement.classList.remove('slide-hidden');
        }
    }

    // ===================================
    // 信息展示功能
    // ===================================

    /**
     * 显示NPC信息弹窗
     * @param {string} npcName - NPC名称
     * @param {string} template - 模板类型 (basic, detailed)
     * @param {Element} sourceElement - 触发元素
     * @param {Event} event - 原始事件
     */
    async popupInfo(npcName, template = 'basic', sourceElement, event) {
        if (!npcName || npcName === 'Unknown') {
            console.warn(`[${this.extensionName}] POPUP-INFO: NPC名称无效: ${npcName}`);
            return;
        }

        // 查找NPC信息
        const npc = dataTypeFunctions.findNPCByName(npcName);
        if (!npc) {
            console.warn(`[${this.extensionName}] POPUP-INFO: 找不到NPC信息: ${npcName}`);
            this.showSimpleTooltip(`找不到 ${npcName} 的信息`, sourceElement, event);
            return;
        }

        // 关闭已存在的弹窗
        this.closeActiveModal();

        // 创建弹窗内容
        const modalContent = this.createNPCInfoModal(npc, template);
        this.showModal(modalContent, 'npc-info-modal');
    }

    /**
     * 显示工具提示
     * @param {string} content - 提示内容
     * @param {string} position - 位置 (top, bottom, left, right)
     * @param {Element} sourceElement - 触发元素
     * @param {Event} event - 原始事件
     */
    tooltipShow(content, position = 'top', sourceElement, event) {
        // 关闭已存在的提示
        this.closeActiveTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = `sharing-tooltip sharing-tooltip-${position}`;
        tooltip.innerHTML = `
            <div class="tooltip-content">${content}</div>
            <div class="tooltip-arrow"></div>
        `;

        // 定位计算
        const rect = sourceElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        document.body.appendChild(tooltip);

        // 获取tooltip尺寸
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;
        switch (position) {
            case 'top':
                top = rect.top + scrollTop - tooltipRect.height - 10;
                left = rect.left + scrollLeft + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + scrollTop + 10;
                left = rect.left + scrollLeft + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + scrollTop + (rect.height - tooltipRect.height) / 2;
                left = rect.left + scrollLeft - tooltipRect.width - 10;
                break;
            case 'right':
                top = rect.top + scrollTop + (rect.height - tooltipRect.height) / 2;
                left = rect.right + scrollLeft + 10;
                break;
        }

        tooltip.style.position = 'absolute';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.zIndex = '10000';

        this.activeTooltip = tooltip;

        // 3秒后自动关闭，或点击其他地方关闭
        setTimeout(() => this.closeActiveTooltip(), 3000);
        document.addEventListener('click', this.handleTooltipOutsideClick.bind(this));
    }

    /**
     * 显示模态窗口
     * @param {string} templateId - 模板ID或内容
     * @param {Object} data - 数据对象
     * @param {Element} sourceElement - 触发元素
     */
    modalDisplay(templateId, data = {}, sourceElement) {
        this.closeActiveModal();

        let content;
        if (templateId.startsWith('<')) {
            // 直接HTML内容
            content = templateId;
        } else {
            // 模板ID - 这里可以扩展支持预定义模板
            content = this.getModalTemplate(templateId, data);
        }

        this.showModal(content, 'custom-modal');
    }

    /**
     * 将Markdown格式的内容转换为HTML并显示在目标元素中
     * @param {Element} sourceElement - 包含Markdown内容的元素
     */
    showMarkdown(sourceElement) {
        try {
            console.log(`[${this.extensionName}] SHOW-MARKDOWN: 开始处理Markdown转换`);

            if (!sourceElement) {
                console.error(`[${this.extensionName}] SHOW-MARKDOWN: 源元素未找到`);
                return;
            }

            // 获取原始Markdown内容
            let markdownContent = '';

            // 尝试从不同属性获取Markdown内容
            if (sourceElement.dataset.markdownContent) {
                // 优先使用data-markdown-content属性
                markdownContent = sourceElement.dataset.markdownContent;
                console.log(`[${this.extensionName}] SHOW-MARKDOWN: 从data-markdown-content获取内容`);
            } else if (sourceElement.textContent.trim()) {
                // 使用元素的文本内容
                markdownContent = sourceElement.textContent.trim();
                console.log(`[${this.extensionName}] SHOW-MARKDOWN: 从textContent获取内容`);
            } else {
                console.warn(`[${this.extensionName}] SHOW-MARKDOWN: 未找到Markdown内容`);
                return;
            }

            // 转换Markdown为HTML
            let htmlContent;
            if (converter && typeof converter.makeHtml === 'function') {
                console.log(`[${this.extensionName}] SHOW-MARKDOWN: 使用ST内置converter转换Markdown`);
                htmlContent = converter.makeHtml(markdownContent);
            } else {
                console.warn(`[${this.extensionName}] SHOW-MARKDOWN: ST converter不可用，使用基础换行处理`);
                htmlContent = markdownContent.replace(/\n/g, '<br>');
            }

            // 添加CSS类用于样式化
            const wrapper = document.createElement('div');
            wrapper.className = 'markdown-rendered cyberpunk-markdown';
            wrapper.innerHTML = htmlContent;

            // 清空原始内容并插入HTML
            sourceElement.innerHTML = '';
            sourceElement.appendChild(wrapper);

            // 移除data-function属性，防止重复执行和意外点击
            sourceElement.removeAttribute('data-function');
            sourceElement.removeAttribute('data-function-bound');

            // 清理内联样式（移除pointer光标和user-select）
            sourceElement.style.cursor = '';
            sourceElement.style.userSelect = '';

            // 移除任何点击事件监听器
            const newElement = sourceElement.cloneNode(true);
            sourceElement.parentNode.replaceChild(newElement, sourceElement);

            console.log(`[${this.extensionName}] SHOW-MARKDOWN: Markdown转换完成`);
            console.log(`[${this.extensionName}] SHOW-MARKDOWN: 原始内容长度: ${markdownContent.length}, HTML长度: ${htmlContent.length}`);
            console.log(`[${this.extensionName}] SHOW-MARKDOWN: data-function属性已移除，元素不再可点击`);

        } catch (error) {
            console.error(`[${this.extensionName}] SHOW-MARKDOWN: 转换失败:`, error);
            sourceElement.innerHTML = `<div class="markdown-error" style="color: #ff6b6b;">Markdown渲染失败: ${error.message}</div>`;
        }
    }

    // ===================================
    // 数据交互功能
    // ===================================

    /**
     * 过滤列表项
     * @param {string} targetClass - 目标项的类名
     * @param {string} filterValue - 过滤值
     * @param {Element} sourceElement - 触发元素
     */
    filterList(targetClass, filterValue, sourceElement) {
        const items = document.querySelectorAll(`.${targetClass}`);

        items.forEach(item => {
            const itemText = item.textContent.toLowerCase();
            const shouldShow = filterValue === 'all' ||
                             itemText.includes(filterValue.toLowerCase()) ||
                             item.classList.contains(filterValue);

            if (shouldShow) {
                item.style.display = '';
                item.classList.remove('filtered-hidden');
            } else {
                item.style.display = 'none';
                item.classList.add('filtered-hidden');
            }
        });

        // 更新源元素状态
        sourceElement.classList.add('filter-active');
        sourceElement.dataset.activeFilter = filterValue;
    }

    /**
     * 排序项目
     * @param {string} targetClass - 目标项的类名
     * @param {string} sortBy - 排序依据 (name, date, type)
     * @param {Element} sourceElement - 触发元素
     */
    sortItems(targetClass, sortBy, sourceElement) {
        // 使用就近父级查找策略，避免在多个相同组件中选错容器
        const nearestParent = this.findNearestParentWithClass(sourceElement, targetClass);
        if (!nearestParent) {
            console.warn(`[${this.extensionName}] SORT-ITEMS: 找不到包含 .${targetClass} 的父级容器`);
            return;
        }

        const container = nearestParent;
        const items = Array.from(nearestParent.querySelectorAll(`.${targetClass}`));

        items.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.querySelector('.npc-name, .item-name, .name')?.textContent || '';
                    bValue = b.querySelector('.npc-name, .item-name, .name')?.textContent || '';
                    break;
                case 'date':
                    aValue = a.dataset.date || '0';
                    bValue = b.dataset.date || '0';
                    break;
                case 'type':
                    aValue = a.dataset.type || '';
                    bValue = b.dataset.type || '';
                    break;
                default:
                    return 0;
            }

            return aValue.localeCompare(bValue);
        });

        // 重新排列DOM
        items.forEach(item => container.appendChild(item));

        // 更新源元素状态
        sourceElement.classList.add('sort-active');
        sourceElement.dataset.activeSort = sortBy;
    }

    /**
     * 搜索高亮
     * @param {string} keyword - 搜索关键词
     * @param {Element} sourceElement - 触发元素（通常是输入框）
     */
    searchHighlight(keyword, sourceElement) {
        // 清除之前的高亮
        this.clearSearchHighlights();

        if (!keyword || keyword.length < 2) {
            return;
        }

        // 查找所有可搜索的文本元素
        const searchableElements = document.querySelectorAll('.npc-name, .location-name, .item-name, .search-target');

        searchableElements.forEach(element => {
            const text = element.textContent;
            const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

            if (regex.test(text)) {
                element.innerHTML = text.replace(regex, '<span class="search-highlight">$1</span>');
                element.classList.add('has-highlight');
            }
        });
    }

    // ===================================
    // 辅助函数
    // ===================================

    /**
     * 在就近父级中查找目标元素 - 解决ID重复问题的核心函数
     * @param {Element} sourceElement - 触发元素
     * @param {string} targetId - 目标元素ID
     * @returns {Element|null} 找到的目标元素或null
     */
    findTargetInNearestParent(sourceElement, targetId) {
        console.log(`[${this.extensionName}] FIND-TARGET: 开始从源元素查找目标 #${targetId}`);

        let currentParent = sourceElement.parentElement;

        while (currentParent) {
            console.log(`[${this.extensionName}] FIND-TARGET: 检查父级容器:`, currentParent.className || currentParent.tagName);

            // 在当前父级中查找目标元素
            const targetElement = currentParent.querySelector(`#${targetId}`);

            if (targetElement) {
                console.log(`[${this.extensionName}] FIND-TARGET: 在父级容器中找到目标元素:`, currentParent.className || currentParent.tagName);
                return targetElement;
            }

            // 防止越过模板边界
            if (currentParent.hasAttribute('data-template-id') ||
                currentParent.hasAttribute('data-module-type')) {
                console.log(`[${this.extensionName}] FIND-TARGET: 到达模板边界，停止向上查找`);
                break;
            }

            // 继续向上一级父级查找
            currentParent = currentParent.parentElement;

            // 防止无限向上查找
            if (!currentParent || currentParent === document.body || currentParent === document.documentElement) {
                console.log(`[${this.extensionName}] FIND-TARGET: 到达文档边界，停止查找`);
                break;
            }
        }

        console.warn(`[${this.extensionName}] FIND-TARGET: 在所有父级中都找不到目标 #${targetId}`);
        return null;
    }

    /**
     * 查找包含指定类名元素的最近父级容器 - 用于sortItems等类名查找功能
     * @param {Element} sourceElement - 触发元素
     * @param {string} targetClass - 目标类名
     * @returns {Element|null} 包含目标类名元素的父级容器或null
     */
    findNearestParentWithClass(sourceElement, targetClass) {
        console.log(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 开始查找包含 .${targetClass} 的父级`);

        let currentParent = sourceElement.parentElement;

        while (currentParent) {
            console.log(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 检查父级:`, currentParent.className || currentParent.tagName);

            // 检查当前父级是否包含目标类名的元素
            const hasTargetClass = currentParent.querySelector(`.${targetClass}`) !== null;

            if (hasTargetClass) {
                console.log(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 找到包含 .${targetClass} 的父级:`, currentParent.className || currentParent.tagName);
                return currentParent;
            }

            // 防止越过模板边界
            if (currentParent.hasAttribute('data-template-id') ||
                currentParent.hasAttribute('data-module-type')) {
                console.log(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 到达模板边界，停止向上查找`);
                break;
            }

            // 继续向上一级父级查找
            currentParent = currentParent.parentElement;

            // 防止无限向上查找
            if (!currentParent || currentParent === document.body || currentParent === document.documentElement) {
                console.log(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 到达文档边界，停止查找`);
                break;
            }
        }

        console.warn(`[${this.extensionName}] FIND-PARENT-WITH-CLASS: 找不到包含 .${targetClass} 的父级容器`);
        return null;
    }

    /**
     * 设置切换元素的初始状态
     * @param {Element} targetElement - 目标元素
     * @param {Element} sourceElement - 源元素
     * @param {boolean} shouldShow - 是否应该显示
     * @param {string} animation - 动画效果
     */
    setInitialToggleState(targetElement, sourceElement, shouldShow, animation) {
        const indicator = sourceElement.querySelector('.toggle-indicator');

        if (shouldShow) {
            // 设置为显示状态
            this.showElement(targetElement, 'none'); // 初始化时不使用动画
            // 不再修改textContent，只通过CSS类控制旋转
            sourceElement.classList.add('toggle-expanded');
            sourceElement.classList.remove('toggle-collapsed');
            console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 初始状态设置为显示`);
        } else {
            // 设置为隐藏状态
            this.hideElement(targetElement, 'none'); // 初始化时不使用动画
            // 不再修改textContent，只通过CSS类控制旋转
            sourceElement.classList.add('toggle-collapsed');
            sourceElement.classList.remove('toggle-expanded');
            console.log(`[${this.extensionName}] TOGGLE-WRAPPER: 初始状态设置为隐藏`);
        }
    }

    /**
     * 显示元素（带动画）
     */
    showElement(element, animation) {
        element.style.display = '';
        element.classList.remove('hidden');
        element.removeAttribute('data-hidden');

        switch (animation) {
            case 'fade':
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.3s ease-in-out';
                setTimeout(() => element.style.opacity = '1', 10);
                break;
            case 'slide':
                element.style.maxHeight = '0';
                element.style.overflow = 'hidden';
                element.style.transition = 'max-height 0.3s ease-in-out';
                setTimeout(() => element.style.maxHeight = element.scrollHeight + 'px', 10);
                break;
        }
    }

    /**
     * 隐藏元素（带动画）
     */
    hideElement(element, animation) {
        switch (animation) {
            case 'fade':
                element.style.transition = 'opacity 0.3s ease-in-out';
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.classList.add('hidden');
                }, 300);
                break;
            case 'slide':
                element.style.transition = 'max-height 0.3s ease-in-out';
                element.style.maxHeight = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.classList.add('hidden');
                }, 300);
                break;
            default:
                element.style.display = 'none';
                element.classList.add('hidden');
                break;
        }
    }

    /**
     * 应用展开效果
     */
    applyExpandEffect(element, effect) {
        switch (effect) {
            case 'slide-down':
                element.style.maxHeight = element.scrollHeight + 'px';
                element.style.opacity = '1';
                break;
            case 'fade-in':
                element.style.opacity = '1';
                break;
            case 'expand':
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
                break;
        }
    }

    /**
     * 应用收起效果
     */
    applyCollapseEffect(element, effect) {
        switch (effect) {
            case 'slide-down':
                element.style.maxHeight = '0';
                element.style.opacity = '0';
                break;
            case 'fade-in':
                element.style.opacity = '0';
                break;
            case 'expand':
                element.style.transform = 'scale(0.8)';
                element.style.opacity = '0';
                break;
        }
    }

    /**
     * 应用滑出效果
     */
    applySlidOut(element, direction) {
        const transforms = {
            'up': 'translateY(-100%)',
            'down': 'translateY(100%)',
            'left': 'translateX(-100%)',
            'right': 'translateX(100%)'
        };

        element.style.transform = transforms[direction] || transforms.down;
        element.style.opacity = '0';
    }

    /**
     * 应用滑入效果
     */
    applySlideIn(element, direction) {
        element.style.transform = 'translate(0, 0)';
        element.style.opacity = '1';
    }

    /**
     * 创建NPC信息模态窗口
     */
    createNPCInfoModal(npc, template) {
        const avatar = npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '';

        return `
            <div class="npc-info-modal-content">
                <div class="modal-header">
                    <h3 class="npc-info-title">${npc.name}</h3>
                    <button class="modal-close-btn" onclick="sharingFunctions.closeActiveModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="npc-info-avatar">
                        ${avatar ? `<img src="${avatar}" alt="${npc.name}" class="npc-avatar-large">` : ''}
                    </div>
                    <div class="npc-info-details">
                        <div class="npc-description">${npc.description || '暂无描述'}</div>
                        ${template === 'detailed' ? `
                            <div class="npc-extra-info">
                                <div class="npc-personality">性格: ${npc.personality || '未知'}</div>
                                <div class="npc-scenario">背景: ${npc.scenario || '未知'}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示模态窗口
     */
    showModal(content, className = 'custom-modal') {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = `sharing-modal-overlay ${className}`;
        modalOverlay.innerHTML = `
            <div class="sharing-modal">
                ${content}
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this.activeModal = modalOverlay;

        // 点击遮罩关闭
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeActiveModal();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', this.handleModalEscapeKey.bind(this));
    }

    /**
     * 关闭当前模态窗口
     */
    closeActiveModal() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
            document.removeEventListener('keydown', this.handleModalEscapeKey.bind(this));
        }
    }

    /**
     * 关闭当前工具提示
     */
    closeActiveTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
            document.removeEventListener('click', this.handleTooltipOutsideClick.bind(this));
        }
    }

    /**
     * 简单工具提示
     */
    showSimpleTooltip(message, sourceElement, event) {
        this.tooltipShow(message, 'top', sourceElement, event);
    }

    /**
     * 清除搜索高亮
     */
    clearSearchHighlights() {
        const highlightedElements = document.querySelectorAll('.has-highlight');
        highlightedElements.forEach(element => {
            element.innerHTML = element.textContent;
            element.classList.remove('has-highlight');
        });

        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    /**
     * 获取模态模板
     */
    getModalTemplate(templateId, data) {
        // 这里可以根据templateId返回不同的预定义模板
        switch (templateId) {
            case 'simple-info':
                return `<div class="simple-info-modal">${data.message || '信息'}</div>`;
            default:
                return `<div class="default-modal">${templateId}</div>`;
        }
    }

    /**
     * 处理模态窗口ESC键
     */
    handleModalEscapeKey(event) {
        if (event.key === 'Escape') {
            this.closeActiveModal();
        }
    }

    /**
     * 处理工具提示外部点击
     */
    handleTooltipOutsideClick(event) {
        if (this.activeTooltip && !this.activeTooltip.contains(event.target)) {
            this.closeActiveTooltip();
        }
    }

    /**
     * 清理所有绑定和状态
     */
    cleanup() {
        this.closeActiveModal();
        this.closeActiveTooltip();
        this.clearSearchHighlights();

        // 移除所有功能绑定
        const functionElements = document.querySelectorAll('[data-function-bound="true"]');
        functionElements.forEach(element => {
            element.removeAttribute('data-function-bound');
            element.removeAttribute('data-initial-state-set');
            element.style.cursor = '';
            element.style.userSelect = '';
        });
    }
}

// 创建全局实例
const sharingFunctions = new SharingFunctions();

// 导出实例和类
export { SharingFunctions, sharingFunctions };

// 使其在全局可访问（用于HTML onclick等）
globalThis.sharingFunctions = sharingFunctions;
