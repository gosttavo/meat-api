"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./common/router");
class MainRouter extends router_1.Router {
    applyRoutes(application) {
        application.get('/', (req, resp, next) => {
            resp.json({
                users: '/users',
                reviews: '/reviews',
                restaurants: '/restaurants'
            });
        });
    }
}
exports.mainRouter = new MainRouter();
