"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
//receber perfis, retornar request handler
exports.authorize = (...profiles) => {
    return (req, resp, next) => {
        //se a requisição estiver autenticada e a autenticação reconhecer o profile
        //ele segue o fluxo
        //se não, estoura erro 403 
        if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
            req.log
                .debug('User %s. authorized with %j profiles on route %s. Required profiles: %j.', req.authenticated._id, req.authenticated.profiles, req.path(), profiles);
            next();
        }
        else {
            if (req.authenticated) {
                req.log
                    .debug('Permission Denied for %s. Required profiles: %j. User profiles: %j.', req.authenticated._id, profiles, req.authenticated.profiles);
            }
            next(new restify_errors_1.ForbiddenError('Permission Denied'));
        }
    };
};
