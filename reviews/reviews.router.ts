import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { ModelRouter } from '../common/model.router';
import { Review } from './reviews.model';

class ReviewsRouter extends ModelRouter<Review>{
    constructor() {
        super(Review);
    }

    //método pra fazer o populate do findbyid
    protected doPrepareOne(
            query: mongoose.DocumentQuery<Review, Review>
        ): mongoose.DocumentQuery<Review, Review> {
        return query.populate('user', 'name') //popular o name do user e o user
            .populate('restaurant') //popular restaurant;
    }

    //vai criar as rotas
    applyRoutes(application: restify.Server) {
        //rota de usuários
        application.get('/reviews', this.doFindAll);
        //rota de usuários filtrados pelo id]
        application.get('/reviews/:id', [this.doValidateId, this.doFindById]);
        //rota para adicionar usuários
        application.post('/reviews', this.doSave);
    }
}

export const reviewRouter = new ReviewsRouter(); 