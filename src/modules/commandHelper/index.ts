import ICommand from '@command'
import {commands, MContext} from '@types'
import {isThisCommand} from '@utils'

let str = ''

for ( const key in commands ) {
    str += commands[key as keyof typeof commands].aliases.join('|') + '|'
}
str = str.substring(0, str.length - 1)
console.log(str)

const regExp = [
    new RegExp(`^?\\s*(${str})`)
]

export default class implements ICommand {
    hears = [
        (value: string, context: MContext ): boolean => {
            return isThisCommand(value, context, regExp)
        }
    ]

    handler = async ( context: MContext ): Promise<unknown> => {
        let command: keyof typeof commands | null = null

        for (const key of Object.keys(commands)) {
            if (commands[key as keyof typeof commands].aliases.find(x => x === context.$match[1])) {
                command = key as keyof typeof commands
                break
            }
        }

        if ( !command ) return

        return await context.send(`
            📖 ${commands[command].usage}
        `)

    }
}
