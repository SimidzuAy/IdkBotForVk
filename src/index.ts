import {VK} from 'vk-io'
import {HearManager} from '@vk-io/hear'

import loadCommands from './loadCommands'
import User from '@class/User'
import cfg from '@config'
import {MContext} from '@types'
import {DB} from './database'
import Chat from '@class/Chat'
import Logger from '@class/Logger'
import {checkUserIsBanned} from '@utils'

const vk: VK = new VK({
    token: cfg.token,
    language: 'ru'
})

const logger = new Logger()

const users = new Map()
const chats = new Map()
new DB(cfg.db.url, logger)

async function getUser(context: MContext) {
    let user

    if (!users.has(String(context.senderId))) {

        user = await new User(context.senderId)
            .getUser(0, vk)

        users.set(String(context.senderId), {
            user,
            lastTime: Date.now()
        })
    } else {
        user = users.get(String(context.senderId)).user
        users.get(String(context.senderId)).lastTime = Date.now()
    }

    return user
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
        })
    } else {
        chat = chats.get(String(context.peerId)).chat
        chats.get(String(context.peerId)).lastTime = Date.now()
    }

    return chat

}

const hearManager = new HearManager<MContext>()


vk.updates.on(['message_new'], async (context: MContext, next) => {
    if (!context.senderId || !context.peerId || context.senderId < 0 || !context.chatId) return

    context.vk = vk

    const userAndChat = await Promise.all([
        getUser(context),
        getChat(context)
    ])

    context.user = userAndChat[0]
    context.chat = userAndChat[1]

    if ( await checkUserIsBanned(context) ) return

    if (!Chat.getUserFromChat(context.chat, context.senderId)!.inChat)
        Chat.newChatUser(context.chat, context.senderId)

    await next()

})

vk.updates.on(['message_new'], async (context: MContext, next) => {
    try {
        await hearManager.middleware(context, next)
    } catch (error) {
        await context.reply('Произошла ошибка: ' + error.message)
        logger.error(error.message)
        throw error
    }
})


vk.updates.on(['chat_invite_user'], async (context: MContext) => {

    if (!context.chatId) return

    context.vk = vk

    context.chat = await getChat(context)

    if ( await checkUserIsBanned(context) ) return

    if (context.eventMemberId)
        Chat.newChatUser(context.chat, context.eventMemberId)

})

vk.updates.on(['chat_kick_user'], async (context: MContext) => {

    if (!context.chatId) return

    if (context.eventMemberId)
        Chat.removeUserFromChat(context.chat, context.eventMemberId)
    else
        console.log('why')
})

loadCommands(hearManager, logger)

hearManager.onFallback(async context => {
    if (!context.isChat)
        return await context.reply('Команда не найдена')
})


setInterval(() => {
    users.forEach((value, key) => {
        if (Date.now() - users.get(key).lastTime > 30000)
            users.delete(key)
    })
}, 1000 * 60 * 5)


setInterval(() => {
    chats.forEach((value, key) => {
        if (Date.now() - chats.get(key).lastTime > 30000)
            chats.delete(key)
    })
}, 1000 * 60 * 15)


vk.updates.start().catch(console.error).then(() => logger.info('Бот запущен'))
