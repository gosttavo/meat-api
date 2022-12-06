import * as restify from 'restify';
import { ModelRouter } from '../common/model.router';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.handler';

class ReviewsRouter extends ModelRouter<Review>{

    constructor() {
        super(Review);
    }

    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}`, 
            this.doFindAll);

        application.get(`${this.basePath}/:id`, 
            [this.doValidateId, 
            this.doFindById]);

        application.post(`${this.basePath}`, 
            [authorize('admin', 'user'), 
            this.doSave]); 

        application.del(`${this.basePath}/:id`, 
            [this.doValidateId, 
            this.doDelete]);
    }
}

export const reviewRouter = new ReviewsRouter(); 