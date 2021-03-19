const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
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
    senhaResetToken: {
        type: String,
        select: false,
    },
    senhaResetExpires: {
        type: Date,
        select: false,
    },
    cpf_cnpj: {
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
    nomeemp: {
        type: String
    },
    razaosoc: {
        type: String
    },
    telefoneemp: {
        type: String
    },
    celularemp: {
        type: String
    },
    eTipo: {
        type: Number
    },
},
    { timestamps: true })

   
Usuario.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.senha, 10)
    this.senha = hash
    next()
  })


mongoose.model("usuarios", Usuario)