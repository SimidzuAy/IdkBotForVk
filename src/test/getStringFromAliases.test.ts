import { aliasesToCommand } from '../utils'
import { commands } from '../types'

it('String to aliases', () => {
    expect(aliasesToCommand(commands.ban.aliases)).toBe('(?:бан|ban)')
})
