import { Context } from "./Context.js";

export class BaseService<MODEL> {
    public async get(ctx: Context):Promise<MODEL> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
        return "data" as any;
    }
    public async create(ctx: Context):Promise<string> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
        return "UUID";
    }
    public async update(ctx: Context):Promise<void> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
    }
    public async delete(ctx: Context):Promise<void> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
    }
}