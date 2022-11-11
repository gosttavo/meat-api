"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const environment_1 = require("../common/environment");
const mongoose = require("mongoose");
const merge_path_parser_1 = require("./merge-path.parser");
const error_handler_1 = require("./error.handler");
class Server {
    //método pra iniciar o mongo db
    doInitDatabase() {
        mongoose.Promise = global.Promise;
        return mongoose.connect(environment_1.environment.db.url, {
            useMongoClient: true
        });
    }
    doInitRoutes(routers) {
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
                this.application.use(merge_path_parser_1.mergePatchBodyParser);
                //rotas
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }
                //ouvir rota
                this.application.listen(environment_1.environment.server.port, () => {
                    //passar notificação para interessados
                    resolve(this.application);
                });
                //tratamento de erros
                this.application.on('restifyError', error_handler_1.handleError);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    //método para fazer start-up do servidor
    //vai iniciar as rotas se o db estiver respondendo
    bootstrap(routers = []) {
        return this.doInitDatabase()
            .then(() => this.doInitRoutes(routers).then(() => this));
    }
}
exports.Server = Server;
