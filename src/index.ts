import {VK} from 'vk-io'
import {HearManager} from '@vk-io/hear'

import loadCommands from './loadCommands'
import User from '@class/User'
import cfg from '@config'
import {emojiReg, MContext} from '@types'
import {DB} from './database'
import Chat from '@class/Chat'
import Logger from '@class/Logger'
import {checkUserIsBanned} from '@utils'
import {Stat} from './database/types'


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

    await next()

})

vk.updates.on(['message_new'], async (context: MContext, next) => {
    try {
        await hearManager.middleware(context, next)

        if (!Chat.getUserFromChat(context.chat, context.senderId)!.inChat)
            Chat.newChatUser(context.chat, context.senderId)

        // Мега костыль, уберите детей от экранов

        const match = context.text?.match(emojiReg)

        const emojiLen: number = match ? match.length : 0


        // Немного статистики никому не помешает =)

        context.user.stat.commands += 1
        context.user.stat.messages += 1
        context.user.stat.symbols  += context.text ? context.text.length : 0
        context.user.stat.forwards += context.forwards.length
        context.user.stat.emoji    += emojiLen
        
        Chat.getUserFromChat(context.chat, context.senderId)!.stat.commands += 1
        Chat.getUserFromChat(context.chat, context.senderId)!.stat.messages += 1
        Chat.getUserFromChat(context.chat, context.senderId)!.stat.symbols  += context.text ? context.text.length : 0
        Chat.getUserFromChat(context.chat, context.senderId)!.stat.forwards += context.forwards.length
        Chat.getUserFromChat(context.chat, context.senderId)!.stat.emoji    += emojiLen

        context.chat.stat.messages += 1
        context.chat.stat.commands += 1
        context.chat.stat.symbols  += context.text ? context.text.length : 0
        context.chat.stat.forwards += context.forwards.length
        context.chat.stat.emoji    += emojiLen

        context.attachments.forEach(attach => {
            if ( ['audio_message', 'photo', 'video', 'audio', 'doc', 'sticker', 'wall'].includes(attach.type) ) {
                context.user.stat[attach.type as keyof typeof Stat] += 1
                context.chat.stat[attach.type as keyof typeof Stat] += 1
                Chat.getUserFromChat(context.chat, context.senderId)!.stat[attach.type as keyof typeof Stat] += 1
            }
        })


    } catch (error) {
        await context.reply('Произошла ошибка: ' + error.message)
        logger.error(error.message)
        throw error
    }

    context.user.markModified('stat')
    context.chat.markModified('stat')
    context.chat.markModified('users')

    await Promise.all([
        context.user.save(),
        context.chat.save()
    ])

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

    context.user.stat.commands -= 1

    if (!context.isChat)
        return await context.reply('Команда не найдена')

    context.chat.stat.commands -= 1
    Chat.getUserFromChat(context.chat, context.senderId)!.stat.commands -= 1
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
