import * as restify from "restify";
import { NotFoundError } from "restify-errors";
import { ModelRouter } from "../common/model.router";
import { authorize } from "../security/authz.handler";
import { Restaurant } from "./restaurants.model";

class RestaurantsRouter extends ModelRouter<Restaurant> {

    constructor() {
        super(Restaurant);
    }

    doEnvelope(document) {
        let resource = super.doEnvelope(document);
        resource._links.menu = `${this.basePath}/${resource._id}/menu`;
        return resource;
    }

    doFindMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id, "+menu")
            .then(rest => {
                if (!rest) {
                    throw new NotFoundError('Restaurant not found');
                } else {
                    resp.json(rest.menu);
                    return next();
                }
            }).catch(next);
    }

    doReplaceMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id)
            .then(rest => {
                if (!rest) {
                    throw new NotFoundError('Restaurant not found');
                } else {
                    rest.menu = req.body; //ARRAY de MenuItem
                    return rest.save();
                }
            }).then(rest => {
                resp.json(rest.menu);
                return next();
            }).catch(next);
    }

    doFindAllRestaurants = (req, resp, next) => {
        console.log('=== doFindAllRestaurants ===', req.query);

        if (req.query.q === undefined || req.query.q === 'undefined') {
            this.doFindByFilter(req, resp, next);
        } else {
            let search = { $text: { $search: req.query.q } };

            this.doFindByFilter(req, resp, next, search);
        }
    }

    doFindByFilter = (req, resp, next, search?) => {
        console.log("===doFindByFilter===", search)

        this.actualPage = req.query._page;

        let page = this.doPagination(this.actualPage);
        let skip = this.createSkip(page);

        this.model.count({}).exec().then(count => this.model
            .find(search)
            .skip(skip)
            .limit(this.pageSize)
            .then(this.renderAll(resp, next, {
                page, count, pageSize: this.pageSize, url: req.url
            }))).catch(next);
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {

        //rota de restaurants
        application.get(`${this.basePath}`, [this.doFindAllRestaurants]);

        //rota de restaurants filtrados pelo id]
        application.get(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doFindById]);

        //rota para adicionar restaurants
        application.post(`${this.basePath}`,
            [authorize('admin'),
            this.doSave]);

        //rota para fazer update em restaurants
        application.put(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doReplace]);

        //rota p update parcial de restaurants
        application.patch(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doUpdate]);

        //rota para deletar restaurants
        application.del(`${this.basePath}/:id`,
            [authorize('admin'),
            this.doValidateId,
            this.doDelete]);

        //rota de restaurants
        application.get(`${this.basePath}/:id/menu`,
            [this.doValidateId,
            this.doFindMenu]);

        //rota alteração itens do menu
        application.put(`${this.basePath}/:id/menu`,
            [authorize('admin'),
            this.doValidateId,
            this.doReplaceMenu]);
    }
}

export const restaurantRouter = new RestaurantsRouter(); 