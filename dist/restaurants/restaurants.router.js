"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model.router");
const restaurants_model_1 = require("./restaurants.model");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurants_model_1.Restaurant);
        this.on('beforeRender', document => {
            document.password = undefined;
        });
    }
    //vai criar as rotas
    applyRoutes(application) {
        //rota de usuários
        application.get('/restaurants', this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get('/restaurants/:id', [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post('/restaurants', this.doSave);
        //rota para fazer update em usuários
        application.put('/restaurants/:id', [this.doValidateId, this.doReplace]);
        //rota p update parcial de usuários
        application.patch('/restaurants/:id', [this.doValidateId, this.doUpdate]);
        //rota para deletar usuário
        application.del('/restaurants/:id', [this.doValidateId, this.doDelete]);
    }
}
exports.restaurantRouter = new RestaurantsRouter();
