const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    nome: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    telefone: { type: String, required: true },
    funcao: { type: String, required: true },
    veiculo: { type: String, required: true }
});

// **Registrando o modelo corretamente**
const Usuario = mongoose.model("usuarios", UsuarioSchema);
module.exports = Usuario;
