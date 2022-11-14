import * as restify from "restify";
import { ModelRouter } from "../common/model.router";
import { Restaurant } from "./restaurants.model";

class RestaurantsRouter extends ModelRouter<Restaurant> {
    
    constructor() {
        super(Restaurant);
        this.on('beforeRender', document => {
            document.password = undefined;
        })
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {

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

export const restaurantRouter = new RestaurantsRouter(); 