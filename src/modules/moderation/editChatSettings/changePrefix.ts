import ICommand from '@command'
import {ERRORS, hear, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.settings.prefix, 'prefix')}(?:\\s*(.+)|$)`, 'i')
            ]

            return isThisCommand(value, context, regExps)

        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (!Chat.isEnoughPermission('prefix', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        if ( !context.$match[1] ) {
            context.chat.settings.prefix.isRequired = false
            context.chat.markModified('settings')
            return await context.send('Теперь можно писать команды без указания префикса')
        }

        if (context.$match[1].length > 1) {
            return await context.send('Длинна префикса не может превышать один символ')
        }
        
        if ( context.$match[1] === '?' )
            return await context.send('Префикс не может быть "?"')

        context.chat.settings.prefix.symbol = context.$match[1]
        context.chat.settings.prefix.isRequired = true
        context.chat.markModified('settings')
        await context.send(`Префикс успешно изменён на ${context.$match[1]}`)
    };

}
