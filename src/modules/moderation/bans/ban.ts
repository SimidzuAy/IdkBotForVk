import Command from "@command"
import {ERRORS, MContext, commands} from "@types"
import {HearManager} from "@vk-io/hear"
import cfg from '@config'
import {getIdByMatch, getIdFromReply, isThisCommand, sendError, aliasesToCommand} from '@utils'


export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.ban.aliases)} ${cfg.getUserReg}`, "i"),
                new RegExp(`^${context.chat.getPrefix()}}\\s*${aliasesToCommand(commands.ban.aliases)}`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ]

    readonly handler = async (context: MContext) => {

        if (context.chat.getCommandPermission('ban') > context.chat.userGetPermission(context.senderId))
            return

        try {
            const id: number | null = await getIdByMatch(context.vk, [context.$match[1], context.$match[2]]) ||
                await getIdFromReply(context)

            if (id === context.senderId)
                return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.getLang(), context.vk)

            if (id) {
                await context.vk.api.messages.removeChatUser({
                    chat_id: context.chatId!,
                    member_id: id
                })

                context.chat.ban(id, context.senderId)
            } else {
                await context.send("Кого банить то блять")
            }

        } catch (err) {
            await sendError(ERRORS.IN_KICK_USER, context.peerId, context.chat.getLang(), context.vk)
        }
    }

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
