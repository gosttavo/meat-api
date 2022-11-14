"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model.router");
const reviews_model_1 = require("./reviews.model");
class ReviewsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(reviews_model_1.Review);
    }
    //método pra fazer o populate do findbyid
    doPrepareOne(query) {
        return query.populate('user', 'name') //popular o name do user e o user
            .populate('restaurant'); //popular restaurant;
    }
    //vai criar as rotas
    applyRoutes(application) {
        //rota de usuários
        application.get('/reviews', this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get('/reviews/:id', [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post('/reviews', this.doSave);
    }
}
exports.reviewRouter = new ReviewsRouter();
