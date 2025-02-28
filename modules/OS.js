const mongoose = require("mongoose");

const OrdemServicoSchema = new mongoose.Schema({
    diaSemana: { type: String, required: true },
    qtd: { type: Number, required: true, min: 1 },
    observacao: { type: String, default: "" },
    dataCriacao: { type: Date, default: Date.now },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "usuarios", required: true } // Relacionamento com o usuário
});

const OrdemServico = mongoose.model("OrdemServico", OrdemServicoSchema);
module.exports = OrdemServico;
