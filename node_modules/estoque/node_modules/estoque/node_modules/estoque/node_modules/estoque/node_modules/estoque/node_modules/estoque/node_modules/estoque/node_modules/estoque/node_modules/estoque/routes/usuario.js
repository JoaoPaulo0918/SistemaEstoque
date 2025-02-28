
const express = require('express');
const router = express.Router();

// Exemplo de rota
router.get('/', (req, res) => {
    res.send("Página de usuários");
});

module.exports = router;  // Certifique-se de exportar o router corretamente
