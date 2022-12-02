import { Router } from "./router";
import * as mongoose from 'mongoose';
import { NotFoundError } from "restify-errors";

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

    basePath: string;

    pageSize: number = 30;

    actualPage: number;

    constructor(protected model: mongoose.Model<D>) {
        super();
        this.basePath = `/${model.collection.name}`;
    }

    protected doPrepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
        return query;
    }

    //vai envelopar as informações de collection e id p/ criar um hiperlink
    //com o id do recurso em especifico
    doEnvelope(document: any): any {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }

    //vai envelopar as informaçõs de contagem de páginas
    doEnvelopeAll(documents: any[], options: any = {}): any {
        const resource: any = {
            _links: {
                self: `${options.url}`,
            },
            items: documents
        }

        //se todos os parametros forem passados com sucesso faz validações
        if (options.page && options.count && options.pageSize) {
            //só vai mostrar a previous page em páginas maiores que 1
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            //constante que vai contar quantos itens faltam para terminar a listagem
            const remaining = options.count - (options.page * options.pageSize)
            //se for mais que 0, mostrará a nova página
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
            }
        }

        return resource;
    }

    //validar object id
    doValidateId = (req, resp, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            next(new NotFoundError('Document not found'));
        } else {
            next();
        }
    }

    doPagination = (actualPage) => {
        //vai receber a página da req, por padrão é 1
        //se a página for menor ou igual a 0 será 1
        let page = parseInt(actualPage || 1);
        page = page > 0 ? page : 1;

        return page;
    }

    //auxiliar pra skipar a página
    createSkip(page) {
        const skip = (page - 1) * this.pageSize;

        return skip;
    }


    //vai encontrar todos os modelos
    doFindAll = (req, resp, next) => {
        console.log('=== findAll query ===', req.query);

        this.actualPage = req.query._page;

        let page = this.doPagination(this.actualPage);
        let skip = this.createSkip(page);

        //const {q, _page} = req.query;
        let search = req.query.q !== undefined ? {$text: { $search: req.query.q } }  :  undefined ;

        //vai contar as páginas
        this.model.count({}).exec().then(count => this.model
            .find(search)
            .skip(skip)
            .limit(this.pageSize)
            .then(this.renderAll(resp, next, {
                page, count, pageSize: this.pageSize, url: req.url
            }))).catch(next);

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
                throw new NotFoundError('documento não encontrado');
            }
            return next();
        }).catch(next);
    }
}