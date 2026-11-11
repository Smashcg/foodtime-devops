const express = require('express');
const client = require('prom-client');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');

const app = express();
const register = new client.Registry();
const hostname = os.hostname();
const port = process.env.PORT || 3000;

// Configurar métricas padrão (CPU, Heap, Event Loop)
client.collectDefaultMetrics({ register });

// Métrica personalizada: contador de requisições HTTP
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP recebidas no FoodTime',
    labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Métrica personalizada: duração das requisições HTTP
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Configuração de View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para contagem e tempo de requisições
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
        end({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            code: res.statusCode
        });
    });
    next();
});

// Endpoint de métricas para Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Rotas da API
app.use('/', require('./controller/controller'));

// Rotas Estáticas / Visões Web
app.get('/index', (req, res) => {
    res.render('pages/index', { hostname: hostname, title: 'Home - FoodTime DevOps' });
});

app.get('/about', (req, res) => {
    res.render('pages/about', { title: 'About - FoodTime DevOps' });
});

// Inicia servidor apenas se executado diretamente
if (require.main === module) {
    app.listen(port, () => {
        console.log(`FoodTime DevOps Application running on port ${port}`);
        console.log(`Metrics available at http://localhost:${port}/metrics`);
    });
}

module.exports = app;

