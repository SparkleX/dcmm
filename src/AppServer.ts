import Koa from "koa";
import koaLogger from "koa-logger";
import bodyParser from "koa-bodyparser";
import { BaseService } from "./BaseService.js";
import KoaRouter, { RouterContext } from "koa-router";
import { glob } from "glob";
import jsonfile from "jsonfile";
import { RestApis, MethodBinding } from "dcmm-schema";

export class AppServer {
    services: { [n: string]: BaseService<any> } = {};
    oKoa: Koa<Koa.DefaultState, Koa.DefaultContext>;

    public constructor() {
        this.oKoa = new Koa();
        this.oKoa.use(koaLogger());
        this.oKoa.use(bodyParser());
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
                    oRouters[method](path, async (ctx: RouterContext) => {
                        ctx.body = await service[functionName](ctx.request.body);
                    });
                }
            }
        }
        this.oKoa.use(oRouters.routes());
    }
    private scanControllers(): string[] {
        const files = glob.sync(`resources/rest/*.rest.json`);
        //console.info(files);
        return files;
    }
    public async start(port: number): Promise<void> {
        this.initControllers();
        this.oKoa.listen(port);
        console.info(`Server start on port ${port}`);
    }
    public addService(name: string, service: BaseService<any>) {
        this.services[name] = service;
    }
}

