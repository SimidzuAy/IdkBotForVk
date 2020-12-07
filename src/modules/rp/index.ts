import ICommand from '@command'
import {ERRORS, getUserReg, hear, MContext} from '@types'
import cfg from '@config'
import {Keyboard} from 'vk-io'
import {getFullNameById, getIdByMatch, getIdFromReply, isThisCommand} from '@utils'
import Chat from '@class/Chat'

export default class implements ICommand {
    readonly hears: hear[] = [
        (value: string, context: MContext): boolean => {
            const regExps = [
                new RegExp(`^${context.chat.settings.prefix}\\s*(.+)\\s+${getUserReg}`, 'i'),
                new RegExp(`^${context.chat.settings.prefix}\\s*(.+)`, 'i')
            ]

            return isThisCommand(value, context, regExps)
        },
        (value: string, context: MContext): boolean => {
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

            return false
        }
    ];

    readonly handler = async (context: MContext, next: Function): Promise<unknown> => {

        if (!context.isChat) return next()

        let check = false

        // Т.к рп ловит все команды - проверяем существует ли данное рп
        // Если нет, то проверяем следущую команду
        for (const key in cfg.rp) {
            if (key === context.$match[1].toLowerCase()) {
                check = true
                break
            }
        }

        if (!check) return next()


        const id: number | null = await getIdByMatch(context.vk, [context.$match[2], context.$match[3]]) ||
            await getIdFromReply(context)

        if (id) {

            if (id < 0)
                return await context.send('Я не хочу трогать своих братьев!')

            if (id === context.senderId) {
                return await context.send(`Ну и нахуя ты самовыпил ${['сделало', 'сделала', 'сделал'][context.user.sex]}`)
            }

            const inChat = (await context.vk.api.messages.getConversationMembers({
                peer_id: context.peerId
            })).items

            if (!inChat.find(x => x.member_id === id))
                return await Chat.sendError(ERRORS.USER_NOT_FOUND, context)

            const names = [
                `[id${context.senderId}|${context.user.name.nom.first} ${context.user.name.nom.last}]`,
                `[id${id}|${await getFullNameById(context.vk, id, 'gen')}]`]

            const string = context.$match[1][0].toUpperCase() + context.$match[1].substr(1).toLowerCase()

            return await context.vk.api.messages.send({
                message: `${names[0]} ${cfg.rp[context.$match[1].toLowerCase()][context.user.sex]} ${names[1]}`,
                peer_id: context.peerId,
                random_id: 0,
                disable_mentions: true,
                keyboard: Keyboard.builder()
                    .textButton({
                        label: `${string} в ответ`,
                        color: 'negative',
                        payload: `{"${cfg.payload}": {"from": ${id},"to": "id${context.senderId}","action": "${context.$match[1]}"}}`
                    }).inline(true)

            })

        }
    };

}
