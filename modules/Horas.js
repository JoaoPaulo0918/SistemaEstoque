const mongoose = require('mongoose');

const tempoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',  
        required: true
    },
    horaEntrada: {
       type: Date
    },
    horaPausa: {
        type: Date
    },
    horaRetorno: {
        type: Date
    },
    horaSaida: {
        type: Date
    },
    total: {
        type: Number
    },      
    horaExtra: { 
        type: Number
    },
    horaFalta: {
        type: Number
    },
    dataCriacao: { type: Date, default: Date.now }
}, { timestamps: true });


const Tempo = mongoose.model('Tempo', tempoSchema);
module.exports = Tempo;
