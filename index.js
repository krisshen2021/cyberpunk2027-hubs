// Cyberpunk 2027 Theme - index.js

import { extension_settings, renderExtensionTemplateAsync, getContext } from '../../../extensions.js';
import { saveSettingsDebounced, eventSource, event_types, characters, this_chid, getThumbnailUrl, getRequestHeaders, name1 } from '../../../../script.js';
import { power_user } from '../../../power-user.js';
import { executeSlashCommandsWithOptions } from '../../../slash-commands.js';
import { user_avatar } from '../../../personas.js';
import { TemplateRenderer } from './handlebars-renderer.js';
import { dataTypeFunctions } from './function_types.js';
import { sharingFunctions } from './sharing_functions.js';

const extensionName = 'third-party/cyberpunk2027-hubs';
const extensionTitle = 'CYBERPUNK 2027 HUBS'

// 初始化Handlebars渲染器实例
const templateRenderer = new TemplateRenderer();

// Chat style values - use values that don't conflict with ST's defaults
const CYBERPUNK_CHAT_STYLES = {
    MATRIX: 8,      // Matrix Terminal style
    NEURAL: 9       // Neural Holographic style
};

// Global variable to store theme defaults
let cyberpunkThemeDefaults = {
    blur_strength: 10,
    shadow_width: 2,
    font_scale: 1
};

// Default settings
const defaultSettings = {
    enabled: false,
    layout: 'decker',
    style: 'noir',
    // Custom configuration values (override theme defaults)
    custom: {
        blur_strength: null,    // null = use theme default
        shadow_width: null,     // null = use theme default
        font_scale: null        // null = use theme default
    },
    // Chat style settings
    chat_style_enabled: false,  // Whether custom chat styles are enabled
    chat_style: null,           // null = use ST default, or CYBERPUNK_CHAT_STYLES values
    // Character background settings
    character_backgrounds: true,  // Enable character avatar backgrounds in Tyrell layout
    // AI-generated background settings
    ai_backgrounds: false,              // Enable AI-generated backgrounds
    ai_bg_auto: false,                  // Auto-generate backgrounds based on context
    ai_bg_interval: 10,                 // Auto trigger interval (message count)
    ai_bg_cache_limit: 100,             // Cache entry limit
    ai_bg_cache_expire_days: 10,        // Cache expiration days
    ai_bg_width: 1024,                  // Image generation width
    ai_bg_height: 768,                  // Image generation height
    ai_background_cache: [],            // Background cache array
    // Video background settings
    video_background: true,             // Enable video background on homepage
    video_bg_loop: true,                // Loop video playback
    // Template rendering settings
    template_rendering: false,          // Enable template rendering system
    template_theme: 'cyberpunk',        // Current template theme
    template_modules: {                 // Enabled modules per theme
        'cyberpunk': {
            'scene-container': true,
            'combat-interface': true
        },
        'ai-warrior': {
            'scene-container': true
        }
    }
};

// Initialize extension settings
function initSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};

    // Merge with defaults, ensuring custom object exists
    const currentSettings = extension_settings[extensionName];
    if (Object.keys(currentSettings).length === 0) {
        Object.assign(currentSettings, defaultSettings);
    }

    // Ensure custom object exists (for existing users upgrading)
    if (!currentSettings.custom) {
        currentSettings.custom = {
            blur_strength: null,
            shadow_width: null,
            font_scale: null
        };
    }

    // Ensure chat style settings exist (for existing users upgrading)
    if (typeof currentSettings.chat_style_enabled === 'undefined') {
        currentSettings.chat_style_enabled = false;
    }
    if (typeof currentSettings.chat_style === 'undefined') {
        currentSettings.chat_style = null;
    }

    // Ensure character background settings exist (for existing users upgrading)
    if (typeof currentSettings.character_backgrounds === 'undefined') {
        currentSettings.character_backgrounds = true;
    }

    // Ensure AI background settings exist (for existing users upgrading)
    if (typeof currentSettings.ai_backgrounds === 'undefined') {
        currentSettings.ai_backgrounds = false;
    }
    if (typeof currentSettings.ai_bg_auto === 'undefined') {
        currentSettings.ai_bg_auto = false;
    }
    if (typeof currentSettings.ai_bg_interval === 'undefined') {
        currentSettings.ai_bg_interval = 10;
    }
    if (typeof currentSettings.ai_bg_cache_limit === 'undefined') {
        currentSettings.ai_bg_cache_limit = 100;
    }
    if (typeof currentSettings.ai_bg_cache_expire_days === 'undefined') {
        currentSettings.ai_bg_cache_expire_days = 10;
    }
    if (typeof currentSettings.ai_bg_width === 'undefined') {
        currentSettings.ai_bg_width = 1024;
    }
    if (typeof currentSettings.ai_bg_height === 'undefined') {
        currentSettings.ai_bg_height = 768;
    }
    if (!Array.isArray(currentSettings.ai_background_cache)) {
        currentSettings.ai_background_cache = [];
    }

    // Ensure video background settings exist (for existing users upgrading)
    if (typeof currentSettings.video_background === 'undefined') {
        currentSettings.video_background = true;
    }
    if (typeof currentSettings.video_bg_loop === 'undefined') {
        currentSettings.video_bg_loop = true;
    }
}

// Function to apply the selected layout
function applyCyberpunkLayout(layout) {
    // Remove all layout classes first
    document.body.classList.remove('cp2027-layout-decker', 'cp2027-layout-tyrell');

    if (layout === 'tyrell') {
        document.body.classList.add('cp2027-layout-tyrell');
        console.log(`[${extensionName}] Applied Tyrell Cockpit layout (vertical navigation)`);
    } else {
        document.body.classList.add('cp2027-layout-decker');
        console.log(`[${extensionName}] Applied Decker's Dream layout (enhanced default)`);
    }
}

// Function to apply the selected visual style
function applyCyberpunkStyle(style) {
    document.body.classList.remove('cp2027-style-noir', 'cp2027-style-rust');
    if (style === 'rust') {
        document.body.classList.add('cp2027-style-rust');
        loadThemeConfig('rust');
    } else {
        document.body.classList.add('cp2027-style-noir');
        loadThemeConfig('noir');
    }
}

// Function to load and apply theme configuration
async function loadThemeConfig(style) {
    try {
        const fileName = style === 'rust' ?
            'cyberpunk2027-rust-chrome.json' :
            'cyberpunk2027-neon-noir.json';

        const response = await fetch(`/scripts/extensions/${extensionName}/theme/${fileName}`);
        if (!response.ok) {
            console.warn(`[${extensionName}] Failed to load theme config: ${fileName}`);
            return;
        }

        const themeConfig = await response.json();
        const settings = extension_settings[extensionName];

        // Apply color variables to SillyTavern's core CSS variables
        if (themeConfig.main_text_color) {
            document.documentElement.style.setProperty('--SmartThemeBodyColor', themeConfig.main_text_color);
        }
        if (themeConfig.italics_text_color) {
            document.documentElement.style.setProperty('--SmartThemeEmColor', themeConfig.italics_text_color);
        }
        if (themeConfig.underline_text_color) {
            document.documentElement.style.setProperty('--SmartThemeUnderlineColor', themeConfig.underline_text_color);
        }
        if (themeConfig.quote_text_color) {
            document.documentElement.style.setProperty('--SmartThemeQuoteColor', themeConfig.quote_text_color);
        }
        if (themeConfig.blur_tint_color) {
            document.documentElement.style.setProperty('--SmartThemeBlurTintColor', themeConfig.blur_tint_color);
        }
        if (themeConfig.chat_tint_color) {
            document.documentElement.style.setProperty('--SmartThemeChatTintColor', themeConfig.chat_tint_color);
        }
        if (themeConfig.user_mes_blur_tint_color) {
            document.documentElement.style.setProperty('--SmartThemeUserMesBlurTintColor', themeConfig.user_mes_blur_tint_color);
        }
        if (themeConfig.bot_mes_blur_tint_color) {
            document.documentElement.style.setProperty('--SmartThemeBotMesBlurTintColor', themeConfig.bot_mes_blur_tint_color);
        }
        if (themeConfig.shadow_color) {
            document.documentElement.style.setProperty('--SmartThemeShadowColor', themeConfig.shadow_color);
        }
        if (themeConfig.border_color) {
            document.documentElement.style.setProperty('--SmartThemeBorderColor', themeConfig.border_color);
        }

        // Apply system settings - prioritize custom values over theme defaults
        // Blur Strength
        const blurValue = settings.custom?.blur_strength !== null ?
            settings.custom.blur_strength :
            parseFloat(themeConfig.blur_strength?.replace('px', '') || '10');
        applyConfigValue('blur_strength', blurValue);

        // Shadow Width
        const shadowValue = settings.custom?.shadow_width !== null ?
            settings.custom.shadow_width :
            parseFloat(themeConfig.shadow_width?.replace('px', '') || '2');
        applyConfigValue('shadow_width', shadowValue);

        // Font Scale
        const fontScale = settings.custom?.font_scale !== null ?
            settings.custom.font_scale :
            parseFloat(themeConfig.font_scale || '1');
        applyConfigValue('font_scale', fontScale);

        if (themeConfig.main_font_size) {
            const fontSize = parseFloat(themeConfig.main_font_size.replace('px', ''));
            document.documentElement.style.setProperty('--mainFontSize', `calc(${fontScale} * ${fontSize}px)`);
        }

        // Update UI controls to show current values
        updateControlValues(blurValue, shadowValue, fontScale);

        // Store theme defaults for reset functionality
        cyberpunkThemeDefaults = {
            blur_strength: parseFloat(themeConfig.blur_strength?.replace('px', '') || '10'),
            shadow_width: parseFloat(themeConfig.shadow_width?.replace('px', '') || '2'),
            font_scale: parseFloat(themeConfig.font_scale || '1')
        };

        // Save settings to persist changes
        if (typeof saveSettingsDebounced === 'function') {
            saveSettingsDebounced();
        }

        console.log(`[${extensionName}] Applied ${style} theme configuration and synced to ST settings`);
        console.log(`[${extensionName}] - Blur: ${blurValue}px, Shadow: ${shadowValue}px, Font Scale: ${fontScale}`);

    } catch (error) {
        console.error(`[${extensionName}] Error loading theme config:`, error);
    }
}

// Function to apply a single configuration value
function applyConfigValue(type, value) {
    console.log(`[DEBUG] applyConfigValue called with type: ${type}, value: ${value}`);
    if (type === 'blur_strength') {
        document.documentElement.style.setProperty('--blurStrength', value.toString());
        document.documentElement.style.setProperty('--SmartThemeBlurStrength', `calc(${value} * 1px)`);
        if (typeof power_user !== 'undefined') {
            // power_user.blur_strength = value;
            console.log(`[DEBUG] Updated power_user.blur_strength but skipping ST native controls`);
            // 移除对ST原生控件的设置，避免事件冲突
            $('#blur_strength_counter').val(value);
            $('#blur_strength').val(value);
        }
    } else if (type === 'shadow_width') {
        document.documentElement.style.setProperty('--shadowWidth', value.toString());
        if (typeof power_user !== 'undefined') {
            // power_user.shadow_width = value;
            console.log(`[DEBUG] Updated power_user.shadow_width but skipping ST native controls`);
            // 移除对ST原生控件的设置，避免事件冲突
            $('#shadow_width_counter').val(value);
            $('#shadow_width').val(value);
        }
    } else if (type === 'font_scale') {
        document.documentElement.style.setProperty('--fontScale', value.toString());
        if (typeof power_user !== 'undefined') {
            // power_user.font_scale = value;
            console.log(`[DEBUG] Updated power_user.font_scale but skipping ST native controls`);
            // 移除对ST原生控件的设置，避免事件冲突
            $('#font_scale_counter').val(value);
            $('#font_scale').val(value);
        }
    }
}

// Function to update control values in UI
function updateControlValues(blur, shadow, font) {
    $('#cyberpunk_blur_strength').val(blur);
    $('#cyberpunk_blur_strength_number').val(blur);
    $('#cyberpunk_shadow_width').val(shadow);
    $('#cyberpunk_shadow_width_number').val(shadow);
    $('#cyberpunk_font_scale').val(font);
    $('#cyberpunk_font_scale_number').val(font);
}

// Event handlers for configuration controls
function onConfigChange(type, value) {
    console.log(`[DEBUG] onConfigChange called with type: ${type}, value: ${value}`);
    const settings = extension_settings[extensionName];
    if (!settings.custom) settings.custom = {};

    // Store the custom value
    settings.custom[type] = parseFloat(value);

    // Apply the change immediately if theme is active
    if (settings.enabled) {
        console.log(`[DEBUG] Theme is enabled, applying config value for ${type}`);
        applyConfigValue(type, parseFloat(value));

        // Update font size calculation if font scale changed
        if (type === 'font_scale') {
            const fontSize = 15; // Base font size from theme config
            document.documentElement.style.setProperty('--mainFontSize', `calc(${value} * ${fontSize}px)`);
        }
    }

    console.log(`[DEBUG] Calling saveSettingsDebounced for ${type}`);
    saveSettingsDebounced();
}

// Functions for custom chat styles
function addCyberpunkChatStyleOptions() {
    const chatDisplaySelect = document.getElementById('chat_display');
    if (!chatDisplaySelect) {
        console.warn(`[${extensionName}] Chat display select not found`);
        return;
    }

    // Check if our options already exist
    const existingMatrix = chatDisplaySelect.querySelector(`option[value="${CYBERPUNK_CHAT_STYLES.MATRIX}"]`);
    const existingNeural = chatDisplaySelect.querySelector(`option[value="${CYBERPUNK_CHAT_STYLES.NEURAL}"]`);

    if (!existingMatrix) {
        const matrixOption = document.createElement('option');
        matrixOption.value = CYBERPUNK_CHAT_STYLES.MATRIX.toString();
        matrixOption.textContent = '🖥️ Matrix Terminal';
        chatDisplaySelect.appendChild(matrixOption);
        console.log(`[${extensionName}] Added Matrix Terminal chat style option`);
    }

    if (!existingNeural) {
        const neuralOption = document.createElement('option');
        neuralOption.value = CYBERPUNK_CHAT_STYLES.NEURAL.toString();
        neuralOption.textContent = '🧠 Neural Holographic';
        chatDisplaySelect.appendChild(neuralOption);
        console.log(`[${extensionName}] Added Neural Holographic chat style option`);
    }
}

function removeCyberpunkChatStyleOptions() {
    const chatDisplaySelect = document.getElementById('chat_display');
    if (!chatDisplaySelect) return;

    // Remove our custom options
    const matrixOption = chatDisplaySelect.querySelector(`option[value="${CYBERPUNK_CHAT_STYLES.MATRIX}"]`);
    const neuralOption = chatDisplaySelect.querySelector(`option[value="${CYBERPUNK_CHAT_STYLES.NEURAL}"]`);

    if (matrixOption) {
        matrixOption.remove();
        console.log(`[${extensionName}] Removed Matrix Terminal chat style option`);
    }
    if (neuralOption) {
        neuralOption.remove();
        console.log(`[${extensionName}] Removed Neural Holographic chat style option`);
    }
}

function applyCyberpunkChatStyle() {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.chat_style_enabled) {
        // Remove any cyberpunk chat style classes
        document.body.classList.remove('matrixstyle', 'neuralstyle');
        return;
    }

    // Remove all cyberpunk chat style classes first
    document.body.classList.remove('matrixstyle', 'neuralstyle');

    // Apply the selected cyberpunk chat style
    switch (settings.chat_style) {
        case CYBERPUNK_CHAT_STYLES.MATRIX:
            document.body.classList.add('matrixstyle');
            console.log(`[${extensionName}] Applied Matrix Terminal chat style`);
            break;
        case CYBERPUNK_CHAT_STYLES.NEURAL:
            document.body.classList.add('neuralstyle');
            console.log(`[${extensionName}] Applied Neural Holographic chat style`);
            break;
        default:
            console.log(`[${extensionName}] No custom chat style applied`);
    }
}

function setupChatStyleIntegration() {
    const chatDisplaySelect = document.getElementById('chat_display');
    if (!chatDisplaySelect) {
        console.warn(`[${extensionName}] Chat display select not found, chat style integration skipped`);
        return;
    }

    // Add our change handler
    chatDisplaySelect.addEventListener('change', function () {
        const selectedValue = parseInt(this.value);
        const settings = extension_settings[extensionName];

        // Check if it's one of our custom styles
        if (Object.values(CYBERPUNK_CHAT_STYLES).includes(selectedValue)) {
            // Enable chat style and set the value
            settings.chat_style_enabled = true;
            settings.chat_style = selectedValue;

            // Apply the style
            applyCyberpunkChatStyle();

            // Save settings
            saveSettingsDebounced();

            console.log(`[${extensionName}] Selected custom chat style: ${selectedValue}`);
        } else {
            // If a non-cyberpunk style is selected, disable our custom styles
            if (settings.chat_style_enabled) {
                settings.chat_style_enabled = false;
                settings.chat_style = null;
                applyCyberpunkChatStyle(); // This will remove our classes
                saveSettingsDebounced();
                console.log(`[${extensionName}] Disabled custom chat styles`);
            }
        }
    });

    // Restore chat style selection on page load
    setTimeout(() => {
        restoreChatStyleSelection();
    }, 1000);

    console.log(`[${extensionName}] Chat style integration setup complete`);
}

// Character background functions for Tyrell layout
function getCurrentCharacterAvatar() {
    try {
        // Get chat data from ST context
        const context = getContext();
        const chatData = context.chat;

        // Early exit if we're on homepage (no character or group selected)
        if ((context.characterId === undefined || context.characterId === null) &&
            (context.groupId === undefined || context.groupId === null)) {
            return null;
        }

        // Check if chat array exists and has messages
        if (!Array.isArray(chatData) || chatData.length === 0) {
            // Only use fallback if we're actually in a character chat (not on homepage)
            if (this_chid !== undefined && characters && characters[this_chid] && context.characterId !== undefined) {
                const character = characters[this_chid];
                if (character.avatar && character.avatar !== 'none') {
                    return getThumbnailUrl('avatar', character.avatar);
                }
            }
            return null;
        }

        // Find the last message that is from a character (not user, not system)
        for (let i = chatData.length - 1; i >= 0; i--) {
            const message = chatData[i];

            // Skip user messages and system messages
            if (message.is_user || message.is_system || message.extra?.type === 'narrator') {
                continue;
            }

            // Check if message has character name and avatar
            if (message.name && message.avatar && message.avatar !== 'none') {
                return getThumbnailUrl('avatar', message.avatar);
            }

            // Fallback: if message has name but no direct avatar, try to find character by name
            if (message.name && typeof characters !== 'undefined' && Array.isArray(characters)) {
                const character = characters.find(char => char.name === message.name);
                if (character && character.avatar && character.avatar !== 'none') {
                    return getThumbnailUrl('avatar', character.avatar);
                }
            }
        }

        // If no character messages found, fallback to current session character
        // But only if we're actually in a character chat (not on homepage)
        if (this_chid !== undefined && characters && characters[this_chid] && context.characterId !== undefined) {
            const character = characters[this_chid];
            if (character.avatar && character.avatar !== 'none') {
                return getThumbnailUrl('avatar', character.avatar);
            }
        }

        return null;
    } catch (error) {
        console.error(`[${extensionName}] Error getting character avatar:`, error);
        return null;
    }
}

// Debounce helper to prevent rapid-fire calls
let backgroundUpdateTimeout = null;
let isBackgroundTransitioning = false;

// Helper function to smoothly fade out an element and execute callback
function fadeOutElement(element, duration = 500, callback = null) {
    if (!element) return;

    // Use setProperty like the working test
    element.style.setProperty('transition', `opacity ${duration / 1000}s ease-out`, 'important');

    // Small delay to ensure transition is set before changing opacity
    setTimeout(() => {
        element.style.setProperty('opacity', '0', 'important');
    }, 10);

    setTimeout(() => {
        if (callback) callback();
    }, duration + 50);
}

// Helper function to smoothly fade in an element
function fadeInElement(element, targetOpacity = 1, duration = 500) {
    if (!element) return;

    // Set initial state
    element.style.setProperty('opacity', '0', 'important');
    element.style.setProperty('transition', `opacity ${duration / 1000}s ease-in`, 'important');

    // Small delay to ensure initial state is set before starting transition
    setTimeout(() => {
        element.style.setProperty('opacity', targetOpacity.toString(), 'important');
    }, 50);
}

function updateCharacterBackground() {
    // Clear any pending updates to prevent rapid-fire calls
    if (backgroundUpdateTimeout) {
        clearTimeout(backgroundUpdateTimeout);
    }

    // Increased debounce time to reduce CPU usage
    backgroundUpdateTimeout = setTimeout(() => {
        performBackgroundUpdate();
    }, 300);
}

