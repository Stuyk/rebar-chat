<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useMessenger } from '../../../../webview/composables/useMessenger';
import { ChatConfig } from '../shared/config';
import ChatMessage from './components/ChatMessage.vue';
import { useEvents } from '../../../../webview/composables/useEvents';
import { ChatEvents } from '../shared/events';

type CommandInfo = { name: string; desc: string };

const events = useEvents();
const { messages, emit } = useMessenger();
const input = ref('');
const inputBox = ref<HTMLInputElement | null>(null);
const chatBox = ref<HTMLInputElement | null>(null);
const timestamp = ref(true);
const focused = ref(false);
const commands = ref<CommandInfo[]>([]);
const closestMatchingCommands = ref<CommandInfo[]>([
    // { name: 'test', desc: 'hi' },
    // { name: 'test', desc: 'hi' },
]);
const selectedCommandIndex = ref(-1);
const commandHistory = ref<string[]>([]);
const commandHistoryIndex = ref(-1);


function setCommands(data: CommandInfo[]) {
    commands.value = data;
}

const chatMessages = computed(() => {
    if (messages.value.length < ChatConfig.messagesPerPage) {
        return [...messages.value].reverse();
    }

    if (!focused.value) {
        return messages.value.slice(0, ChatConfig.messagesPerPage).reverse();
    }

    return [...messages.value].reverse();
});

function focus() {
    focused.value = true;
    inputBox.value.focus();

    nextTick(() => {
        const child = chatBox.value.children[chatBox.value.children.length - 1];
        if (!child) {
            return;
        }

        child.scrollIntoView({ behavior: 'instant' });
    });
}

function unfocus() {
    focused.value = false;
    inputBox.value.blur();
}

function send() {
    focused.value = false;
    inputBox.value.blur();

    if (input.value.length <= 0) {
        return;
    }

    emit(input.value);
    commandHistory.value.unshift(input.value);
    input.value = '';
    commandHistoryIndex.value = -1;
}

function onInputChange(inputValue: string) {
    if (inputValue.charAt(0) !== '/' || inputValue.length <= 0) {
        closestMatchingCommands.value = [];
        selectedCommandIndex.value = -1;
        return;
    }

    const inputSplit = inputValue.split(' ');
    const cmd = inputSplit[0];
    if (!cmd) {
        return;
    }

    let closestCommands = [];
    for (let command of commands.value) {
        if (!command.name.includes(cmd.replace('/', ''))) {
            continue;
        }

        closestCommands.push(command);
        if (closestCommands.length >= 5) {
            break;
        }
    }

    closestMatchingCommands.value = closestCommands;
    selectedCommandIndex.value = -1;
}

function onKeydown(event: KeyboardEvent) {
    if (closestMatchingCommands.value.length === 0 && commandHistory.value.length === 0) {
        return;
    }

    if (event.key === 'Tab') {
        event.preventDefault();
        if (closestMatchingCommands.value.length > 0) {
            selectedCommandIndex.value = (selectedCommandIndex.value + 1) % closestMatchingCommands.value.length;
            input.value = `/${closestMatchingCommands.value[selectedCommandIndex.value].name}`;
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.value.length > 0) {
            if (commandHistoryIndex.value < commandHistory.value.length - 1) {
                commandHistoryIndex.value += 1;
            }
            input.value = commandHistory.value[commandHistoryIndex.value];
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (commandHistoryIndex.value > 0) {
            commandHistoryIndex.value -= 1;
            input.value = commandHistory.value[commandHistoryIndex.value];
        } else {
            commandHistoryIndex.value = -1;
            input.value = '';
        }
    }
}

onMounted(() => {
    events.on(ChatEvents.toWebview.focus, focus);
    events.on(ChatEvents.toWebview.unfocus, unfocus);
    events.on(ChatEvents.toWebview.send, send);
    events.on(ChatEvents.toWebview.commands, setCommands);
    events.emitServer(ChatEvents.toWebview.commands);
});

watch(input, onInputChange);
</script>

<template>
    <div class="fixed left-6 top-6 flex flex-col gap-6" :class="focused ? [] : ['pointer-events-none']">
        <div
            class="flip-left flex max-h-[448px] min-h-[448px] min-w-[448px] max-w-[448px] flex-col gap-4 overflow-y-auto pl-3"
            ref="chatBox"
        >
            <ChatMessage
                v-for="(message, index) in chatMessages"
                :key="index"
                :message="message"
                :timestamp="timestamp"
                class="text-md flip-right font-bold tracking-wider"
            />
        </div>
        <div class="flex w-full flex-col gap-4">
            <input
                :max="ChatConfig.inputLength"
                v-model="input"
                ref="inputBox"
                @keydown="onKeydown"
                placeholder="Write text or /command"
                type="text"
                class="min-w-[448px] max-w-[448px] rounded-lg border-2 border-neutral-50 border-opacity-20 bg-neutral-950 bg-opacity-80 px-4 py-4 font-bold tracking-wider text-white outline-none placeholder:text-neutral-500 focus:border-opacity-50"
                :class="focused ? ['opacity-100'] : ['opacity-0']"
            />
            <template v-if="closestMatchingCommands.length >= 1 && focused">
                <span class="select-none rounded-md bg-neutral-950 bg-opacity-60 px-2 py-2 font-medium text-white">
                    Suggestions
                </span>
                <span
                    v-for="(command, index) in closestMatchingCommands"
                    :key="index"
                    class="select-none rounded-md bg-neutral-950 bg-opacity-60 px-2 py-2 font-medium text-white"
                >
                    {{ command.name }} - {{ command.desc }}
                </span>
            </template>
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 6px;
}

.flip-left {
    direction: rtl;
}

.flip-right {
    direction: ltr;
}
</style>
