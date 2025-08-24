/**
 * 自定义Handlebars模板渲染器
 * 专门为聊天元素主题系统设计
 */

// 导入Handlebars和DOMPurify（从ST的lib.js）
import { Handlebars, DOMPurify } from '../../../../lib.js';

export class TemplateRenderer {
    constructor() {
        this.templateCache = new Map();
        this.registerCustomHelpers();
        console.log('[cyberpunk2027-hubs] [TemplateRenderer] Handlebars渲染器初始化完成');
    }

    /**
     * 注册自定义Helper函数
     */
    registerCustomHelpers() {
        // 清除可能存在的旧Helper（避免重复注册）
        try {
            Handlebars.unregisterHelper('ifExists');
            Handlebars.unregisterHelper('ifNotEmpty');
            Handlebars.unregisterHelper('safeEach');
        } catch (e) {
            // 忽略错误，第一次注册时会失败
        }

        // Helper: 检查值是否存在且不为空（增强版本）
        Handlebars.registerHelper('ifExists', function(value, options) {
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifExists called with:', value, typeof value);
            
            // 检查各种空值情况，包括空白字符
            if (value === null || value === undefined || value === 'undefined' || value === 'null') {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifExists: value is null/undefined/string-null, rendering inverse');
                return options.inverse(this);
            }
            
            // 对于字符串，检查trim后是否为空
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
                    console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifExists: value is empty/null string (after trim), rendering inverse');
                    return options.inverse(this);
                }
            }
            
            // 对于数组，检查是否为空数组
            if (Array.isArray(value) && value.length === 0) {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifExists: array is empty, rendering inverse');
                return options.inverse(this);
            }
            
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifExists: value exists and valid, rendering main content');
            return options.fn(this);
        });

        // Helper: 检查数组是否存在且不为空（增强版本）
        Handlebars.registerHelper('ifNotEmpty', function(array, options) {
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty called with:', array, typeof array, Array.isArray(array));
            
            // 首先检查是否为null或undefined
            if (array === null || array === undefined || array === 'undefined' || array === 'null') {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty: array is null/undefined/string-null, rendering inverse');
                return options.inverse(this);
            }
            
            // 对于字符串，检查trim后是否为空
            if (typeof array === 'string') {
                const trimmed = array.trim();
                if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
                    console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty: string is empty/null (after trim), rendering inverse');
                    return options.inverse(this);
                }
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty: string has content, rendering main content');
                return options.fn(this);
            }
            
            // 检查是否为数组且有内容
            if (Array.isArray(array) && array.length > 0) {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty: array has content, rendering main content');
                return options.fn(this);
            }
            
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] ifNotEmpty: array is empty or not array, rendering inverse');
            return options.inverse(this);
        });

        // Helper: 字符串比较
        Handlebars.registerHelper('ifEqual', function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        // Helper: 数值比较
        Handlebars.registerHelper('ifGreater', function(a, b, options) {
            if (parseFloat(a) > parseFloat(b)) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        // Helper: 字符串截取
        Handlebars.registerHelper('truncate', function(str, length) {
            if (str && str.length > length) {
                return str.substring(0, length) + '...';
            }
            return str || '';
        });

        // 注册一个安全的each helper，处理空数组或undefined
        Handlebars.registerHelper('safeEach', function(array, options) {
            if (Array.isArray(array) && array.length > 0) {
                let result = '';
                for (let i = 0; i < array.length; i++) {
                    result += options.fn(array[i]);
                }
                return result;
            } else {
                return options.inverse(this);
            }
        });

        console.log('[cyberpunk2027-hubs] [TemplateRenderer] 自定义Helper函数注册完成');
        
        // 测试Helper函数是否正确注册
        this.testHelpers();
    }

    /**
     * 测试Helper函数是否正确注册
     */
    testHelpers() {
        try {
            // 测试 ifExists helper
            const testTemplate1 = '{{#ifExists testValue}}exists{{else}}not exists{{/ifExists}}';
            const compiled1 = Handlebars.compile(testTemplate1);
            const result1 = compiled1({ testValue: 'test' });
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] Helper test - ifExists with value:', result1);
            
            const result2 = compiled1({ testValue: '' });
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] Helper test - ifExists with empty:', result2);
            
            // 测试 ifNotEmpty helper
            const testTemplate2 = '{{#ifNotEmpty testArray}}has content{{else}}empty{{/ifNotEmpty}}';
            const compiled2 = Handlebars.compile(testTemplate2);
            const result3 = compiled2({ testArray: ['item1'] });
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] Helper test - ifNotEmpty with array:', result3);
            
            const result4 = compiled2({ testArray: [] });
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] Helper test - ifNotEmpty with empty array:', result4);
            
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] 所有Helper函数测试通过');
        } catch (error) {
            console.error('[cyberpunk2027-hubs] [TemplateRenderer] Helper函数测试失败:', error);
        }
    }

    /**
     * 渲染模板
     * @param {string} templateString - 模板字符串
     * @param {Object} data - 数据对象
     * @param {Object} options - 渲染选项
     * @returns {string} 渲染后的HTML
     */
    render(templateString, data, options = {}) {
        const {
            sanitize = true,           // 是否进行安全过滤
            cache = true,              // 是否使用缓存
            debug = false              // 是否输出调试信息
        } = options;

        try {
            if (debug) {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 开始渲染模板');
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 模板内容:', templateString.substring(0, 200) + '...');
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 数据对象:', data);
                
                // 检查数据对象中的关键字段
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 数据检查:');
                console.log('  - NPC_LIST:', data.NPC_LIST, Array.isArray(data.NPC_LIST));
                console.log('  - NPC_SPECIFIC:', data.NPC_SPECIFIC);
                console.log('  - USER_NAME:', data.USER_NAME);
            }

            // 检查模板缓存
            let compiledTemplate;
            const cacheKey = this.generateCacheKey(templateString);

            if (cache && this.templateCache.has(cacheKey)) {
                compiledTemplate = this.templateCache.get(cacheKey);
                if (debug) console.log('[cyberpunk2027-hubs] [TemplateRenderer] 使用缓存的模板');
            } else {
                // 编译模板
                try {
                    compiledTemplate = Handlebars.compile(templateString);
                    if (cache) {
                        this.templateCache.set(cacheKey, compiledTemplate);
                        if (debug) console.log('[cyberpunk2027-hubs] [TemplateRenderer] 模板已编译并缓存');
                    }
                } catch (compileError) {
                    console.error('[cyberpunk2027-hubs] [TemplateRenderer] 模板编译失败:', compileError);
                    console.error('[cyberpunk2027-hubs] [TemplateRenderer] 问题模板:', templateString);
                    throw new Error(`模板编译失败: ${compileError.message}`);
                }
            }

            // 渲染模板
            let result;
            try {
                if (debug) console.log('[cyberpunk2027-hubs] [TemplateRenderer] 开始执行模板渲染...');
                result = compiledTemplate(data);
                if (debug) console.log('[cyberpunk2027-hubs] [TemplateRenderer] 模板渲染成功');
            } catch (renderError) {
                console.error('[cyberpunk2027-hubs] [TemplateRenderer] 模板渲染失败:', renderError);
                console.error('[cyberpunk2027-hubs] [TemplateRenderer] 渲染数据:', data);
                console.error('[cyberpunk2027-hubs] [TemplateRenderer] 模板内容:', templateString.substring(0, 500));
                throw new Error(`模板渲染失败: ${renderError.message}`);
            }

            // 安全过滤
            if (sanitize) {
                result = DOMPurify.sanitize(result);
                if (debug) console.log('[cyberpunk2027-hubs] [TemplateRenderer] 已进行安全过滤');
            }

            if (debug) {
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 渲染完成');
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 结果长度:', result.length);
                console.log('[cyberpunk2027-hubs] [TemplateRenderer] 结果预览:', result.substring(0, 300) + '...');
            }

            return result;

        } catch (error) {
            console.error('[cyberpunk2027-hubs] [TemplateRenderer] 渲染过程失败:', error);
            console.error('[cyberpunk2027-hubs] [TemplateRenderer] 错误堆栈:', error.stack);
            console.error('[cyberpunk2027-hubs] [TemplateRenderer] 模板内容:', templateString);
            console.error('[cyberpunk2027-hubs] [TemplateRenderer] 数据对象:', data);

            // 返回错误提示而不是抛出异常
            return `<div class="template-error" style="color: red; border: 1px solid red; padding: 10px; margin: 5px;">
                模板渲染失败: ${error.message}
                <br>请检查控制台获取详细错误信息
            </div>`;
        }
    }

    /**
     * 生成缓存键
     * @param {string} templateString - 模板字符串
     * @returns {string} 缓存键
     */
    generateCacheKey(templateString) {
        // 使用模板内容的hash作为缓存键
        let hash = 0;
        for (let i = 0; i < templateString.length; i++) {
            const char = templateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return `template_${hash}`;
    }

    /**
     * 清除模板缓存
     * @param {string|null} cacheKey - 指定缓存键，null表示清除所有
     */
    clearCache(cacheKey = null) {
        if (cacheKey) {
            this.templateCache.delete(cacheKey);
            console.log(`[cyberpunk2027-hubs] [TemplateRenderer] 已清除缓存: ${cacheKey}`);
        } else {
            this.templateCache.clear();
            console.log('[cyberpunk2027-hubs] [TemplateRenderer] 已清除所有模板缓存');
        }
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计
     */
    getCacheStats() {
        return {
            size: this.templateCache.size,
            keys: Array.from(this.templateCache.keys())
        };
    }

    /**
     * 预编译模板（用于性能优化）
     * @param {string} templateString - 模板字符串
     * @returns {string} 缓存键
     */
    precompile(templateString) {
        const cacheKey = this.generateCacheKey(templateString);
        if (!this.templateCache.has(cacheKey)) {
            const compiledTemplate = Handlebars.compile(templateString);
            this.templateCache.set(cacheKey, compiledTemplate);
            console.log(`[cyberpunk2027-hubs] [TemplateRenderer] 模板预编译完成: ${cacheKey}`);
        }
        return cacheKey;
    }
}

// 导出单例实例（如果需要全局共享）
export const templateRenderer = new TemplateRenderer();