function performBackgroundUpdate() {
    // Prevent overlapping transitions
    if (isBackgroundTransitioning) {
        return;
    }

    try {
        const settings = extension_settings[extensionName];

        // If feature is disabled, remove any existing background
        if (!settings.enabled || settings.layout !== 'tyrell' || !settings.character_backgrounds) {
            const cyberpunkBg = document.getElementById('cyberpunk_bg');
            if (cyberpunkBg) {
                isBackgroundTransitioning = true;
                fadeOutElement(cyberpunkBg, 300, () => {
                    cyberpunkBg.remove();
                    isBackgroundTransitioning = false;
                });
            }
            return;
        }

        // Wait for required data to be available ONLY if we're not trying to close chat
        if (typeof characters === 'undefined') {
            setTimeout(updateCharacterBackground, 500);
            return;
        }

        // Get chat context
        const context = getContext();
        const chatData = context.chat;
        const isInChat = Array.isArray(chatData) && chatData.length > 0;

        // Enhanced chat state detection to prevent assistant avatar on homepage
        // Check if we're on the main interface (no character selected AND no group selected)
        const isOnHomepage = (context.characterId === undefined || context.characterId === null) &&
            (context.groupId === undefined || context.groupId === null);
        const noChatOpen = (!isInChat) || isOnHomepage;

        if (noChatOpen) {
            const cyberpunkBg = document.getElementById('cyberpunk_bg');
            if (cyberpunkBg) {
                isBackgroundTransitioning = true;
                fadeOutElement(cyberpunkBg, 500, () => {
                    cyberpunkBg.remove();
                    isBackgroundTransitioning = false;
                });
            }
            return;
        }

        const avatarUrl = getCurrentCharacterAvatar();

        if (avatarUrl) {
            // Find or create cyberpunk background element
            let cyberpunkBg = document.getElementById('cyberpunk_bg');
            const isNewElement = !cyberpunkBg;

            if (isNewElement) {
                cyberpunkBg = document.createElement('div');
                cyberpunkBg.id = 'cyberpunk_bg';
                document.body.appendChild(cyberpunkBg);
            }

            // Check if background image is changing
            const currentBgImage = cyberpunkBg.style.backgroundImage;
            const newBgImage = `url("${avatarUrl}")`;
            const isImageChanged = currentBgImage !== newBgImage;

            if (isImageChanged && !isNewElement) {
                // Smooth transition: fade out -> change image -> fade in (optimal timing)
                isBackgroundTransitioning = true;
                fadeOutElement(cyberpunkBg, 400, () => {  // 400ms fade out
                    cyberpunkBg.style.backgroundImage = newBgImage;
                    fadeInElement(cyberpunkBg, 1, 600);  // 600ms fade in with full opacity
                    setTimeout(() => {
                        isBackgroundTransitioning = false;
                    }, 700);  // Wait for fade in to complete
                });
            } else if (isNewElement) {
                // New element: set image and fade in (optimal timing)
                cyberpunkBg.style.backgroundImage = newBgImage;
                isBackgroundTransitioning = true;
                fadeInElement(cyberpunkBg, 1, 500);  // 500ms fade in with full opacity
                setTimeout(() => {
                    isBackgroundTransitioning = false;
                }, 600);
            }
        } else {
            // No avatar - remove background
            const cyberpunkBg = document.getElementById('cyberpunk_bg');
            if (cyberpunkBg) {
                isBackgroundTransitioning = true;
                fadeOutElement(cyberpunkBg, 400, () => {
                    cyberpunkBg.remove();
                    isBackgroundTransitioning = false;
                });
            }
        }
    } catch (error) {
        console.error(`[${extensionName}] Error updating character background:`, error);
        isBackgroundTransitioning = false;
    }
}

function clearCharacterBackground() {
    try {
        // Remove our custom background element
        const cyberpunkBg = document.getElementById('cyberpunk_bg');
        if (cyberpunkBg) {
            cyberpunkBg.remove();
            console.log(`[${extensionName}] Character background cleared`);
        }
    } catch (error) {
        console.error(`[${extensionName}] Error clearing character background:`, error);
    }
}

// ===================================
// Video Background System
// ===================================

let videoBackgroundElement = null;
let isOnHomepage = false;

/**
 * Create and manage the video background element
 */
function createVideoBackground() {
    try {
        const settings = extension_settings[extensionName];

        // Don't create if disabled or already exists
        if (!settings.enabled || !settings.video_background || videoBackgroundElement) {
            return;
        }

        console.log(`[${extensionName}] Creating video background element`);

        videoBackgroundElement = document.createElement('video');
        videoBackgroundElement.id = 'cyberpunk_video_bg';
        videoBackgroundElement.src = `/scripts/extensions/${extensionName}/assets/cyberpunk_bg.mp4`;
        videoBackgroundElement.autoplay = true;
        videoBackgroundElement.muted = true;
        videoBackgroundElement.loop = settings.video_bg_loop;
        videoBackgroundElement.playsInline = true;
        videoBackgroundElement.volume = 0.0; // Always muted

        // Add to DOM
        document.body.appendChild(videoBackgroundElement);

        // Hide initially (will be shown when on homepage)
        videoBackgroundElement.style.display = 'none';

        console.log(`[${extensionName}] Video background element created and added to DOM`);

    } catch (error) {
        console.error(`[${extensionName}] Error creating video background:`, error);
    }
}

/**
 * Remove video background element
 */
function removeVideoBackground() {
    try {
        if (videoBackgroundElement) {
            videoBackgroundElement.pause();
            videoBackgroundElement.src = '';
            videoBackgroundElement.remove();
            videoBackgroundElement = null;
            console.log(`[${extensionName}] Video background removed`);
        }
    } catch (error) {
        console.error(`[${extensionName}] Error removing video background:`, error);
    }
}

/**
 * Check if user is currently on the homepage/welcome screen
 * Shared logic for both character and video background systems
 */
function checkHomepageStatus() {
    try {
        const context = getContext();

        // Consider homepage when:
        // 1. No character selected (characterId is undefined/null)
        // 2. No group selected (groupId is undefined/null)
        // 3. No active chat
        const isCurrentlyOnHomepage = (
            (context.characterId === undefined || context.characterId === null) &&
            (context.groupId === undefined || context.groupId === null)
        );

        // Update video background status if changed OR always update if video element exists
        if (isCurrentlyOnHomepage !== isOnHomepage || videoBackgroundElement) {
            isOnHomepage = isCurrentlyOnHomepage;
            updateVideoBackgroundVisibility();
            console.log(`[${extensionName}] Homepage status: ${isOnHomepage ? 'ON homepage' : 'IN chat'}`);
        }

        // Also trigger character background update (they use the same logic)
        updateCharacterBackground();

        // 如果在主页且主题启用，重新应用标题修改
        if (isOnHomepage && extension_settings[extensionName].enabled) {
            // 使用延迟确保DOM完全更新
            setTimeout(modifyWelcomePageTitle, 100);
        }

        // 控制AI背景生成按钮的显示/隐藏
        if (extension_settings[extensionName].enabled && extension_settings[extensionName].ai_backgrounds) {
            const generateBtn = document.getElementById('cyberpunk_ai_generate_btn');
            if (isOnHomepage) {
                // 在主页则隐藏按钮
                if (generateBtn) {
                    generateBtn.style.display = 'none';
                }
            } else {
                // 在聊天中则显示按钮，如果按钮不存在则创建
                if (generateBtn) {
                    generateBtn.style.display = 'flex';
                } else {
                    addAIBackgroundGenerateButton();
                }
            }
        }

    } catch (error) {
        console.error(`[${extensionName}] Error checking homepage status:`, error);
    }
}

/**
 * Update video background visibility based on homepage status
 */
function updateVideoBackgroundVisibility() {
    try {
        const settings = extension_settings[extensionName];

        // If video background is disabled or element doesn't exist, hide it
        if (!settings.enabled || !settings.video_background || !videoBackgroundElement) {
            if (videoBackgroundElement) {
                videoBackgroundElement.style.display = 'none';
                videoBackgroundElement.pause();
                console.log(`[${extensionName}] Video background hidden (disabled or element missing)`);
            }
            return;
        }

        if (isOnHomepage) {
            // Show video on homepage
            videoBackgroundElement.style.display = 'block';
            videoBackgroundElement.style.opacity = '1';

            // Play video if it was paused
            const playPromise = videoBackgroundElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`[${extensionName}] Video autoplay prevented:`, error);
                });
            }

            console.log(`[${extensionName}] Video background shown on homepage`);
        } else {
            // Hide video in chat for performance
            videoBackgroundElement.style.opacity = '0';
            videoBackgroundElement.style.display = 'none';
            videoBackgroundElement.pause(); // Save resources immediately

            console.log(`[${extensionName}] Video background hidden in chat`);
        }

    } catch (error) {
        console.error(`[${extensionName}] Error updating video background visibility:`, error);
    }
}

/**
 * Update video background loop setting
 */
function updateVideoBackgroundSettings() {
    try {
        const settings = extension_settings[extensionName];

        if (!videoBackgroundElement) {
            return;
        }

        // Update loop setting
        videoBackgroundElement.loop = settings.video_bg_loop;

        // If we're on homepage and video should be playing, ensure it's playing
        if (isOnHomepage && settings.enabled && settings.video_background) {
            // If video was paused due to loop being disabled, restart it
            if (videoBackgroundElement.paused) {
                const playPromise = videoBackgroundElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`[${extensionName}] Video autoplay prevented during loop setting update:`, error);
                    });
                }
                console.log(`[${extensionName}] Video restarted after loop setting change`);
            }
        }

        console.log(`[${extensionName}] Video background loop setting updated: ${settings.video_bg_loop}`);

    } catch (error) {
        console.error(`[${extensionName}] Error updating video background settings:`, error);
    }
}

/**
 * Setup video background integration (reuses character background event listeners)
 */
function setupVideoBackgroundIntegration() {
    try {
        eventSource.on(event_types.CHAT_CHANGED, checkHomepageStatus);
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, checkHomepageStatus);
        eventSource.on(event_types.MESSAGE_DELETED, checkHomepageStatus);  // Important: deletion can change last character

        // Single initial background setup with longer delay to avoid rapid calls
        setTimeout(checkHomepageStatus, 1000);

        console.log(`[${extensionName}] Video background integration initialized (shares events with character background)`);
    } catch (error) {
        console.error(`[${extensionName}] Error setting up video background integration:`, error);
    }
}

/**
 * Remove video background event listeners (no-op since we share with character background)
 */
function removeVideoBackgroundEventListeners() {
    try {
        // Video background shares event listeners with character background system
        // No need to remove anything specific to video background
        console.log(`[${extensionName}] Video background uses shared event listeners - no cleanup needed`);
    } catch (error) {
        console.error(`[${extensionName}] Error removing video background event listeners:`, error);
    }
}

// ===================================
// AI Background Generation System v2.0
// ===================================

// Environment Analysis JSON Schema
const envAnalysisSchema = {
    name: 'EnvironmentAnalysis',
    description: 'A JSON object containing environment analysis results with current environment description, change status, and image generation prompt',
    strict: true,
    value: {
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': {
            'currentEnv': { 'type': 'string' },
            'isNewEnv': { 'type': 'boolean' },
            'imgPromptForEnv': { 'type': 'string' }
        },
        'required': ['currentEnv', 'isNewEnv', 'imgPromptForEnv']
    }
};

/**
 * Main function: Analyze environment and generate background if needed (non-blocking)
 */
async function analyzeEnvironmentAndGenerate() {
    try {
        const settings = extension_settings[extensionName];

        if (!settings.enabled || !settings.ai_backgrounds) {
            return;
        }

        // Direct call since generateRaw with quiet=true should be non-blocking
        await performEnvironmentAnalysisAsync();

    } catch (error) {
        console.error(`[${extensionName}] Error in analyzeEnvironmentAndGenerate:`, error);
    }
}

/**
 * Async function to perform environment analysis without blocking UI
 */
async function performEnvironmentAnalysisAsync() {
    try {
        const settings = extension_settings[extensionName];
        const context = getContext();
        const currentChatName = context.getCurrentChatId();

        if (!currentChatName) {
            console.log(`[${extensionName}] No chat selected, skipping AI background generation`);
            return;
        }

        // Get full chat history
        const fullChatHistory = extractFullChatHistory(context.chat);

        // Get cached environment info
        const cachedBg = findCachedBackground(currentChatName);
        const preEnv = cachedBg?.env;

        console.log(`[${extensionName}] Starting non-blocking environment analysis with generateRaw...`);

        // Analyze current environment using non-blocking generateRaw
        const envAnalysis = await analyzeCurrentEnvironment(fullChatHistory, preEnv);

        if (!envAnalysis) {
            console.error(`[${extensionName}] Environment analysis failed`);
            return;
        }

        // Update cache with current environment
        updateCachedBackground(currentChatName, {
            env: envAnalysis.currentEnv,
            lastUpdated: Date.now()
        });

        // Generate new background if environment changed
        if (envAnalysis?.isNewEnv && envAnalysis?.imgPromptForEnv !== "none") {
            console.log(`[${extensionName}] New environment detected, generating background...`);
            await generateAndApplyBackground(envAnalysis.imgPromptForEnv, currentChatName, envAnalysis.currentEnv);
        } else {
            console.log(`[${extensionName}] Environment unchanged, using cached background`);
            // Apply existing cached background if available
            if (cachedBg?.bgpath) {
                await setAIBackground(cachedBg.bgpath);
            }
        }

    } catch (error) {
        console.error(`[${extensionName}] Error in performEnvironmentAnalysisAsync:`, error);
    }
}

/**
 * Extract full chat history as formatted text, including system prompts and character info
 */
function extractFullChatHistory(chatArray) {
    if (!Array.isArray(chatArray)) {
        chatArray = [];
    }

    let history = '';

    // Add global system prompt at the beginning if available
    if (power_user.sysprompt?.enabled && power_user.sysprompt?.content) {
        history = `System: ${power_user.sysprompt.content}\n\n`;
        console.log(`[${extensionName}] Added global system prompt to chat history: ${power_user.sysprompt.content.substring(0, 100)}...`);
    }

    // Add character-specific system prompt (more important for character context)
    if (this_chid !== undefined && characters && characters[this_chid]) {
        const character = characters[this_chid];

        // Character's main prompt override (Advanced Definitions -> Prompt Overrides -> Main Prompt)
        if (character.data?.system_prompt && character.data.system_prompt.trim()) {
            history += `Character System Prompt (${character.name || 'Unknown'}): ${character.data.system_prompt}\n\n`;
            console.log(`[${extensionName}] Added character system prompt: ${character.data.system_prompt.substring(0, 100)}...`);
        }

        // Character description
        if (character.description && character.description.trim()) {
            history += `Character Description (${character.name || 'Unknown'}): ${character.description}\n\n`;
            console.log(`[${extensionName}] Added character description: ${character.description.substring(0, 100)}...`);
        }

        // Add scenario if available
        if (character.scenario && character.scenario.trim()) {
            history += `Scenario: ${character.scenario}\n\n`;
            console.log(`[${extensionName}] Added scenario: ${character.scenario.substring(0, 100)}...`);
        }
    }

    // Add chat messages
    if (chatArray.length > 0) {
        const chatHistory = chatArray
            .filter(msg => !msg.is_system && msg.mes && msg.mes.trim() !== '')
            .map(msg => `${msg.name || 'Unknown'}: ${msg.mes}`)
            .join('\n\n');

        history += chatHistory;
    } else {
        history += "No chat history available.";
    }

    console.log(`[${extensionName}] Total chat history length: ${history.length} characters`);
    return history;
}

/**
 * Analyze current environment using LLM with structured output (non-blocking)
 */
async function analyzeCurrentEnvironment(fullChatHistory, preEnv) {
    try {
        const { generateRaw } = getContext();

        const prompt = buildEnvironmentPrompt(fullChatHistory, preEnv);

        // Use generateRaw instead of generateQuietPrompt to avoid UI blocking
        const result = await generateRaw({
            prompt: prompt,
            jsonSchema: envAnalysisSchema
        });

        console.log(`[${extensionName}] Environment analysis result:`, result);
        console.log(`[${extensionName}] Result type:`, typeof result);

        // Parse JSON if result is a string
        let parsedResult = result;
        if (typeof result === 'string') {
            try {
                parsedResult = JSON.parse(result);
                console.log(`[${extensionName}] Successfully parsed JSON:`, parsedResult);
            } catch (parseError) {
                console.error(`[${extensionName}] Failed to parse JSON result:`, parseError);
                return null;
            }
        }

        return parsedResult;

    } catch (error) {
        console.error(`[${extensionName}] Environment analysis failed:`, error);
        // If generateRaw fails, try fallback approach
        console.log(`[${extensionName}] Attempting fallback with generateQuietPrompt...`);
        try {
            const { generateQuietPrompt } = getContext();
            const prompt = buildEnvironmentPrompt(fullChatHistory, preEnv);

            const fallbackResult = await generateQuietPrompt({
                quietPrompt: prompt,
                jsonSchema: envAnalysisSchema
            });

            if (typeof fallbackResult === 'string') {
                return JSON.parse(fallbackResult);
            }
            return fallbackResult;
        } catch (fallbackError) {
            console.error(`[${extensionName}] Fallback also failed:`, fallbackError);
            return null;
        }
    }
}

/**
 * Build environment analysis prompt
 */
function buildEnvironmentPrompt(fullChatHistory, preEnv) {
    return `你是专业的分析师，你的工作是分析角色扮演对话，决定是否需要生成新的角色所处的四周环境相关的背景图像的image Prompt，　并输出基于json格式的分析结果。

请分析以下完整的对话历史（包含角色设定），找出当前角色处所的的最新的四周的环境场景设定：

完整对话历史(包含了系统提示以及角色与用户的对话消息历史)：
${fullChatHistory}

---

${preEnv ? `你上一次分析的角色所处的四周的环境情况：[${preEnv}]，这个'前次环境情况'是用以与当前环境分析结果进行对比，以决定是否需要生成新的背景图像的image prompt` : ''}

---

请仔细分析：
1. 基于System中的角色设定和完整对话内容，判断当前场景的地理位置、时间设定、氛围风格
2. 考虑角色的背景设定、性格特征，分析对话中体现的环境变化
3. 与'前次环境情况'相比是否有显著的场景变化（地点、时间、氛围等）
4. 如果环境情况有显著变化，生成适合该新环境的背景图像描述（描述相关的image prompt中只详细描述环境元素和氛围，**严禁包含人物描述**）

---

json格式输出要求：
- currentEnv: 基于角色设定和对话内容的当前环境详细描述（自然语言进行详细描述）
- isNewEnv: 环境是否发生了显著变化(布尔值)
- imgPromptForEnv: 如果需要生成新环境相关背景图，则提供详细的图像生成prompt, prompt只详细描述环境元素和氛围，**严禁包含人物描述**；如果不需要则返回"none"

`;
}

/**
 * Generate and apply new background
 */
async function generateAndApplyBackground(prompt, chatname, envDescription) {
    try {
        console.log(`[${extensionName}] Starting background generation for chat: ${chatname}`);

        // Generate background image
        const backgroundUrl = await generateEnvironmentBackground(prompt);

        if (backgroundUrl) {
            console.log(`[${extensionName}] Background generated successfully, applying...`);
            // Apply background
            await setAIBackground(backgroundUrl);

            // Update cache
            updateCachedBackground(chatname, {
                bgpath: backgroundUrl,
                env: envDescription,
                timestamp: Date.now(),
                lastUpdated: Date.now()
            });

            console.log(`[${extensionName}] AI background generated and applied for chat: ${chatname}`);
        } else {
            console.error(`[${extensionName}] Failed to generate background - backgroundUrl is null`);
        }

    } catch (error) {
        console.error(`[${extensionName}] Error generating background:`, error);
    }
}

/**
 * Generate background image using ST's image generation
 */
async function generateEnvironmentBackground(prompt) {
    try {
        console.log(`[${extensionName}] Attempting to generate background with prompt: ${prompt.substring(0, 100)}...`);

        // Check if slash command execution is available
        if (typeof executeSlashCommandsWithOptions !== 'function') {
            console.warn(`[${extensionName}] Slash command execution not available - executeSlashCommandsWithOptions is ${typeof executeSlashCommandsWithOptions}`);
            return null;
        }

        console.log(`[${extensionName}] Using ST slash command system for image generation...`);

        // Get user-configured dimensions
        const settings = extension_settings[extensionName];
        const width = settings.ai_bg_width || 1024;
        const height = settings.ai_bg_height || 768;

        console.log(`[${extensionName}] Using image dimensions: ${width}x${height}`);

        // Use the /imagine command to generate the image
        const command = `/imagine quiet=true width=${width} height=${height} "${prompt}"`;
        const result = await executeSlashCommandsWithOptions(command);

        if (result && result.pipe) {
            console.log(`[${extensionName}] Image generation successful, received URL: ${result.pipe}`);
            return result.pipe;
        } else {
            console.warn(`[${extensionName}] Image generation returned no result or no pipe`);
            console.log(`[${extensionName}] Full result:`, result);
            return null;
        }

    } catch (error) {
        console.error(`[${extensionName}] Image generation failed:`, error);
        return null;
    }
}

/**
 * Set AI-generated background
 */
