"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
const router_1 = require("../common/router");
const users_model_1 = require("./users.model");
class UserRouter extends router_1.Router {
    constructor() {
        super();
        this.on('beforeRender', document => {
            document.password = undefined;
        });
    }
    //vai criar as rotas
    applyRoutes(application) {
        //rota de usuários
        application.get('/users', (req, resp, next) => {
            users_model_1.User.find()
                .then(this.render(resp, next))
                .catch(next);
        });
        //rota de usuários filtrados pelo id
        application.get('/users/:id', (req, resp, next) => {
            users_model_1.User.findById(req.params.id)
                .then(this.render(resp, next))
                .catch(next);
        });
        //rota para adicionar usuários
        application.post('/users', (req, resp, next) => {
            //criar documento
            let user = new users_model_1.User(req.body);
            user.save()
                .then(this.render(resp, next))
                .catch(next);
        });
        //rota para fazer update em usuários
        application.put('/users/:id', (req, resp, next) => {
            const options = {
                overwrite: true //vai fazer com o update seja completo
            };
            //filtro, modificação, parametros customizados
            users_model_1.User.update({ _id: req.params.id }, req.body, options).exec()
                .then(result => {
                //verificar se o update atingiu um documento
                if (result.n) {
                    return users_model_1.User.findById(req.params.id).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError('documento não encontrado');
                    ;
                }
            })
                .then(this.render(resp, next))
                .catch(next);
        });
        //rota p update parcial de usuários
        application.patch('/users/:id', (req, resp, next) => {
            //constante para mandar o documento novo p/ ser modificado
            const options = { new: true };
            users_model_1.User.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(resp, next))
                .catch(next);
        });
        //rota para deletar usuário
        application.del('/users/id', (req, resp, next) => {
            users_model_1.User.remove({ _id: req.params.id }).exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    resp.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('documento não encontrado');
                    ;
                }
                return next();
            }).catch(next);
        });
    }
}
exports.userRouter = new UserRouter();
