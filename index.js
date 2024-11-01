import {eventSource, event_types, name1, name2, saveSettingsDebounced} from '../../../../script.js';
import {extension_settings } from '../../../extensions.js';
// Used during development
// import {eventSource, event_types, name1, name2, saveSettingsDebounced} from '../../../../public/script.js';
// import {extension_settings } from '../../../../public/scripts/extensions.js';

const extensionName = "SillyTavern-AdditionalProxyData";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
    cot_prompt: "{username}: [PAUSE YOUR ROLEPLAY. Answer all questions concisely, in full sentences, and continuous text.] Think about the story, and consider information you have, especially the description and setting of {character}. What do you have to consider to maintain the characters personalities? How do the characters react and what are their personality traits? What physical space are you in? How do you maintain a consistent progression? Finally: Remind yourself to not act or talk for {username}. What rules should you follow for formatting and style? Only answer the questions as instructed. Remember you are narrating a story for the user, don't include active elements for them.",
};

function onCoTPromptInput() {
    const value = $(this).val();
    extension_settings[extensionName].cot_prompt = value;
    saveSettingsDebounced();
}

function onCoTPromptRestoreClick() {
    $('#apd_prompt').val(defaultSettings.cot_prompt).trigger('input');
}

async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    $('#apd_prompt').val(extension_settings[extensionName].cot_prompt).trigger('input');
}

eventSource.on(event_types.TEXT_COMPLETION_SETTINGS_READY, (args) =>{
    Object.assign(args, {
        'username': name1,
        'character': name2,
        'cot_prompt': extension_settings[extensionName].cot_prompt,
    });
});

jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);

    $("#extensions_settings").append(settingsHtml);
    $('#apd_prompt').on('input', onCoTPromptInput);
    $('#apd_prompt_restore').on('click', onCoTPromptRestoreClick);

    await loadSettings();
});
