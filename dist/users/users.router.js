"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model.router");
const users_model_1 = require("./users.model");
class UserRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        this.on('beforeRender', document => {
            document.password = undefined;
        });
    }
    //vai criar as rotas
    applyRoutes(application) {
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
exports.userRouter = new UserRouter();
