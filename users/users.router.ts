import * as restify from "restify";
import { ModelRouter } from "../common/model.router";
import { authenticate } from "../security/auth.handler";
import { authorize } from "../security/authz.handler";
import { User } from "./users.model";

class UserRouter extends ModelRouter<User> {

    constructor() {
        super(User);
        this.on('beforeRender', document => {
            document.password = undefined;
        })
    }

    //método p/ filtrar query por email
    doFindByEmail = (req, resp, next) => {
        if (req.query.email) {
            User.doFindByEmail(req.query.email)
                .then(user => {
                    if (user) {
                        return [user];
                    } else {
                        return [];
                    }
                })
                .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.ul
                })).catch(next);
        } else {
            next();
        }
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {
        //rota de usuários -> versão 2.0.0
        application.get(`${this.basePath}`,
            [authorize('admin'),
            this.doFindByEmail,
            this.doFindAll]);

        //rota de usuários -> versão 1.0.0
        //application.get({ path: `${this.basePath}`, version: '1.0.0' }, this.doFindAll);

        //rota de usuários filtrados pelo id]
        application.get(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doFindById]);

        //rota para adicionar usuários
        application.post(`${this.basePath}`,
            [authorize('admin'),
            this.doSave]);

        //rota para fazer update em usuários
        application.put(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doReplace]);

        //rota p update parcial de usuários
        application.patch(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doUpdate]);

        //rota para deletar usuário
        application.del(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doDelete]);

        //rota p autenticar usuário
        application.post(`${this.basePath}/authenticate`, authenticate);
    }
}

export const userRouter = new UserRouter(); 