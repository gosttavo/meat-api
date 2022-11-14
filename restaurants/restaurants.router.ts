import * as restify from "restify";
import { NotFoundError } from "restify-errors";
import { ModelRouter } from "../common/model.router";
import { Restaurant } from "./restaurants.model";

class RestaurantsRouter extends ModelRouter<Restaurant> {

    constructor() {
        super(Restaurant);
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
        application.get('/restaurants', this.doFindAll);
        //rota de restaurants filtrados pelo id]
        application.get('/restaurants/:id', [this.doValidateId, this.doFindById]);
        //rota para adicionar restaurants
        application.post('/restaurants', this.doSave);
        //rota para fazer update em restaurants
        application.put('/restaurants/:id', [this.doValidateId, this.doReplace]);
        //rota p update parcial de restaurants
        application.patch('/restaurants/:id', [this.doValidateId, this.doUpdate]);
        //rota para deletar restaurants
        application.del('/restaurants/:id', [this.doValidateId, this.doDelete]);

        //rota de restaurants
        application.get('/restaurants/:id/menu', [this.doValidateId, this.doFindMenu]);
        //rota alteração itens do menu
        application.put('/restaurants/:id/menu', [this.doValidateId, this.doReplaceMenu]);
    }
}

export const restaurantRouter = new RestaurantsRouter(); 