<script lang="ts" setup>
import { computed } from 'vue';
import { Message } from '@Shared/types/message';
import { formatTimestamp } from '@Shared/utility/time';
import { ChatConfig } from '../../shared/config';

const props = defineProps<{ message: Message; timestamp?: boolean }>();

const classes = computed(() => {
    const classesToAdd: string[] = [];

    switch (props.message.type) {
        case 'alert':
            classesToAdd.push('text-red-400');
            break;
        case 'warning':
            classesToAdd.push('text-orange-300');
            break;
        case 'system':
            classesToAdd.push('text-indigo-400');
            break;
        case 'info':
            classesToAdd.push('text-green-500');
            break;
        case 'player':
            classesToAdd.push('text-white');
            break;
    }

    return classesToAdd;
});

function colorify(text: string | null) {
    let matches = [];
    let m = null;
    let curPos = 0;
    if (!text) {
        return null;
    }
    do {
        m = /\{[A-Fa-f0-9]{3}\}|\{[A-Fa-f0-9]{6}\}/g.exec(text.substring(curPos));
        if (!m) {
            break;
        }
        matches.push({
            found: m[0],
            index: m['index'] + curPos,
        });
        curPos = curPos + m['index'] + m[0].length;
    } while (m != null);

    if (matches.length > 0) {
        text += '</font>';
        for (let i = matches.length - 1; i >= 0; --i) {
            let color = matches[i].found.substring(1, matches[i].found.length - 1);
            let insertHtml = `${i !== 0 ? '</font>' : ''}<font color="#${color}">`;
            text = `${text.slice(0, matches[i].index)}${insertHtml}${text.slice(
                matches[i].index + matches[i].found.length,
                text.length,
            )}`;
        }
    }
    return text;
}

const content = computed(() => {
    const timestamp = formatTimestamp(props.message.timestamp);

    let content = props.timestamp ? `[${timestamp.hour}:${timestamp.minute}:${timestamp.second}]` : ``;

    if (props.message.type === 'player') {
        content += ' ' + props.message.author.replace('_', ' ') + ' says:';
    }

    content += ' ' + props.message.content;

    if (content.length > ChatConfig.inputLength) {
        content = content.slice(0, ChatConfig.inputLength) + '...';
    }

    return content;
});
</script>

<template>
    <div class="arial text-md text-shadow text- font-bold tracking-wider" :class="classes">
        <span v-html="colorify(content)"></span>
    </div>
</template>

<style scoped>
.arial {
    font-family: 'Arial';
}

.text-shadow {
    text-shadow:
        0 -2px 2px rgba(0, 0, 0, 1),
        0 2px 2px rgba(0, 0, 0, 1),
        -2px 0px 2px rgba(0, 0, 0, 1),
        2px 0px 2px rgba(0, 0, 0, 1);
}

.text-shadow-light {
    text-shadow:
        0 -2px 2px rgba(0, 0, 0, 0.5),
        0 2px 2px rgba(0, 0, 0, 0.5),
        -2px 0px 2px rgba(0, 0, 0, 0.5),
        2px 0px 2px rgba(0, 0, 0, 0.5);
}
</style>
