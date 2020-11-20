import Command from "@command"
import {ERRORS, MContext} from "@types"
import {HearManager} from "@vk-io/hear"
import {isThisCommand, sendError} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*(?:создать роль|create role)\\s+(.+)\\s+(\\d{1,3})$`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {

        const num = Number(context.$match[2])

        if (num >= -100 && num <= 99) {
            if (context.chat.userHasPermission(context.senderId, 90)) {
                context.chat.crateRight(num, context.$match[1])
                await context.send("Ну создал и чё.")
            } else
                return await sendError(ERRORS.NOT_ENOUGH_RIGHTS, context.peerId, context.chat.getLang(), context.vk)
        } else {
            await context.send([
                "Уровень прав может быть от -100 до 99",
                "Right level permission can be from -100 to 99"
            ][context.chat.getLang()])
        }

    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
