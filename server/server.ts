import * as restify from 'restify';
import { environment } from '../common/environment';
import { Router } from '../common/router';

import * as fs from 'fs';

import * as mongoose from 'mongoose';
import { mergePatchBodyParser } from './merge-path.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';
import corsMiddleware = require('restify-cors-middleware');

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

    //método para inicar as rotas/servidor
    doInitRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                //#region === OPÇÕES DO SERVIDOR ===   

                const options: restify.ServerOptions = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger
                }

                if (environment.security.enableHttps) {
                    options.certificate = fs.readFileSync(environment.security.certificate),
                        options.key = fs.readFileSync(environment.security.key)
                } //habilitar certificado https

                this.application = restify.createServer(options); //criar sv

                //#endregion === FIM OPÇÕES SERVIDOR ===

                //#region === CONFIG.CORS -> habilitar front-end ===

                const corsOptions: corsMiddleware.Options = { //habilitar CORS
                    preflightMaxAge: 10, //
                    origins: ['http://localhost:4200'], //habilitar origens das requisições
                    allowHeaders: ['authorization'], //headers permitidos
                    exposeHeaders: ['x-custom-header'] //
                }

                //vai guardar a resposta da função com o cors
                const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions);

                //método pre() => chamado smp que chegar req novo
                this.application.pre(cors.preflight);
                //método use() => requisições normais
                this.application.use(cors.actual);

                //#endregion === FIM CORS ===

                //#region === LOGGER ===

                this.application.pre(restify.plugins.requestLogger({
                    log: logger
                }));

                //#endregion === FIM LOGGER ===

                //#region === PLUGINS ===
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);
                this.application.use(tokenParser);
                //#endregion

                //#region === ROTAS ===
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }

                this.application.listen(environment.server.port, () => {
                    //passar notificação para interessados
                    resolve(this.application);
                });
                //#endregion

                //#region === TRATAMENTO ERROS ===

                this.application.on('restifyError', handleError);

                //#endregion === FIM ERROS
            }
            catch (error) {
                reject(error);
            }
        });
    }

    //start-up do servidor => iniciar as rotas se o db estiver respondendo
    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.doInitDatabase().then(() => this.doInitRoutes(routers)
                                    .then(() => this));
    }

    shutdown() {
        return mongoose.disconnect().then(() => this.application.close());
    }
}