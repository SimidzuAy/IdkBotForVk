import {MContext} from '@types'

export default interface ICommand {
    PATH: string,
    hears: any[],
    handler:(context: MContext, next: Function) => {}
}
