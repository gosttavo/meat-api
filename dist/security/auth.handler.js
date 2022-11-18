"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const restify_errors_1 = require("restify-errors");
const users_model_1 = require("../users/users.model");
const environment_1 = require("../common/environment");
exports.authenticate = (req, resp, next) => {
    //vai esperar vir do body da resposta = email e password
    const { email, password } = req.body;
    //+password vai usar o projection p/ encontrar a senha no banco
    users_model_1.User.doFindByEmail(email, '+password').then(user => {
        //se usuário e senha existirem
        if (user && user.matches(password)) {
            //gerar token
            const token = jwt.sign({ sub: user.email,
                iss: 'meat-api' }, environment_1.environment.security.apiSecret);
            //resposta + token acesso
            resp.json({ name: user.name,
                email: user.email,
                accessToken: token });
            return next(false);
        }
        else {
            return next(new restify_errors_1.NotAuthorizedError('Invalid credentials'));
        }
    }).catch(next);
};
