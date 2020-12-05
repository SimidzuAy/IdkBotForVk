import {Type} from 'ts-mongoose'

const number = Type.number({ required: true, min: 0 })

export const Stat = Type.object({ required: true }).of({
    messages:      number,
    symbols:       number,
    audio_message: number,
    forwards:      number,
    photo:         number,
    video:         number,
    audio:         number,
    doc:           number,
    sticker:       number,
    commands:      number,
    emoji:         number,
    wall:          number
})


const command = Type.object({ required: true}).of({
    permission: Type.number({
        max: 100,
        min: -100,
        required: true
    })
})


export const Commands = Type.object({
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
    myRole: command,
    statInChat: command
})
