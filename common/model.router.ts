import { Router } from "./router";
import * as mongoose from 'mongoose';
import { NotFoundError } from "restify-errors";

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

    constructor(protected model: mongoose.Model<D>) {
        super();
    }

    protected doPrepareOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
        return query;
    }

    //validar object id
    doValidateId = (req, resp, next) => {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            next(new NotFoundError('Document not found'));
        } else {
            next();
        }
    }
    //vai encontrar todos os modelos
    doFindAll = (req, resp, next) => {
        this.model.find()
            .then(this.renderAll(resp, next))
            .catch(next);
    }
    //filtrar models pelo id
    doFindById = (req, resp, next) => {
        this.doPrepareOne(this.model.findById(req.params.id))
            .then(this.render(resp, next))
            .catch(next);
    }
    //salvar models
    doSave = (req, resp, next) => {
        //criar documento
        let document = new this.model(req.body);
        document.save()
            .then(this.render(resp, next))
            .catch(next);
    }
    //substituir models
    doReplace = (req, resp, next) => {
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
                } else {
                    throw new NotFoundError('documento não encontrado');;
                }
            })
            .then(this.render(resp, next))
            .catch(next);
    }
    //atualizar models
    doUpdate = (req, resp, next) => {
        //constante para mandar o documento novo p/ ser modificado
        const options = { runValidators: true, new: true };

        this.model.findByIdAndUpdate(req.params.id, req.body, options)
            .then(this.render(resp, next))
            .catch(next);
    }
    //deletar models
    doDelete = (req, resp, next) => {
        this.model.remove({ _id: req.params.id }).exec().then((cmdResult: any) => {
            if (cmdResult.result.n) {
                resp.send(204);
            } else {
                throw new NotFoundError('documento não encontrado');;
            }
            return next();
        }).catch(next);
    }
}