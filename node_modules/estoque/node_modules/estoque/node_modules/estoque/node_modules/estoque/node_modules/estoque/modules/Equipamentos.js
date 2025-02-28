const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    marca: { type: String, required: true },
    mac: { type: String, required: true },
    observacao: { type: String },
    qtd: { type: Number, required: true },
    salvarEstoque: { type: Boolean, default: false },
    dataCriacao: { type: Date, default: Date.now },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "usuarios", required: true } // Relacionamento com o usuário
});

const Produto = mongoose.model('Produto', ProdutoSchema);

module.exports = Produto;
