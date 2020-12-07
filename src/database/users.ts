import {createSchema, Type, typedModel} from 'ts-mongoose'
import {RIGHTS} from '@types'
import {Stat} from './types'

const nameCase = Type.object({ required: true }).of({
    first: Type.string({ required: true }),
    last: Type.string({ required: true })
})

export const userSchema = createSchema({
    vkId: Type.number({
        required: true,
        unique: true
    }),
    rights: Type.array().of(Type.number({
        type: RIGHTS,
        enum: [0, 1, 2],
        required: false
    })),
    name: {
        nom: nameCase,
        gen: nameCase,
        dat: nameCase,
        acc: nameCase,
        ins: nameCase,
        abl: nameCase
    },
    sex: Type.number({ required: true }),
    stat: Stat
})

export const userModel = typedModel('User', userSchema, undefined, undefined, {
    getByVkId(id: number) {
        return this.find({
            vkId: id
        })
    }
})
