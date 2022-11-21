import 'jest';
import * as mongoose from 'mongoose';
import * as request from 'supertest';

let address: string = (<any>global).address;
const auth: string = (<any>global).auth;

//#region === TESTES GET ===

test('get - 200 /reviews', () => {
    return request(address)
        .get('/reviews')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(console.error);
});

test('get - 404 /reviews/aaaa - not found', () => {
    return request(address)
        .get('/reviews/aaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404);
        }).catch(console.error)
});

//#endregion === FIM TESTES GET ===

//#region === TESTES POST ===

test('post - 200 /reviews', () => {
    return request(address)
        .post('/reviews')
        .set('Authorization', auth)
        .send({
            date: '2022-11-18 00:00:00.000',
            rating: 5,
            comments: 'teste',
            user: new mongoose.Types.ObjectId(),
            restaurant: new mongoose.Types.ObjectId()
        })
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined;
            expect(response.body.rating).toBe(5);
            expect(response.body.comments).toBe('teste');
            expect(response.body.restaurant).toBeDefined;
            expect(response.body.user).toBeDefined;
        })
        .catch(console.error);
});

test('post - 400 / - data obrigatória', () => {
    return request(address)
        .post('/reviews')
        .set('Authorization', auth)
        .send({
            rating: 5,
            comments: 'teste',
            user: new mongoose.Types.ObjectId(),
            restaurant: new mongoose.Types.ObjectId()
        })
        .then(response => {
            expect(response.status).toBe(400);
        })
        .catch(console.error);
});

test('post - 400 / - rating obrigatório', () => {
    return request(address)
        .post('/reviews')
        .set('Authorization', auth)
        .send({
            date: '2022-11-18 00:00:00.000',
            comments: 'teste',
            user: new mongoose.Types.ObjectId(),
            restaurant: new mongoose.Types.ObjectId()
        })
        .then(response => {
            expect(response.status).toBe(400);
        })
        .catch(console.error);
});

//#endregion === FIM TESTES POST ===