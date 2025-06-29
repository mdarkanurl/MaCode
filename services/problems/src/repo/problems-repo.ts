import { prisma } from "../prisma"
import { CrudRepo } from "./crud-repo"

class ProblemRepo extends CrudRepo {
    constructor() {
        super(prisma.problem)
    }
}