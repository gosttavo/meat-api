import * as restify from 'restify';
import { environment } from '../common/environment';
import { Router } from '../common/router';

import * as mongoose from 'mongoose';
import { mergePatchBodyParser } from './merge-path.parser';
import { handleError } from './error.handler';

export class Server {

    //propriedade server
    application: restify.Server;

    //método pra iniciar o mongo db
    doInitDatabase(): mongoose.MongooseThenable {
        (<any>mongoose).Promise = global.Promise;
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    doInitRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                //criar servidor
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                });

                //método p receber os params das urls das queries
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);

                //rotas
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }

                //ouvir rota
                this.application.listen(environment.server.port, () => {
                    //passar notificação para interessados
                    resolve(this.application);
                });

                //tratamento de erros
                this.application.on('restifyError', handleError);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    //método para fazer start-up do servidor
    //vai iniciar as rotas se o db estiver respondendo
    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.doInitDatabase()
            .then(() => this.doInitRoutes(routers).then(() => this));
    }
}