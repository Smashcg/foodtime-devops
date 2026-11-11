const request = require('supertest');
const app = require('../server');
const os = require('os');

describe('FoodTime DevOps - Suíte de Testes Automatizados da API', () => {

    describe('Endpoints de Saúde e Status', () => {
        test('GET / deve responder com status 200 e payload saudável', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('healthy!');
            expect(res.body.service).toBe('FoodTime DevOps API');
        });

        test('GET /health deve retornar status operacional UP e tempo de atividade', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('UP');
            expect(typeof res.body.uptime).toBe('number');
        });
    });

    describe('Endpoints de Rotas de Teste', () => {
        test('GET /teste deve responder com sucesso e mensagem de teste', async () => {
            const res = await request(app).get('/teste');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('isso é um teste!');
        });

        test('GET /teste1 deve responder com sucesso', async () => {
            const res = await request(app).get('/teste1');
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBe('isso é um teste 1!');
        });

        test('GET /teste2 deve responder com sucesso', async () => {
            const res = await request(app).get('/teste2');
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBe('isso é um teste 2!');
        });

        test('GET /teste3 deve responder com sucesso', async () => {
            const res = await request(app).get('/teste3');
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBe('isso é um teste 3!');
        });

        test('GET /rota-inexistente deve responder com código 404', async () => {
            const res = await request(app).get('/rota-inexistente');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('Endpoints de Negócio e Pedidos', () => {
        test('GET /api/orders deve retornar lista de pedidos do FoodTime', async () => {
            const res = await request(app).get('/api/orders');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.orders)).toBe(true);
            expect(res.body.orders.length).toBeGreaterThan(0);
            expect(res.body.orders[0]).toHaveProperty('item');
            expect(res.body.orders[0]).toHaveProperty('customer');
        });
    });

    describe('Visões Web Renderizadas (EJS)', () => {
        test('GET /index deve renderizar a página inicial contendo o hostname da máquina', async () => {
            const res = await request(app).get('/index');
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/html');
            expect(res.text).toContain(os.hostname());
            expect(res.text).toContain('Bem-vindo ao FoodTime!');
        });

        test('GET /about deve renderizar a página sobre o projeto com sucesso', async () => {
            const res = await request(app).get('/about');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Sobre a Arquitetura do FoodTime');
            expect(res.text).toContain('Endpoints da API');
        });
    });

    describe('Observabilidade e Métricas Prometheus', () => {
        test('GET /metrics deve expor métricas no formato padrão do Prometheus', async () => {
            // Dispara uma requisição prévia para incrementar contadores
            await request(app).get('/');

            const res = await request(app).get('/metrics');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('http_requests_total');
            expect(res.text).toContain('process_cpu_user_seconds_total');
        });
    });

});

