import * as restify from 'restify';
import * as mongoose from 'mongoose';

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

    doCalculateAverageRestaurantRating = async (req, resp, next) => {
        console.log(req.params.body.restaurant);

        let restId = req.params.body.restaurant;

        const hasFind = await Review.aggregate([
            { $match: { restaurant: new mongoose.Types.ObjectId(restId)} },
            { $group: { _id: "$restaurant", average: { $avg: "$rating" } } }
        ])

        console.log('média', hasFind)
    }
//
    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}`,
            this.doFindAll);

        // application.get(`${this.basePath}/:id`, 
        //     [this.doValidateId, 
        //     this.doFindById]);

        application.get(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doFindReviewByRestaurantId]);

            application.get(`${this.basePath}/:id/rating`,
            [this.doValidateId,
            this.doCalculateAverageRestaurantRating]);

        application.post(`${this.basePath}`,
            [authorize('admin', 'user'),
            this.doCalculateAverageRestaurantRating,
            this.doSave]);

        application.del(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doDelete]);
    }
}

export const reviewRouter = new ReviewsRouter(); 