import {genCommand, isThisCommand, sendCommandUsage, sendError} from '@utils'
import ICommand from '@command'
import {ERRORS, MContext} from '@types'
import Chat from '@class/Chat'

const emojiReg = new RegExp('[\\u{1f300}-\\u{1f5ff}\\u{1f900}-\\u{1f9ff}\\u{1f600}-\\u{1f64f}\\u{1f680}-\\u{1f6ff}\\u{2600}-' +
    '\\u{26ff}\\u{2700}-\\u{27bf}\\u{1f1e6}-\\u{1f1ff}\\u{1f191}-\\u{1f251}\\u{1f004}\\u{1f0cf}\\u{1f170}-\\u{1f171}' +
    '\\u{1f17e}-\\u{1f17f}\\u{1f18e}\\u{3030}\\u{2b50}\\u{2b55}\\u{2934}-\\u{2935}\\u{2b05}-\\u{2b07}\\u{2b1b}-' +
    '\\u{2b1c}\\u{3297}\\u{3299}\\u{303d}\\u{00a9}\\u{00ae}\\u{2122}\\u{23f3}\\u{24c2}\\u{23e9}-\\u{23ef}\\u{25b6}' +
    '\\u{23f8}-\\u{23fa}]', 'ui')

export default class implements ICommand {

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'roleEmoji')} (\\d{1,3}) (.+)`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(genCommand(context.chat.prefix, 'roleEmoji')).test(value)) {
                    sendCommandUsage('roleEmoji', context.peerId, context.chat.lang, context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.commands['roleEmoji'].permission > Chat.getUserFromChat(context.chat, context.senderId)!.permission)
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.lang, context.vk)

        if (!emojiReg.test(context.$match[2]))
            return await context.send('Неверное emoji')

        const right = context.chat.rights.find(x => x.permission === Number(context.$match[1]))
        const emoji = context.$match[2].match(emojiReg)![0]

        if (!right)
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.lang, context.vk)

        context.chat.rights.find(x => x.permission === Number(context.$match[1]))!.emoji = emoji

        await context.send([
            `Emoji роли с названием ${right.name} успешно измененно!`,
            `Emoji role with name ${right.name} has been changed`
        ][context.chat.lang])

    };
}
