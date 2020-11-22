import Command from "@command"
import {commands, MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {aliasesToCommand, isThisCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.prefix.aliases)} (.+)`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('prefix') > context.chat.userGetPermission(context.senderId))
            return

        if (context.$match[1].length > 1) {
            return await context.send("Длинна префикса не может превышать один символ")
        }

        context.chat.setPrefix(context.$match[1])
        await context.send(`Префикс успешно изменён на ${context.$match[1]}`)
    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
