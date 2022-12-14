import * as restify from 'restify';

export const handleError = (req: restify.Request, resp: restify.Response, err, done) => {

    ///vai gerar o corpo do objeto
    err.toJSON = () => {
        return {
            message: err.message
        }
    }

    //status code -> tratar erros especificos
    switch (err.name) {
        case 'MongoError':
            if (err.code === 11000) {
                err.statusCode = 400;
            }
            break;
        case 'ValidationError':
            err.statusCode = 400;

            //criar array de mensagens
            const messages: any[] = [];

            //adicionar mensagens de erro no array
            for (let name in err.errors) {
                messages.push({ message: err.errors[name].message })
            }

            //retornar lista de erros
            err.toJSON = () => ({
                message: 'Validation error while processing your request',
                errors: messages
            });

            break;
    }

    done();
}