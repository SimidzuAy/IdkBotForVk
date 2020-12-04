import {createSchema, Type, typedModel} from 'ts-mongoose'
import {RIGHTS} from '@types'

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
    fullName: Type.string({required: true}),
    sex: Type.number({ required: true })

})

export const userModel = typedModel('User', userSchema, undefined, undefined, {
    getByVkId(id: number) {
        return this.find({
            vkId: id
        })
    }
})
