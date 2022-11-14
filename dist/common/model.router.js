"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
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
            this.model.find()
                .then(this.renderAll(resp, next))
                .catch(next);
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
                    ;
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    doPrepareOne(query) {
        return query;
    }
    //vai envelopar as informções de collection e id p/ criar um hiperlink
    //com o id do recurso em especifico
    doEnvelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
