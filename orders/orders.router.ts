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

    doFindOrderByUserEmail = (req, resp, next) => {
        console.log('===Email===', req.params.id);
        Order.find({ email: req.params.id })
            .then(this.renderAll(resp, next))
            .catch(next);
    }

    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}/:id`, this.doFindOrderByUserEmail);

        application.post(`${this.basePath}`, 
            [authorize('admin', 'user'), 
            this.doSave]);

        // application.get(`${this.basePath}/:id`,
        //     [this.doValidateId,
        //     this.doFindOrderByUserEmail]);

        // application.get(`${this.basePath}/:id/items`,
        //     [this.doValidateId,
        //     this.doFindItems]);

        // application.put(`${this.basePath}/:id/items`,
        //     [authorize('admin'),
        //     this.doValidateId,
        //     this.doReplaceItems]);
    }

}

export const orderRouter = new OrdersRouter();