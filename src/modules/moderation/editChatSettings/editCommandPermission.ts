import ICommand from '@command'
import {commands, ERRORS, hear, MContext} from '@types'
import {genCommand, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {

    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`${genCommand(context.chat.prefix, 'changeRoleRight')} ([а-яА-Яa-zA-Z]+) (\\d{1,3})`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (!Chat.isEnoughPermission('changeRoleRight', context))
            return await Chat.sendError(ERRORS.NOT_ENOUGH_RIGHTS, context)

        const command = context.$match[1]

        let isValidCommand = false

        let commandInDb: keyof typeof commands | null = null

        for (const key of Object.keys(commands)) {
            if (commands[key as keyof typeof commands].aliases.find(x => x === command)) {
                isValidCommand = true
                commandInDb = key as keyof typeof commands
                break
            }
        }

        if ( !commandInDb ) return

        if ( !isValidCommand )
            return await Chat.sendError(ERRORS.UNKNOWN_COMMAND, context)

        const rightLevel = Number(context.$match[2])

        if ( rightLevel > 100 || rightLevel < -100  )
            return await Chat.sendError(ERRORS.TOO_BIG_SMALL_RIGHT_LEVEL, context)

        if ( !context.chat.rights.find(x => x.permission === rightLevel) )
            return await Chat.sendError(ERRORS.ROLE_DOESNT_CREATED, context)

        context.chat.commands[commandInDb].permission = rightLevel

        context.chat.markModified('commands')
    };
}
