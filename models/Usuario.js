const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nick: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    celular_user: {
        type: String
    },
    eAdmin: {
        type: Number,
        default: 1
    },
    senha: {
        type: String,
        required: true
    },
    senhaResetToken: {
        type: String,
        select: false,
    },
    senhaResetExpires: {
        type: Date,
        select: false,
    },
    eTipopessoa:{
        type: String
    },
    nomeloja: {
        type: String
    },
    cnpj: {
        type: String
    },
    rzsocial: {
        type: String
    },
    nomecompleto:{
        type: String
    },
    cpf: {
        type: String
    },
    celular_loja:{
        type: String
    },
    telefone_loja:{
        type: String
    },
    email_loja:{
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
    numero:{
        type: Number
    },
    bairro: {
        type: String
    },
    telefoneemp: {
        type: String
    },
    celularemp: {
        type: String
    },
    instagram:{
        type: String
    },
    facebook:{
        type: String
    },
    whatsapp:{
        type: String
    },
    eTipoconta: {
        type: Number
    },
},
    { timestamps: true })


mongoose.model("usuarios", Usuario)