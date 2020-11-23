import Command from "@command"
import {commands, ERRORS, MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {aliasesToCommand, isThisCommand, sendCommandUsage, sendError} from "@utils"

export default class extends Command {

    readonly PATH: string = __filename

    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.createRole.aliases)}\\s+(.+)\\s+(\\d{1,3})$`, "i")
            ]

            const ans = isThisCommand(value, context, regExps)

            if ( !ans ) {
                if (new RegExp(`^${context.chat.getPrefix()}${aliasesToCommand(commands.createRole.aliases)}`).test(value)) {
                    sendCommandUsage("createRole", context.peerId, context.chat.getLang(), context.vk)
                }
            }
            return ans
        }
    ];

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('createRole') > context.chat.userGetPermission(context.senderId))
            return

        const num = Number(context.$match[2])

            if (num >= -100 && num <= 99) {
                if (context.chat.userHasPermission(context.senderId, 90)) {
                    context.chat.crateRight(num, context.$match[1])
                    context.chat.save()
                    await context.send("Ну создал и чё.")
                } else
                    return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.getLang(), context.vk)
            } else {
                await sendError(ERRORS.TOO_BIG_SMALL_RIGHT_LEVEL, context.peerId, context.chat.getLang(), context.vk)
            }

    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
