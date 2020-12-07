import ICommand from '@command'
import {commands, MContext} from '@types'
import {isThisCommand} from '@utils'
import Chat from '@class/Chat'

let str = ''

for ( const key in commands ) {
    str += commands[key as keyof typeof commands].aliases.join('|') + '|'
}
str = str.substring(0, str.length - 1)

const regExp = [
    new RegExp(`^\\?\\s*(${str})`)
]

export default class implements ICommand {
    hears = [
        (value: string, context: MContext ): boolean => {
            return isThisCommand(value, context, regExp)
        }
    ]

    handler = async ( context: MContext ): Promise<unknown> => {
        let commandKey: keyof typeof commands | null = null

        for (const key of Object.keys(commands)) {
            if (commands[key as keyof typeof commands].aliases.find(x => new RegExp(x).test(context.$match[1]))) {
                commandKey = key as keyof typeof commands
                break
            }
        }

        if ( !commandKey ) return

        const thisCommand = commands[commandKey]

        let required = ''
        let notRequired = ''

        thisCommand.params.required.forEach(param => {
            required += `[${param}] `
        })

        thisCommand.params.notRequired.forEach(param => {
            notRequired += `{${param}} `
        })

        const cmd = Chat.getCommand(context.chat, commandKey)
        const role = Chat.getRoleByPermission(context.chat, cmd.permission)!

        return await context.send(`
            📖 Синонимы команды: ${thisCommand.aliases.join(', ')}
            🤔 Использование команды: ${context.chat.settings.prefix.symbol}${context.$match[1]} ${required}${notRequired}
            ⚡ Необходимая роль: ${role.name} (${role.permission})
            
            ❓ ${thisCommand.description}
        `.replace(/ {12}/g, ''))

    }
}
