import ICommand from '@command'
import {ERRORS, hear, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'prefix')} (.+)`, 'i')
            ]

            return isThisCommand(value, context, regExps)

        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (!Chat.isEnoughPermission('prefix', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        if (context.$match[1].length > 1) {
            return await context.send('Длинна префикса не может превышать один символ')
        }
        
        if ( context.$match[1] === '?' )
            return await context.send('Префикс не может быть "?"')

        context.chat.prefix = context.$match[1]
        context.chat.markModified('commands')
        await context.send(`Префикс успешно изменён на ${context.$match[1]}`)
    };

}
