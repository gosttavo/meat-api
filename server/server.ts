import * as restify from 'restify';
import { environment } from '../common/environment';
import { Router } from '../common/router';

import * as fs from 'fs';

import * as mongoose from 'mongoose';
import { mergePatchBodyParser } from './merge-path.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';

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
                const options: restify.ServerOptions = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger
                }

                if(environment.security.enableHttps){
                    options.certificate = fs.readFileSync(environment.security.certificate),
                    options.key = fs.readFileSync(environment.security.key)
                }

                //criar servidor
                this.application = restify.createServer(options);

                this.application.pre(restify.plugins.requestLogger({
                    log: logger
                }));

                //método p receber os params das urls das queries
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);
                this.application.use(tokenParser);

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
                //log
                // this.application.on('after', restify.plugins.auditLogger({
                //     log: logger,
                //     event: 'after'
                // }));
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

    shutdown(){
        return mongoose.disconnect().then(() => this.application.close());
    }
}