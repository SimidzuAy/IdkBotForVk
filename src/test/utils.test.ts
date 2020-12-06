import { aliasesToCommand, prettyNum } from '../utils'

it('String to aliases', () => {
    expect(aliasesToCommand(['бан', 'ban'])).toBe('(?:бан|ban)')
    expect(aliasesToCommand(['разбан', 'unban'])).toBe('(?:разбан|unban)')
})

it('Should return pretty num', () => {
    expect(prettyNum(1010)).toBe('1.01K')
    expect(prettyNum(1_000_110)).toBe('1M')
    expect(prettyNum(25)).toBe('25')
    expect(prettyNum(75000)).toBe('75K')
})
