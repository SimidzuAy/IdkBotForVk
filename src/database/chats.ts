import {createSchema, Type, typedModel} from 'ts-mongoose'
import {Commands, Stat} from './types'

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
    commands: Commands,
    stat: Stat
})

export const chatModel = typedModel('Chat', chatSchema, undefined, undefined, {
    getByPeerId(peerId: number) {
        return this.find({
            peerId
        })
    }
})
