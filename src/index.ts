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

const start = Date.now()

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
            chat,
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
    try {
        const userAndChat = await Promise.all([
            getUser(context),
            getChat(context)
        ])

        context.user = userAndChat[0]
        context.chat = userAndChat[1]

        if (await checkUserIsBanned(context)) return

        await next()
    } catch (e) {
        // Если юзер слишком быстро пишет, чтобы при попытке создания его 2 был игнор ошибки
        if ( e.type !== 'MongoError' ) throw e
    }
})

vk.updates.on(['message_new'], async (context: MContext, next) => {
    try {
        await hearManager.middleware(context, next)

        if (!Chat.getUserFromChat(context.chat, context.senderId)!.inChat)
            Chat.newChatUser(context.chat, context.senderId)

        // Уберите детей от экранов

        const match = context.text?.match(emojiReg)

        const emojiLen: number = match ? match.length : 0
        const text = context.text ? context.text.replace(emojiReg, '').length : 0

        // Мега костыль, зато рабочий.
        const stat: typeof Stat = {} as typeof Stat

        Object.assign(stat, Chat.getUserFromChat(context.chat, context.senderId)!.stat)
        stat.messages += 1
        stat.commands += 1
        stat.symbols  += text
        stat.forwards += context.forwards.length
        stat.emoji    += emojiLen

        const userStat: typeof Stat = {} as typeof Stat

        Object.assign(userStat, context.user.stat)
        userStat.commands += 1
        userStat.messages += 1
        userStat.symbols  += text
        userStat.forwards += context.forwards.length
        userStat.emoji    += emojiLen

        const chatStat: typeof Stat = {} as typeof Stat
        Object.assign(chatStat, context.chat.stat)

        chatStat.messages += 1
        chatStat.commands += 1
        chatStat.symbols  += text
        chatStat.forwards += context.forwards.length
        chatStat.emoji    += emojiLen


        context.attachments.forEach(attach => {
            if ( ['audio_message', 'photo', 'video', 'audio', 'doc', 'sticker', 'wall'].includes(attach.type) ) {
                userStat[attach.type as keyof typeof Stat] += 1
                chatStat[attach.type as keyof typeof Stat] += 1
                stat[attach.type as keyof typeof Stat] += 1
            }
        })

        const index = context.chat.users.findIndex(user => user.userId === context.senderId)!
        context.chat.users[index].stat = stat
        context.chat.stat = chatStat
        context.user.stat = userStat

    } catch (error) {
        await context.reply('Произошла ошибка: ' + error.message)
        logger.error(error.message)
        throw error
    }

    context.user.markModified('stat')
    context.chat.markModified('stat')
    context.chat.markModified('users')
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

    const userStat: typeof Stat = {} as typeof Stat

    Object.assign(userStat, context.user.stat)
    userStat.commands -=1

    context.user.stat = userStat

    if (!context.isChat)
        return await context.reply('Команда не найдена')

    const chatStat: typeof Stat = {} as typeof Stat
    Object.assign(chatStat, context.chat.stat)
    chatStat.commands -= 1
    context.chat.stat = chatStat

    const stat: typeof Stat = {} as typeof Stat
    Object.assign(stat, Chat.getUserFromChat(context.chat, context.senderId)!.stat)
    stat.commands -= 1

    const index = context.chat.users.findIndex(user => user.userId === context.senderId)!
    context.chat.users[index].stat = stat

})


setInterval(() => {
    users.forEach((value, key) => {
        if (Date.now() - users.get(key).lastTime > 30000) {
            users.get(key).user.save()
            users.delete(key)
        }
    })
}, 1000 * 60 * 5)


setInterval(() => {
    chats.forEach((value, key) => {
        if (Date.now() - chats.get(key).lastTime > 30000) {
            chats.get(key).chat.save()
            chats.delete(key)
        }
    })
}, 1000 * 60 * 15)


setInterval(() => {
    chats.forEach((value, key) => {
        chats.get(key).chat.save()
    })
    users.forEach((value, key) => {
        users.get(key).user.save()
    })
}, 5000)

vk.updates.start().catch(console.error).then(() => logger.info(`Бот запущен за ${Date.now() - start} ms`))
