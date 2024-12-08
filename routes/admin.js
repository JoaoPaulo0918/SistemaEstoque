const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const { eAdmin } = require('../helpers/eAdmin');


// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // pasta onde as imagens serão armazenadas
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Define o nome do arquivo como data atual + nome original
  }
});

const upload = multer({ storage: storage }); // Cria uma instância do multer com a configuração de armazenamento


router.get('/', (req, res) => {
    res.render('index')
});

router.get('/inicio', (req, res) => {
  res.render('admin/home')
})


module.exports = router;