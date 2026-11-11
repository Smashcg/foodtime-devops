const express = require('express');
const router = express.Router();

// Endpoint de verificação de integridade (Health Check)
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: 'healthy!',
        service: 'FoodTime DevOps API',
        timestamp: new Date().toISOString()
    });
});

// Endpoint adicional de health check explícito
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// Endpoints de teste e demonstração
router.get('/teste', (req, res) => {
    res.status(200).json({ success: true, data: 'isso é um teste!' });
});

router.get('/teste1', (req, res) => {
    res.status(200).json({ success: true, data: 'isso é um teste 1!' });
});

router.get('/teste2', (req, res) => {
    res.status(200).json({ success: true, data: 'isso é um teste 2!' });
});

router.get('/teste3', (req, res) => {
    res.status(200).json({ success: true, data: 'isso é um teste 3!' });
});

// Endpoint com dados simulados de pedidos do FoodTime
router.get('/api/orders', (req, res) => {
    res.status(200).json({
        success: true,
        orders: [
            { id: 101, item: 'Hamburguer Artesanal', customer: 'Patrick', status: 'preparando' },
            { id: 102, item: 'Pizza Margherita', customer: 'Lucas', status: 'em entrega' },
            { id: 103, item: 'Salada Ceasar', customer: 'Mariana', status: 'entregue' }
        ]
    });
});

module.exports = router;

