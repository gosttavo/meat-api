import * as restify from 'restify';
import { EventEmitter } from 'events';

export abstract class Router extends EventEmitter {
    //vai receber instancia do sv
    abstract applyRoutes(application: restify.Server);

    //método pra envelopar informação e criar hipermedia
    doEnvelope(document: any): any {
        return document;
    }

    doEnvelopeAll(documents: any[], options: any = {}): any {
        return documents;
    }

    //renderizar um documento sozinho
    render(response: restify.Response, next: restify.Next) {
        return (document) => {
            if (document) {
                this.emit('beforeRender', document);
                response.json(this.doEnvelope(document));
            } else {
                response.send(404);
            }
            return next();
        }
    }

    //renderizar um array de documentos
    renderAll(response: restify.Response, next: restify.Next, options: any = {}) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach((document, index, array) => {
                    this.emit('beforeRender', document);
                    array[index] = this.doEnvelope(document);
                })
                response.json(this.doEnvelopeAll(documents, options));
            } else {
                response.json(this.doEnvelopeAll([]));
            }
            return next();
        }
    }
}