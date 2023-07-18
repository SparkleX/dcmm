import { BaseModel } from "./BaseModel.js";
import { BaseRepo } from "./BaseRepo.js";
import { Context } from "./Context.js";

export class BaseService<MODEL> {
    oRepo: BaseRepo<MODEL>;
    public constructor(repo:BaseRepo<MODEL>) {
        this.oRepo = repo
    }
    public async get(ctx: Context):Promise<MODEL> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        const id: BaseModel = {
            NodeId: ctx.httpParams.id
        };
        const data = await this.oRepo.get(ctx, id);
        return data;
    }
    public async create(ctx: Context):Promise<string> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
        const key = await this.oRepo.create(ctx, ctx.httpBody)
        return (key as any).NodeId;
    }
    public async update(ctx: Context):Promise<void> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
        const id: BaseModel = {
            NodeId: ctx.httpParams.id
        };
        const data = ctx.httpBody;
        await this.oRepo.update(ctx, id, data);
    }
    public async delete(ctx: Context):Promise<void> {
        console.debug(`ID = ${ctx.httpParams.id}`)
        console.debug(ctx.httpBody);
        const id: BaseModel = {
            NodeId: ctx.httpParams.id
        };
        await this.oRepo.delete(ctx, id);
    }
}