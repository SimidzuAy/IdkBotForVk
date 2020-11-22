import Command from "@command"
import {commands, ERRORS, MContext, getUserReg} from "@types"
import {HearManager} from "@vk-io/hear"
import {getIdByMatch, getIdFromReply, isThisCommand, sendError, aliasesToCommand} from "@utils"

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {

            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.unBan.aliases)} ${getUserReg}`, "i"),
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.unBan.aliases)}`)
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('unBan') > context.chat.userGetPermission(context.senderId))
            return

        const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

            if (id === context.senderId)
                return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.getLang(), context.vk)

            if (id) {
                if (context.chat.getBanned().find(x => x.bannedId === id)) {
                    context.chat.unBan(id)
                    context.chat.save()
                    await context.send(`Пользователь @id${id} успешно разбанен!`)
                } else
                    return await sendError(ERRORS.USER_ARE_NOT_BANNED, context.peerId, context.chat.getLang(), context.vk)

            }

    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
