import ICommand from '@command'
import {commands, MContext} from '@types'
import {HearManager} from '@vk-io/hear'
import {aliasesToCommand, isThisCommand, sendCommandUsage} from '@utils'

export default class implements ICommand {

    readonly PATH: string = __filename;

    readonly hears: any[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.prefix.aliases)} (.+)`, 'i')
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.prefix.aliases)}`).test(value)) {
                    sendCommandUsage('prefix', context.peerId, context.chat.getLang(), context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext): Promise<unknown> => {

        if (context.chat.getCommandPermission('prefix') > context.chat.userGetPermission(context.senderId))
            return

        if (context.$match[1].length > 1) {
            return await context.send('Длинна префикса не может превышать один символ')
        }

        context.chat.setPrefix(context.$match[1])
        context.chat.save()
        await context.send(`Префикс успешно изменён на ${context.$match[1]}`)
    };

    constructor(hearManager: HearManager<MContext>) {
        hearManager.hear(this.hears, this.handler)
    }

}
