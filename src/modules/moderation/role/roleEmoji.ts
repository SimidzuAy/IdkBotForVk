import {genCommand, isThisCommand} from '@utils'
import ICommand from '@command'
import {emojiReg, ERRORS, hear, MContext} from '@types'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'roleEmoji')} (\\d{1,3}) (.+)`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (!Chat.isEnoughPermission('roleEmoji', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        if (!emojiReg.test(context.$match[2]))
            return await context.send('Неверное emoji')

        const right = context.chat.rights.find(x => x.permission === Number(context.$match[1]))
        const emoji = context.$match[2].match(emojiReg)![0]

        if (!right)
            return await Chat.sendError(ERRORS.ROLE_DOESNT_CREATED, context)

        context.chat.rights.find(x => x.permission === Number(context.$match[1]))!.emoji = emoji

        await context.send(`Emoji роли с названием ${right.name} успешно измененно!`)

    };
}
