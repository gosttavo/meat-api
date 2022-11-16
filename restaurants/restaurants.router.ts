import * as restify from "restify";
import { NotFoundError } from "restify-errors";
import { ModelRouter } from "../common/model.router";
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

    //vai criar as rotas
    applyRoutes(application: restify.Server) {

        //rota de restaurants
        application.get(`${this.basePath}`, this.doFindAll);
        //rota de restaurants filtrados pelo id]
        application.get(`${this.basePath}/:id`, [this.doValidateId, this.doFindById]);
        //rota para adicionar restaurants
        application.post(`${this.basePath}`, this.doSave);
        //rota para fazer update em restaurants
        application.put(`${this.basePath}/:id`, [this.doValidateId, this.doReplace]);
        //rota p update parcial de restaurants
        application.patch(`${this.basePath}/:id`, [this.doValidateId, this.doUpdate]);
        //rota para deletar restaurants
        application.del(`${this.basePath}/:id`, [this.doValidateId, this.doDelete]);

        //rota de restaurants
        application.get(`${this.basePath}/:id/menu`, [this.doValidateId, this.doFindMenu]);
        //rota alteração itens do menu
        application.put(`${this.basePath}/:id/menu`, [this.doValidateId, this.doReplaceMenu]);
    }
}

export const restaurantRouter = new RestaurantsRouter(); 