import 'jest';
import * as request from 'supertest';

let address: string = (<any>global).address;
const auth: string = (<any>global).auth;

//#region === TESTES GET ===

test('get - 200 /restaurants', () => {
    return request(address)
        .get('/restaurants')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(console.error);
});

test('get - 404 /restaurants/aaaa - not found', () => {
    return request(address)
        .get('/restaurants/aaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404);
        }).catch(console.error);
});

test('get - 200 /restaurants/:id - find by id', () => {
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth)
        .send({
            name: 'Teste Burger',
        })
        .then(response => request(address)
            .get(`/restaurants/${response.body._id}`)
            .set('Authorization', auth)
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.name).toBe('Teste Burger');
            }))
        .catch(console.error);
});

//#endregion === FIM TESTES GET ===

//#region === TESTES POST ===

test('post - 200 /restaurants', () => {
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth)
        .send({
            name: 'Teste Burger',
            menu: [{ name: "Coke", price: 5 }]
        })
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined
            expect(response.body.name).toBe('Teste Burger');
            expect(response.body.menu).toBeInstanceOf(Array)
            expect(response.body.menu).toHaveLength(1)
            expect(response.body.menu[0]).toMatchObject({ name: "Coke", price: 5 })
        })
        .catch(console.error);
});

test('post - 200 /restaurants - menu undefined', () => {
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth)
        .send({
            name: 'Teste Burger',
        })
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Teste Burger');
            expect(response.body.menu).toBeUndefined;
        })
        .catch(console.error);
});

//#endregion === FIM TESTES POST ===