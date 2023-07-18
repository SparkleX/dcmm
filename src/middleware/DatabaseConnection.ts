import Koa, { Next } from "koa";
import { Context } from "../Context.js";
import { AppServer } from "../AppServer.js";
import { DbAccess } from "sql-access";
const dbAccess = new DbAccess();
dbAccess.quoteChar = "";

export async function dbConnection(ctx: Koa.Context, next: Next) {
    const dcmmContext: Context = {};
    dcmmContext.dbAccess = dbAccess;
    dcmmContext.httpBody = ctx.request.body;
    try {
        const that = this as AppServer
        const dataSource = that.oPool;
        console.debug("get db conn...");
        dcmmContext.connection = await dataSource.getConnection();
        ctx["_context"] = dcmmContext;
        
        await next();
        console.debug("commit db conn...");
        await dcmmContext.connection.commit();
    } catch (e) {
        console.error(e);
        await dcmmContext.connection.rollback();
    } finally {
        dcmmContext.connection.close();
    }
}