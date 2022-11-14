import * as restify from 'restify';
import { EventEmitter } from 'events';

export abstract class Router extends EventEmitter {
    //vai receber instancia do sv
    abstract applyRoutes(application: restify.Server);

    //renderizar um documento sozinho
    render(response: restify.Response, next: restify.Next) {
        return (document) => {
            if (document) {
                this.emit('beforeRender', document);
                response.json(document);
            } else {
                response.send(404);
            }
            return next();
        }
    }

    //renderizar um array de documentos
    renderAll(response: restify.Response, next: restify.Next) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach(document => {
                    this.emit('beforeRender', document);
                }) 
                response.json(documents);
            } else {
                response.json([]);
            }
        }
    }
}