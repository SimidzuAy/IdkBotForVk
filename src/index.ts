import {MessageContext, VK} from "vk-io"
import {HearManager} from "@vk-io/hear"

import loadCommands from './loadCommands'
import User from '@class/User'
import cfg from '@config'
import {MContext} from "@types"
import {DB} from "./dataBase"
import Chat from "@class/Chat"

const vk: VK = new VK({
    token: cfg.token,
    language: "ru"
})

const users = new Map()
const chats = new Map()
new DB(cfg.db.url)

async function getUser(context: MContext) {
    let user

    if (!users.has(String(context.senderId))) {

        user = await new User(context.senderId)
            .getUser(0, vk);

        users.set(String(context.senderId), {
            user,
            lastTime: Date.now()
        })
    } else {
        user = users.get(String(context.senderId)).user;
        users.get(String(context.senderId)).lastTime = Date.now();
    }

    return user;
}

async function getChat(context: MContext) {
    let chat

    if (!chats.has(String(context.peerId))) {

        const chatInfo = await context.vk.api.messages.getConversationMembers({
            peer_id: context.peerId
        })

        chat = await new Chat(context.peerId, chatInfo.items).getChat()

        chats.set(String(context.peerId), {
            chat: chat,
            lastTime: Date.now()
        });
    } else {
        chat = chats.get(String(context.peerId)).chat;
        chats.get(String(context.peerId)).lastTime = Date.now();
    }

    return chat;

}

const hearManager = new HearManager<MContext>()


vk.updates.on(['message_new'], async (context: MContext, next: Function) => {

    if (!context.senderId || !context.peerId || context.senderId < 0 || !context.chatId) return

    context.vk = vk

    const userAndChat = await Promise.all([
        getUser(context),
        getChat(context)
    ])

    context.user = userAndChat[0]
    context.chat = userAndChat[1]

    if (context.chat.getBanned().find(x => x.bannedId === context.senderId)) {

        const methods: [Promise<MessageContext>, Promise<number>] = [
            context.send("Данный пользователь находится в бане!"),
            vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: context.senderId
            })
        ];

        return await Promise.all(methods)
    }

    if ( !context.chat.getAllUsers().find(x => x.userId === context.senderId)!.inChat )
        context.chat.newChatUser(context.senderId)

    await next()

});

vk.updates.on(['message_new'], async (context: MContext, next: Function) => {
    try {
        // @ts-ignore
        await hearManager.middleware(context, next)
    } catch (error) {
        await context.reply("Произошла ошибка: " + error.message)
        throw error
    }
})


vk.updates.on(['chat_invite_user'], async (context: MContext) => {

    if (!context.chatId) return

    context.vk = vk

    context.chat = await getChat(context)

    if (context.chat.getBanned().find(x => x.bannedId === context.eventMemberId)) {

        const methods: [Promise<MessageContext>, Promise<number>] = [
            context.send("Данный пользователь находится в бане!"),
            vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: context.eventMemberId
            })
        ];

        return await Promise.all(methods)
    }

    if (context.eventMemberId)
        context.chat.newChatUser(context.eventMemberId)

});

vk.updates.on(["chat_kick_user"], async (context: MContext) => {

    if (!context.chatId) return

    if (context.eventMemberId)
        context.chat.removeChatUser(context.eventMemberId)
    else
        console.log("why")
})

loadCommands(hearManager);

hearManager.onFallback(async (context) => {
    if (!context.isChat)
        return await context.reply("Команда не найдена")
});


setInterval(() => {
    users.forEach((value, key) => {
        if (Date.now() - users.get(key).lastTime > 30000)
            users.delete(key)
    })
}, 1000 * 60 * 5);


setInterval(() => {
    chats.forEach((value, key) => {
        if (Date.now() - chats.get(key).lastTime > 30000)
            chats.delete(key)
    })
}, 1000 * 60 * 15);


vk.updates.start().catch(console.error).then(() => console.log("started"));
