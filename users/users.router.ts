import * as restify from "restify";
import { ModelRouter } from "../common/model.router";
import { User } from "./users.model";

class UserRouter extends ModelRouter<User> {

    constructor() {
        super(User);
        this.on('beforeRender', document => {
            document.password = undefined;
        })
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {

        //rota de usuários
        application.get('/users', this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get('/users/:id', [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post('/users', this.doSave);
        //rota para fazer update em usuários
        application.put('/users/:id', [this.doValidateId, this.doReplace]);
        //rota p update parcial de usuários
        application.patch('/users/:id', [this.doValidateId, this.doUpdate]);
        //rota para deletar usuário
        application.del('/users/:id', [this.doValidateId, this.doDelete]);
    }
}

export const userRouter = new UserRouter(); 