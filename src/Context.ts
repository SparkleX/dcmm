import { Connection } from "db-conn";
import { DbAccess } from "sql-access";

export class Context {
    httpBody?: any; //ctx.request.body
    httpParams?: any; //ctx.params
    connection?: Connection;
    dbAccess?: DbAccess;
}