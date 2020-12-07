import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import {genCommand, isThisCommand, prettyNum} from '@utils'
import Chat from '@class/Chat'
import {chatModel} from '../../database'

export default class implements ICommand {
    hears = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.settings.prefix, 'allUserStat')}`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    handler = async ( context: MContext ): Promise<unknown> => {
        if (!Chat.isEnoughPermission('allUserStat', context) )
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        const allUsersChatsLen: number = (await chatModel.find({
            vkId: context.senderId
        })).length

        return await context.send(`
                [id${context.senderId}|Ваша] подробная статистика во всех чатах:
                🤖 Вы были в ${allUsersChatsLen} чатах с ботом
                📧 Сообщений: ${prettyNum(context.user.stat.messages)}
                🔣 Символов: ${prettyNum(context.user.stat.symbols)}
                🎵 Голосовых: ${prettyNum(context.user.stat.audio_message)}
                📩 Пересланных: ${prettyNum(context.user.stat.forwards)}
                📷 Фото: ${prettyNum(context.user.stat.photo)}
                📹 Видео: ${prettyNum(context.user.stat.video)}
                🎧 Аудио: ${prettyNum(context.user.stat.audio)}
                📑 Документов: ${prettyNum(context.user.stat.doc)}
                📣 Постов: ${prettyNum(context.user.stat.wall)}
                💩 Стикеров: ${prettyNum(context.user.stat.sticker)}
                ❗ Команд: ${prettyNum(context.user.stat.commands)}
                🤣 Смайлов: ${prettyNum(context.user.stat.emoji)}
        `.replace(/ {16}/g, ''), { disable_mentions: 1 })
    }
}
