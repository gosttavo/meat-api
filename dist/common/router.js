"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Router extends events_1.EventEmitter {
    //método pra envelopar informação e criar hipermedia
    doEnvelope(document) {
        return document;
    }
    //renderizar um documento sozinho
    render(response, next) {
        return (document) => {
            if (document) {
                this.emit('beforeRender', document);
                response.json(this.doEnvelope(document));
            }
            else {
                response.send(404);
            }
            return next();
        };
    }
    //renderizar um array de documentos
    renderAll(response, next) {
        return (documents) => {
            if (documents) {
                documents.forEach((document, index, array) => {
                    this.emit('beforeRender', document);
                    array[index] = this.doEnvelope(document);
                });
                response.json(documents);
            }
            else {
                response.json([]);
            }
            return next();
        };
    }
}
exports.Router = Router;
