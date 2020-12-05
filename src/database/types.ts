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
