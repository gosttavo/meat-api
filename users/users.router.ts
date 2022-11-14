import * as restify from "restify";
import { NotFoundError } from "restify-errors";
import { Router } from "../common/router";
import { User } from "./users.model";

class UserRouter extends Router {

    constructor() {
        super();
        this.on('beforeRender', document => {
            document.password = undefined;
        })
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {

        //rota de usuários
        application.get('/users', (req, resp, next) => {
            User.find()
                .then(this.render(resp, next))
                .catch(next);
        });

        //rota de usuários filtrados pelo id
        application.get('/users/:id', (req, resp, next) => {
            User.findById(req.params.id)
                .then(this.render(resp, next))
                .catch(next);
        });

        //rota para adicionar usuários
        application.post('/users', (req, resp, next) => {
            //criar documento
            let user = new User(req.body);
            user.save()
                .then(this.render(resp, next))
                .catch(next);
        });

        //rota para fazer update em usuários
        application.put('/users/:id', (req, resp, next) => {
            const options = {
                runValidators: true,
                overwrite: true //vai fazer com o update seja completo
            };
            //filtro, modificação, parametros customizados
            User.update({ _id: req.params.id }, req.body, options).exec()
                .then(result => {
                    //verificar se o update atingiu um documento
                    if (result.n) {
                        return User.findById(req.params.id).exec();
                    } else {
                        throw new NotFoundError('documento não encontrado');;
                    }
                })
                .then(this.render(resp, next))
                .catch(next);
        });

        //rota p update parcial de usuários
        application.patch('/users/:id', (req, resp, next) => {
            //constante para mandar o documento novo p/ ser modificado
            const options = { runValidators: true, new: true };

            User.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(resp, next))
                .catch(next);
        });

        //rota para deletar usuário
        application.del('/users/id', (req, resp, next) => {
            User.remove({ _id: req.params.id }).exec().then((cmdResult: any) => {
                if (cmdResult.result.n) {
                    resp.send(204);
                } else {
                    throw new NotFoundError('documento não encontrado');;
                }
                return next();
            }).catch(next);
        });
    }
}

export const userRouter = new UserRouter(); 