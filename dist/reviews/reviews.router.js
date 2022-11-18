"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model.router");
const reviews_model_1 = require("./reviews.model");
const authz_handler_1 = require("../security/authz.handler");
class ReviewsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(reviews_model_1.Review);
    }
    //método pra fazer o populate do findbyid
    doPrepareOne(query) {
        return query.populate('user', 'name') //popular o name do user e o user
            .populate('restaurant'); //popular restaurant;
    }
    doEnvelope(document) {
        let resource = super.doEnvelope(document);
        const restaurantId = document.restaurant._id ? document.restaurant._id : document.restaurant;
        resource._links.restaurant = `restaurant/${restaurantId}`;
        return resource;
    }
    //vai criar as rotas
    applyRoutes(application) {
        //rota de usuários
        application.get(`${this.basePath}`, this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get(`${this.basePath}/:id`, [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post(`${this.basePath}`, [authz_handler_1.authorize('user'),
            this.doSave]);
    }
}
exports.reviewRouter = new ReviewsRouter();
