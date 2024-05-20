# Chat for Rebar Framework

This plugin allows you to speak to other players who are near your player using the chat box.

Press `t` to chat, and type commands with `/` in front to execute commands.

## Features

-   Press `t` to chat
-   Type commands or messages in the chat box
-   Config for chat distance
-   Config for global chat (disabled by default)
-   Config for message length
-   Config for messages to show on screen
-   Chat color support by using `{FF0000} This message is red!`
-   API check chat status through callbacks
-   API check if player is chatting

## API

```ts
import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';

const Rebar = useRebar();
const api = Rebar.useApi();

// Ideally you only want to show the chat, after the player has fully logged in
alt.on('playerConnect', async (player) => {
    const chat = await api.getAsync('chat-api');
    chat.show(player);
});
```

## Installation

From the main directory of your `Rebar` framework.

```
git clone https://github.com/Stuyk/rebar-chat src/plugins/chat
```

That's it.

If you wish to save the plugin in your own repository, go to the `src/plugins/chat` folder and delete the `.git` folder.
