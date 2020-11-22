import Command from "@command"
import {ERRORS, MContext, getUserReg} from "@types"
import {HearManager} from "@vk-io/hear"
import cfg from '@config'
import {Keyboard} from "vk-io"
import {getFullNameById, getIdByMatch, getIdFromReply, isThisCommand, sendError} from '@utils'

export default class extends Command {
    readonly hears: any[] = [
        (value: string, context: MContext) => {
            const regExps = [
                new RegExp(`^${context.chat.getPrefix()}\\s*(.+)\\s+${getUserReg}`, "i"),
                new RegExp(`^${context.chat.getPrefix()}\\s*(.+)`, "i")
            ]

            return isThisCommand(value, context, regExps)
        },
        (value: string, context: MContext) => {
            if (context.messagePayload) {
                const obj = JSON.parse(context.messagePayload)

                if (obj[cfg.payload]) {
                    if (obj[cfg.payload].from === context.senderId) {
                        if (obj[cfg.payload].action && obj[cfg.payload].to) {
                            context.$match = []
                            context.$match[1] = obj[cfg.payload].action
                            context.$match[2] = obj[cfg.payload].to
                            return true
                        }
                    }
                }
            }

            return false;
        }
    ];

    // @ts-ignore
    readonly handler = async (context: MContext, next: Function) => {

        if (!context.isChat) return next()

        let check = false

        for (const key in cfg.rp) {
            if (key === context.$match[1].toLowerCase()) {
                check = true
                break
            }
        }

        if (!check) return next();


        let id: number | null = await getIdByMatch(context.vk, [context.$match[2], context.$match[3]]) ||
            await getIdFromReply(context);

        if (id) {

            if (id < 0)
                return await context.send([
                    "Я не хочу трогать своих братьев!",
                    "I dont wanna touch my brothers!"
                ][context.chat.getLang()])

            if (id === context.senderId) {
                return await context.send(`Ну и нахуя ты самовыпил ${context.user.selectBySex(["сделало", "сделала", "сделал"])}`)
            }

            const inChat = (await context.vk.api.messages.getConversationMembers({
                peer_id: context.peerId
            })).items;

            if (!inChat.find(x => x.member_id === id))
                return await sendError(ERRORS.USER_NOT_FOUND, context.peerId, context.chat.getLang(), context.vk)

            const names = [
                `[id${context.senderId}|${context.user.getFullName()}]`,
                `[id${id}|${await getFullNameById(context.vk, id, "gen")}]`];

            const string = context.$match[1][0].toUpperCase() + context.$match[1].substr(1).toLowerCase();

            return await context.vk.api.messages.send({
                message: `${names[0]} ${context.user.selectBySex(cfg.rp[context.$match[1].toLowerCase()])} ${names[1]}`,
                peer_id: context.peerId,
                random_id: 0,
                disable_mentions: true,
                keyboard: Keyboard.builder()
                    .textButton({
                        label: `${string} в ответ`,
                        color: "negative",
                        payload: `{"${cfg.payload}": {"from": ${id},"to": "id${context.senderId}","action": "${context.$match[1]}"}}`
                    }).inline(true)

            })

        }
    };

    constructor(hearManager: HearManager<MContext>) {
        super(hearManager)

        hearManager.hear(this.hears, this.handler)
    }

}
