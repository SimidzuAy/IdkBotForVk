import {createSchema, Type, typedModel} from 'ts-mongoose'
import {LANG} from '@types'
import { Stat } from './types'

const command = Type.object({ required: true}).of({
    permission: Type.number({
        max: 100,
        min: -100,
        required: true
    })
})


export const chatSchema = createSchema({
    peerId: Type.number({
        required: true,
        unique: true
    }),
    bans: Type.array({ required: true }).of({
        bannedId: Type.number({required: true}),
        byId: Type.number({required: true}),
        from: Type.number({required: true}),
        to: Type.number({required: false, default: -1})
    }),
    prefix: Type.string({
        required: true
    }),
    lang: Type.number({
        required: true,
        default: LANG.RUSSIAN
    }),
    users: Type.array({ required: true }).of({
        userId: Type.number({required: true}),
        permission: Type.number({required: true, max: 100, min: -100}),
        inChat: Type.boolean({required: true}),
        stat: Stat
    }),
    rights: Type.array({
        required: true
    }).of({
        name: Type.string({required: true}),
        permission: Type.number({required: true, max: 100, min: -100}),
        emoji: Type.string({required: false, default: ''})
    }),
    commands: Type.object({
        required: true
    }).of({
        ban: command,
        unBan: command,
        prefix: command,
        createRole: command,
        changeRoleRight: command,
        roleEmoji: command,
        setRole: command,
        getAdminList: command,
        ping: command,
        myRole: command
    }),
    stat: Stat
})

export const chatModel = typedModel('Chat', chatSchema, undefined, undefined, {
    getByPeerId(peerId: number) {
        return this.find({
            peerId
        })
    }
})
