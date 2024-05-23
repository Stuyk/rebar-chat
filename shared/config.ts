export const ChatConfig = {
    // How close players need to be read each others messages
    chatDistance: 25,

    // Set this to true to skip all distance checks, and make messages global
    globalChat: false,

    // The max length of an input
    inputLength: 128,

    // Maximum messages on screen at any given time
    messagesPerPage: 8,

    // Chat Hotkey
    keybinds: {
        open: 84, // t
        close: 27, // escape
        send: 13, // enter
    },
};
