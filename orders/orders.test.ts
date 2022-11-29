import 'jest';
import * as request from 'supertest';

let address: string = (<any>global).address;
const auth: string = (<any>global).auth;

test('post - 200 Orders', () => {
    return request(address)
        .post('/orders')
        .set('Authorization', auth)
        .send({
            name: "gustavogoulart",
            email: "gustavogoulart92@gmail.com",
            address: "teste",
            number: 12,
            optionalAddress: "12",
            paymentOption: "MON",
            totalOrder: 15.9,
            orderItems: [
              {
                quantity: 1,
                menuId: "bread",
                valueItem: 15.9,
                name: "Pão Artesanal Italiano"
              }
            ]
        })            
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('gustavogoulart');
            expect(response.body.email).toBe('gustavogoulart92@gmail.com');
            expect(response.body._id).toBeDefined();
        }).catch(fail);
});