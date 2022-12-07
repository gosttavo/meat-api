import * as restify from 'restify';

import { ModelRouter } from '../common/model.router';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.handler';

class ReviewsRouter extends ModelRouter<Review>{

    constructor() {
        super(Review);
    }

    doFindReviewByRestaurantId = (req, resp, next) => {
        Review.find({ restaurant: req.params.id })
            .then(this.renderAll(resp, next))
            .catch(next);
    }

    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}`, 
            this.doFindAll);

        // application.get(`${this.basePath}/:id`, 
        //     [this.doValidateId, 
        //     this.doFindById]);

        application.get(`${this.basePath}/:id`, 
            [this.doValidateId, 
            this.doFindReviewByRestaurantId]);

        application.post(`${this.basePath}`, 
            [authorize('admin', 'user'), 
            this.doSave]); 

        application.del(`${this.basePath}/:id`, 
            [this.doValidateId, 
            this.doDelete]);
    }
}

export const reviewRouter = new ReviewsRouter(); 