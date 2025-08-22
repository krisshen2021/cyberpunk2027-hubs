/**
 * 数据类型查找函数库
 * 专门处理各种数据类型的属性查找和处理逻辑
 * 保持index.js的简洁性
 */

// 导入ST系统的必要函数
import { characters, this_chid, getThumbnailUrl } from '../../../script.js';

/**
 * 数据类型查找函数管理类
 */
export class DataTypeFunctions {
    constructor() {
        this.extensionName = 'cyberpunk2027-hubs';
    }

    // ===================================
    // NPC 相关查找函数
    // ===================================

    /**
     * 根据名称在角色库中查找NPC
     * @param {string} npcName - NPC名称
     * @returns {Object|null} 找到的角色对象
     */
    findNPCByName(npcName) {
        if (!npcName || !characters) return null;

        try {
            // 精确匹配
            let npc = characters.find(char => char.name === npcName);

            // 如果没找到，尝试模糊匹配
            if (!npc) {
                npc = characters.find(char =>
                    char.name.toLowerCase().includes(npcName.toLowerCase()) ||
                    npcName.toLowerCase().includes(char.name.toLowerCase())
                );
            }

            console.log(`[${this.extensionName}] NPC-LOOKUP: Found NPC "${npcName}":`, npc ? npc.name : 'Not found');
            return npc;
        } catch (error) {
            console.warn(`[${this.extensionName}] NPC-LOOKUP: Error finding NPC "${npcName}":`, error);
            return null;
        }
    }

    /**
     * 获取NPC头像URL
     * @param {string} npcName - NPC名称
     * @returns {string} 头像URL或空字符串
     */
    findNPCAvatar(npcName) {
        const npc = this.findNPCByName(npcName);
        return npc && npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '';
    }

    // ===================================
    // 物品 相关查找函数 (待实现)
    // ===================================

    /**
     * 查找物品图标
     * @param {string} itemName - 物品名称
     * @returns {string} 图标URL
     */
    findItemIcon(itemName) {
        // TODO: 实现物品图标查找逻辑
        // 可以从游戏数据库、配置文件或API查找

        // 临时实现：返回默认图标
        console.log(`[${this.extensionName}] ITEM-LOOKUP: Finding icon for "${itemName}"`);

        // 示例：可以根据物品名称返回不同图标
        const itemIconMap = {
            '剑': '⚔️',
            '盾': '🛡️',
            '药水': '🧪',
            '头盔': '⛑️',
            '胸甲': '🦺',
            // 更多映射...
        };

        return itemIconMap[itemName] || '📦'; // 默认物品图标
    }

    /**
     * 查找物品稀有度
     * @param {string} itemName - 物品名称
     * @returns {string} 稀有度等级
     */
    findItemRarity(itemName) {
        // TODO: 实现物品稀有度查找逻辑

        console.log(`[${this.extensionName}] ITEM-LOOKUP: Finding rarity for "${itemName}"`);

        // 示例：根据物品名称返回稀有度
        const itemRarityMap = {
            '传说之剑': 'legendary',
            '龙鳞盾': 'epic',
            '治疗药水': 'common',
            '魔法头盔': 'rare',
            // 更多映射...
        };

        return itemRarityMap[itemName] || 'common';
    }

    /**
     * 查找物品价值
     * @param {string} itemName - 物品名称
     * @returns {number} 物品价值
     */
    findItemValue(itemName) {
        // TODO: 实现物品价值查找逻辑
        console.log(`[${this.extensionName}] ITEM-LOOKUP: Finding value for "${itemName}"`);
        return 0; // 默认价值
    }

    // ===================================
    // 技能 相关查找函数 (待实现)
    // ===================================

    /**
     * 查找技能等级
     * @param {string} skillName - 技能名称
     * @returns {number} 技能等级
     */
    findSkillLevel(skillName) {
        // TODO: 从角色数据或技能系统查找
        console.log(`[${this.extensionName}] SKILL-LOOKUP: Finding level for "${skillName}"`);

        // 示例实现
        const skillLevelMap = {
            '火球术': 5,
            '治疗术': 3,
            '闪现': 7,
            // 更多映射...
        };

        return skillLevelMap[skillName] || 1;
    }

    /**
     * 查找技能冷却时间
     * @param {string} skillName - 技能名称
     * @returns {number} 冷却时间（秒）
     */
    findSkillCooldown(skillName) {
        // TODO: 从技能数据库查找
        console.log(`[${this.extensionName}] SKILL-LOOKUP: Finding cooldown for "${skillName}"`);

        const skillCooldownMap = {
            '火球术': 3,
            '治疗术': 5,
            '闪现': 10,
            // 更多映射...
        };

        return skillCooldownMap[skillName] || 0;
    }

