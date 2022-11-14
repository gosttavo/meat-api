"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
const model_router_1 = require("../common/model.router");
const restaurants_model_1 = require("./restaurants.model");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurants_model_1.Restaurant);
        this.doFindMenu = (req, resp, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id, "+menu")
                .then(rest => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurant not found');
                }
                else {
                    resp.json(rest.menu);
                    return next();
                }
            }).catch(next);
        };
        this.doReplaceMenu = (req, resp, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id)
                .then(rest => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurant not found');
                }
                else {
                    rest.menu = req.body; //ARRAY de MenuItem
                    return rest.save();
                }
            }).then(rest => {
                resp.json(rest.menu);
                return next();
            }).catch(next);
        };
    }
    //vai criar as rotas
    applyRoutes(application) {
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
exports.restaurantRouter = new RestaurantsRouter();
