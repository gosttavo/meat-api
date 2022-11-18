import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/users.model';
import { environment } from '../common/environment';

export const tokenParser: restify.RequestHandler = (req, resp, next) => {
    const token = doExtractToken(req);

    if (token) {
        jwt.verify(token, environment.security.apiSecret, doApplyBearer(req, next));
    } else {
        next();
    }
}

function doExtractToken(req: restify.Request) {
    let token = undefined;

    //Authorization: Bearer TOKEN
    const authorization = req.header('authorization');

    if (authorization) {
        const parts: string[] = authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    return token;
}

//vai receber o request p/ associar o usuário
//vai retornar uma função que terá a assinada da callback esperada
//no método verify
function doApplyBearer(req: restify.Request, next): (error, decoded) => void {
    return (error, decoded) => {
        if (decoded) {
            User.doFindByEmail(decoded.sub).then(user => {
                if (user) {
                    //associar o usuário no request
                    req.authenticated = user;
                }
                next();
            }).catch(next);
        } else {
            next();
        }
    }
}