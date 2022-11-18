import * as restify from 'restify';
import { ForbiddenError } from 'restify-errors';

//receber perfis, retornar request handler
export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
    return (req, resp, next) => {
        //se a requisição estiver autenticada e a autenticação reconhecer o profile
        //ele segue o fluxo
        //se não, estoura erro 403 
        if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
            next();
        } else {
            next(new ForbiddenError('Permission Denied'));
        }
    }
}