async function setAIBackground(imageUrl) {
    try {
        // Create or update AI background element
        let aiBgElement = document.getElementById('cyberpunk_ai_bg');

        if (!aiBgElement) {
            aiBgElement = document.createElement('div');
            aiBgElement.id = 'cyberpunk_ai_bg';
            aiBgElement.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                z-index: -2 !important;
                opacity: 1 !important;
                transition: opacity 0.5s ease-in-out !important;
            `;
            document.body.appendChild(aiBgElement);
        }

        // Set the background image
        aiBgElement.style.backgroundImage = `url("${imageUrl}")`;

        console.log(`[${extensionName}] AI background applied:`, imageUrl);

    } catch (error) {
        console.error(`[${extensionName}] Error setting AI background:`, error);
    }
}

/**
 * Clear AI background
 */
function clearAIBackground() {
    const aiBgElement = document.getElementById('cyberpunk_ai_bg');
    if (aiBgElement) {
        aiBgElement.remove();
        console.log(`[${extensionName}] AI background cleared`);
    }
}

// ===================================
// Cache Management System
// ===================================

/**
 * Find cached background for chat
 */
function findCachedBackground(chatname) {
    const settings = extension_settings[extensionName];
    return settings.ai_background_cache?.find(item => item.chatname === chatname);
}

/**
 * Update cached background data
 */
function updateCachedBackground(chatname, data) {
    const settings = extension_settings[extensionName];

    if (!settings.ai_background_cache) {
        settings.ai_background_cache = [];
    }

    const existingIndex = settings.ai_background_cache.findIndex(item => item.chatname === chatname);

    if (existingIndex >= 0) {
        // Update existing entry
        Object.assign(settings.ai_background_cache[existingIndex], data);
    } else {
        // Create new entry
        settings.ai_background_cache.push({
            chatname: chatname,
            ...data
        });
    }

    // Cleanup if cache is too large
    if (settings.ai_background_cache.length > settings.ai_bg_cache_limit) {
        settings.ai_background_cache.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        settings.ai_background_cache = settings.ai_background_cache.slice(0, settings.ai_bg_cache_limit);
    }

    saveSettingsDebounced();
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache() {
    const settings = extension_settings[extensionName];

    if (!settings.ai_background_cache) return;

    const expireTime = Date.now() - (settings.ai_bg_cache_expire_days * 24 * 60 * 60 * 1000);
    const originalLength = settings.ai_background_cache.length;

    settings.ai_background_cache = settings.ai_background_cache.filter(
        item => (item.lastUpdated || item.timestamp || 0) > expireTime
    );

    if (settings.ai_background_cache.length < originalLength) {
        console.log(`[${extensionName}] Cleaned up ${originalLength - settings.ai_background_cache.length} expired cache entries`);
        saveSettingsDebounced();
    }
}

function setupCharacterBackgroundIntegration() {
    try {
        // Listen for essential events that can change the current character
        eventSource.on(event_types.CHAT_CHANGED, checkHomepageStatus);
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, checkHomepageStatus);
        eventSource.on(event_types.MESSAGE_DELETED, checkHomepageStatus);  // Important: deletion can change last character

        // Single initial background setup with longer delay to avoid rapid calls
        setTimeout(checkHomepageStatus, 1000);

        console.log(`[${extensionName}] Dynamic character background integration initialized (optimized) with video support`);
    } catch (error) {
        console.error(`[${extensionName}] Error setting up character background integration:`, error);
    }
}

function setupAIBackgroundIntegration() {
    try {
        // Listen for chat changes and character messages for auto-trigger
        eventSource.on(event_types.CHAT_CHANGED, onAIChatChanged);
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, onAIMessageReceived);
        eventSource.on(event_types.CHAT_DELETED, onAIChatDeleted);

        // Add manual generate button to character background area
        addAIBackgroundGenerateButton();

        // Load existing background for current chat
        setTimeout(() => {
            loadExistingAIBackground();
        }, 1000);

        // Cleanup expired cache on startup
        cleanupExpiredCache();

        console.log(`[${extensionName}] AI background integration initialized`);
    } catch (error) {
        console.error(`[${extensionName}] Error setting up AI background integration:`, error);
    }
}

/**
 * Add floating generate button to cyberpunk_bg element
 */
function addAIBackgroundGenerateButton() {
    // Remove existing button if any
    const existingBtn = document.getElementById('cyberpunk_ai_generate_btn');
    if (existingBtn) existingBtn.remove();

    // 检查是否在主页，如果在主页则不显示按钮
    if (isOnHomepage) {
        console.log(`[${extensionName}] AI generate button hidden on homepage`);
        return;
    }

    // Create modern floating button with glassmorphism design
    const generateBtn = document.createElement('div');
    generateBtn.id = 'cyberpunk_ai_generate_btn';
    generateBtn.title = 'Generate AI Background';
    generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L16 5L15.26 8.09L22 7L15.74 8.91L19 12L15.26 11.91L22 17L15.74 15.09L19 12L13.09 15.74L12 22L10.91 15.74L8 19L8.74 15.91L2 17L8.26 15.09L5 12L8.74 12.09L2 7L8.26 8.91L5 12L10.91 8.26L12 2Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;

    generateBtn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 56px !important;
        height: 56px !important;
        background: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: rgba(255, 255, 255, 0.8) !important;
        cursor: pointer !important;
        z-index: 1000 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        user-select: none !important;
    `;

    // Add hover and active effects
    generateBtn.addEventListener('mouseenter', () => {
        generateBtn.style.transform = 'scale(1.05)';
        generateBtn.style.background = 'rgba(0, 0, 0, 0.8)';
        generateBtn.style.color = 'rgba(255, 255, 255, 1)';
        generateBtn.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        generateBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    generateBtn.addEventListener('mouseleave', () => {
        generateBtn.style.transform = 'scale(1)';
        generateBtn.style.background = 'rgba(0, 0, 0, 0.6)';
        generateBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        generateBtn.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        generateBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });

    generateBtn.addEventListener('mousedown', () => {
        generateBtn.style.transform = 'scale(0.95)';
    });

    generateBtn.addEventListener('mouseup', () => {
        generateBtn.style.transform = 'scale(1.05)';
    });

    // Add click handler
    generateBtn.addEventListener('click', onManualGenerateAIBackground);

    // Always append to body for consistent positioning
    document.body.appendChild(generateBtn);
}

/**
 * Load existing AI background for current chat
 */
async function loadExistingAIBackground() {
    try {
        const context = getContext();
        const currentChatName = context.getCurrentChatId();

        if (!currentChatName) return;

        const cachedBg = findCachedBackground(currentChatName);
        if (cachedBg?.bgpath) {
            await setAIBackground(cachedBg.bgpath);
            console.log(`[${extensionName}] Loaded existing AI background for chat: ${currentChatName}`);
        }
    } catch (error) {
        console.error(`[${extensionName}] Error loading existing AI background:`, error);
    }
}

// ===================================
// Event Handlers for AI Background
// ===================================

// Add loading state for generate button
let isGeneratingBackground = false;

/**
 * Manual generate button click handler (non-blocking)
 */
async function onManualGenerateAIBackground() {
    try {
        const settings = extension_settings[extensionName];

        if (!settings.enabled || !settings.ai_backgrounds) {
            console.log(`[${extensionName}] AI backgrounds not enabled`);
            return;
        }

        if (isGeneratingBackground) {
            console.log(`[${extensionName}] Background generation already in progress`);
            return;
        }

        console.log(`[${extensionName}] Manual AI background generation triggered`);

        // Set loading state
        isGeneratingBackground = true;
        updateGenerateButtonState(true);

        try {
            // Direct call since generateRaw should be non-blocking
            await performEnvironmentAnalysisAsync();
        } finally {
            isGeneratingBackground = false;
            updateGenerateButtonState(false);
        }

    } catch (error) {
        console.error(`[${extensionName}] Error in manual generate:`, error);
        isGeneratingBackground = false;
        updateGenerateButtonState(false);
    }
}

/**
 * Update generate button loading state
 */
function updateGenerateButtonState(loading) {
    const generateBtn = document.getElementById('cyberpunk_ai_generate_btn');
    if (!generateBtn) return;

    if (loading) {
        generateBtn.style.opacity = '0.6';
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12"
                                      dur="1s" repeatCount="indefinite"/>
                </path>
            </svg>
        `;
    } else {
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L16 5L15.26 8.09L22 7L15.74 8.91L19 12L15.26 11.91L22 17L15.74 15.09L19 12L13.09 15.74L12 22L10.91 15.74L8 19L8.74 15.91L2 17L8.26 15.09L5 12L8.74 12.09L2 7L8.26 8.91L5 12L10.91 8.26L12 2Z"
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
        `;
    }
}

/**
 * Chat changed event handler
 */
async function onAIChatChanged() {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.ai_backgrounds) return;

    const context = getContext();
    const currentChatName = context.getCurrentChatId();

    // Only clear and reload if we actually switched to a different chat
    const existingAiBg = document.getElementById('cyberpunk_ai_bg');
    if (existingAiBg && currentChatName) {
        // Check if we have a cached background for this chat
        const cachedBg = findCachedBackground(currentChatName);
        if (cachedBg?.bgpath) {
            // We have a background for this chat, just update the image
            existingAiBg.style.backgroundImage = `url("${cachedBg.bgpath}")`;
            console.log(`[${extensionName}] Switched to cached AI background for chat: ${currentChatName}`);
            return;
        }
    }

    // Clear current AI background only if we don't have a cached one
    clearAIBackground();

    // Load existing background for the new chat
    setTimeout(() => {
        loadExistingAIBackground();
    }, 500);
}

/**
 * Character message rendered event handler for auto-trigger
 */
async function onAIMessageReceived() {
    const settings = extension_settings[extensionName];

    if (!settings.enabled || !settings.ai_backgrounds || !settings.ai_bg_auto) {
        return;
    }

    const context = getContext();
    const totalMessages = context.chat.length;

    // Count only character messages (non-user, non-system messages)
    const characterMessages = context.chat.filter(msg => !msg.is_user && !msg.is_system);
    const characterMessageCount = characterMessages.length;

    const interval = settings.ai_bg_interval;
    const shouldTrigger = characterMessageCount % interval === 0 && characterMessageCount > 0;

    console.log(`[${extensionName}] AUTO-TRIGGER: Total messages: ${totalMessages}, Character messages: ${characterMessageCount}, Interval: ${interval}`);
    console.log(`[${extensionName}] AUTO-TRIGGER: Should trigger: ${shouldTrigger} (${characterMessageCount} % ${interval} = ${characterMessageCount % interval})`);

    if (shouldTrigger) {
        console.log(`[${extensionName}] AUTO-TRIGGER: ${characterMessageCount} character messages reached, analyzing environment...`);
        await analyzeEnvironmentAndGenerate();
    } else {
        const remaining = interval - (characterMessageCount % interval);
        console.log(`[${extensionName}] AUTO-TRIGGER: Not triggering - need ${remaining} more character messages (currently ${characterMessageCount})`);
    }
}

/**
 * Chat deleted event handler
 */
function onAIChatDeleted(chatName) {
    const settings = extension_settings[extensionName];
    if (!settings.ai_background_cache) return;

    // Remove cached background for deleted chat
    const originalLength = settings.ai_background_cache.length;
    settings.ai_background_cache = settings.ai_background_cache.filter(
        item => item.chatname !== chatName
    );

    if (settings.ai_background_cache.length < originalLength) {
        console.log(`[${extensionName}] Removed AI background cache for deleted chat: ${chatName}`);
        saveSettingsDebounced();
    }
}

// ===================================
// AI Background Resource Management
// ===================================

/**
 * 扫描AI背景图像目录，收集所有图像文件信息
 */
async function scanAIBackgroundImages() {
    try {
        // 首先获取所有角色文件夹
        const foldersResponse = await fetch('/api/images/folders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getRequestHeaders()
            }
        });

        if (!foldersResponse.ok) {
            throw new Error(`获取文件夹列表失败: ${foldersResponse.statusText}`);
        }

        const folders = await foldersResponse.json();
        console.log(`[${extensionName}] DEBUG: 找到文件夹:`, folders);

        const allImages = [];

        // 遍历每个角色文件夹获取图像
        for (const folder of folders) {
            try {
                const imagesResponse = await fetch('/api/images/list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getRequestHeaders()
                    },
                    body: JSON.stringify({
                        folder: folder
                    })
                });

                if (imagesResponse.ok) {
                    const images = await imagesResponse.json();
                    console.log(`[${extensionName}] DEBUG: 文件夹 ${folder} 中的图像:`, images);

                    // 处理每个图像
                    for (const imageName of images) {
                        // 构建完整路径用于匹配
                        const fullPath = `data/default-user/user/images/${folder}/${imageName}`;

                        allImages.push({
                            name: imageName,
                            path: fullPath,
                            characterDir: folder,
                            lastModified: Date.now()
                        });
                    }
                } else {
                    console.warn(`[${extensionName}] 获取文件夹 ${folder} 的图像失败:`, imagesResponse.statusText);
                }
            } catch (error) {
                console.warn(`[${extensionName}] 处理文件夹 ${folder} 时出错:`, error);
            }
        }

        console.log(`[${extensionName}] DEBUG: 处理后的图像列表:`, allImages);
        return allImages;
    } catch (error) {
        console.error(`[${extensionName}] 扫描AI背景图像失败:`, error);
        return [];
    }
}

/**
 * 分析哪些AI背景图像未被引用
 */
function analyzeUnusedAIBackgrounds(allImages) {
    const settings = extension_settings[extensionName];
    const cache = settings.ai_background_cache || [];

    console.log(`[${extensionName}] DEBUG: 分析图像使用情况`);
    console.log(`[${extensionName}] DEBUG: 总图像数: ${allImages.length}`);
    console.log(`[${extensionName}] DEBUG: 缓存条目数: ${cache.length}`);

    // 收集所有被缓存引用的图像路径
    const referencedPaths = new Set();
    cache.forEach((item, index) => {
        console.log(`[${extensionName}] DEBUG: 缓存条目 ${index}:`, item);
        if (item.bgpath) {
            // 尝试多种路径格式匹配
            const url = item.bgpath;
            console.log(`[${extensionName}] DEBUG: 处理URL: ${url}`);

            // 方法1: 标准路径提取
            if (url.includes('/user/images/')) {
                const pathPart = url.split('/user/images/')[1];
                if (pathPart) {
                    const fullPath = `data/default-user/user/images/${pathPart}`;
                    referencedPaths.add(fullPath);
                    console.log(`[${extensionName}] DEBUG: 添加引用路径1: ${fullPath}`);
                }
            }

            // 方法2: 如果是完整的文件系统路径
            if (url.includes('data/default-user/user/images/')) {
                referencedPaths.add(url);
                console.log(`[${extensionName}] DEBUG: 添加引用路径2: ${url}`);
            }

            // 方法3: 如果URL是相对路径
            if (url.startsWith('/')) {
                const relativePath = url.substring(1); // 移除开头的 /
                if (relativePath.includes('user/images/')) {
                    const pathPart = relativePath.split('user/images/')[1];
                    if (pathPart) {
                        const fullPath = `data/default-user/user/images/${pathPart}`;
                        referencedPaths.add(fullPath);
                        console.log(`[${extensionName}] DEBUG: 添加引用路径3: ${fullPath}`);
                    }
                }
            }

            // 方法4: 提取文件名进行模糊匹配
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            if (fileName && fileName.includes('.')) {
                // 查找所有包含这个文件名的图像
                allImages.forEach(img => {
                    if (img.name === fileName) {
                        referencedPaths.add(img.path);
                        console.log(`[${extensionName}] DEBUG: 添加引用路径4 (按文件名): ${img.path}`);
                    }
                });
            }
        }
    });

    console.log(`[${extensionName}] DEBUG: 所有引用路径:`, Array.from(referencedPaths));

    // 调试：显示所有图像路径
    console.log(`[${extensionName}] DEBUG: 所有图像路径:`);
    allImages.forEach((img, index) => {
        console.log(`[${extensionName}] DEBUG: 图像 ${index}: ${img.path}`);
    });

    // 查找未被引用的图像
    const unusedImages = allImages.filter(img => {
        const isReferenced = referencedPaths.has(img.path);
        console.log(`[${extensionName}] DEBUG: 检查图像 ${img.path}: ${isReferenced ? '已引用' : '未引用'}`);
        return !isReferenced;
    });
    const usedImages = allImages.filter(img => referencedPaths.has(img.path));

    console.log(`[${extensionName}] DEBUG: 分析结果 - 总计: ${allImages.length}, 已使用: ${usedImages.length}, 未使用: ${unusedImages.length}`);

    return {
        total: allImages.length,
        used: usedImages.length,
        unused: unusedImages.length,
        unusedImages,
        usedImages
    };
}

/**
 * 删除AI背景图像文件
 */
async function deleteAIBackgroundImages(imagePaths) {
    const deletedFiles = [];
    const failedFiles = [];

    for (const imagePath of imagePaths) {
        try {
            // 从完整路径中提取相对路径
            // 从 "data/default-user/user/images/CharName/file.png"
            // 提取 "user/images/CharName/file.png"
            const relativePath = imagePath.replace('data/default-user/', '');

            const response = await fetch('/api/images/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getRequestHeaders()
                },
                body: JSON.stringify({
                    path: relativePath
                })
            });

            if (response.ok) {
                deletedFiles.push(imagePath);
                console.log(`[${extensionName}] 已删除: ${imagePath}`);
            } else {
                failedFiles.push(imagePath);
                console.warn(`[${extensionName}] 删除失败: ${imagePath} - ${response.statusText}`);
            }
        } catch (error) {
            console.error(`[${extensionName}] 删除文件时出错 ${imagePath}:`, error);
            failedFiles.push(imagePath);
        }
    }

    return { deletedFiles, failedFiles };
}

/**
 * 创建资源管理UI界面
 */
function createResourceManagementUI() {
    const container = document.createElement('div');
    container.id = 'ai-background-resource-manager';
    container.style.cssText = `
        background: rgba(26, 26, 58, 0.95);
        border: 2px solid #004dcc;
        border-radius: 12px;
        padding: 20px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: var(--cp2027-font-primary);
        color: #e0f0ff;
    `;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #00ffdd; text-shadow: 0 0 5px rgba(0, 255, 221, 0.5);">
                AI背景图像资源管理
            </h3>
            <button id="close-resource-manager" style="
                background: #ff4444; color: white; border: none; border-radius: 6px;
                padding: 8px 12px; cursor: pointer; font-size: 14px;
            ">关闭</button>
        </div>

        <div id="scan-section" style="margin-bottom: 20px;">
            <button id="scan-ai-backgrounds" style="
                background: linear-gradient(135deg, #1a2240 0%, #2a3450 100%);
                color: #e0f0ff; border: 2px solid #004dcc; border-radius: 6px;
                padding: 12px 20px; cursor: pointer; font-weight: 600;
                transition: all 0.3s ease;
            ">扫描AI背景图像</button>
            <span id="scan-status" style="margin-left: 15px; color: #ffdd00;"></span>
        </div>

        <div id="results-section" style="display: none;">
            <div id="summary" style="
                background: rgba(42, 42, 90, 0.4); padding: 15px; border-radius: 8px;
                border: 1px solid rgba(0, 255, 221, 0.3); margin-bottom: 20px;
            "></div>

            <div id="unused-images-section">
                <h4 style="color: #ff9955; margin-bottom: 10px;">未使用的图像文件</h4>
                <div id="unused-images-list" style="
                    max-height: 300px; overflow-y: auto; border: 1px solid rgba(0, 255, 221, 0.2);
                    border-radius: 6px; background: rgba(0, 0, 0, 0.3);
                "></div>
                <div style="margin-top: 15px;">
                    <button id="delete-selected" style="
                        background: #e74c3c; color: white; border: none; border-radius: 6px;
                        padding: 10px 20px; cursor: pointer; margin-right: 10px;
                    ">删除选中的文件</button>
                    <button id="delete-all-unused" style="
                        background: #c0392b; color: white; border: none; border-radius: 6px;
                        padding: 10px 20px; cursor: pointer;
                    ">删除所有未使用的文件</button>
                </div>
            </div>
        </div>
    `;

    return container;
}

/**
 * 显示资源管理界面
 */
async function showResourceManagement() {
    const container = createResourceManagementUI();
    document.body.appendChild(container);

    let currentScanResults = null;

    // 关闭按钮事件
    container.querySelector('#close-resource-manager').onclick = () => {
        container.remove();
    };

    // 扫描按钮事件
    container.querySelector('#scan-ai-backgrounds').onclick = async () => {
        const scanButton = container.querySelector('#scan-ai-backgrounds');
        const scanStatus = container.querySelector('#scan-status');
        const resultsSection = container.querySelector('#results-section');

        scanButton.disabled = true;
        scanStatus.textContent = '正在扫描...';
        resultsSection.style.display = 'none';

        try {
            const allImages = await scanAIBackgroundImages();
            const analysis = analyzeUnusedAIBackgrounds(allImages);
            currentScanResults = analysis;

            // 显示汇总信息
            const summary = container.querySelector('#summary');
            summary.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong style="color: #00ffdd;">总图像数:</strong><br>
                        ${analysis.total} 个文件
                    </div>
                    <div>
                        <strong style="color: #00ff88;">已使用:</strong><br>
                        ${analysis.used} 个文件
                    </div>
                    <div>
                        <strong style="color: #ff9955;">未使用:</strong><br>
                        ${analysis.unused} 个文件
                    </div>
                </div>
            `;

            // 显示未使用的图像列表
            const unusedList = container.querySelector('#unused-images-list');
            if (analysis.unusedImages.length > 0) {
                unusedList.innerHTML = analysis.unusedImages.map(img => `
                    <div style="
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 8px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <label style="display: flex; align-items: center; flex: 1; cursor: pointer;">
                            <input type="checkbox" class="image-checkbox" data-path="${img.path}"
                                   style="margin-right: 10px;" checked>
                            <div>
                                <div style="font-weight: 600;">${img.name}</div>
                                <div style="font-size: 12px; color: #b0d0ff;">
                                    ${img.characterDir} • ${new Date(img.lastModified).toLocaleDateString()}
                                </div>
                            </div>
                        </label>
                    </div>
                `).join('');
            } else {
                unusedList.innerHTML = '<div style="padding: 20px; text-align: center; color: #00ff88;">没有发现未使用的图像文件！</div>';
            }

            resultsSection.style.display = 'block';
            scanStatus.textContent = `扫描完成 - 发现 ${analysis.unused} 个未使用的文件`;
        } catch (error) {
            scanStatus.textContent = '扫描失败';
            console.error(`[${extensionName}] 扫描失败:`, error);
        } finally {
            scanButton.disabled = false;
        }
    };

    // 删除选中文件
    container.querySelector('#delete-selected').onclick = async () => {
        const checkboxes = container.querySelectorAll('.image-checkbox:checked');
        const selectedPaths = Array.from(checkboxes).map(cb => cb.dataset.path);

        if (selectedPaths.length === 0) {
            alert('请选择要删除的文件');
            return;
        }

        if (!confirm(`确定要删除 ${selectedPaths.length} 个文件吗？此操作无法撤销！`)) {
            return;
        }

        const result = await deleteAIBackgroundImages(selectedPaths);
        alert(`删除完成：成功 ${result.deletedFiles.length} 个，失败 ${result.failedFiles.length} 个`);

        // 重新扫描
        container.querySelector('#scan-ai-backgrounds').click();
    };

    // 删除所有未使用文件
    container.querySelector('#delete-all-unused').onclick = async () => {
        if (!currentScanResults || currentScanResults.unusedImages.length === 0) {
            alert('没有未使用的文件需要删除');
            return;
        }

        if (!confirm(`确定要删除所有 ${currentScanResults.unusedImages.length} 个未使用的文件吗？\n此操作无法撤销！`)) {
            return;
        }

        const allPaths = currentScanResults.unusedImages.map(img => img.path);
        const result = await deleteAIBackgroundImages(allPaths);
        alert(`删除完成：成功 ${result.deletedFiles.length} 个，失败 ${result.failedFiles.length} 个`);

        // 重新扫描
        container.querySelector('#scan-ai-backgrounds').click();
    };

    // 使用CSS来处理响应式定位
    container.style.position = 'fixed';
    container.style.zIndex = '10000';
    container.style.top = '50px';
    container.style.left = '50px';
    container.style.right = '50px';
    container.style.maxHeight = 'calc(100vh - 100px)';
    container.style.overflowY = 'auto';
    container.style.margin = '0 auto';

    // 添加响应式CSS类
    container.classList.add('cyberpunk-resource-manager');
}

