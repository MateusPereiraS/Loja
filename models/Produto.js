const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const Schema = mongoose.Schema;

const Produto = new Schema({
    idvendedor:{
        type: String,
        required:true
    },
    nome_produto:{
        type: String,
        required:true
    },
    categoria:{
        type:String,
        required:true
    },

},
{ timestamps: true })


mongoose.model("produto", Produto)