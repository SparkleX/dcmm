import { Context } from "./Context.js";
import { DbAccess } from "sql-access";

export class BaseRepo<MODEL> {

	public tableName: string;
	constructor(tableName: string) {
		this.tableName = tableName;
	}
	public async get(ctx: Context, key: object): Promise<MODEL> {
		const rt = await ctx.dbAccess.select(ctx.connection, this.tableName, key as object);
		return rt[0] as any;
	}
	public async create(ctx: Context, data: MODEL): Promise<object> {
		await ctx.dbAccess.insert(ctx.connection, this.tableName, data as object);
		return data as any;
	}
	public async update(ctx: Context, key: object, data: MODEL): Promise<void> {
		await ctx.dbAccess.update(ctx.connection, this.tableName, key as object, data as object);
	}
	public async delete(ctx: Context, key: object): Promise<void> {
		await ctx.dbAccess.delete(ctx.connection, this.tableName, key as object);
	}
}