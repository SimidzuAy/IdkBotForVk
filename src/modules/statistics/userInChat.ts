import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand, prettyNum} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {
    hears = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(genCommand(context.chat.prefix, 'statInChat'))
            ]


            return isThisCommand(value, context, regExps)
        }
    ]

    handler = async ( context: MContext ): Promise<unknown> => {
        if ( !Chat.isEnoughPermission('statInChat', context) )
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        const user = Chat.getUserFromChat(context.chat, context.senderId)!
        
        if ( context.text!.toLowerCase().includes('детально') )
            return await context.send(`
                [id${context.senderId}|Ваша] статистика в этом чате:
                📧 Сообщений: ${prettyNum(user.stat.messages)}
                🔣 Символов: ${prettyNum(user.stat.symbols)}
                🎵 Голосовых: ${prettyNum(user.stat.audio_message)}
                📩 Пересланных: ${prettyNum(user.stat.forwards)}
                📷 Фото: ${prettyNum(user.stat.photo)}
                📹 Видео: ${prettyNum(user.stat.video)}
                🎧 Аудио: ${prettyNum(user.stat.audio)}
                📑 Документов: ${prettyNum(user.stat.doc)}
                📣 Постов: ${prettyNum(user.stat.wall)}
                💩 Стикеров: ${prettyNum(user.stat.sticker)}
                ❗ Команд: ${prettyNum(user.stat.commands)}
                🤣 Смайлов: ${prettyNum(user.stat.emoji)}
        `.replace(/ {16}/g, ''), { disable_mentions: 1 })


        return await context.send(`
            [id${context.senderId}|Ваша] статистика в этом чате:
            📧 Сообщений: ${prettyNum(user.stat.messages)}
            🔣 Символов: ${prettyNum(user.stat.symbols)}
        `.replace(/ {12}/g, ''), { disable_mentions: 1 })

    }
}
