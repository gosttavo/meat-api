import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import { NotAuthorizedError } from 'restify-errors';
import { User } from '../users/users.model';
import { environment } from '../common/environment';

export const authenticate: restify.RequestHandler = (req, resp, next) => {
    //vai esperar vir do body da resposta = email e password
    const { email, password } = req.body;

    //+password vai usar o projection p/ encontrar a senha no banco
    User.doFindByEmail(email, '+password').then(user => {

        //se usuário e senha existirem
        if (user && user.matches(password)) {
            //gerar token
            const token = jwt.sign({
                sub: user.email,
                iss: 'meat-api'
            },
            environment.security.apiSecret);

            //resposta + token acesso
            resp.json({
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                accessToken: token
            });

            return next(false);
        } else {
            return next(new NotAuthorizedError('Invalid credentials'));
        }
    }).catch(next);
}