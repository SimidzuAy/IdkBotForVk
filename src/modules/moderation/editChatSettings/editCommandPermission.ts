import ICommand from '@command'
import {commands, ERRORS, MContext} from '@types'
import {aliasesToCommand, isThisCommand, sendCommandUsage, sendError} from '@utils'
import {HearManager} from '@vk-io/hear'

export default class implements ICommand {

    readonly PATH: string = __filename;

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.changeRoleRight.aliases)} ([а-яА-Яa-zA-Z]+) (\\d{1,3})`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.changeRoleRight.aliases)}`).test(value)) {
                    sendCommandUsage('changeRoleRight', context.peerId, context.chat.getLang(), context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if ( context.chat.getCommandPermission('changeRoleRight') > context.chat.userGetPermission(context.senderId))
            return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.getLang(), context.vk)

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
            return await sendError(ERRORS.UNKNOWN_COMMAND, context.peerId, context.chat.getLang(), context.vk)

        const rightLevel = Number(context.$match[2])

        if ( rightLevel > 100 || rightLevel < -100  )
            return await sendError(ERRORS.TOO_BIG_SMALL_RIGHT_LEVEL, context.peerId, context.chat.getLang(), context.vk)

        if ( !context.chat.chatGetRights().find(x => x.permission === rightLevel) )
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.getLang(), context.vk)

        context.chat.chatSetCommandPermission(commandInDb, rightLevel)
        context.chat.save()
    };

    constructor(hearManager: HearManager<MContext>) {
        hearManager.hear(this.hears, this.handler)
    }

}
