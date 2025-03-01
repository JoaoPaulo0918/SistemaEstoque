const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    marca: { type: String, required: true },
    observacao: { type: String },
    qtd: { type: Number, required: true },
    salvarEstoque: { type: Boolean, default: false },
    dataCriacao: { type: Date, default: Date.now },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "usuarios", required: true } 
    // Relacionamento com o usuário
});

const Material = mongoose.model('Material', MaterialSchema);

module.exports = Material;
