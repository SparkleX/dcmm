export class BaseService<MODEL> {
    public async get(id: string):Promise<MODEL> {
        return "data" as any;
    }
    public async create(data: MODEL):Promise<string> {
        return "UUID";
    }
    public async update(id:string, data: MODEL):Promise<void> {

    }
    public async delete(id: string):Promise<void> {

    }
}