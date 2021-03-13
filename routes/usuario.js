const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcryptjs = require("bcryptjs")
const passport = require("passport")
var file = require('file-system')
var fs = require('fs')
const {eAdmin} = require("../helpers/eAdmin")
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/assets/images/users/'+req.params.idfoto+'/perfil-foto/')

        },
        filename:(req,file,cb)=> {
            cb(null, req.params.idfoto+".jpg")
        }
    })
const upload = multer({storage})

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
    
})

router.post("/registro/add",  (req, res) => {
    
    var erros = []
    var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if(!req.body.email.search(reg) == 0 ){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente."})
    }

    if(erros.length > 0){

        res.render("usuarios/registro", {erros: erros})

    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash("error_msg", "E-mail já cadastrado.")
                res.redirect("/usuarios/registro")
            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1,
                })

                
                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })

            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }
})


router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post('/fotoperfiluser/:idfoto', upload.single('img_user'),  (req,res ) => {
    req.params.idfoto
    res.redirect("/usuarios/perfil/"+req.params.idfoto)
    console.log('ok')
  })

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})


router.get("/logout", (req, res) =>{

    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")

})

router.get("/perfil/:id", async (req, res) => { // perfil do usuário
    try {
        const dir = "public/assets/images/users/"+req.params.id+"/perfil-foto";
        if (!fs.existsSync(dir)){
            //Efetua a criação do diretório
            fs.mkdir(dir, (err) => {
                if (err) {
                    console.log("Deu ruim...");
                    return
                }
        
                console.log("Diretório criado! =)")
            });
        }
        let usuario = await Usuario.findById({ _id: req.params.id }).lean()
        res.render('./usuarios/perfil', { usuario: usuario})
        //Verifica se não existe
    } catch (err) {

    }



})

router.post('/salvarperfil', async (req, res) => { // rota para edicao do perfil, apenas o dados
    Usuario.findById({ _id: req.body.id }).then(usuario => {
        
            usuario.email = req.body.email,
            usuario.nome = req.body.nome,
            usuario.celular = req.body.celular,
            usuario.endereco = req.body.endereco
            
                usuario.save().then(() => {
                    console.log('ok')
                    req.flash('success_msg', 'Dados editado com sucesso')
                    res.redirect('/usuarios/perfil/'+ usuario._id)
                }).catch(err => {
                    req.flash('error_msg', 'Error ao editar dados' + err)
                    res.redirect('/')
                })
            
            })
        })          

module.exports = router