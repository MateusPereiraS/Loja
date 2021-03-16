const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 1
    },
    senha: {
        type: String,
        
    },
    cpf: {
        type: String
    },
    celular: {
        type: String
    },
    cep: {
        type: String
    },
    cidade: {
        type: String
    },
    uf: {
        type: String
    },
    endereco: {
        type: String
    },
    bairro: {
        type: String
    },
    numero: {
        type: String
    },
},
{ timestamps: true})

mongoose.model("usuarios", Usuario)