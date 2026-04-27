const express = require('express');
const multer = require('multer');
const path = require('path');
const routes = express.Router();

const authMiddleware = require('../middlewares/auth');
const AuthController = require('../controllers/AuthController');
const ClienteController = require('../controllers/ClienteController');
const VeiculoController = require('../controllers/VeiculoController');
const OSController = require('../controllers/OSController');
const FinanceiroController = require('../controllers/FinanceiroController');
const ServicoPecaController = require('../controllers/ServicoPecaController');
const FotoController = require('../controllers/FotoController');

// Configuração Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Rotas Públicas
routes.post('/auth/login', AuthController.login);

// Rotas Protegidas
routes.use(authMiddleware);

// Clientes
routes.get('/clientes', ClienteController.index);
routes.get('/clientes/:id', ClienteController.show);
routes.post('/clientes', ClienteController.store);
routes.put('/clientes/:id', ClienteController.update);
routes.delete('/clientes/:id', ClienteController.delete);

// Veículos
routes.get('/veiculos', VeiculoController.index);
routes.post('/veiculos', VeiculoController.store);
routes.put('/veiculos/:id', VeiculoController.update);
routes.delete('/veiculos/:id', VeiculoController.delete);

// OS
routes.get('/os', OSController.index);
routes.get('/os/:id', OSController.show);
routes.post('/os', OSController.store);
routes.put('/os/:id', OSController.update);
routes.get('/os/:id/pdf', OSController.generatePDF);

// Serviços e Peças
routes.post('/servicos', ServicoPecaController.storeServico);
routes.delete('/servicos/:id', ServicoPecaController.deleteServico);
routes.post('/pecas', ServicoPecaController.storePeca);
routes.delete('/pecas/:id', ServicoPecaController.deletePeca);

// Financeiro
routes.get('/financeiro', FinanceiroController.index);
routes.post('/financeiro', FinanceiroController.store);
routes.get('/financeiro/summary', FinanceiroController.summary);
routes.get('/financeiro/report', FinanceiroController.generateReport);

// Fotos
routes.post('/upload', upload.single('foto'), FotoController.store);
routes.get('/os/:os_id/fotos', FotoController.index);
routes.delete('/fotos/:id', FotoController.delete);

module.exports = routes;