function restoreChatStyleSelection() {
    const settings = extension_settings[extensionName];
    const chatDisplaySelect = document.getElementById('chat_display');

    if (!chatDisplaySelect || !settings.enabled || !settings.chat_style_enabled || !settings.chat_style) {
        return;
    }

    // Set the dropdown to our custom style
    if (Object.values(CYBERPUNK_CHAT_STYLES).includes(settings.chat_style)) {
        chatDisplaySelect.value = settings.chat_style.toString();
        console.log(`[${extensionName}] Restored chat style selection to: ${settings.chat_style}`);

        // Apply the style
        applyCyberpunkChatStyle();

        // Trigger change event to ensure ST's internal state is updated
        chatDisplaySelect.dispatchEvent(new Event('change'));
    }
}

function onResetToDefault(type) {
    console.log(`[${extensionName}] Starting reset for ${type}`);
    const settings = extension_settings[extensionName];

    if (!settings.custom) settings.custom = {};

    // Clear the custom value (revert to theme default)
    settings.custom[type] = null;
    console.log(`[${extensionName}] Cleared custom value for ${type}`);

    // Get the theme default value
    const defaultValue = cyberpunkThemeDefaults[type] ||
        (type === 'blur_strength' ? 10 : type === 'shadow_width' ? 2 : 1);
    console.log(`[${extensionName}] Default value for ${type}: ${defaultValue}`);

    // Apply the default value
    if (settings.enabled) {
        applyConfigValue(type, defaultValue);
        console.log(`[${extensionName}] Applied default value: ${defaultValue}`);

        // Update font size calculation if font scale was reset
        if (type === 'font_scale') {
            const fontSize = 15; // Base font size from theme config
            document.documentElement.style.setProperty('--mainFontSize', `calc(${defaultValue} * ${fontSize}px)`);
        }
    }

    // Update the UI controls
    if (type === 'blur_strength') {
        $('#cyberpunk_blur_strength').val(defaultValue);
        $('#cyberpunk_blur_strength_number').val(defaultValue);
    } else if (type === 'shadow_width') {
        $('#cyberpunk_shadow_width').val(defaultValue);
        $('#cyberpunk_shadow_width_number').val(defaultValue);
    } else if (type === 'font_scale') {
        $('#cyberpunk_font_scale').val(defaultValue);
        $('#cyberpunk_font_scale_number').val(defaultValue);
    }
    console.log(`[${extensionName}] Updated UI controls for ${type} to ${defaultValue}`);

    saveSettingsDebounced();
    console.log(`[${extensionName}] Reset ${type} to theme default: ${defaultValue}`);
}

// 防止递归事件触发的标志
let isUpdatingControls = false;

// 修改欢迎页标题相关变量和函数
let titleObserver = null;

// 设置标题观察器，防止ST覆盖我们的修改
function setupTitleObserver(titleElement) {
    // 清除之前的观察器
    if (titleObserver) {
        titleObserver.disconnect();
    }

    titleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const target = mutation.target;
                // 检查是否被ST重置为原始内容
                if (target.textContent && target.textContent.trim() === 'Recent Chats') {
                    console.log(`[${extensionName}] Welcome title was reset by ST, reapplying custom title`);
                    setTimeout(() => {
                        if (extension_settings[extensionName].enabled && isOnHomepage) {
                            target.innerHTML = `<span class="mytitle">${extensionTitle}</span>`;
                        }
                    }, 50);
                }
            }
        });
    });

    // 观察标题元素及其子元素的变化
    titleObserver.observe(titleElement, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// 修改欢迎页标题函数
function modifyWelcomePageTitle() {
    // 使用setTimeout确保DOM元素已加载
    const tryModifyTitle = () => {
        const recentChatsTitle = document.querySelector('.recentChatsTitle');
        if (recentChatsTitle) {
            // 检查是否已经被修改过了
            if (recentChatsTitle.querySelector('.mytitle')) {
                console.log(`[${extensionName}] Welcome page title already modified, skipping`);
                return;
            }

            // 保存原始内容，如果还没保存的话
            if (!recentChatsTitle.dataset.originalContent) {
                recentChatsTitle.dataset.originalContent = recentChatsTitle.innerHTML;
            }
            recentChatsTitle.innerHTML = `<span class="mytitle">${extensionTitle}</span>`;
            console.log(`[${extensionName}] Welcome page title modified`);

            // 设置观察器监听该元素的变化
            setupTitleObserver(recentChatsTitle);
        } else {
            // 如果元素还不存在，稍后再试
            setTimeout(tryModifyTitle, 500);
        }
    };

    // 立即尝试修改
    tryModifyTitle();
}

// 恢复欢迎页标题函数
function restoreWelcomePageTitle() {
    const recentChatsTitle = document.querySelector('.recentChatsTitle');
    if (recentChatsTitle && recentChatsTitle.dataset.originalContent) {
        recentChatsTitle.innerHTML = recentChatsTitle.dataset.originalContent;
        delete recentChatsTitle.dataset.originalContent;
        console.log(`[${extensionName}] Welcome page title restored`);
    }
}

// Function to apply theme based on current settings
function applyTheme() {
    const settings = extension_settings[extensionName];
    if (settings.enabled) {
        applyCyberpunkLayout(settings.layout);
        applyCyberpunkStyle(settings.style);
        document.body.classList.add('cp2027-active');

        // Add chat style options and apply custom chat style
        addCyberpunkChatStyleOptions();
        applyCyberpunkChatStyle();

        // Setup character background integration for Tyrell layout
        if (settings.layout === 'tyrell' && settings.character_backgrounds) {
            setupCharacterBackgroundIntegration();
        }

        // Setup AI background integration
        if (settings.ai_backgrounds) {
            setupAIBackgroundIntegration();
        }

        // Setup video background integration
        if (settings.video_background) {
            createVideoBackground();
            setupVideoBackgroundIntegration();
        }

        // Setup scene data integration
        if (settings.template_rendering) {
            setupSceneDataIntegration();
        }

        // 修改欢迎页标题
        modifyWelcomePageTitle();
    } else {
        removeTheme();
    }
}

// Function to remove theme
//TODO: save layout and style and chat style name into a global config json.
function removeTheme() {
    document.body.classList.remove(
        'cp2027-layout-decker',
        'cp2027-layout-tyrell',
        'cp2027-style-noir',
        'cp2027-style-rust',
        'cp2027-active',
        // Remove chat style classes
        'matrixstyle',
        'neuralstyle'
    );

    // Remove chat style options
    removeCyberpunkChatStyleOptions();

    // Clear character background and remove event listeners
    clearCharacterBackground();

    // 恢复原始欢迎页标题
    restoreWelcomePageTitle();

    // 清理标题观察器
    if (titleObserver) {
        titleObserver.disconnect();
        titleObserver = null;
    }
    eventSource.removeListener(event_types.CHAT_CHANGED, checkHomepageStatus);
    eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, checkHomepageStatus);
    eventSource.removeListener(event_types.MESSAGE_DELETED, checkHomepageStatus);

    // Clear AI background and remove event listeners
    clearAIBackground();
    eventSource.removeListener(event_types.CHAT_CHANGED, onAIChatChanged);
    eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, onAIMessageReceived);
    eventSource.removeListener(event_types.CHAT_DELETED, onAIChatDeleted);

    // Remove AI generate button
    const generateBtn = document.getElementById('cyberpunk_ai_generate_btn');
    if (generateBtn) generateBtn.remove();

    // 清理图像重定位队列
    pendingImageRelocations.clear();
    console.log(`[${extensionName}] IMAGE-QUEUE: Cleared pending queue`);

    // Clear video background and remove event listeners
    removeVideoBackground();
    removeVideoBackgroundEventListeners();

    // Remove scene data integration
    removeSceneDataIntegration();

    // Reset CSS variables to their default values
    const defaultColors = {
        '--SmartThemeBodyColor': 'rgb(220, 220, 210)',
        '--SmartThemeEmColor': 'rgb(145, 145, 145)',
        '--SmartThemeUnderlineColor': 'rgb(188, 231, 207)',
        '--SmartThemeQuoteColor': 'rgb(225, 138, 36)',
        '--SmartThemeBlurTintColor': 'rgba(23, 23, 23, 1)',
        '--SmartThemeChatTintColor': 'rgba(23, 23, 23, 1)',
        '--SmartThemeUserMesBlurTintColor': 'rgba(0, 0, 0, 0.3)',
        '--SmartThemeBotMesBlurTintColor': 'rgba(60, 60, 60, 0.3)',
        '--SmartThemeShadowColor': 'rgba(0, 0, 0, 0.5)',
        '--SmartThemeBorderColor': 'rgba(0, 0, 0, 0.5)',
        '--blurStrength': '10',
        '--SmartThemeBlurStrength': 'calc(10 * 1px)',
        '--shadowWidth': '2',
        '--fontScale': '1',
        '--mainFontSize': 'calc(1 * 15px)'
    };

    Object.entries(defaultColors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });

    // Reset power_user settings to defaults and update UI
    if (typeof power_user !== 'undefined') {
        // Reset to ST defaults
        power_user.blur_strength = 10;
        power_user.shadow_width = 2;
        power_user.font_scale = 1;

        // Update UI elements to show default values
        $('#blur_strength_counter').val(10);
        $('#blur_strength').val(10);
        $('#shadow_width_counter').val(2);
        $('#shadow_width').val(2);
        $('#font_scale_counter').val(1);
        $('#font_scale').val(1);

        console.log(`[${extensionName}] Reset ST settings to defaults: blur=10px, shadow=2px, font_scale=1.0`);
    }

    // Reset body background
    document.body.style.backgroundColor = '';
    document.body.style.color = '';

    // Save the restored settings
    if (typeof saveSettingsDebounced === 'function') {
        saveSettingsDebounced();
    }

    console.log(`[${extensionName}] Theme removed, SillyTavern restored to default`);
}

// Update UI elements with current settings
function updateSettingsUI() {
    const settings = extension_settings[extensionName];
    $('#cyberpunk_enabled').prop('checked', settings.enabled);
    $('#cyberpunk_layout').val(settings.layout);
    $('#cyberpunk_style').val(settings.style);
    $('#cyberpunk_chat_style_enabled').prop('checked', settings.chat_style_enabled);
    $('#cyberpunk_character_backgrounds').prop('checked', settings.character_backgrounds);
    $('#cyberpunk_ai_backgrounds').prop('checked', settings.ai_backgrounds);
    $('#cyberpunk_ai_bg_auto').prop('checked', settings.ai_bg_auto);
    $('#cyberpunk_ai_bg_interval').val(settings.ai_bg_interval);
    $('#cyberpunk_ai_bg_width').val(settings.ai_bg_width);
    $('#cyberpunk_ai_bg_height').val(settings.ai_bg_height);
    $('#cyberpunk_video_background').prop('checked', settings.video_background);
    $('#cyberpunk_video_bg_loop').prop('checked', settings.video_bg_loop);
    $('#cyberpunk_template_rendering').prop('checked', settings.template_rendering);

    // 动态加载主题选项
    loadThemeOptions();

    // 初始化模块列表
    updateAvailableModules(settings.template_theme || 'cyberpunk');
}

// Event handlers
function onEnabledChange() {
    extension_settings[extensionName].enabled = $('#cyberpunk_enabled').prop('checked');
    applyTheme();
    saveSettingsDebounced();
}

function onLayoutChange() {
    const layout = $('#cyberpunk_layout').val();
    extension_settings[extensionName].layout = layout;
    if (extension_settings[extensionName].enabled) {
        applyCyberpunkLayout(layout);

        // Handle character background based on layout
        if (layout === 'tyrell' && extension_settings[extensionName].character_backgrounds) {
            setupCharacterBackgroundIntegration();
        } else {
            clearCharacterBackground();
            eventSource.removeListener(event_types.CHAT_CHANGED, checkHomepageStatus);
            eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, checkHomepageStatus);
            eventSource.removeListener(event_types.MESSAGE_DELETED, checkHomepageStatus);
        }
    }
    saveSettingsDebounced();
}

function onStyleChange() {
    extension_settings[extensionName].style = $('#cyberpunk_style').val();
    if (extension_settings[extensionName].enabled) {
        applyCyberpunkStyle(extension_settings[extensionName].style);
    }
    saveSettingsDebounced();
}

function onChatStyleEnabledChange() {
    const isEnabled = $('#cyberpunk_chat_style_enabled').prop('checked');
    extension_settings[extensionName].chat_style_enabled = isEnabled;

    if (extension_settings[extensionName].enabled) {
        if (isEnabled) {
            // Add chat style options
            addCyberpunkChatStyleOptions();
            console.log(`[${extensionName}] Chat style options enabled`);
        } else {
            // Remove chat style options and classes
            removeCyberpunkChatStyleOptions();
            document.body.classList.remove('matrixstyle', 'neuralstyle');
            extension_settings[extensionName].chat_style = null;
            console.log(`[${extensionName}] Chat style options disabled`);
        }
    }

    saveSettingsDebounced();
}

function onCharacterBackgroundsChange() {
    const isEnabled = $('#cyberpunk_character_backgrounds').prop('checked');
    extension_settings[extensionName].character_backgrounds = isEnabled;

    if (extension_settings[extensionName].enabled && extension_settings[extensionName].layout === 'tyrell') {
        if (isEnabled) {
            setupCharacterBackgroundIntegration();
            console.log(`[${extensionName}] Character backgrounds enabled`);
        } else {
            clearCharacterBackground();
            eventSource.removeListener(event_types.CHAT_CHANGED, checkHomepageStatus);
            eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, checkHomepageStatus);
            eventSource.removeListener(event_types.MESSAGE_DELETED, checkHomepageStatus);
            console.log(`[${extensionName}] Character backgrounds disabled`);
        }
    }

    saveSettingsDebounced();
}

// AI Background Event Handlers
function onAIBackgroundsChange() {
    const isEnabled = $('#cyberpunk_ai_backgrounds').prop('checked');
    extension_settings[extensionName].ai_backgrounds = isEnabled;

    if (extension_settings[extensionName].enabled) {
        if (isEnabled) {
            setupAIBackgroundIntegration();
            console.log(`[${extensionName}] AI backgrounds enabled`);
        } else {
            clearAIBackground();
            eventSource.removeListener(event_types.CHAT_CHANGED, onAIChatChanged);
            eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, onAIMessageReceived);
            eventSource.removeListener(event_types.CHAT_DELETED, onAIChatDeleted);

            // Remove generate button
            const generateBtn = document.getElementById('cyberpunk_ai_generate_btn');
            if (generateBtn) generateBtn.remove();

            console.log(`[${extensionName}] AI backgrounds disabled`);
        }
    }

    saveSettingsDebounced();
}

function onAIBgAutoChange() {
    extension_settings[extensionName].ai_bg_auto = $('#cyberpunk_ai_bg_auto').prop('checked');
    saveSettingsDebounced();
}

function onAIBgIntervalChange() {
    const value = parseInt($('#cyberpunk_ai_bg_interval').val());
    extension_settings[extensionName].ai_bg_interval = value;
    saveSettingsDebounced();
}

function onAIBgWidthChange() {
    const value = parseInt($('#cyberpunk_ai_bg_width').val());
    extension_settings[extensionName].ai_bg_width = value;
    saveSettingsDebounced();
}

function onAIBgHeightChange() {
    const value = parseInt($('#cyberpunk_ai_bg_height').val());
    extension_settings[extensionName].ai_bg_height = value;
    saveSettingsDebounced();
}

// Video Background Event Handlers
function onVideoBackgroundChange() {
    const isEnabled = $('#cyberpunk_video_background').prop('checked');
    extension_settings[extensionName].video_background = isEnabled;

    if (extension_settings[extensionName].enabled) {
        if (isEnabled) {
            createVideoBackground();
            setupVideoBackgroundIntegration();
            // Force immediate status check to ensure video appears if on homepage
            // setTimeout(checkHomepageStatus, 100);
            console.log(`[${extensionName}] Video background enabled`);
        } else {
            removeVideoBackground();
            removeVideoBackgroundEventListeners();
            console.log(`[${extensionName}] Video background disabled`);
        }
    }

    saveSettingsDebounced();
}

function onVideoBgLoopChange() {
    const value = $('#cyberpunk_video_bg_loop').prop('checked');
    extension_settings[extensionName].video_bg_loop = value;

    // Apply updated loop setting if video background is enabled
    if (extension_settings[extensionName].enabled && extension_settings[extensionName].video_background) {
        updateVideoBackgroundSettings();
    }

    saveSettingsDebounced();
}

// Template Rendering Event Handlers
function onTemplateRenderingChange() {
    const isEnabled = $('#cyberpunk_template_rendering').prop('checked');
    extension_settings[extensionName].template_rendering = isEnabled;

    if (extension_settings[extensionName].enabled) {
        if (isEnabled) {
            // 启用模板渲染：设置事件监听器并执行一次完整渲染
            setupSceneDataIntegration();
            console.log(`[${extensionName}] Template rendering enabled - setting up integration`);

            // 延迟执行一次完整的标准化处理，确保当前聊天中的所有模板都被渲染
            setTimeout(async () => {
                await standardTemplateProcessing('TEMPLATE_RENDERING_ENABLED');
                console.log(`[${extensionName}] Initial template rendering completed`);
            }, 200);

        } else {
            // 禁用模板渲染：移除事件监听器并清理所有已渲染的内容
            console.log(`[${extensionName}] Template rendering disabled - cleaning up`);

            // 1. 移除事件监听器
            removeSceneDataIntegration();

            // 2. 清理所有已渲染的HTML容器和CSS
            setTimeout(async () => {
                await cleanupCompleteThemeData();
                console.log(`[${extensionName}] All rendered templates cleaned up`);
            }, 100);
        }
    }

    saveSettingsDebounced();
}



// === Scene Data Processing Functions ===


// 缓存模板文件和配置
let templateConfigs = {}; // 新增：缓存模板配置

// 防重复操作标志
let isProcessing = new Set(); // 跟踪正在处理的消息ID
let isStandardProcessing = false; // 防止标准处理重复执行
let lastProcessedMessage = null; // 记录最后处理的消息，防止重复处理
let lastProcessedTime = 0; // 记录最后处理时间

// 缓存已加载的主题列表
let availableThemes = null;

/**
 * 获取所有可用主题列表
 * @returns {Promise<string[]>} 主题名称数组
 */
