import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
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

        return await context.send(`
        📧 Сообщений: ${user.stat.messages}
        🔣 Символов: ${user.stat.symbols}
        🎵 Голосовых: ${user.stat.audio_message}
        📩 Пересланных: ${user.stat.forwards}
        📷 Фото: ${user.stat.photo}
        📹 Видео: ${user.stat.video}
        🎧 Аудио: ${user.stat.audio}
        📑 Документов: ${user.stat.doc}
        📣 Постов: ${user.stat.wall}
        💩 Стикеров: ${user.stat.sticker}
        ❗ Команд: ${user.stat.commands}
        🤣 Смайлов: ${user.stat.emoji}
        `.replace(/ {8}/g, ''))
    }
}
