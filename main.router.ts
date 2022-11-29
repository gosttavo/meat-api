import * as restify from "restify";
import { Router } from "./common/router";

class MainRouter extends Router {

    applyRoutes(application: restify.Server) {
        application.get('/', (req, resp, next) => {
            resp.json({
                users: '/users',
                reviews: '/reviews',
                restaurants: '/restaurants',
                orders: '/orders'
            });
        });
    }
}

export const mainRouter = new MainRouter();