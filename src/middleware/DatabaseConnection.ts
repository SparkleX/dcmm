import Koa, { Next } from "koa";
import { Context } from "../Context.js";
import { AppServer } from "../AppServer.js";

export async function dbConnection(ctx: Koa.Context, next: Next) {
    const dcmmContext: Context = {};
    dcmmContext.httpBody = ctx.request.body;
    try {
        const that = this as AppServer
        const dataSource = that.oPool;
        console.debug("get db conn...");
        dcmmContext.connection = await dataSource.getConnection();
        ctx["_context"] = dcmmContext;
        await next();
        console.debug("commit db conn...");
        //await context.conn.commit();
    } catch (e) {
        console.error(e);
        /* console.error(e);
         ctx.status = 500;
         ctx.body = {
             message: e.message,
             path: e.path
         };

         console.error(e);*/
    } finally {
        dcmmContext.connection.close();
    }
}