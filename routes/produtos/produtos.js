const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../../models/Produto")
const Produto = mongoose.model("produto")
const { eAdmin } = require("../../helpers/eAdmin")
const multer = require('multer')
const { getMaxListeners } = require('process')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/assets/images/users/${req.params.idusuario}/produtos/${req.params.idproduto}`)

    },
    filename: (req, file, cb) => {
        cb(null, req.params.produtoimg)
    }
})
const upload = multer({ storage })


//Produtos

router.get('/meusprodutos/:id', eAdmin, async (req, res) => {
    try {
        let produto = await Produto.findById({ _id: req.params.id }).lean()
        res.render('./vendedores/produto-vendedor', { produto: produto })
        //Verifica se não existe
    } catch (err) {
        console.log(err)

    }
})

router.get('/produtos-cadastro', eAdmin, async (req, res) => {
    
    res.render('./vendedores/produtos-cadastro')
    
})

module.exports = router