async function getAvailableThemes() {
    if (availableThemes) {
        return availableThemes;
    }

    try {
        const themesConfig = await loadThemesConfig();
        if (themesConfig && themesConfig.themes) {
            availableThemes = Object.keys(themesConfig.themes);
            console.log(`[${extensionName}] THEME-CONFIG: Available themes:`, availableThemes);
            return availableThemes;
        }
    } catch (error) {
        console.error(`[${extensionName}] THEME-CONFIG: Error getting available themes:`, error);
    }

    // 回退到默认主题（应与themes-config.json保持一致）
    availableThemes = ['cyberpunk', 'ai-warrior'];
    console.log(`[${extensionName}] THEME-CONFIG: 使用回退主题列表:`, availableThemes);
    return availableThemes;
}

/**
 * 加载主题配置文件
 * @returns {Object|null} 主题配置对象
 */
async function loadThemesConfig() {
    try {
        const configPath = `/scripts/extensions/${extensionName}/chat-elements-themes/themes-config.json`;
        const response = await fetch(configPath);

        if (!response.ok) {
            console.warn(`[${extensionName}] THEME-CONFIG: Failed to load themes config: ${response.status}`);
            return null;
        }

        const config = await response.json();
        console.log(`[${extensionName}] THEME-CONFIG: Loaded themes config successfully`);
        return config;
    } catch (error) {
        console.error(`[${extensionName}] THEME-CONFIG: Error loading themes config:`, error);
        return null;
    }
}

/**
 * 动态加载主题选项到下拉菜单
 */
async function loadThemeOptions() {
    try {
        const themesConfig = await loadThemesConfig();
        const themeSelect = $('#cyberpunk_template_theme');

        if (!themesConfig || !themesConfig.themes) {
            console.warn(`[${extensionName}] THEME-CONFIG: No themes config found, using defaults`);
            return;
        }

        // 清空现有选项
        themeSelect.empty();

        // 添加主题选项
        Object.entries(themesConfig.themes).forEach(([themeId, themeData]) => {
            const optionText = `${themeData.name} - ${themeData.description}`;
            themeSelect.append(`<option value="${themeId}">${optionText}</option>`);
        });

        console.log(`[${extensionName}] THEME-CONFIG: Loaded ${Object.keys(themesConfig.themes).length} theme options`);

        // 设置当前选中的主题
        const currentTheme = extension_settings[extensionName].template_theme || 'cyberpunk';
        themeSelect.val(currentTheme);

    } catch (error) {
        console.error(`[${extensionName}] THEME-CONFIG: Error loading theme options:`, error);

        // 回退到硬编码选项（最后的回退选项，应与themes-config.json保持一致）
        const themeSelect = $('#cyberpunk_template_theme');
        themeSelect.empty();
        themeSelect.append('<option value="cyberpunk">赛博朋克 2027 - 霓虹灯和电子风格</option>');
        themeSelect.append('<option value="ai-warrior">未来A.I战士 - 机械战士主题</option>');
    }
}

/**
 * 根据主题更新可用模块列表
 * @param {string} theme - 主题名称
 */
async function updateAvailableModules(theme) {
    const themesConfig = await loadThemesConfig();
    if (!themesConfig || !themesConfig.themes[theme]) {
        console.warn(`[${extensionName}] THEME-CONFIG: Theme ${theme} not found in config`);
        return;
    }

    const themeData = themesConfig.themes[theme];
    const modulesContainer = $('#cyberpunk_template_modules');

    if (!modulesContainer.length) {
        console.warn(`[${extensionName}] THEME-CONFIG: Modules container not found`);
        return;
    }

    // 清空现有内容
    modulesContainer.empty();

    // 为每个模块创建复选框
    Object.entries(themeData.modules).forEach(([moduleId, moduleInfo]) => {
        const isEnabled = extension_settings[extensionName].template_modules?.[theme]?.[moduleId] ?? moduleInfo.enabled;

        const moduleHtml = `
            <div class="flex-container" style="align-items: center; gap: 10px; margin: 8px 0; width: 100%; max-width: 100%; box-sizing: border-box;">
                <label class="checkbox_label cyberpunk-main-toggle" for="cyberpunk_module_${moduleId}" style="margin: 0; width: 100%; max-width: 100%;">
                    <input type="checkbox" id="cyberpunk_module_${moduleId}" data-theme="${theme}" data-module="${moduleId}" ${isEnabled ? 'checked' : ''} />
                    <span class="cyberpunk-toggle-text" style="font-size: 12px;">${moduleInfo.name}</span>
                </label>
            </div>
            <div class="cyberpunk-description" style="margin-left: 25px; margin-bottom: 10px; max-width: calc(100% - 25px); box-sizing: border-box;">
                <small>${moduleInfo.description}</small>
            </div>
        `;

        modulesContainer.append(moduleHtml);
    });

    // 添加模块变更事件监听器
    modulesContainer.find('input[type="checkbox"]').on('change', onModuleChange);

    console.log(`[${extensionName}] THEME-CONFIG: Updated modules for theme: ${theme}`);
}

/**
 * 处理模块启用/禁用变更
 */
async function onModuleChange() {
    const checkbox = $(this);
    const module = checkbox.data('module');
    const isEnabled = checkbox.prop('checked');

    // 获取当前实际选择的主题（而不是复选框记住的主题）
    const currentTheme = extension_settings[extensionName].template_theme || 'cyberpunk';
    const settings = extension_settings[extensionName];

    console.log(`[${extensionName}] MODULE-CONFIG: ${module} in ${currentTheme} theme: ${isEnabled ? 'enabled' : 'disabled'}`);

    // 初始化模块配置结构
    if (!settings.template_modules) {
        settings.template_modules = {};
    }
    if (!settings.template_modules[currentTheme]) {
        settings.template_modules[currentTheme] = {};
    }

    // 更新设置
    settings.template_modules[currentTheme][module] = isEnabled;

    // 保存设置
    saveSettingsDebounced();

    if (!isEnabled) {
        // 如果禁用了模块，从DOM中移除相应的已渲染模板
        await removeExistingTemplates(module);
        console.log(`[${extensionName}] MODULE-CONFIG: Removed ${module} templates from DOM`);
    } else {
        // 如果启用了模块，使用当前主题立即扫描并渲染该模块的模板
        await renderNewlyEnabledModule(module, currentTheme);
        console.log(`[${extensionName}] MODULE-CONFIG: Rendered ${module} templates for enabled module using theme: ${currentTheme}`);
    }
}

/**
 * 渲染新启用模块的所有模板
 * @param {string} moduleType - 模块类型
 * @param {string} theme - 主题名称
 */
async function renderNewlyEnabledModule(moduleType, theme) {
    try {
        console.log(`[${extensionName}] RENDER-NEW-MODULE: Scanning for ${moduleType} templates`);

        // 查找页面中所有该模块类型的span元素
        const moduleElements = document.querySelectorAll(`span[data-type="${moduleType}"]`);

        if (moduleElements.length === 0) {
            console.log(`[${extensionName}] RENDER-NEW-MODULE: No ${moduleType} elements found in current chat`);
            return;
        }

        console.log(`[${extensionName}] RENDER-NEW-MODULE: Found ${moduleElements.length} ${moduleType} elements to render`);

        // 确保CSS已注入
        await loadAndInjectTemplateCSS(moduleType, theme);

        // 逐个渲染每个元素
        let renderedCount = 0;
        for (const element of moduleElements) {
            try {
                // 检查是否已经被渲染（通过检查下一个兄弟元素）
                const nextSibling = element.nextElementSibling;
                const isAlreadyRendered = nextSibling &&
                    nextSibling.hasAttribute('data-module-type') &&
                    nextSibling.getAttribute('data-module-type') === moduleType;

                if (isAlreadyRendered) {
                    console.log(`[${extensionName}] RENDER-NEW-MODULE: Skipping already rendered ${moduleType} element`);
                    continue;
                }

                // 加载模板配置和HTML
                const templateConfig = await loadTemplateConfig(moduleType, theme);
                const templateHTML = await loadTemplate(moduleType, theme);

                if (!templateConfig || !templateHTML) {
                    console.warn(`[${extensionName}] RENDER-NEW-MODULE: Template or config not available for ${moduleType}@${theme}`);
                    continue;
                }

                // 解析和渲染模板
                const templateData = processTemplateData(element, templateConfig);
                if (Object.keys(templateData).length === 0) {
                    console.warn(`[${extensionName}] RENDER-NEW-MODULE: No data found in ${moduleType} element`);
                    continue;
                }

                const renderedHTML = renderTemplateWithConfig(templateHTML, templateData, templateConfig);

                // 创建并插入渲染结果
                const containerDiv = document.createElement('div');
                containerDiv.innerHTML = renderedHTML;
                const templateContainer = containerDiv.firstElementChild;

                // 添加标识属性
                const elementId = `${moduleType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                templateContainer.setAttribute('data-template-id', elementId);
                templateContainer.setAttribute('data-module-type', moduleType);

                // 插入DOM并隐藏原始元素
                element.parentNode.insertBefore(templateContainer, element.nextSibling);
                if (element instanceof HTMLElement) {
                    element.style.display = 'none';
                }

                renderedCount++;
                console.log(`[${extensionName}] RENDER-NEW-MODULE: Successfully rendered ${moduleType} element with ID: ${elementId}`);

            } catch (error) {
                console.error(`[${extensionName}] RENDER-NEW-MODULE: Error rendering ${moduleType} element:`, error);
            }
        }

        console.log(`[${extensionName}] RENDER-NEW-MODULE: Rendered ${renderedCount}/${moduleElements.length} ${moduleType} templates`);

    } catch (error) {
        console.error(`[${extensionName}] RENDER-NEW-MODULE: Error in renderNewlyEnabledModule:`, error);
    }
}

// ===================================
// 新的清理+注入机制
// ===================================

/**
 * 获取所有需要管理的模块列表
 * @returns {Promise<string[]>} 所有模块名称数组
 */
async function getAllModulesFromConfig() {
    try {
        const config = await loadThemesConfig();
        if (config && config.all_modules && Array.isArray(config.all_modules)) {
            console.log(`[${extensionName}] 从配置获取所有模块:`, config.all_modules);
            return config.all_modules;
        }
    } catch (error) {
        console.error(`[${extensionName}] 获取模块列表失败:`, error);
    }

    // 回退到配置文件中的默认模块列表
    const defaultModules = ['scene-container', 'combat-interface', 'inventory-check', 'character-status', 'dialogue-panel', 'map-display'];
    console.log(`[${extensionName}] 使用默认模块列表:`, defaultModules);
    return defaultModules;
}

/**
 * 获取指定主题的启用模块列表（考虑用户设置优先级）
 * @param {string} themeName - 主题名称
 * @returns {Promise<string[]>} 启用的模块名称数组
 */
async function getEnabledModulesForTheme(themeName) {
    try {
        const config = await loadThemesConfig();
        if (!config || !config.themes || !config.themes[themeName]) {
            console.warn(`[${extensionName}] 主题${themeName}配置不存在`);
            return [];
        }

        const themeConfig = config.themes[themeName];
        const settings = extension_settings[extensionName];

        const enabledModules = Object.entries(themeConfig.modules || {})
            .filter(([moduleId, moduleInfo]) => {
                // 优先使用用户设置，如果没有则使用配置文件默认值
                const userSetting = settings.template_modules?.[themeName]?.[moduleId];
                const isEnabled = userSetting !== undefined ? userSetting : moduleInfo.enabled;
                return isEnabled === true;
            })
            .map(([moduleId]) => moduleId);

        console.log(`[${extensionName}] 主题${themeName}启用模块（考虑用户设置）:`, enabledModules);
        return enabledModules;
    } catch (error) {
        console.error(`[${extensionName}] 获取主题${themeName}的启用模块失败:`, error);
        return [];
    }
}

// ===================================
// 清理子函数
// ===================================

/**
 * 清理所有模块的CSS样式元素
 * @param {string[]} moduleTypes - 要清理的模块类型列表
 */
function cleanupStyleDOMs(moduleTypes) {
    console.log(`[${extensionName}] 清理Style DOM...`);

    let cleanedCount = 0;
    moduleTypes.forEach(moduleType => {
        // 清理所有主题的CSS（使用通配符匹配）
        const allStyleElements = document.querySelectorAll(`style[id^="${moduleType}-"][id$="-css"]`);
        allStyleElements.forEach(styleElement => {
            styleElement.remove();
            cleanedCount++;
            console.log(`[${extensionName}] 移除CSS: ${styleElement.id}`);
        });

        // 兼容旧的ID格式（没有主题名的）
        const oldCssId = `${moduleType}-css`;
        const oldStyleElement = document.getElementById(oldCssId);
        if (oldStyleElement) {
            oldStyleElement.remove();
            cleanedCount++;
            console.log(`[${extensionName}] 移除旧CSS: ${oldCssId}`);
        }
    });

    console.log(`[${extensionName}] 清理了 ${cleanedCount} 个Style DOM`);
}

/**
 * 强制清理所有模板CSS（包括可能的格式变体和残留）
 */
async function forceCleanupAllTemplateCSS() {
    console.log(`[${extensionName}] 强制清理所有模板CSS...`);

    let cleanedCount = 0;

    try {
        // 动态获取所有模块和主题
        const allModules = await getAllModulesFromConfig();
        const allThemes = await getAvailableThemes();

        // 动态生成所有可能的CSS ID格式
        const possiblePatterns = [];

        // 为每个模块和主题组合生成CSS ID
        allModules.forEach(module => {
            allThemes.forEach(theme => {
                // 新格式: moduleType-theme-css
                possiblePatterns.push(`${module}-${theme}-css`);
                // 旧格式: theme-moduleType-css
                possiblePatterns.push(`${theme}-${module}-css`);
            });
            // 更旧格式: moduleType-css (没有主题)
            possiblePatterns.push(`${module}-css`);
        });

        // 其他可能的格式
        possiblePatterns.push(`${extensionName}-scene-styles`);

        possiblePatterns.forEach(cssId => {
            const element = document.getElementById(cssId);
            if (element) {
                element.remove();
                cleanedCount++;
                console.log(`[${extensionName}] 强制清理CSS: ${cssId}`);
            }
        });

    } catch (error) {
        console.warn(`[${extensionName}] 动态清理失败，使用回退模式:`, error);

        // 回退到硬编码清理（以防配置文件无法读取）
        const fallbackPatterns = [
            // 基于themes-config.json的回退模式
            'scene-container-cyberpunk-css', 'scene-container-ai-warrior-css',
            'combat-interface-cyberpunk-css', 'combat-interface-ai-warrior-css',
            'inventory-check-cyberpunk-css', 'inventory-check-ai-warrior-css',
            'character-status-cyberpunk-css', 'character-status-ai-warrior-css',
            'dialogue-panel-cyberpunk-css', 'dialogue-panel-ai-warrior-css',
            'map-display-cyberpunk-css', 'map-display-ai-warrior-css',
            // 旧格式
            'cyberpunk-scene-container-css', 'ai-warrior-scene-container-css',
            'cyberpunk-combat-interface-css', 'ai-warrior-combat-interface-css',
            // 更旧格式
            'scene-container-css', 'combat-interface-css', 'inventory-check-css',
            'character-status-css', 'dialogue-panel-css', 'map-display-css',
            // 其他格式
            `${extensionName}-scene-styles`
        ];

        fallbackPatterns.forEach(cssId => {
            const element = document.getElementById(cssId);
            if (element) {
                element.remove();
                cleanedCount++;
                console.log(`[${extensionName}] 回退清理CSS: ${cssId}`);
            }
        });
    }

    // 使用选择器清理任何匹配模式的style元素
    const wildcardSelectors = [
        'style[id*="scene-container"]',
        'style[id*="combat-interface"]',
        'style[id*="cyberpunk"]',
        'style[id*="ai-warrior"]'
    ];

    wildcardSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 只清理我们扩展相关的CSS
            if (element.id.includes('scene-container') ||
                element.id.includes('combat-interface') ||
                element.id.includes(extensionName)) {
                element.remove();
                cleanedCount++;
                console.log(`[${extensionName}] 通配符清理CSS: ${element.id}`);
            }
        });
    });

    console.log(`[${extensionName}] 强制清理完成，共清理 ${cleanedCount} 个CSS元素`);
}

/**
 * 注入共享功能模块CSS
 */
async function injectSharingFunctionsCSS() {
    try {
        const cssId = `${extensionName}-sharing-functions-css`;

        // 检查是否已经注入过
        if (document.getElementById(cssId)) {
            console.log(`[${extensionName}] Sharing functions CSS already injected`);
            return;
        }

        // 加载CSS文件
        const cssPath = `/scripts/extensions/${extensionName}/sharing_functions.css`;
        const response = await fetch(cssPath);

        if (!response.ok) {
            console.warn(`[${extensionName}] Sharing functions CSS not found: ${cssPath}`);
            return;
        }

        const cssContent = await response.text();

        // 创建并注入style元素
        const styleElement = document.createElement('style');
        styleElement.id = cssId;
        styleElement.textContent = cssContent;
        document.head.appendChild(styleElement);

        console.log(`[${extensionName}] Sharing functions CSS injected successfully, length: ${cssContent.length}`);

    } catch (error) {
        console.error(`[${extensionName}] Error injecting sharing functions CSS:`, error);
    }
}

/**
 * 标准化模板处理流程：确保CSS注入 → 处理消息
 * 优化版本：处理所有包含模板元素的消息，不依赖扩展数据
 * @param {string} trigger - 触发源（用于日志）
 * @param {Element|null} targetMessageElement - 目标消息元素（如果只处理单个消息）
 * @param {number|null} targetMessageId - 目标消息ID（如果只处理单个消息）
 */
async function standardTemplateProcessing(trigger, targetMessageElement = null, targetMessageId = null) {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.template_rendering) {
        return;
    }

    // 防止重复执行 - 但允许 MESSAGE_UPDATED 重新执行
    if (isStandardProcessing && trigger !== 'MESSAGE_UPDATED') {
        console.log(`[${extensionName}] STANDARD-PROCESSING: 跳过重复执行，触发源: ${trigger}`);
        return;
    }

    isStandardProcessing = true;
    console.log(`[${extensionName}] STANDARD-PROCESSING: 开始标准化处理，触发源: ${trigger}`);

    try {
        const currentTheme = settings.template_theme || 'cyberpunk';
        const enabledModules = await getEnabledModulesForTheme(currentTheme);

        if (enabledModules.length === 0) {
            console.log(`[${extensionName}] STANDARD-PROCESSING: 没有启用的模块，跳过处理`);
            return;
        }

        // === 第1步：确保CSS已注入（只在需要时注入）===
        console.log(`[${extensionName}] STANDARD-PROCESSING: 步骤1 - 确保CSS已注入`);
        await ensureThemeCSS(enabledModules, currentTheme);

        // === 第2步：智能处理消息 ===
        console.log(`[${extensionName}] STANDARD-PROCESSING: 步骤2 - 智能处理消息`);

        if (targetMessageId !== null && targetMessageElement) {
            // 单个消息处理
            console.log(`[${extensionName}] STANDARD-PROCESSING: 处理单个消息 ${targetMessageId}`);

            // 修复：查找模板元素时包括隐藏的元素
            const allSpanElements = targetMessageElement.querySelectorAll('span[data-type]');
            const hasTemplateElements = allSpanElements.length > 0;

            if (hasTemplateElements) {
                const elementTypes = Array.from(allSpanElements).map(el => el.getAttribute('data-type'));
                console.log(`[${extensionName}] STANDARD-PROCESSING: 消息${targetMessageId}包含模板元素（包括隐藏的）: ${elementTypes.join(', ')}`);
                await processMessageIfHasThemeData(targetMessageElement, targetMessageId);
            } else {
                console.log(`[${extensionName}] STANDARD-PROCESSING: 消息${targetMessageId}不包含模板元素`);
            }
        } else {
            // 全局处理：扫描所有消息
            const context = getContext();
            if (context.chat) {
                let processedCount = 0;
                let totalMessages = context.chat.length;
                console.log(`[${extensionName}] STANDARD-PROCESSING: 扫描 ${totalMessages} 条消息寻找模板元素`);

                for (let index = 0; index < context.chat.length; index++) {
                    const messageElement = document.querySelector(`#chat [mesid="${index}"]`);
                    if (messageElement) {
                        // 检查消息是否包含模板元素
                        const hasTemplateElements = messageElement.querySelectorAll('span[data-type]').length > 0;
                        if (hasTemplateElements) {
                            const elementTypes = Array.from(messageElement.querySelectorAll('span[data-type]')).map(el => el.getAttribute('data-type'));
                            console.log(`[${extensionName}] STANDARD-PROCESSING: 消息${index}包含模板元素: ${elementTypes.join(', ')}`);
                            await processMessageIfHasThemeData(messageElement, index);
                            processedCount++;
                        }
                    } else {
                        console.log(`[${extensionName}] STANDARD-PROCESSING: 消息${index}的DOM元素未找到`);
                    }
                }
                console.log(`[${extensionName}] STANDARD-PROCESSING: 全局处理了 ${processedCount}/${totalMessages} 个包含模板元素的消息`);
            } else {
                console.log(`[${extensionName}] STANDARD-PROCESSING: 无聊天数据可处理`);
            }
        }
        scrollToBottom();
        console.log(`[${extensionName}] STANDARD-PROCESSING: 完成，触发源: ${trigger}`);

    } catch (error) {
        console.error(`[${extensionName}] STANDARD-PROCESSING ERROR:`, error);
    } finally {
        // 延迟重置防重复标志，给异步操作时间完成
        // 对于 MESSAGE_UPDATED，立即重置以允许后续编辑操作
        const resetDelay = trigger === 'MESSAGE_UPDATED' ? 50 : 100;
        setTimeout(() => {
            isStandardProcessing = false;
            console.log(`[${extensionName}] STANDARD-PROCESSING: 重置处理标志，触发源: ${trigger}`);
        }, resetDelay);
    }
}

