import Command from "@command"
import {commands, ERRORS, MContext, getUserReg} from "@types"
import {HearManager} from "@vk-io/hear"
import {aliasesToCommand, getIdByMatch, getIdFromReply, isThisCommand, sendError} from "@utils"

export default class extends Command {

    readonly PATH: string = __filename

    readonly hears: any[] = [
        (value: string, context: MContext) => {

            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.setRole.aliases)} ${getUserReg} (\\d{1,3})$`, "i"),
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.setRole.aliases)} (\\d{1,3})$`, "i"),
                new RegExp(`^${context.chat.getPrefix()}\\s*${aliasesToCommand(commands.myRole.aliases)}`, "i")
            ]

            return isThisCommand(value, context, regExps)
        }
    ];

    readonly handler = async (context: MContext) => {
        const id = await getIdFromReply(context) ||
            await getIdByMatch(context.vk, [context.$match[1], context.$match[2]])

        if (!id) {
            const userPermission = context.chat.getUser(context.senderId)!.permission
            const name = context.chat.chatGetRights()!.find(x => x.permission === userPermission)!.name

            return await context.send(`Роль: ${name}`)
        }

        const thisUser = context.chat.getUser(context.senderId)!;
        let permission: number;

        if (!isNaN(Number(context.$match[3]))) {
            permission = Number(context.$match[3])
        } else {
            permission = Number(context.$match[2]);
        }

        if (id === context.senderId)
            return await sendError(ERRORS.USE_AT_YOURSELF, context.peerId, context.chat.getLang(), context.vk)

        if (!context.chat.getUser(id))
            return await sendError(ERRORS.USER_ARE_NOT_IN_THE_CHAT, context.peerId, context.chat.getLang(), context.vk)

        if (thisUser.permission <= context.chat.getUser(id)!.permission)
            return await sendError(ERRORS.USER_HAVE_BIGGER_RIGHT, context.peerId, context.chat.getLang(), context.vk)

        if (thisUser.permission <= permission)
            return await context.send([
                "Вы не можете выдавать права которые выше или равняются вашему!",
                "You cannot issue rights that are higher than or equal to yours!"
            ][context.chat.getLang()])

        if (!context.chat.chatGetRights().find(x => x.permission === permission))
            return await sendError(ERRORS.ROLE_DOESNT_CREATED, context.peerId, context.chat.getLang(), context.vk)

        context.chat.userSetPermission(id, permission)
        context.chat.save()

        await context.send(["Уровень прав успешно изменён!", "Permission level successfully changed!"][context.chat.getLang()])

    };

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