    /**
     * 查找技能魔法消耗
     * @param {string} skillName - 技能名称
     * @returns {number} 魔法消耗
     */
    findSkillManaCost(skillName) {
        // TODO: 实现技能魔法消耗查找
        console.log(`[${this.extensionName}] SKILL-LOOKUP: Finding mana cost for "${skillName}"`);
        return 0;
    }

    // ===================================
    // 地点 相关查找函数 (待实现)
    // ===================================

    /**
     * 查找地点距离
     * @param {string} locationName - 地点名称
     * @returns {string} 距离描述
     */
    findLocationDistance(locationName) {
        // TODO: 实现地点距离计算
        console.log(`[${this.extensionName}] LOCATION-LOOKUP: Finding distance to "${locationName}"`);
        return 'unknown';
    }

    /**
     * 查找地点类型
     * @param {string} locationName - 地点名称
     * @returns {string} 地点类型
     */
    findLocationType(locationName) {
        // TODO: 实现地点类型查找
        console.log(`[${this.extensionName}] LOCATION-LOOKUP: Finding type for "${locationName}"`);

        const locationTypeMap = {
            '咖啡厅': 'shop',
            '图书馆': 'public',
            '家': 'residence',
            '办公室': 'workplace',
            // 更多映射...
        };

        return locationTypeMap[locationName] || 'unknown';
    }

    // ===================================
    // 通用属性查找函数
    // ===================================

    /**
     * 根据属性名称动态查找属性值
     * @param {string} propName - 属性名称
     * @param {string} itemName - 项目名称
     * @param {string} itemType - 项目类型 (npc/item/skill/location)
     * @returns {any} 属性值
     */
    findPropertyValue(propName, itemName, itemType = 'unknown') {
        console.log(`[${this.extensionName}] PROPERTY-LOOKUP: Finding ${propName} for ${itemType} "${itemName}"`);

        // 根据属性名称调用对应的查找函数
        switch (propName) {
            // NPC 属性
            case 'avatar':
                return this.findNPCAvatar(itemName);

            // 物品 属性
            case 'icon':
                return this.findItemIcon(itemName);
            case 'rarity':
                return this.findItemRarity(itemName);
            case 'value':
                return this.findItemValue(itemName);

            // 技能 属性
            case 'level':
                return this.findSkillLevel(itemName);
            case 'cooldown':
                return this.findSkillCooldown(itemName);
            case 'mana_cost':
                return this.findSkillManaCost(itemName);

            // 地点 属性
            case 'distance':
                return this.findLocationDistance(itemName);
            case 'type':
                return this.findLocationType(itemName);

            // 通用属性
            case 'name':
                return itemName; // 名称就是自身

            default:
                console.warn(`[${this.extensionName}] PROPERTY-LOOKUP: Unknown property "${propName}" for ${itemType}`);
                return '';
        }
    }

    // ===================================
    // 扩展辅助函数
    // ===================================

    /**
     * 批量查找多个属性
     * @param {string[]} propNames - 属性名称数组
     * @param {string} itemName - 项目名称
     * @param {string} itemType - 项目类型
     * @returns {Object} 属性值对象
     */
    findMultipleProperties(propNames, itemName, itemType = 'unknown') {
        const result = { name: itemName };

        propNames.forEach(propName => {
            if (propName !== 'name') { // name已经设置
                result[propName] = this.findPropertyValue(propName, itemName, itemType);
            }
        });

        return result;
    }

    /**
     * 检查属性是否支持
     * @param {string} propName - 属性名称
     * @returns {boolean} 是否支持
     */
    isPropertySupported(propName) {
        const supportedProperties = [
            'name', 'avatar', 'icon', 'rarity', 'value',
            'level', 'cooldown', 'mana_cost', 'distance', 'type'
        ];
        return supportedProperties.includes(propName);
    }
}

// 导出单例实例
export const dataTypeFunctions = new DataTypeFunctions();

// 为了向后兼容，也导出单独的函数
export function findNPCByName(npcName) {
    return dataTypeFunctions.findNPCByName(npcName);
}

export function findItemIcon(itemName) {
    return dataTypeFunctions.findItemIcon(itemName);
}

export function findItemRarity(itemName) {
    return dataTypeFunctions.findItemRarity(itemName);
}

export function findSkillLevel(skillName) {
    return dataTypeFunctions.findSkillLevel(skillName);
}

export function findSkillCooldown(skillName) {
    return dataTypeFunctions.findSkillCooldown(skillName);
}

export function findLocationDistance(locationName) {
    return dataTypeFunctions.findLocationDistance(locationName);
}

export function findLocationType(locationName) {
    return dataTypeFunctions.findLocationType(locationName);
}