/**
 * 确保主题CSS已注入（智能检查，避免重复注入）
 * @param {string[]} enabledModules - 启用的模块列表
 * @param {string} currentTheme - 当前主题
 */
async function ensureThemeCSS(enabledModules, currentTheme) {
    console.log(`[${extensionName}] ENSURE-CSS: 检查主题CSS是否需要注入`);

    let needsInjection = false;
    const missingModules = [];

    // 检查每个模块的CSS是否已存在
    for (const moduleType of enabledModules) {
        const cssId = `${moduleType}-${currentTheme}-css`;
        if (!document.getElementById(cssId)) {
            needsInjection = true;
            missingModules.push(moduleType);
        }
    }

    if (needsInjection) {
        console.log(`[${extensionName}] ENSURE-CSS: 需要注入CSS，缺失模块:`, missingModules);

        // 只清理和注入缺失的CSS
        if (missingModules.length < enabledModules.length) {
            // 部分缺失，只注入缺失的
            await injectStyleDOMs(missingModules, currentTheme);
        } else {
            // 全部缺失，先清理再注入
            const allModules = await getAllModulesFromConfig();
            cleanupStyleDOMs(allModules);
            await injectStyleDOMs(enabledModules, currentTheme);
        }
    } else {
        console.log(`[${extensionName}] ENSURE-CSS: 主题CSS已存在，跳过注入`);
    }
}

/**
 * 简化的消息处理：基于DOM元素的纯净渲染（无扩展数据依赖）
 * @param {Element} messageElement - 消息DOM元素
 * @param {number} messageId - 消息ID
 */
async function processMessageIfHasThemeData(messageElement, messageId) {
    const context = getContext();
    const message = context.chat[messageId];

    // 跳过用户和系统消息
    if (!message || message.is_user || message.is_system) {
        return;
    }

    // 动态获取所有模块列表
    const allModules = await getAllModulesFromConfig();

    // 构建动态选择器：检查消息DOM中是否包含模板元素
    const dataTypeSelectors = allModules.map(module => `span[data-type="${module}"]`).join(', ');
    const templateElements = messageElement.querySelectorAll(dataTypeSelectors);

    if (templateElements.length === 0) {
        return;
    }

    console.log(`[${extensionName}] SIMPLE-PROCESSING: 处理消息${messageId}，发现${templateElements.length}个模板元素`);

    // 构建动态选择器：清理所有已渲染的容器（防止重复渲染）
    const containerSelectors = allModules.map(module => `[data-module-type="${module}"]`).join(', ');
    const containers = messageElement.querySelectorAll(containerSelectors);
    containers.forEach(container => container.remove());
    console.log(`[${extensionName}] SIMPLE-PROCESSING: 清理了${containers.length}个已渲染容器`);

    // 确保所有原始模板元素都可见（以防之前被隐藏）
    templateElements.forEach(element => {
        if (element.style.display === 'none') {
            element.style.display = '';
            console.log(`[${extensionName}] SIMPLE-PROCESSING: 恢复显示原始模板元素`);
        }
    });

    // 基于DOM元素重新渲染（纯净的源数据驱动）
    await processSceneDataInMessage(messageElement, messageId); // 传递false表示不保存扩展数据
    console.log(`[${extensionName}] SIMPLE-PROCESSING: 完成消息${messageId}的纯净渲染`);
}

/**
 * 清理所有模块的已渲染HTML元素
 * @param {string[]} moduleTypes - 要清理的模块类型列表
 */
function cleanupRenderedHTMLDOMs(moduleTypes) {
    console.log(`[${extensionName}] 清理已渲染HTML DOM...`);

    let cleanedCount = 0;
    moduleTypes.forEach(moduleType => {
        // 1. 清理带有 data-module-type 属性的容器（我们的新标准）
        const moduleContainers = document.querySelectorAll(`[data-module-type="${moduleType}"]`);
        moduleContainers.forEach(container => {
            container.remove();
            cleanedCount++;
        });

        // 2. 清理带有 data-template-id 属性的容器
        const templateContainers = document.querySelectorAll(`[data-template-id*="${moduleType}"]`);
        templateContainers.forEach(container => {
            container.remove();
            cleanedCount++;
        });

        // 3. 清理旧格式的主容器类
        const mainContainers = document.querySelectorAll(`.${moduleType}`);
        mainContainers.forEach(container => {
            container.remove();
            cleanedCount++;
        });

        // 4. 清理可能的变体类（如带主题后缀的）
        const variantContainers = document.querySelectorAll(`[class*="${moduleType}"]`);
        variantContainers.forEach(container => {
            if (container.className.includes(moduleType)) {
                container.remove();
                cleanedCount++;
            }
        });

        console.log(`[${extensionName}] 清理HTML容器: ${moduleType}`);
    });

    console.log(`[${extensionName}] 清理了 ${cleanedCount} 个HTML DOM`);
}

// === 已废弃的扩展数据清理函数 ===
// 现在使用纯净的DOM驱动渲染，在processMessageIfHasThemeData中直接清理

/**
 * 完整清理所有主题数据（简化版）
 */
async function cleanupCompleteThemeData() {
    console.log(`[${extensionName}] 开始完整主题数据清理...`);

    try {
        // 获取所有需要清理的模块列表
        const allModules = await getAllModulesFromConfig();

        // 1. 恢复所有被隐藏的原始span元素
        restoreHiddenSpanElements(allModules);

        // 2. 清理已渲染的HTML容器
        cleanupRenderedHTMLDOMs(allModules);

        // 3. 清理CSS样式
        cleanupStyleDOMs(allModules);

        // 4. 清除处理标志
        isProcessing.clear();

        // 5. 清理共享功能模块
        sharingFunctions.cleanup();
        console.log(`[${extensionName}] 共享功能清理完成`);

        console.log(`[${extensionName}] 完整主题数据清理完成`);
    } catch (error) {
        console.error(`[${extensionName}] 完整主题数据清理失败:`, error);
        throw error;
    }
}

/**
 * 恢复所有被隐藏的原始span元素
 * @param {string[]} moduleTypes - 要恢复的模块类型列表
 */
function restoreHiddenSpanElements(moduleTypes) {
    console.log(`[${extensionName}] 恢复被隐藏的原始span元素...`);

    let restoredCount = 0;
    moduleTypes.forEach(moduleType => {
        // 查找所有该模块类型的span元素
        const spanElements = document.querySelectorAll(`span[data-type="${moduleType}"]`);

        spanElements.forEach(spanElement => {
            // 恢复被隐藏的span元素显示
            if (spanElement.style.display === 'none') {
                spanElement.style.display = '';
                restoredCount++;
                console.log(`[${extensionName}] 恢复显示原始span元素: ${moduleType}`);
            }
        });
    });

    console.log(`[${extensionName}] 恢复了 ${restoredCount} 个被隐藏的span元素`);
}

/**
 * 注入指定模块的CSS样式
 * @param {string[]} moduleTypes - 要注入的模块类型列表
 * @param {string} theme - 主题名称
 */
async function injectStyleDOMs(moduleTypes, theme) {
    console.log(`[${extensionName}] 注入Style DOM for theme: ${theme}`);

    const injectionPromises = moduleTypes.map(async (moduleType) => {
        try {
            const cssId = `${moduleType}-${theme}-css`;

            // 检查是否已经存在（防止重复注入）
            if (document.getElementById(cssId)) {
                console.log(`[${extensionName}] CSS已存在，跳过: ${cssId}`);
                return;
            }

            // 加载CSS文件
            const cssPath = `/scripts/extensions/${extensionName}/chat-elements-themes/${theme}/${moduleType}/template.css`;
            const response = await fetch(cssPath);

            if (!response.ok) {
                console.warn(`[${extensionName}] CSS文件不存在: ${cssPath}`);
                return;
            }

            const cssContent = await response.text();

            // 创建并注入style元素
            const styleElement = document.createElement('style');
            styleElement.id = cssId;
            styleElement.textContent = cssContent;
            document.head.appendChild(styleElement);

            console.log(`[${extensionName}] 注入CSS成功: ${cssId}, 长度: ${cssContent.length}`);

        } catch (error) {
            console.error(`[${extensionName}] 注入CSS失败 ${moduleType}:`, error);
        }
    });

    await Promise.all(injectionPromises);
    console.log(`[${extensionName}] 所有Style DOM注入完成`);
}

/**
 * 处理主题选择变更（使用新机制）
 */
function onThemeSelectionChange() {
    const selectedTheme = String($('#cyberpunk_template_theme').val() || 'cyberpunk');
    console.log(`[${extensionName}] THEME-CONFIG: Theme changed to: ${selectedTheme}`);

    // 首先保存设置
    extension_settings[extensionName].template_theme = selectedTheme;
    saveSettingsDebounced();

    // **重要**：更新模块选择UI以反映新主题的模块状态
    updateAvailableModules(selectedTheme);

    // 强制清理所有CSS和重置处理标志
    isStandardProcessing = false; // 重置标志以允许执行

    // 延迟执行确保UI更新完成，并强制清理
    setTimeout(async () => {
        try {
            // 强制清理所有CSS
            const allModules = await getAllModulesFromConfig();
            cleanupStyleDOMs(allModules);
            await forceCleanupAllTemplateCSS();
            console.log(`[${extensionName}] THEME-SWITCH: 强制清理所有CSS完成`);

            // 执行标准处理
            await standardTemplateProcessing('THEME_CHANGED');
            console.log(`[${extensionName}] THEME-SWITCH: 主题切换完成，UI和模板已同步到主题: ${selectedTheme}`);
        } catch (error) {
            console.error(`[${extensionName}] THEME-SWITCH ERROR:`, error);
        }
    }, 100);
}

/**
 * 移除指定模块类型的已渲染模板
 * @param {string} moduleType - 模块类型
 */
async function removeExistingTemplates(moduleType) {
    // 移除原始的span元素
    const elements = document.querySelectorAll(`[data-type="${moduleType}"]`);

    // 移除已渲染的容器（使用更通用的选择器）
    const renderedElements = document.querySelectorAll(`[data-module-type="${moduleType}"]`);
    renderedElements.forEach(container => container.remove());

    // 恢复显示被隐藏的原始span元素
    elements.forEach(element => {
        if (element.style.display === 'none') {
            element.style.display = '';
        }
    });

    console.log(`[${extensionName}] TEMPLATE-CLEANUP: Removed ${renderedElements.length} ${moduleType} templates`);
}

// /**
//  * 重新渲染现有模板以应用新主题
//  * @param {string} newTheme - 新主题名称
//  */
// async function reRenderExistingTemplates(newTheme) {
//     // 获取所有模块类型
//     const allModules = await getAllModulesFromConfig();

//     // 动态构建选择器，查找所有模块的模板元素
//     const moduleSelectors = allModules.map(module => `[data-type="${module}"]`);
//     const allTemplateElements = document.querySelectorAll(moduleSelectors.join(', '));

//     console.log(`[${extensionName}] THEME-SWITCH: Re-rendering ${allTemplateElements.length} templates with theme: ${newTheme}`);

//     // 首先完全清理所有现有的渲染区
//     const allRenderedContainers = document.querySelectorAll('[data-module-type]');
//     console.log(`[${extensionName}] THEME-SWITCH: Removing ${allRenderedContainers.length} existing rendered containers`);
//     allRenderedContainers.forEach(container => container.remove());

//     // 按模块类型分组
//     const elementsByType = {};
//     allTemplateElements.forEach(element => {
//         const dataType = element.getAttribute('data-type');
//         if (!elementsByType[dataType]) {
//             elementsByType[dataType] = [];
//         }
//         elementsByType[dataType].push(element);
//     });

//     // 处理每个模块类型的元素
//     for (const [moduleType, elements] of Object.entries(elementsByType)) {
//         for (const element of elements) {
//             try {
//                 // 提取原始数据
//                 const originalData = {};
//                 Array.from(element.attributes).forEach(attr => {
//                     if (attr.name.startsWith('data-') && attr.name !== 'data-type') {
//                         originalData[attr.name] = attr.value;
//                     }
//                 });

//                 // 使用新主题重新渲染
//                 const newRenderedHTML = await renderTemplateWithNewTheme(moduleType, originalData, newTheme);

//                 if (newRenderedHTML) {
//                     // 创建新元素并直接插入（不依赖nextElementSibling）
//                     const containerDiv = document.createElement('div');
//                     containerDiv.innerHTML = newRenderedHTML;
//                     const newContainer = containerDiv.firstElementChild;

//                     // 添加模块类型标识
//                     newContainer.setAttribute('data-module-type', moduleType);

//                     // 在span标签后插入新渲染的容器
//                     element.parentNode.insertBefore(newContainer, element.nextSibling);

//                     console.log(`[${extensionName}] THEME-SWITCH: Re-rendered ${moduleType} template with theme: ${newTheme}`);
//                 }
//             } catch (error) {
//                 console.error(`[${extensionName}] THEME-SWITCH: Error re-rendering ${moduleType} template:`, error);
//             }
//         }
//     }
// }

// /**
//  * 使用指定主题渲染模板
//  * @param {string} templateType - 模板类型
//  * @param {Object} data - 数据对象
//  * @param {string} theme - 主题名称
//  * @returns {string|null} 渲染后的HTML
//  */
// async function renderTemplateWithNewTheme(templateType, data, theme) {
//     try {
//         const config = await loadTemplateConfig(templateType, theme);
//         if (!config) {
//             console.warn(`[${extensionName}] TEMPLATE-RENDER: Config not found for ${templateType} in ${theme} theme`);
//             return null;
//         }

//         // 加载模板HTML
//         const templateHTML = await loadTemplate(templateType, theme);
//         if (!templateHTML) {
//             console.warn(`[${extensionName}] TEMPLATE-RENDER: Template HTML not found for ${templateType} in ${theme} theme`);
//             return null;
//         }

//         // 加载并注入CSS（如果还没加载过）
//         await loadAndInjectTemplateCSS(templateType, theme);

//         // data已经是处理过的数据对象，直接使用renderTemplateWithConfig渲染
//         let renderedHTML = renderTemplateWithConfig(templateHTML, data, config);

//         // CSS由主题文件自动处理，无需添加额外类

//         return renderedHTML;
//     } catch (error) {
//         console.error(`[${extensionName}] TEMPLATE-RENDER: Error rendering with new theme:`, error);
//         return null;
//     }
// }

/**
 * 移除指定主题的模板CSS
 * @param {string} templateType - 模板类型 (如 'scene-container')
 * @param {string} theme - 主题名称 (如 'cyberpunk')
 */
function removeTemplateCSS(templateType, theme) {
    const cssKey = `${templateType}-${theme}-css`;
    const styleElement = document.getElementById(cssKey);
    if (styleElement) {
        styleElement.remove();
        console.log(`[${extensionName}] TEMPLATE-CSS: Removed CSS for ${templateType}-${theme}`);
    }

    // 兼容旧格式的清理
    const oldCssKey = `${theme}-${templateType}-css`;
    const oldStyleElement = document.getElementById(oldCssKey);
    if (oldStyleElement) {
        oldStyleElement.remove();
        console.log(`[${extensionName}] TEMPLATE-CSS: Removed old format CSS for ${theme}-${templateType}`);
    }
}

/**
 * 移除所有主题的指定模板类型CSS（主题切换时清理）
 * @param {string} templateType - 模板类型 (如 'scene-container')
 * @param {string} excludeTheme - 排除的主题（当前主题不清理）
 */
async function removeAllTemplateCSS(templateType, excludeTheme = null) {
    // 动态获取所有主题列表
    const allThemes = await getAvailableThemes();

    allThemes.forEach(theme => {
        if (theme !== excludeTheme) {
            removeTemplateCSS(templateType, theme);
        }
    });
}

/**
 * 加载并注入模板CSS
 * @param {string} templateType - 模板类型 (如 'scene-container')
 * @param {string} theme - 主题名称 (如 'cyberpunk')
 */
async function loadAndInjectTemplateCSS(templateType, theme = 'cyberpunk') {
    const cssKey = `${templateType}-${theme}-css`;

    // 总是先清理其他主题的CSS以避免冲突
    await removeAllTemplateCSS(templateType, theme);

    // 检查是否已经注入过
    if (document.getElementById(cssKey)) {
        console.log(`[${extensionName}] TEMPLATE-CSS: CSS for ${templateType}-${theme} already injected`);
        return; // 已经注入过
    }

    try {
        const cssPath = `/scripts/extensions/${extensionName}/chat-elements-themes/${theme}/${templateType}/template.css`;
        console.log(`[${extensionName}] TEMPLATE-CSS: Loading CSS from ${cssPath}`);

        const response = await fetch(cssPath);
        if (!response.ok) {
            console.warn(`[${extensionName}] TEMPLATE-CSS: CSS not found at ${cssPath}`);
            return;
        }

        const cssContent = await response.text();

        // 创建并注入CSS样式
        const styleElement = document.createElement('style');
        styleElement.id = cssKey;
        styleElement.textContent = cssContent;
        document.head.appendChild(styleElement);

        console.log(`[${extensionName}] TEMPLATE-CSS: Injected CSS for ${theme}-${templateType}, length: ${cssContent.length}`);
    } catch (error) {
        console.error(`[${extensionName}] TEMPLATE-CSS: Error loading CSS:`, error);
    }
}

/**
 * 加载模板HTML文件
 * @param {string} templateType - 模板类型 (如 'scene-container')
 * @param {string} theme - 主题名称 (如 'cyberpunk')
 * @returns {string|null} 模板HTML内容
 */
async function loadTemplate(templateType, theme = 'cyberpunk') {
    const templateKey = `${theme}-${templateType}`;

    try {
        const templatePath = `/scripts/extensions/${extensionName}/chat-elements-themes/${theme}/${templateType}/template.html`;
        // console.log(`[${extensionName}] TEMPLATE-LOAD: Loading HTML from ${templatePath}`);

        const response = await fetch(templatePath);
        if (!response.ok) {
            console.warn(`[${extensionName}] TEMPLATE-LOAD: Template not found at ${templatePath}`);
            return null;
        }

        const templateHTML = await response.text();
        // console.log(`[${extensionName}] TEMPLATE-LOAD: Loaded HTML template, length: ${templateHTML.length}`);
        return templateHTML;
    } catch (error) {
        console.error(`[${extensionName}] TEMPLATE-LOAD: Error loading template:`, error);
        return null;
    }
}

/**
 * 加载模板配置文件
 * @param {string} templateType - 模板类型 (如 'scene-container')
 * @param {string} theme - 主题名称 (如 'cyberpunk')
 * @returns {Object|null} 配置对象
 */
async function loadTemplateConfig(templateType, theme = 'cyberpunk') {
    const configKey = `${theme}-${templateType}`;

    // 检查缓存
    if (templateConfigs[configKey]) {
        console.log(`[${extensionName}] TEMPLATE-CONFIG: Using cached config for ${configKey}`);
        return templateConfigs[configKey];
    }

    try {
        const configPath = `/scripts/extensions/${extensionName}/chat-elements-themes/${theme}/${templateType}/config.json`;
        // console.log(`[${extensionName}] TEMPLATE-CONFIG: Loading config from ${configPath}`);

        const response = await fetch(configPath);
        if (!response.ok) {
            console.warn(`[${extensionName}] TEMPLATE-CONFIG: Config not found at ${configPath}, using fallback`);
            return null;
        }

        const config = await response.json();
        templateConfigs[configKey] = config;

        // console.log(`[${extensionName}] TEMPLATE-CONFIG: Loaded config for ${configKey}:`, config);
        return config;

    } catch (error) {
        console.error(`[${extensionName}] TEMPLATE-CONFIG ERROR loading config for ${configKey}:`, error);
        return null;
    }
}

/**
 * 通用模板数据处理函数
 * @param {Element} element - DOM元素
 * @param {Object} config - 模板配置
 * @returns {Object} 处理后的数据对象
 */
/**
 * 从 ST 系统自动获取数据
 * @param {string} type - 数据类型 (main_character, user)
 * @param {string} attribute - 属性名 (name, avatar)
 * @returns {string|null} 获取到的数据
 */
function getAutoData(type, attribute) {
    try {
        switch (type) {
            case 'main_character':
                const mainChar = characters[this_chid];
                if (attribute === 'name') {
                    return mainChar?.name || '未知角色';
                }
                if (attribute === 'avatar') {
                    return mainChar?.avatar ? getThumbnailUrl('avatar', mainChar.avatar) : '';
                }
                break;

            case 'user':
                if (attribute === 'name') {
                    // 从 script.js 导出的 name1 变量获取用户名
                    return typeof name1 !== 'undefined' ? name1 : '用户';
                }
                if (attribute === 'avatar') {
                    // 从 personas.js 导出的 user_avatar 变量获取用户头像
                    // 注意：用户头像使用 'persona' 类型，不是 'avatar' 类型
                    return typeof user_avatar !== 'undefined' && user_avatar ?
                        getThumbnailUrl('persona', user_avatar) : '';
                }
                break;
        }
    } catch (error) {
        console.warn(`[${extensionName}] AUTO-DATA: Error getting ${type}.${attribute}:`, error);
    }

    return null;
}

