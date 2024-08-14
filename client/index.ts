import * as alt from 'alt-client';
import { useRebarClient } from '../../../main/client/index.js';
import { ChatConfig } from '../shared/config.js';
import { ChatEvents } from '../shared/events.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();

function handleClose() {
    if (!messenger.isChatFocused()) {
        return;
    }

    messenger.unfocusChat();
    webview.unfocus();
    alt.toggleGameControls(true);
    webview.emit(ChatEvents.toWebview.unfocus);
    alt.emitServer(ChatEvents.toServer.isChatting, false);
}

const KeyBinds = {
    [ChatConfig.keybinds.close]: handleClose,
    [ChatConfig.keybinds.send]: () => {
        webview.emit(ChatEvents.toWebview.send);
        handleClose();
    },
    [ChatConfig.keybinds.open]: () => {
        if (messenger.isChatFocused()) {
            return;
        }

        if (alt.isConsoleOpen()) {
            return;
        }

        messenger.focusChat();
        webview.focus();
        alt.toggleGameControls(false);
        webview.emit(ChatEvents.toWebview.focus);
        alt.emitServer(ChatEvents.toServer.isChatting, true);
    },
};

alt.on('keyup', (key: number) => {
    if (!webview.isOverlayOpen('Chat')) {
        return;
    }

    if (webview.isAnyPageOpen()) {
        return;
    }

    if (!KeyBinds[key]) {
        return;
    }

    KeyBinds[key]();
});
