import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { ChatEvents } from '../shared/events.js';

type PlayerChatCallback = (player: alt.Player, isChatting: boolean) => void;

const API_NAME = 'chat-api';
const Rebar = useRebar();
const sessionKey = 'is-player-chatting';
const callbacks: PlayerChatCallback[] = [];

function handleIsChatting(player: alt.Player, value: boolean) {
    player.setMeta(sessionKey, value);

    for (let cb of callbacks) {
        cb(player, value);
    }
}

function useApi() {
    function show(player: alt.Player) {
        const webview = Rebar.player.useWebview(player);
        webview.show('Chat', 'overlay');
    }

    function isChatting(player: alt.Player) {
        return player.getMeta(sessionKey) ? true : false;
    }

    function onChatStatusChange(callback: PlayerChatCallback) {
        callbacks.push(callback);
    }

    return {
        show,
        isChatting,
        onChatStatusChange,
    };
}

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof useApi>;
    }
}

Rebar.useApi().register(API_NAME, useApi());

alt.on('rebar:playerCharacterBound', (player) => Rebar.player.useWebview(player).show('Chat', 'overlay'));
alt.onClient(ChatEvents.toServer.isChatting, handleIsChatting);