/**
 * 获取派生数据（基于其他数据计算得出）
 * @param {Object} fieldConfig - 字段配置
 * @param {Object} processedData - 已处理的数据
 * @param {Element} element - DOM元素
 * @returns {string|null} 派生数据
 */
function getDerivedData(fieldConfig, processedData, element) {
    if (fieldConfig.type === 'npc_lookup') {
        const npcName = element.getAttribute(fieldConfig.depends_on);
        if (npcName) {
            const npc = dataTypeFunctions.findNPCByName(npcName);
            if (npc) {
                if (fieldConfig.attribute === 'avatar') {
                    return npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '';
                }
                return npc[fieldConfig.attribute] || '';
            }
        }
    }
    return null;
}


function processTemplateData(element, config) {
    const processedData = {};
    const rawAttributes = {};

    console.log(`[${extensionName}] TEMPLATE-DATA: 开始处理模板数据`);

    // 简单清理空白文本节点
    if (element.childNodes && element.childNodes.length > 0) {
        const nodesToRemove = [];
        Array.from(element.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
                nodesToRemove.push(node);
            }
        });
        nodesToRemove.forEach(node => {
            try { node.parentNode.removeChild(node); } catch (e) { }
        });
    }

    // 收集所有data-*属性
    for (const attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
            rawAttributes[attr.name] = attr.value.trim();
        }
    }

    // console.log(`[${extensionName}] TEMPLATE-DATA: 收集到 ${Object.keys(rawAttributes).length} 个data属性`);

    if (!config || !config.data_mapping) {
        // 无配置时使用增强的原始属性处理
        return createEnhancedFallbackData(rawAttributes);
    }

    // 按配置处理数据并设置默认值 - 支持数据类型系统
    Object.entries(config.data_mapping).forEach(([placeholder, fieldConfig]) => {
        const attributeName = fieldConfig.attribute;
        let value = null;

        // 根据数据类型进行处理
        const category = fieldConfig.category || 'basic_data';
        // console.log(`[${extensionName}] TEMPLATE-DATA: 处理 ${placeholder}, category: ${category}`);

        if (fieldConfig.source === 'auto') {
            // 自动从ST系统获取数据
            value = getAutoData(fieldConfig.type, fieldConfig.attribute);
        } else if (fieldConfig.source === 'llm') {
            // 从LLM输出获取，根据数据类型进行不同处理
            value = rawAttributes[attributeName] || '';

            // 根据category进行类型化处理
            switch (category) {
                case 'general_array':
                    value = dataTypeFunctions.processGeneralArray(value, config.data_types?.general_array);
                    break;
                case 'npc_list':
                    value = processListData(value, config.data_types?.npc_list);
                    break;
                case 'npc_specific':
                    // 处理NPC特定数据，并自动派生属性
                    processNPCSpecificData(placeholder, value, processedData, config.data_types?.npc_specific);
                    return; // 跳过后续处理，因为已经在函数内处理完毕
                case 'dialogue_msg':
                    // 处理对话消息数据 - 从innerHTML获取内容
                    if (fieldConfig.source_method === 'innerHTML') {
                        const innerHTML = element.innerHTML.trim();
                        if (innerHTML) {
                            value = innerHTML;
                            console.log(`[${extensionName}] TEMPLATE-DATA: 从innerHTML获取对话内容，长度: ${innerHTML.length}`);
                        } else {
                            value = fieldConfig.default || '';
                        }
                    }
                    break;
                case 'basic_data':
                default:
                    // 基础数据类型，保持原样
                    break;
            }
        } else if (fieldConfig.source === 'derived') {
            // 基于其他数据派生（旧逻辑，保持兼容性）
            value = getDerivedData(fieldConfig, processedData, element);
        } else {
            // 传统模式：从属性获取
            value = rawAttributes[attributeName] || '';
        }

        // 统一默认值处理
        const dataKey = (fieldConfig.source === 'auto' || fieldConfig.source === 'derived') ? placeholder : attributeName;
        if (value === null || value === undefined || value === '') {
            if (category === 'npc_list' || (fieldConfig.type === 'array' && Array.isArray(fieldConfig.default))) {
                processedData[dataKey] = fieldConfig.default || [];
            } else {
                processedData[dataKey] = getSimpleDefaultValue(dataKey, fieldConfig.default);
            }
        } else {
            processedData[dataKey] = value;
        }

        // console.log(`[${extensionName}] TEMPLATE-DATA: 设置 ${dataKey} = ${JSON.stringify(processedData[dataKey])}`);
    });

    // console.log(`[${extensionName}] TEMPLATE-DATA: 处理完成，数据对象包含 ${Object.keys(processedData).length} 个字段`);

    if (Object.keys(processedData).length === 0) {
        console.error(`[${extensionName}] TEMPLATE-DATA ERROR: 数据处理失败，使用备用数据`);
        return createEnhancedFallbackData(rawAttributes);
    }

    return processedData;
}

/**
 * 处理列表数据类型（通用函数，支持NPC、物品等各种列表）
 * @param {string} value - 逗号分隔的名称列表
 * @param {Object} typeConfig - 数据类型配置
 * @returns {Array} 包含name和其他动态属性的对象数组
 */
function processListData(value, typeConfig) {
    if (!value || typeof value !== 'string') {
        console.log(`[${extensionName}] TEMPLATE-DATA: 列表数据为空，返回空数组`);
        return [];
    }

    const separator = typeConfig?.separator || ',';
    const itemNames = value.split(separator).map(name => name.trim()).filter(name => name);

    if (itemNames.length === 0) {
        console.log(`[${extensionName}] TEMPLATE-DATA: 列表解析后为空，返回空数组`);
        return [];
    }

    const autoProperties = typeConfig?.auto_properties || ['name'];
    // console.log(`[${extensionName}] TEMPLATE-DATA: 处理列表，发现 ${itemNames.length} 个项目:`, itemNames);
    // console.log(`[${extensionName}] TEMPLATE-DATA: 自动属性配置:`, autoProperties);

    const itemList = itemNames.map(itemName => {
        const itemData = { name: itemName };

        // 根据 auto_properties 动态添加属性
        autoProperties.forEach(prop => {
            if (prop === 'name') {
                // name已经设置，跳过
                return;
            }

            // 使用统一的属性查找函数
            const propValue = dataTypeFunctions.findPropertyValue(prop, itemName);
            if (propValue !== undefined && propValue !== '') {
                itemData[prop] = propValue;
                // console.log(`[${extensionName}] TEMPLATE-DATA: "${itemName}" -> ${prop}: ${propValue}`);
            }
        });

        return itemData;
    });

    console.log(`[${extensionName}] TEMPLATE-DATA: 列表处理完成，返回 ${itemList.length} 个对象`);
    return itemList;
}

/**
 * 处理NPC特定数据类型，并自动派生_NAME和_AVATAR属性
 * @param {string} placeholder - 占位符名称（如 "{{NPC_SPECIFIC_LEADER}}"）
 * @param {string} value - NPC名称
 * @param {Object} processedData - 处理后的数据对象（引用传递）
 * @param {Object} typeConfig - 数据类型配置
 */
function processNPCSpecificData(placeholder, value, processedData, typeConfig) {
    const baseName = placeholder.replace(/[{}]/g, ''); // 移除花括号，如 "NPC_SPECIFIC_LEADER"
    const cleanValue = (value || '').trim();

    console.log(`[${extensionName}] TEMPLATE-DATA: 处理NPC特定数据 ${baseName}, 值: "${cleanValue}"`);

    // 只有当值不为空时才设置属性（这样 {{#ifExists}} 才能正确工作）
    if (cleanValue && cleanValue !== '') {
        // 设置基础属性
        processedData[baseName] = cleanValue;

        // 自动派生_NAME属性
        const nameKey = baseName + '_NAME';
        processedData[nameKey] = cleanValue;
        // console.log(`[${extensionName}] TEMPLATE-DATA: 派生属性 ${nameKey} = "${processedData[nameKey]}"`);

        // 自动派生_AVATAR属性
        const avatarKey = baseName + '_AVATAR';
        const npc = dataTypeFunctions.findNPCByName(cleanValue);
        processedData[avatarKey] = npc ? (npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '') : '';
        // console.log(`[${extensionName}] TEMPLATE-DATA: 派生属性 ${avatarKey} = "${processedData[avatarKey] || '无头像'}" (查找NPC: ${cleanValue})`);

        console.log(`[${extensionName}] TEMPLATE-DATA: NPC特定数据处理完成，创建了 ${baseName}, ${nameKey}, ${avatarKey} 三个属性`);
    } else {
        console.log(`[${extensionName}] TEMPLATE-DATA: NPC特定数据为空，跳过 ${baseName} 相关属性的创建`);
        // 不设置任何属性，这样 {{#ifExists}} 就会返回 false
    }
}

/**
 * 创建增强的备用数据
 * @param {Object} rawAttributes - 原始属性数据
 * @returns {Object} 增强的数据对象
 */
function createEnhancedFallbackData(rawAttributes) {
    const enhancedData = {
        ...rawAttributes,
        // 基本的用户和角色信息
        USER_NAME: rawAttributes['data-user-name'] || getAutoData('user', 'name') || 'User',
        USER_AVATAR: rawAttributes['data-user-avatar'] || getAutoData('user', 'avatar') || '',
        MAIN_CHAR_NAME: rawAttributes['data-main-char-name'] || getAutoData('main_character', 'name') || 'Character',
        MAIN_CHAR_AVATAR: rawAttributes['data-main-char-avatar'] || getAutoData('main_character', 'avatar') || '',
        // NPC相关
        NPC_LIST: [],
        NPC_SPECIFIC: rawAttributes['data-npc-specific'] || 'Unknown',
        NPC_SPECIFIC_AVATAR: ''
    };

    // 处理NPC列表
    if (rawAttributes['data-npc-list']) {
        const npcNames = rawAttributes['data-npc-list'].split(',').map(name => name.trim()).filter(name => name);
        enhancedData['NPC_LIST'] = npcNames.map(npcName => {
            const npc = dataTypeFunctions.findNPCByName(npcName);
            return {
                name: npcName,
                avatar: npc ? (npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '') : ''
            };
        });
    }

    // 处理特定NPC头像
    if (enhancedData['NPC_SPECIFIC'] && enhancedData['NPC_SPECIFIC'] !== 'Unknown') {
        const npc = dataTypeFunctions.findNPCByName(enhancedData['NPC_SPECIFIC']);
        enhancedData['NPC_SPECIFIC_AVATAR'] = npc ? (npc.avatar ? getThumbnailUrl('avatar', npc.avatar) : '') : '';
    }

    return enhancedData;
}

/**
 * 获取简单的默认值
 * @param {string} dataKey - 数据键名
 * @param {string} configDefault - 配置中的默认值
 * @returns {string} 默认值
 */
function getSimpleDefaultValue(dataKey, configDefault) {
    // 如果配置中有默认值，使用配置的
    if (configDefault && configDefault.trim() !== '') {
        return configDefault;
    }

    // 处理dataKey为空或undefined的情况
    if (!dataKey || typeof dataKey !== 'string') {
        return '';
    }

    // 否则使用智能默认值
    if (dataKey.includes('NPC_SPECIFIC') && !dataKey.includes('AVATAR')) {
        return 'Unknown';
    }
    if (dataKey.includes('USER_NAME')) {
        return 'User';
    }
    if (dataKey.includes('MAIN_CHAR_NAME') || dataKey.includes('CHARACTER')) {
        return 'Character';
    }

    // 默认返回空字符串
    return '';
}

/**
 * 使用Handlebars渲染模板
 * @param {string} template - HTML模板字符串
 * @param {Object} data - 数据对象
 * @param {Object} config - 模板配置
 * @returns {string} 渲染后的HTML
 */
function renderTemplateWithConfig(template, data, config) {
    if (!config || !config.data_mapping) {
        console.log(`[${extensionName}] TEMPLATE-RENDER: 使用简化渲染（无配置）`);
        return templateRenderer.render(template, data, { sanitize: true, cache: true });
    }

    try {
        // 准备Handlebars数据格式 - 支持数据类型系统
        const handlebarsData = {};

        // 首先将所有processed data直接添加到handlebars数据中（包括派生属性）
        Object.entries(data).forEach(([key, value]) => {
            // 处理属性名，移除data-前缀（如果有）
            let cleanKey = key.replace(/^data-/, '');
            // 转换为大写，处理连字符
            cleanKey = cleanKey.replace(/-/g, '_').toUpperCase();
            handlebarsData[cleanKey] = value;
        });

        // 处理配置的数据映射（确保所有配置的字段都存在）
        Object.entries(config.data_mapping).forEach(([placeholder, fieldConfig]) => {
            const attributeName = fieldConfig.attribute;
            let value = null;

            // 根据数据源获取值
            if (fieldConfig.source === 'auto' || fieldConfig.source === 'derived') {
                value = data[placeholder];
            } else {
                value = data[attributeName];
            }

            // 简化的默认值处理 - 数据已经在处理阶段设置了默认值
            if (value === null || value === undefined) {
                value = '';
            }

            // 将占位符转换为Handlebars变量名
            const handlebarsKey = placeholder.replace(/[{}]/g, '');
            handlebarsData[handlebarsKey] = value;

            // 数据类型系统：检查是否有派生属性需要添加
            if (fieldConfig.category === 'npc_specific') {
                const baseName = placeholder.replace(/[{}]/g, '');
                // 确保派生属性也存在于handlebars数据中
                const nameKey = baseName + '_NAME';
                const avatarKey = baseName + '_AVATAR';

                if (data[nameKey] !== undefined) {
                    handlebarsData[nameKey] = data[nameKey];
                }
                if (data[avatarKey] !== undefined) {
                    handlebarsData[avatarKey] = data[avatarKey];
                }
            }
        });

        // 添加所有以大写字母开头的属性（包括自动派生的属性）
        Object.entries(data).forEach(([key, value]) => {
            if (/^[A-Z]/.test(key) && !handlebarsData[key]) {
                handlebarsData[key] = value;
                // console.log(`[${extensionName}] TEMPLATE-RENDER: 添加派生属性 ${key} = ${JSON.stringify(value)}`);
            }
        });

        // console.log(`[${extensionName}] TEMPLATE-RENDER: 使用数据类型系统渲染，数据字段: ${Object.keys(handlebarsData).length}个`);
        // console.log(`[${extensionName}] TEMPLATE-RENDER: Handlebars数据键名:`, Object.keys(handlebarsData));

        return templateRenderer.render(template, handlebarsData, {
            sanitize: true,
            cache: true,
            debug: false  // 减少日志输出
        });

    } catch (error) {
        console.error(`[${extensionName}] TEMPLATE-RENDER: 渲染失败:`, error);
        return `<div class="template-error">模板渲染失败: ${error.message}</div>`;
    }
}

/**
 * 加载场景模板文件
 */


/**
 * 检测并处理消息中的所有模板数据标签（动态支持所有启用的模块）
 * @param {Element} messageElement - 消息DOM元素
 * @param {number} messageId - 消息ID（可选，用于持久化）
 */
async function processSceneDataInMessage(messageElement, messageId = null) {
    console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: processSceneDataInMessage called for messageId: ${messageId}`);

    // 获取当前启用的模块列表
    const settings = extension_settings[extensionName];
    const currentTheme = settings.template_theme || 'cyberpunk';
    const enabledModules = await getEnabledModulesForTheme(currentTheme);

    console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Current theme: ${currentTheme}, enabled modules:`, enabledModules);

    if (enabledModules.length === 0) {
        // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: No enabled modules, nothing to process`);
        return;
    }

    // 动态构建选择器，查找所有启用模块的元素
    const moduleSelectors = enabledModules.map(module => `span[data-type="${module}"]`);
    const allTemplateElements = messageElement.querySelectorAll(moduleSelectors.join(', '));

    // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Found ${allTemplateElements.length} template elements in message`);

    if (allTemplateElements.length === 0) {
        // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: No template elements found, nothing to process`);
        return;
    }

    // 按模块类型分组处理
    const elementsByType = {};
    allTemplateElements.forEach(element => {
        const dataType = element.getAttribute('data-type');
        if (!elementsByType[dataType]) {
            elementsByType[dataType] = [];
        }
        elementsByType[dataType].push(element);
    });

    // 处理每个模块类型的元素
    for (const [moduleType, elements] of Object.entries(elementsByType)) {
        console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Processing ${elements.length} ${moduleType} elements`);

        for (let i = 0; i < elements.length; i++) {
            const templateElement = elements[i];
            // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Processing ${moduleType} element ${i + 1}/${elements.length}`);

            try {
                // 生成唯一ID用于标识模板数据元素
                const elementId = `${moduleType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // 隐藏原始的span标签
                if (templateElement instanceof HTMLElement) {
                    templateElement.style.display = 'none';
                    // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Original ${moduleType} span hidden`);
                }

                // 加载模板配置、HTML和CSS
                const templateConfig = await loadTemplateConfig(moduleType, currentTheme);
                const templateHTML = await loadTemplate(moduleType, currentTheme);
                await loadAndInjectTemplateCSS(moduleType, currentTheme);

                if (!templateConfig || !templateHTML) {
                    console.warn(`[${extensionName}] TEMPLATE-PROCESSING WARNING: Template or config not available for ${moduleType}@${currentTheme}, skipping`);
                    continue;
                }

                // 解析模板数据属性（使用配置）
                const templateData = processTemplateData(templateElement, templateConfig);
                // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Parsed ${moduleType} data:`, templateData);
                // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Data keys count: ${Object.keys(templateData).length}`);
                // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Data keys:`, Object.keys(templateData));

                // 简化的数据检查 - 只要有基本数据结构就继续渲染
                if (Object.keys(templateData).length === 0) {
                    // console.error(`[${extensionName}] TEMPLATE-PROCESSING ERROR: processTemplateData returned empty object! This should not happen.`);
                    // console.error(`[${extensionName}] TEMPLATE-PROCESSING ERROR: Template config:`, templateConfig);
                    // console.error(`[${extensionName}] TEMPLATE-PROCESSING ERROR: Element attributes:`, Array.from(templateElement.attributes));
                    continue;
                }

                console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: Proceeding with template rendering`);

                // 渲染模板
                let renderedHTML = renderTemplateWithConfig(templateHTML, templateData, templateConfig);

                // console.log(`[${extensionName}] TEMPLATE-PROCESSING DEBUG: ${moduleType} template rendered, HTML length: ${renderedHTML.length}`);

                // 创建容器并插入渲染后的HTML
                const containerDiv = document.createElement('div');
                containerDiv.innerHTML = renderedHTML;
                const templateContainer = containerDiv.firstElementChild;

                // 添加元素ID到渲染的容器
                templateContainer.setAttribute('data-template-id', elementId);
                templateContainer.setAttribute('data-module-type', moduleType);

                // 保护现有图像容器 - 在插入新容器前检查是否需要保护图像
                const existingContainer = messageElement.querySelector(`[data-module-type="${moduleType}"]`);
                const savedImages = [];
                if (existingContainer) {
                    // 查找并保存现有的图像容器
                    const imageContainers = existingContainer.querySelectorAll('.custom-image-container');
                    imageContainers.forEach(img => {
                        // 临时移动到消息根元素，避免被清除
                        messageElement.appendChild(img);
                        img.style.display = 'none';
                        img.setAttribute('data-temp-preserved', 'true');
                        savedImages.push(img);
                    });
                    // 移除旧容器
                    existingContainer.remove();
                    console.log(`[${extensionName}] IMAGE-PROTECTION: Preserved ${savedImages.length} images from old ${moduleType} container`);
                }

                // 在原始span标签下方插入渲染结果
                templateElement.parentNode.insertBefore(templateContainer, templateElement.nextSibling);

                // 恢复保存的图像到新容器的占位符中
                if (savedImages.length > 0) {
                    const placeholder = templateContainer.querySelector('.img-placeholder');
                    if (placeholder) {
                        savedImages.forEach(img => {
                            placeholder.appendChild(img);
                            img.style.display = '';
                            img.removeAttribute('data-temp-preserved');
                        });
                        console.log(`[${extensionName}] IMAGE-PROTECTION: Restored ${savedImages.length} images to new ${moduleType} container`);
                    } else {
                        // 如果没有占位符，恢复到原来的显示状态，保持在消息根元素下
                        savedImages.forEach(img => {
                            img.style.display = '';
                            img.removeAttribute('data-temp-preserved');
                        });
                        console.log(`[${extensionName}] IMAGE-PROTECTION: No placeholder found, images kept at message root level`);
                    }
                }

                console.log(`[${extensionName}] TEMPLATE-PROCESSING SUCCESS: ${moduleType} element ${i + 1} rendered and inserted successfully with ID: ${elementId}`);

                // 纯净渲染模式：不保存扩展数据，直接完成渲染
                console.log(`[${extensionName}] TEMPLATE-PROCESSING: ${moduleType} 纯净渲染完成，不保存扩展数据`);

            } catch (error) {
                console.error(`[${extensionName}] TEMPLATE-PROCESSING ERROR processing ${moduleType} element ${i + 1}:`, error);
                console.error(`[${extensionName}] TEMPLATE-PROCESSING ERROR stack:`, error.stack);
            }
        }
    }

    // 消息模板渲染完成后，立即处理该消息对应的图像重定位
    if (typeof messageId === 'number') {
        const msgIdStr = messageId.toString();
        if (pendingImageRelocations.has(msgIdStr)) {
            console.log(`[${extensionName}] TEMPLATE-PROCESSING: 消息${messageId}模板渲染完成，处理对应的图像重定位`);
            const pendingItem = pendingImageRelocations.get(msgIdStr);
            const success = relocateImageToTheme(msgIdStr, pendingItem.imageContainer);
            if (success) {
                pendingImageRelocations.delete(msgIdStr);
                console.log(`[${extensionName}] TEMPLATE-PROCESSING: 成功重定位消息${messageId}的图像并从队列中移除`);
            } else {
                console.log(`[${extensionName}] TEMPLATE-PROCESSING: 消息${messageId}的图像重定位仍然失败，保留在队列中`);
            }
        }

        console.log(`[${extensionName}] TEMPLATE-PROCESSING: 消息${messageId}模板渲染完成`);
    }

    // 初始化共享功能绑定 - 在所有模板渲染完成后
    // console.log(`[${extensionName}] TEMPLATE-PROCESSING: 初始化共享功能绑定...`);
    sharingFunctions.initializeFunctionBindings(messageElement);
    console.log(`[${extensionName}] TEMPLATE-PROCESSING: 共享功能绑定完成`);

    // 立即处理所有Markdown元素
    // console.log(`[${extensionName}] TEMPLATE-PROCESSING: 处理Markdown元素...`);
    const markdownElements = messageElement.querySelectorAll('[data-function*="show_markdown"]');
    // console.log(`[${extensionName}] TEMPLATE-PROCESSING: 发现 ${markdownElements.length} 个Markdown元素`);

    markdownElements.forEach((element, index) => {
        try {
            // console.log(`[${extensionName}] TEMPLATE-PROCESSING: 处理Markdown元素 ${index + 1}/${markdownElements.length}`);
            sharingFunctions.showMarkdown(element);
        } catch (error) {
            console.error(`[${extensionName}] TEMPLATE-PROCESSING: Markdown处理失败`, error);
        }
    });
}

/**
 * 消息接收时的场景数据处理事件处理器
 * @param {number} messageId - 接收到的消息ID
 */
/**
 * 消息接收事件处理器 - 使用标准化处理流程
 * @param {number} messageId - 消息ID
 */
async function onMessageSceneDataReceived(messageId) {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.template_rendering) {
        return;
    }

    // 检查是否有任何启用的模块
    const currentTheme = settings.template_theme || 'cyberpunk';
    const enabledModules = await getEnabledModulesForTheme(currentTheme);
    if (enabledModules.length === 0) {
        return;
    }

    console.log(`[${extensionName}] MESSAGE-RECEIVED: Processing messageId: ${messageId}`);

    // 延迟执行确保DOM已更新
    setTimeout(() => {
        const numericMessageId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
        if (typeof numericMessageId === 'number' && !isNaN(numericMessageId)) {
            const messageElement = document.querySelector(`#chat [mesid="${messageId}"]`);
            if (messageElement) {
                standardTemplateProcessing('MESSAGE_RECEIVED', messageElement, numericMessageId);
                // character message rendered：图像生成慢，模板渲染快，不需要队列处理
                // 图像生成事件会在模板渲染之后到达，直接处理即可
            }
        }
    }, 200);
}


