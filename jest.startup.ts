import * as jestCli from 'jest-cli';

import { Server } from './server/server';
import { environment } from './common/environment';
import { userRouter } from './users/users.router';
import { User } from './users/users.model';
import { reviewRouter } from './reviews/reviews.router';
import { Review } from './reviews/reviews.model';
import { Restaurant } from './restaurants/restaurants.model';
import { restaurantRouter } from './restaurants/restaurants.router';

let server: Server

const beforeAllTests = () => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db';
    environment.server.port = process.env.SERVER_PORT || 3001;
    server = new Server();
    return server.bootstrap([userRouter, reviewRouter, restaurantRouter])
    .then(() => User.remove({}).exec())
    .then(() => Review.remove({}).exec())
    .then(() => Restaurant.remove({}).exec())
}

const afterAllTests = () => {
    return server.shutdown();
}

//startup
beforeAllTests()
.then(() => jestCli.run())
.then(() => afterAllTests())
.catch(error => {
    console.error(error);
    process.exit(1);
});