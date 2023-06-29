import { Connection } from "db-conn";

export class Context {
    httpBody?: any; //ctx.request.body
    httpParams?: any; //ctx.params
    connection?: Connection;
}