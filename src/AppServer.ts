import Koa from "koa";
import koaLogger from "koa-logger";
import bodyParser from "koa-bodyparser";
import { BaseService } from "./BaseService.js";
import KoaRouter, { RouterContext } from "koa-router";
import { glob } from "glob";
import jsonfile from "jsonfile";
import { RestApis, MethodBinding } from "dcmm-schema";
import { Context } from "./Context.js"
import { init } from "metal-dao";
import { DataSource } from "db-conn"
import { MySqlDataSource, MySqlDriver } from "db-conn-mysql";
import { dbConnection } from "./middleware/DatabaseConnection.js"
import dotenv from "dotenv";


function daoCallback (query: string, params:any[], target: object, propertyKey: string, context?: string){
    console.debug("daoCallback");
    const ctx = params[0] as Context;
    const promise = ctx.connection.executeQuery(query,[]);
    return promise;
}

export class AppServer {
    services: { [n: string]: BaseService<any> } = {};
    oKoa: Koa<Koa.DefaultState, Koa.DefaultContext>;
    oPool: DataSource;
    
    public constructor() {
        dotenv.config();
    }
    private async initDatabase():Promise<void> {
		const oConfig = JSON.parse(process.env.DB_CONFIG);
		this.oPool = new MySqlDataSource(oConfig);
		const oConn = await this.oPool.getConnection();
		await oConn.close();
    }
    private initControllers() {
        const files = this.scanControllers();

        const oRouters = new KoaRouter();

        for (const file of files) {
            console.info(file);
            const oRestApis = jsonfile.readFileSync(file) as RestApis;
            const serviceName = oRestApis.serviceName;
            const service = this.services[serviceName];
            if (!service) {
                throw `Service "${serviceName}" is not exists`;
            }

            for (let method in oRestApis.methods) {
                const methodBinding = oRestApis.methods[method] as MethodBinding;
                for (const path in methodBinding) {
                    const functionName = methodBinding[path];
                    const targetFunc = service[functionName];

                    if (!targetFunc) {
                        throw `function "${functionName}" is not exists on service "${serviceName}"`;
                    }
                    console.info(`[add router] ${method} ${path}`)
                    oRouters[method](path, async (ctx: RouterContext) => {
                        const dcmmContext = ctx["_context"] as Context;
                        dcmmContext.httpParams = ctx.params;
                        ctx.body = await service[functionName](dcmmContext);
                    });
                }
            }
        }
        this.oKoa.use(oRouters.routes());
    }
    private scanControllers(): string[] {
        const files = glob.sync(`resources/rest/*.rest.json`);
        return files;
    }
    public async start(port: number): Promise<void> {
        this.oKoa = new Koa();
        this.oKoa.use(koaLogger());
        this.oKoa.use(bodyParser());
        this.oKoa.use(dbConnection.bind(this));
        init(daoCallback);
        this.initControllers();
        await this.initDatabase();
        this.oKoa.listen(port);
        console.info(`Server start on port ${port}`);
    }
    public addService(name: string, service: BaseService<any>) {
        this.services[name] = service;
    }
}

