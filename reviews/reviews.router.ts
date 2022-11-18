import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { ModelRouter } from '../common/model.router';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.handler';

class ReviewsRouter extends ModelRouter<Review>{
    constructor() {
        super(Review);
    }

    //método pra fazer o populate do findbyid
    protected doPrepareOne(query: mongoose.DocumentQuery<Review, Review>): 
    mongoose.DocumentQuery<Review, Review> {
        return query.populate('user', 'name') //popular o name do user e o user
                    .populate('restaurant') //popular restaurant;
    }

    doEnvelope(document) {
        let resource = super.doEnvelope(document);
        const restaurantId = document.restaurant._id ?document.restaurant._id : document.restaurant;
        resource._links.restaurant = `restaurant/${restaurantId}`;
        return resource;
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {
        //rota de usuários
        application.get(`${this.basePath}`, this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get(`${this.basePath}/:id`, [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post(`${this.basePath}`, 
            [authorize('user'), 
            this.doSave]);
    }
}

export const reviewRouter = new ReviewsRouter(); 