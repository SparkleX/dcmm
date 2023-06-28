import Koa from "koa";
import koaLogger from "koa-logger";
import bodyParser from "koa-bodyparser";

export class AppServer {
    public constructor() {

    }
    public async start(port: number):Promise<void> {
           const app = new Koa();
           app.use(koaLogger());
           app.use(bodyParser());
           app.listen(port);
           console.info(`Server start on port ${port}`);
       }
}