import * as restify from "restify";
import { NotFoundError } from "restify-errors";
import { ModelRouter } from "../common/model.router";
import { authorize } from "../security/authz.handler";
import { Order } from "./orders.model";

class OrdersRouter extends ModelRouter<Order> {

    constructor() {
        super(Order);
    }

    doEnvelope(document) {
        let resource = super.doEnvelope(document);
        resource._links.items = `${this.basePath}/${resource._id}`;
        return resource;
    }

    doFindOrderByUserId = (req, resp, next) => {
        console.log('===User Id===', req.params.id);
        Order.find({ user: req.params.id })
            .then(this.renderAll(resp, next))
            .catch(next);
    }

    applyRoutes(application: restify.Server) {

        application.post(`${this.basePath}`, 
            [authorize('admin', 'user'), 
            this.doSave]);

        application.get(`${this.basePath}`,
            [authorize('admin'),
            this.doFindAll]);

        application.get(`${this.basePath}/:id`,
            [authorize('admin', 'user'),
            this.doValidateId,
            this.doFindById]);

        application.get(`${this.basePath}/historic/:id`, 
            [this.doValidateId,
            this.doFindOrderByUserId]);

        application.patch(`${this.basePath}/:id`,
            [authorize('admin', 'user'), 
            this.doValidateId,
            this.doUpdate]);

        // application.put(`${this.basePath}/:id/items`,
        //     [authorize('admin'),
        //     this.doValidateId,
        //     this.doReplaceItems]);
    }

}

export const orderRouter = new OrdersRouter();