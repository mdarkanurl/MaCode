import { CustomError } from "../utils/errors/app-error";

export class CrudRepo {
    private model: any;

    constructor(model: any) {
        this.model = model;
    }

    async create(data: Object) {
        return await this.model.create({
            ...data
        });
    }

    async destroy(id: string) {
        try {
            return await this.model.delete(
                {
            where: { id },
        });
        } catch (error) {
            throw new CustomError("Failed to delete records", 500);
        }
    }

    async get(id: string) {
        try {
            return await this.model.findUnique({
            where: { id },
        });
        } catch (error) {
            throw new CustomError("Failed to get record", 500);
        }
    }

    async getAll() {
        try {
            return await this.model.findMany();
        } catch (error) {
            throw new CustomError("Failed to get data from Database. Please try again", 500);
        }
    }

    async getById(id: string) {
       try {
         return await this.model.findUnique({
            where: { id },
        });
       } catch (error) {
            throw new CustomError("Failed to get record", 500);
       }
    }

    async getByEmail(email: string) {
        try {
            const users = await this.model.findUnique({
            where: { email },
        });
        
        return users;
        } catch (error) {
            throw new CustomError("Failed to get record", 500);
        }
    }

    async update(id: string, data: any) {
        try {
            console.log('Data is, ', id, data);
            const x = await this.model.update({
                where: { id },
                data: { ...data },
            });
            console.log(x);
            return x;
        } catch (error) {
            throw new CustomError("Failed to update record", 500);
        }
    }
}