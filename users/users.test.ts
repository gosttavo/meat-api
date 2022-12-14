import 'jest';
import * as request from 'supertest';

const address: string = (<any>global).address;
const auth: string = (<any>global).auth;

//#region === TESTES GET ===

test('get - 200 /users', () => {
    return request(address)
        .get('/users')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);
});

test('get - 404 /users/aaaa - not found', () => {
    return request(address)
        .get('/users/aaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404);
        }).catch(fail);
});

test('get - 200 /users/:id - find by email', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'user',
            email: 'user@gmail.com',
            password: '123'
        })
        .then(response => request(address)
            .get('/users')
            .set('Authorization', auth)
            .query({ email: 'user@gmail.com' }))
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array)
            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0].email).toBe('user@gmail.com');
        })
        .catch(fail);
});

test('get - 200 /users/:id - find by id', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'testeId',
            email: 'testeId@gmail.com',
            password: '123'
        })
        .then(response => request(address)
            .get(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.name).toBe('testeId');
                expect(response.body.email).toBe('testeId@gmail.com');
                expect(response.body.password).toBeUndefined;
            }))
        .catch(fail);
});

//#endregion === FIM TESTES GET ===

//#region === TESTES POST ===

test('post - 200 /users', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usu??rio1',
            email: "usuario1@gmail.com",
            password: "123",
            cpf: "396.951.250-69"
        })
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('usu??rio1');
            expect(response.body.email).toBe('usuario1@gmail.com');
            expect(response.body.cpf).toBe('396.951.250-69');
            expect(response.body.password).toBeUndefined;
        }).catch(fail);
});

test('post - 400 /users - nome obrigat??rio', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            email: 'testeobrigatorio@gmail.com',
            password: '12345',
            cpf: '396.951.250-69'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].message).toContain('name');
            expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
});

test('post - 400 /users - email obrigat??rio', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            nome: 'testemail',
            password: '12345',
            cpf: '396.951.250-69'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].message).toContain('email');
            expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
});

test('post - 400 /users - senha obrigat??ria', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usertest',
            email: 'testeobrigatorio@gmail.com',
            cpf: '396.951.250-69'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].message).toContain('password');
        })
        .catch(fail);
});

test('post - 400 /users - email duplicado', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usertest',
            email: 'testeobrigatorio@gmail.com',
            password: '123',
            cpf: '396.951.250-69'
        })
        .then(response => request(address)
            .post('/users')
            .set('Authorization', auth)
            .send({
                name: 'usertest',
                email: 'testeobrigatorio@gmail.com',
                password: '123',
                cpf: '396.951.250-69'
            }))
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(`E11000 duplicate key error`)
        })
        .catch(fail);
});

test('post - 400 /users - CPF inv??lido', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usertest',
            email: 'testeobrigatorio@gmail.com',
            password: '123',
            cpf: '000.111.222-33'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array)
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0].message).toContain('Invalid CPF')
        })
        .catch(fail);
});

test('post - 400 /users - email inv??lido', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usertest',
            email: 'testeobrigatoricom',
            password: '123',
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array)
            expect(response.body.errors[0].message).toContain('Path `email` is invalid')
        })
        .catch(fail);
});

test('post - 400 /users - nome inv??lido (menos de 3 caracteres)', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'us',
            email: 'testeobrigatorio@gmail.com',
            password: '12345',
            cpf: '396.951.250-69'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0].message).toContain('shorter than the minimum allowed')
        })
        .catch(fail);
});

test('post - 400 /users - nome inv??lido (mais de 80 caracteres)', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            email: 'testeobrigatorio@gmail.com',
            password: '12345',
            cpf: '396.951.250-69'
        })
        .then(response => {
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0].message).toContain('longer than the maximum allowed')
        })
        .catch(fail);
});

