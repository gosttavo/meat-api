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
        resource._links.menu = `${this.basePath}/${resource._id}/items`;
        return resource;
    }

    doFindItems = (req, resp, next) => {
        Order.findById(req.params.id,"+items")
        .then(ord => {
            if (!ord) {
                throw new NotFoundError('Restaurant not found');
            } else {
                resp.json(ord.orderItems);
                return next();
            }
        }).catch(next);
    }

    doReplaceItems = (req, resp, next) => {
        Order.findById(req.params.id)
            .then(ord => {
                if (!ord) {
                    throw new NotFoundError('Restaurant not found');
                } else {
                    ord.orderItems = req.body; //ARRAY de MenuItem
                    return ord.save();
                }
            }).then(ord => {
                resp.json(ord.orderItems);
                return next();
            }).catch(next);
    }

    applyRoutes(application: restify.Server) {

        application.get(`${this.basePath}`, this.doFindAll);

        application.post(`${this.basePath}`, 
            [authorize('admin', 'user'), 
            this.doSave]);

        application.get(`${this.basePath}/:id`,
            [this.doValidateId,
            this.doFindById]);

        application.get(`${this.basePath}/:id/items`,
            [this.doValidateId,
            this.doFindItems]);

        application.put(`${this.basePath}/:id/items`,
            [authorize('admin'),
            this.doValidateId,
            this.doReplaceItems]);
    }

}

export const orderRouter = new OrdersRouter();