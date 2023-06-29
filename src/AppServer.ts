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
import { GenericPool, GenericPoolConfig } from "db-conn-pool";
import { MySqlDriver } from "db-conn-mysql";
import { dbConnection } from "./middleware/DatabaseConnection.js"

function daoCallback (query: string, params:any[], target: object, propertyKey: string, context?: string){
    console.debug("daoCallback")
    return "data"
}

export class AppServer {
    services: { [n: string]: BaseService<any> } = {};
    oKoa: Koa<Koa.DefaultState, Koa.DefaultContext>;
    oPool: GenericPool;
    
    public constructor() {

    }
    private async initDatabase():Promise<void> {
		const poolConfig: GenericPoolConfig = {
			min: 2,
			max: 5,
			testOnBorrow: false,
		};
		const oConfig = {
            host: 'localhost',
            user: 'root',
            database: 'db1',
            password:'12345678'
		};
        const oDriver = new MySqlDriver();

		this.oPool = new GenericPool(oDriver, oConfig, poolConfig);
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

