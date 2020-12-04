import {hear, MContext} from '@types'

export default interface ICommand {
    hears:   hear[],
    handler: (context: MContext, next: Function) => {}
}
