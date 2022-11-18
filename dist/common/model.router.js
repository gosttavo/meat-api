"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 4;
        //validar object id
        this.doValidateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found'));
            }
            else {
                next();
            }
        };
        //vai encontrar todos os modelos
        this.doFindAll = (req, resp, next) => {
            //vai receber a página da req, por padrão é 1
            let page = parseInt(req.query._page || 1);
            //se a página for menor ou igual a 0 será 1
            page = page > 0 ? page : 1;
            //constante pra auxiliar na hora de skipar a página
            const skip = (page - 1) * this.pageSize;
            //vai contar as páginas
            this.model.count({}).exec().then(count => this.model
                .find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(resp, next, {
                page, count, pageSize: this.pageSize, url: req.url
            }))).catch(next);
        };
        //filtrar models pelo id
        this.doFindById = (req, resp, next) => {
            this.doPrepareOne(this.model.findById(req.params.id))
                .then(this.render(resp, next))
                .catch(next);
        };
        //salvar models
        this.doSave = (req, resp, next) => {
            //criar documento
            let document = new this.model(req.body);
            document.save()
                .then(this.render(resp, next))
                .catch(next);
        };
        //substituir models
        this.doReplace = (req, resp, next) => {
            const options = {
                runValidators: true,
                overwrite: true //vai fazer com o update seja completo
            };
            //filtro, modificação, parametros customizados
            this.model.update({ _id: req.params.id }, req.body, options).exec()
                .then(result => {
                //verificar se o update atingiu um documento
                if (result.n) {
                    return this.model.findById(req.params.id).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError('documento não encontrado');
                    ;
                }
            })
                .then(this.render(resp, next))
                .catch(next);
        };
        //atualizar models
        this.doUpdate = (req, resp, next) => {
            //constante para mandar o documento novo p/ ser modificado
            const options = { runValidators: true, new: true };
            this.model.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(resp, next))
                .catch(next);
        };
        //deletar models
        this.doDelete = (req, resp, next) => {
            this.model.remove({ _id: req.params.id }).exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    resp.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('documento não encontrado');
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    doPrepareOne(query) {
        return query;
    }
    //vai envelopar as informações de collection e id p/ criar um hiperlink
    //com o id do recurso em especifico
    doEnvelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    //vai envelopar as informaçõs de contagem de páginas
    doEnvelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: `${options.url}`,
            },
            items: documents
        };
        //se todos os parametros forem passados com sucesso faz validações
        if (options.page && options.count && options.pageSize) {
            //só vai mostrar a previous page em páginas maiores que 1
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            //constante que vai contar quantos itens faltam para terminar a listagem
            const remaining = options.count - (options.page * options.pageSize);
            //se for mais que 0, mostrará a nova página
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
            }
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
