"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model.router");
const auth_handler_1 = require("../security/auth.handler");
const authz_handler_1 = require("../security/authz.handler");
const users_model_1 = require("./users.model");
class UserRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        //método p/ filtrar query por email
        this.doFindByEmail = (req, resp, next) => {
            if (req.query.email) {
                users_model_1.User.doFindByEmail(req.query.email)
                    .then(user => {
                    if (user) {
                        return [user];
                    }
                    else {
                        return [];
                    }
                })
                    .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.ul
                })).catch(next);
            }
            else {
                next();
            }
        };
        this.on('beforeRender', document => {
            document.password = undefined;
        });
    }
    //vai criar as rotas
    applyRoutes(application) {
        //rota de usuários -> versão 2.0.0
        application.get(`${this.basePath}`, [authz_handler_1.authorize('admin'),
            this.doFindByEmail,
            this.doFindAll]);
        //rota de usuários -> versão 1.0.0
        //application.get({ path: `${this.basePath}`, version: '1.0.0' }, this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'),
            this.doValidateId,
            this.doFindById]);
        //rota para adicionar usuários
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'),
            this.doSave]);
        //rota para fazer update em usuários
        application.put(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'),
            this.doValidateId,
            this.doReplace]);
        //rota p update parcial de usuários
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'),
            this.doValidateId,
            this.doUpdate]);
        //rota para deletar usuário
        application.del(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'),
            this.doValidateId,
            this.doDelete]);
        //rota p autenticar usuário
        application.post(`${this.basePath}/authenticate`, auth_handler_1.authenticate);
    }
}
exports.userRouter = new UserRouter();
