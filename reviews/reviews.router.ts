import * as restify from 'restify';
import * as mongoose from 'mongoose';

import { ModelRouter } from '../common/model.router';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.handler';
import { Restaurant } from '../restaurants/restaurants.model';

class ReviewsRouter extends ModelRouter<Review>{

    constructor() {
        super(Review);
    }

    doFindReviewByRestaurantId = (req, resp, next) => {
        Review.find({ restaurant: req.params.id })
            .then(this.renderAll(resp, next))
            .catch(next);
    }

    doSaveReview = (req, resp, next) => {
        let restId = req.body.restaurant;

        this.doSave(req, resp, next);

        this.doCalculateAverageRestaurantRating(restId);
    }

    doCalculateAverageRestaurantRating = async (restId) => {
        console.log('===Restaurant ID===', restId);

        const hasFind = await Review.aggregate([
            { $match: { restaurant: new mongoose.Types.ObjectId(restId)} },
            { $group: { _id: "$restaurant", average: { $avg: "$rating" } } }
        ]);

        console.log('===média===', hasFind)
        this.doUpdateRestaurantRatingByAverage(restId, hasFind);
    }

    doUpdateRestaurantRatingByAverage = async (restId, hasFind) => {
        console.log('===hasFind===', hasFind[0]);
        let average = hasFind[0].average;

        await Restaurant.updateOne(
            { _id: restId }, { $set: { rating: average }}
        ).exec();
    }

    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}`,
            this.doFindAll);

        application.get(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doFindReviewByRestaurantId]);

        application.post(`${this.basePath}`,
            [authorize('admin', 'user'),
            this.doSaveReview]);

        application.del(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doDelete]);
    }
}

export const reviewRouter = new ReviewsRouter(); 