/**
 * 聊天变更事件处理器 - 使用标准化处理流程
 */
async function onSceneDataChatChanged() {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.template_rendering) {
        return;
    }

    // 检查是否有任何启用的模块
    const currentTheme = settings.template_theme || 'cyberpunk';
    const enabledModules = await getEnabledModulesForTheme(currentTheme);
    if (enabledModules.length === 0) {
        return;
    }

    console.log(`[${extensionName}] CHAT_CHANGED: 开始处理聊天切换事件`);

    // 延迟执行确保DOM已更新
    setTimeout(() => {
        standardTemplateProcessing('CHAT_CHANGED');

        // 延迟清理队列中的无效项 - 等待所有模板渲染完成
        setTimeout(() => {
            if (pendingImageRelocations.size > 0) {
                console.log(`[${extensionName}] CHAT_CHANGED: 延迟清理剩余的 ${pendingImageRelocations.size} 个队列项`);
                clearPendingImageQueue();
            }
        }, 2000); // 2秒后清理，给足够时间让所有模板渲染完成
    }, 100);
}

/**
 * 消息更新事件处理器 - 使用标准化处理流程（编辑后）
 */
async function onSceneDataMessageUpdated(messageId) {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.template_rendering) {
        return;
    }

    // 检查是否有任何启用的模块
    const currentTheme = settings.template_theme || 'cyberpunk';
    const enabledModules = await getEnabledModulesForTheme(currentTheme);
    if (enabledModules.length === 0) {
        return;
    }

    const now = Date.now();
    const messageKey = `${messageId}`;

    // 防止短时间内重复处理同一消息 (150ms内) - 降低时间阈值，因为现在只有一个事件源
    if (lastProcessedMessage === messageKey && (now - lastProcessedTime) < 150) {
        console.log(`[${extensionName}] MESSAGE-UPDATED: 跳过重复处理消息 ${messageId} (${now - lastProcessedTime}ms前刚处理过)`);
        return;
    }

    // 更新处理记录
    lastProcessedMessage = messageKey;
    lastProcessedTime = now;

    console.log(`[${extensionName}] MESSAGE-UPDATED: 处理消息 ${messageId}`);

    // 延迟执行确保DOM已更新
    setTimeout(() => {
        const numericMessageId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
        if (typeof numericMessageId === 'number' && !isNaN(numericMessageId)) {
            const messageElement = document.querySelector(`#chat [mesid="${messageId}"]`);
            if (messageElement) {
                standardTemplateProcessing('MESSAGE_UPDATED', messageElement, numericMessageId);
            }
        }
    }, 100);
}

/**
 * 消息换页事件处理器 - 使用标准化处理流程
 */
async function onSceneDataMessageSwiped(messageId) {
    const settings = extension_settings[extensionName];
    if (!settings.enabled || !settings.template_rendering) {
        return;
    }

    // 检查是否有任何启用的模块
    const currentTheme = settings.template_theme || 'cyberpunk';
    const enabledModules = await getEnabledModulesForTheme(currentTheme);
    if (enabledModules.length === 0) {
        return;
    }

    console.log(`[${extensionName}] MESSAGE-SWIPED: Message ${messageId} swiped, using standard processing`);

    // 延迟执行确保DOM已更新
    setTimeout(() => {
        const numericMessageId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
        if (typeof numericMessageId === 'number' && !isNaN(numericMessageId)) {
            const messageElement = document.querySelector(`#chat [mesid="${messageId}"]`);
            if (messageElement) {
                // 使用标准化处理流程，基于DOM元素重新渲染
                standardTemplateProcessing('MESSAGE_SWIPED', messageElement, numericMessageId);
            }
        }
    }, 100);
}

/**
 * 处理来自live-msg-inline-img-generator的图像事件 - 插件间协作
 * @param {CustomEvent} event - 图像事件 (EventImgGenerated 或 EventImgRestored)
 */
function handleImageEvent(event) {
    const { msgId, imageContainer, source } = event.detail;
    const eventType = event.type;

    console.log(`[${extensionName}] IMAGE-EVENT: Received ${eventType} from ${source} for message: ${msgId}`);

    // 立即尝试重定位
    const success = relocateImageToTheme(msgId, imageContainer);

    if (!success) {
        if (eventType === 'EventImgRestored') {
            // 图像恢复事件：通常在chat changed时发生，图像恢复快，模板渲染慢
            // 需要加入队列等待模板渲染完成
            pendingImageRelocations.set(msgId.toString(), {
                imageContainer: imageContainer,
                eventType: eventType
            });
            console.log(`[${extensionName}] IMAGE-EVENT: Added to pending queue for message: ${msgId} (chat restore)`);
        } else if (eventType === 'EventImgGenerated') {
            // 图像生成事件：有时候图像生成也可能比模板渲染更快到达
            // 如果重定位失败，也加入队列等待模板渲染完成
            pendingImageRelocations.set(msgId.toString(), {
                imageContainer: imageContainer,
                eventType: eventType
            });
            console.log(`[${extensionName}] IMAGE-EVENT: Added to pending queue for message: ${msgId} (image generated before template ready)`);
        }
    } else {
        console.log(`[${extensionName}] IMAGE-EVENT: Successfully relocated for message: ${msgId}`);
        const messageElement = document.querySelector(`#chat [mesid="${msgId}"]`);
        //在messageElement中寻找所有togglewrapper元素，并将初始状态设为隐藏后重新绑定。
        // 如果页面中有多个相似的元素
        const toggleWrappers = messageElement.querySelectorAll('[data-function*="toggle-wrapper"]');
        if (toggleWrappers.length === 0) {
            console.log(`[${extensionName}] IMAGE-EVENT: No toggle-wrapper elements found in message: ${msgId}`);
            return;
        } else {
            // 遍历并移除属性
             console.log(`[${extensionName}] IMAGE-EVENT: Found ${toggleWrappers.length} toggle-wrapper elements in message: ${msgId}`);
            toggleWrappers.forEach(element => {
                element.removeAttribute('data-initial-state-set');
            });
        }

        sharingFunctions.initializeFunctionBindings(messageElement);
        console.log(`[${extensionName}] IMAGE-EVENT: 图像重定向后共享功能绑定完成`);
    }

}

// 全局待处理图像队列 - 解决时序问题
const pendingImageRelocations = new Map(); // msgId -> { imageContainer, eventType }


/**
 * 清空待处理队列
 */
function clearPendingImageQueue() {
    const queueSize = pendingImageRelocations.size;
    pendingImageRelocations.clear();
    if (queueSize > 0) {
        console.log(`[${extensionName}] PENDING-QUEUE: Cleared ${queueSize} pending items`);
    }
}

/**
 * 将图像容器重定位到主题模板的占位符中
 * @param {string|number} msgId - 消息ID
 * @param {HTMLElement} imageContainer - 图像容器DOM元素
 * @returns {boolean} 是否成功重定位
 */
function relocateImageToTheme(msgId, imageContainer) {
    try {
        // 查找消息元素
        const msgElement = document.querySelector(`#chat [mesid="${msgId}"]`);
        if (!msgElement) {
            console.warn(`[${extensionName}] IMAGE-RELOCATE: Message element not found for ID: ${msgId}`);
            return false;
        }

        // 查找主题容器中的占位符
        const themeContainer = msgElement.querySelector('[data-module-type]');
        const placeholder = themeContainer?.querySelector('.img-placeholder');

        if (!themeContainer) {
            console.log(`[${extensionName}] IMAGE-RELOCATE: No theme container found for message: ${msgId}`);
            return false;
        }

        if (!placeholder) {
            console.log(`[${extensionName}] IMAGE-RELOCATE: No image placeholder found in theme container for message: ${msgId}`);
            return false;
        }

        // 检查图像是否已经在正确位置
        if (imageContainer && imageContainer.parentNode !== placeholder) {
            placeholder.appendChild(imageContainer);
            console.log(`[${extensionName}] IMAGE-RELOCATE: Image successfully relocated to theme placeholder for message: ${msgId}`);
            scrollToBottom();
            return true;
        } else if (imageContainer && imageContainer.parentNode === placeholder) {
            console.log(`[${extensionName}] IMAGE-RELOCATE: Image already in correct position for message: ${msgId}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`[${extensionName}] IMAGE-RELOCATE ERROR:`, error);
        return false;
    }
}

/**
 * 设置场景数据处理集成
 */
function setupSceneDataIntegration() {
    try {
        console.log(`[${extensionName}] SCENE-DATA DEBUG: setupSceneDataIntegration called`);

        // 检查事件类型是否存在
        if (!event_types.CHARACTER_MESSAGE_RENDERED) {
            console.error(`[${extensionName}] SCENE-DATA ERROR: CHARACTER_MESSAGE_RENDERED event type not found`);
            console.log(`[${extensionName}] SCENE-DATA DEBUG: Available event types:`, Object.keys(event_types));
            return;
        }

        // 监听角色消息渲染事件
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, onMessageSceneDataReceived);
        console.log(`[${extensionName}] SCENE-DATA DEBUG: Event listener registered for CHARACTER_MESSAGE_RENDERED`);

        // 监听用户消息渲染事件 - 用户消息也可能包含场景数据
        // if (event_types.USER_MESSAGE_RENDERED) {
        //     eventSource.on(event_types.USER_MESSAGE_RENDERED, onMessageSceneDataReceived);
        //     console.log(`[${extensionName}] SCENE-DATA DEBUG: Event listener registered for USER_MESSAGE_RENDERED`);
        // }

        // 监听聊天变更事件，用于恢复场景数据
        eventSource.on(event_types.CHAT_CHANGED, onSceneDataChatChanged);
        console.log(`[${extensionName}] SCENE-DATA DEBUG: Event listener registered for CHAT_CHANGED`);

        // 监听消息更新事件，用于消息编辑后恢复
        eventSource.on(event_types.MESSAGE_UPDATED, onSceneDataMessageUpdated);
        console.log(`[${extensionName}] SCENE-DATA DEBUG: Event listener registered for MESSAGE_UPDATED`);

        // 监听消息换页事件
        eventSource.on(event_types.MESSAGE_SWIPED, onSceneDataMessageSwiped);
        console.log(`[${extensionName}] SCENE-DATA DEBUG: Event listener registered for MESSAGE_SWIPED`);

        // 监听插件间通信事件 - 与live-msg-inline-img-generator协作
        document.addEventListener('EventImgGenerated', handleImageEvent);
        document.addEventListener('EventImgRestored', handleImageEvent);
        console.log(`[${extensionName}] SCENE-DATA DEBUG: Plugin communication event listeners registered`);
        console.log(`[${extensionName}] SCENE-DATA SUCCESS: Scene data integration initialized with persistence`);

    } catch (error) {
        console.error(`[${extensionName}] SCENE-DATA ERROR setting up scene data integration:`, error);
        console.error(`[${extensionName}] SCENE-DATA ERROR stack:`, error.stack);
    }
}

/**
 * 移除场景数据处理集成
 */
function removeSceneDataIntegration() {
    try {
        // 移除所有事件监听器
        eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, onMessageSceneDataReceived);
        // if (event_types.USER_MESSAGE_RENDERED) {
        //     eventSource.removeListener(event_types.USER_MESSAGE_RENDERED, onMessageSceneDataReceived);
        // }
        eventSource.removeListener(event_types.CHAT_CHANGED, onSceneDataChatChanged);
        eventSource.removeListener(event_types.MESSAGE_UPDATED, onSceneDataMessageUpdated);
        eventSource.removeListener(event_types.MESSAGE_SWIPED, onSceneDataMessageSwiped);

        // 移除CSS样式
        const styleElement = document.getElementById(`${extensionName}-scene-styles`);
        if (styleElement) {
            styleElement.remove();
        }

        console.log(`[${extensionName}] Scene data integration removed with all persistence listeners`);

    } catch (error) {
        console.error(`[${extensionName}] Error removing scene data integration:`, error);
    }
}
//scroll to bottom function
function scrollToBottom() {
    const chatDiv = document.getElementById('chat');
    chatDiv.scrollTo({
        top: chatDiv.scrollHeight,
        behavior: 'smooth'  // 平滑滚动
    });
}
// Create global object for backwards compatibility (if needed)
globalThis.cyberpunk2027 = {
    applyTheme,
    removeTheme,
    settings: () => extension_settings[extensionName]
};

// jQuery initialization
jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting extension initialization...`);

        // Wait a bit to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize settings
        initSettings();
        console.log(`[${extensionName}] Settings initialized`);

        // Clean up any leftover CSS from previous sessions
        console.log(`[${extensionName}] Cleaning up any leftover CSS from previous sessions`);
        await forceCleanupAllTemplateCSS();

        // 注入共享功能模块CSS
        await injectSharingFunctionsCSS();
        console.log(`[${extensionName}] Sharing functions CSS injected`);

        // Load and add settings UI
        const settingsHtml = $(await renderExtensionTemplateAsync(extensionName, 'settings'));
        $('#extensions_settings').append(settingsHtml);
        console.log(`[${extensionName}] Settings UI added`);

        // Wait for UI to be added to DOM
        await new Promise(resolve => setTimeout(resolve, 50));

        // Update UI with current settings
        updateSettingsUI();
        console.log(`[${extensionName}] Settings UI updated`);

        // Bind event handlers
        $('#cyberpunk_enabled').on('change', onEnabledChange);
        $('#cyberpunk_layout').on('change', onLayoutChange);
        $('#cyberpunk_style').on('change', onStyleChange);
        $('#cyberpunk_chat_style_enabled').on('change', onChatStyleEnabledChange);
        $('#cyberpunk_character_backgrounds').on('change', onCharacterBackgroundsChange);

        // AI background controls
        $('#cyberpunk_ai_backgrounds').on('change', onAIBackgroundsChange);
        $('#cyberpunk_ai_bg_auto').on('change', onAIBgAutoChange);
        $('#cyberpunk_ai_bg_interval').on('change', onAIBgIntervalChange);
        $('#cyberpunk_ai_bg_width').on('change', onAIBgWidthChange);
        $('#cyberpunk_ai_bg_height').on('change', onAIBgHeightChange);

        // Video background controls
        $('#cyberpunk_video_background').on('change', onVideoBackgroundChange);
        $('#cyberpunk_video_bg_loop').on('change', onVideoBgLoopChange);

        // Template rendering handlers
        $('#cyberpunk_template_rendering').on('change', onTemplateRenderingChange);
        $('#cyberpunk_template_theme').on('change', onThemeSelectionChange);

        // Resource management button
        $('#cyberpunk_resource_management').on('click', showResourceManagement);

        // Bind configuration control handlers
        // Blur strength controls - 滑块控制数字输入
        $('#cyberpunk_blur_strength').on('input', function () {
            console.log(`[DEBUG] Slider input triggered, isUpdatingControls: ${isUpdatingControls}`);
            if (isUpdatingControls) {
                console.log('[DEBUG] Slider input blocked by isUpdatingControls');
                return;
            }
            const value = $(this).val();
            console.log(`[DEBUG] Slider input processing value: ${value}`);
            // 只同步到配对的控件，不同步回自己
            isUpdatingControls = true;
            $('#cyberpunk_blur_strength_number').val(value);
            isUpdatingControls = false;
            console.log(`[DEBUG] Slider synced to number input, calling onConfigChange`);
            onConfigChange('blur_strength', value);
        });
        // 数字输入控制滑块
        $('#cyberpunk_blur_strength_number').on('input', function () {
            console.log(`[DEBUG] Number input triggered, isUpdatingControls: ${isUpdatingControls}`);
            if (isUpdatingControls) {
                console.log('[DEBUG] Number input blocked by isUpdatingControls');
                return;
            }
            const value = $(this).val();
            console.log(`[DEBUG] Number input processing value: ${value}`);
            // 只同步到配对的控件，不同步回自己
            isUpdatingControls = true;
            $('#cyberpunk_blur_strength').val(value);
            isUpdatingControls = false;
            console.log(`[DEBUG] Number input synced to slider, calling onConfigChange`);
            onConfigChange('blur_strength', value);
        });

        // Shadow width controls
        $('#cyberpunk_shadow_width').on('input', function () {
            if (isUpdatingControls) return; // 防止递归调用
            const value = $(this).val();
            isUpdatingControls = true;
            $('#cyberpunk_shadow_width_number').val(value);
            isUpdatingControls = false;
            onConfigChange('shadow_width', value);
        });
        $('#cyberpunk_shadow_width_number').on('input', function () {
            if (isUpdatingControls) return; // 防止递归调用
            const value = $(this).val();
            isUpdatingControls = true;
            $('#cyberpunk_shadow_width').val(value);
            isUpdatingControls = false;
            onConfigChange('shadow_width', value);
        });

        // Font scale controls
        $('#cyberpunk_font_scale').on('input', function () {
            if (isUpdatingControls) return; // 防止递归调用
            const value = $(this).val();
            isUpdatingControls = true;
            $('#cyberpunk_font_scale_number').val(value);
            isUpdatingControls = false;
            onConfigChange('font_scale', value);
        });
        $('#cyberpunk_font_scale_number').on('input', function () {
            if (isUpdatingControls) return; // 防止递归调用
            const value = $(this).val();
            isUpdatingControls = true;
            $('#cyberpunk_font_scale').val(value);
            isUpdatingControls = false;
            onConfigChange('font_scale', value);
        });

        // Reset button handlers using event delegation
        $(document).on('click', '.cyberpunk-reset-btn', function () {
            const controlType = $(this).data('control');
            console.log(`[${extensionName}] Reset button clicked for: ${controlType}`);
            console.log(`[${extensionName}] Current theme defaults:`, cyberpunkThemeDefaults);
            onResetToDefault(controlType);
        });

        console.log(`[${extensionName}] Event handlers bound`);

        // Apply theme on startup if enabled
        applyTheme();
        console.log(`[${extensionName}] Theme applied on startup`);

        // Setup chat style integration
        setupChatStyleIntegration();

        console.log(`[${extensionName}] Extension loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] Failed to initialize extension:`, error);
        console.error(`[${extensionName}] Error stack:`, error.stack);

        // Try to show a simple notification to user if possible
        if (typeof toastr !== 'undefined' && toastr.error) {
            toastr.error(`Failed to load Cyberpunk 2027 theme: ${error.message}`);
        }
    }
});
