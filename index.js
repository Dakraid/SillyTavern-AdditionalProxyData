import {eventSource, event_types, name1, name2, saveSettingsDebounced, getRequestHeaders} from '../../../../script.js';
import {extension_settings} from '../../../extensions.js';
// Used during development
// import {eventSource, event_types, name1, name2, saveSettingsDebounced, getRequestHeaders} from '../../../../public/script.js';
// import {extension_settings } from '../../../../public/scripts/extensions.js';

const extensionName = "SillyTavern-AdditionalProxyData";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
    cot_prompt: "{username}: [PAUSE YOUR ROLEPLAY. Answer all questions concisely, in full sentences, and continuous text.] Think about the story, and consider information you have, especially the description and setting of {character}. What do you have to consider to maintain the characters personalities? How do the characters react and what are their personality traits? What physical space are you in? How do you maintain a consistent progression? Finally: Remind yourself to not act or talk for {username}. What rules should you follow for formatting and style? Only answer the questions as instructed. Remember you are narrating a story for the user, don't include active elements for them.",
    thought_endpoint: "http://127.0.0.1:5000/v1/thought",
    min_messages: 1,
};

function onCoTPromptInput() {
    const value = $(this).val();
    extension_settings[extensionName].cot_prompt = value;
    saveSettingsDebounced();
}

function onCoTEndpointInput() {
    const value = $(this).val();
    extension_settings[extensionName].thought_endpoint = value;
    saveSettingsDebounced();
}

function onCoTMinMessages() {
    const value = $(this).val();
    extension_settings[extensionName].min_messages = value;
    saveSettingsDebounced();
}

function onCoTPromptRestoreClick() {
    $('#apd_prompt').val(defaultSettings.cot_prompt).trigger('input');
}

async function onCoTGetLastClick() {
    const url = new URL(extension_settings[extensionName].thought_endpoint);

    const apiResult = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getRequestHeaders(),
        },
    });

    const data = await apiResult.json();
    $('#apd_last_thought').val(data.content).trigger('input');
}

async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    $('#apd_prompt').val(extension_settings[extensionName].cot_prompt).trigger('input');
    $('#apd_thought_endpoint').val(extension_settings[extensionName].thought_endpoint).trigger('input');
    $('#apd_min_messages').val(extension_settings[extensionName].min_messages).trigger('input');
}

eventSource.on(event_types.TEXT_COMPLETION_SETTINGS_READY, (args) =>{
    Object.assign(args, {
        'username': name1,
        'character': name2,
        'cot_prompt': extension_settings[extensionName].cot_prompt,
        'cot_min_messages': extension_settings[extensionName].min_messages,
    });
});

eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, (args) =>{
    Object.assign(args, {
        'username': name1,
        'character': name2,
        'cot_prompt': extension_settings[extensionName].cot_prompt,
        'cot_min_messages': extension_settings[extensionName].min_messages,
    });
});

jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);

    $("#extensions_settings").append(settingsHtml);
    $('#apd_prompt').on('input', onCoTPromptInput);
    $('#apd_thought_endpoint').on('input', onCoTEndpointInput);
    $('#apd_min_messages').on('input', onCoTMinMessages);
    $('#apd_prompt_restore').on('click', onCoTPromptRestoreClick);
    $('#apd_get_last_thought').on('click', onCoTGetLastClick);

    await loadSettings();
});
