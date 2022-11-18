"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const users_model_1 = require("../users/users.model");
const environment_1 = require("../common/environment");
exports.tokenParser = (req, resp, next) => {
    const token = doExtractToken(req);
    if (token) {
        jwt.verify(token, environment_1.environment.security.apiSecret, doApplyBearer(req, next));
    }
    else {
        next();
    }
};
function doExtractToken(req) {
    let token = undefined;
    //Authorization: Bearer TOKEN
    const authorization = req.header('authorization');
    if (authorization) {
        const parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    return token;
}
//vai receber o request p/ associar o usuário
//vai retornar uma função que terá a assinada da callback esperada
//no método verify
function doApplyBearer(req, next) {
    return (error, decoded) => {
        if (decoded) {
            users_model_1.User.doFindByEmail(decoded.sub).then(user => {
                if (user) {
                    //associar o usuário no request
                    req.authenticated = user;
                }
                next();
            }).catch(next);
        }
        else {
            next();
        }
    };
}