test('post - 200 /users/authenticate', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'teste',
            email: 'testeauth@gmail.com',
            password: '123',
            gender: 'Female'
        })
        .then(response => request(address)
            .post('/users/authenticate')
            .set('Authorization', auth)
            .send({
                email: 'testeauth@gmail.com',
                password: '123'
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body).toBeInstanceOf(Object);
                expect(response.body.email).toBe('testeauth@gmail.com');
                expect(response.body.name).toBe('teste');
                expect(response.body._id).toBeDefined;
            }))
        .catch(fail);
});

test('post - 403 /users/authenticate - invalid credentials', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'teste',
            email: 'testeauth@gmail.com',
            password: '123',
            gender: 'Female'
        })
        .then(response => request(address)
            .post('/users/authenticate')
            .set('Authorization', auth)
            .send({
                email: 'testeauth@gmail.com',
                password: '1233'
            })
            .then(response => {
                expect(response.status).toBe(403);
                expect(response.body.message).toContain('Invalid credentials');
            }))
        .catch(fail);
});

//#endregion === FIM TESTES POST ===

//#region === TESTES PATCH ===

test('patch - 200 /users/:id', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usuario2',
            email: 'usuario2@email.com',
            password: '123456'
        })
        .then(response => request(address)
            .patch(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'usuario2 - patch'
            }))
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('usuario2 - patch');
            expect(response.body.email).toBe('usuario2@email.com');
            expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
});

test('patch - 404 /users/aaaa - not found', () => {
    return request(address)
        .patch(`/users/aaaa`)
        .set('Authorization', auth)
        .send({
            name: 'usuario2 - patch'
        })
        .then(response => {
            expect(response.status).toBe(404);
        })
        .catch(fail);
});

test('patch - 404 /users/:id - gender not found', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usuario2',
            email: 'usuario2@email.com',
            password: '123456',
            gender: 'male'
        })
        .then(response => request(address)
            .patch(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                gender: 'non-binary'
            }))
        .then(response => {
            expect(response.status).toBe(404);
        })
        .catch(fail);
});

//#endregion === FIM TESTES PATCH ===

//#region === TESTES DELETE ===

test('del - 204 /users/:id', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usuario3',
            email: 'usuario3@gmail.com',
            password: '123'
        })
        .then(response => request(address)
            .del(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'usuario3'
            }))
        .then(response => {
            expect(response.status).toBe(204);
            expect(response.body.name).toBeUndefined();
            expect(response.body.email).toBeUndefined();
        })
        .catch(fail);
});

test('del - 404 /users/aaaa - not found', () => {
    return request(address)
        .delete('/users/aaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404);
        })
        .catch(fail);
});

//#endregion === FIM TESTES DELETE === 

//#region === TESTES PUT ===

test('put - 200 /users/:id - cpf indefinido', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'testeput',
            email: 'testeput@gmail.com',
            password: '14786',
            CPF: '959.322.110-75'
        })
        .then(response => request(address)
            .put(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'novotesteput',
                email: 'testeput@gmail.com',
                password: '14786'
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.name).toBe('novotesteput');
                expect(response.body.email).toBe('testeput@gmail.com');
                expect(response.body.password).toBeUndefined();
                expect(response.body.cpd).toBeUndefined();
            }))
        .catch(fail);
});

test('put - 404 /users/aaaa - not found', () => {
    return request(address)
        .put(`/users/aaaa`)
        .set('Authorization', auth)
        .send({
            name: 'novotesteput',
            email: 'testeput@gmail.com',
            password: '14786'
        })
        .then(response => {
            expect(response.status).toBe(404);
        })
        .catch(fail);
});

test('put - 404 /users/:id - nome indefinido', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'testeput',
            email: 'testeput@gmail.com',
            password: '14786',
        })
        .then(response => request(address)
            .put(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                email: 'testeput@gmail.com',
            })
            .then(response => {
                expect(response.status).toBe(404);
                expect(response.body.name).toBeUndefined;
            }))
        .catch(fail);
});

//#endregion === FIM TESTE PUT ===