const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const nodemailer = require('nodemailer');
const mailer = require('../node_modules/mailer')
const Usuario = mongoose.model("usuarios")
const bcryptjs = require("bcryptjs")
const passport = require("passport")
var file = require('file-system')
var fs = require('fs')
const { eAdmin } = require("../helpers/eAdmin")
const multer = require('multer')
const crypto = require('crypto')
const { getMaxListeners } = require('process')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/assets/images/users/${req.params.idfoto}/`)

    },
    filename: (req, file, cb) => {
        cb(null, "foto-perfil.jpg")
    }
})
const upload = multer({ storage })

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")

})

router.post("/registro/add", (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente." })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente." })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente." })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente." })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "Dados inválidos! Verifique se todos os campos foram preenchidos corretamente." })
    }

    if (erros.length > 0) {

        res.render("usuarios/registro", { erros: erros })

    } else {
        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "E-mail já cadastrado.")
                res.redirect("/usuarios/registro")
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1,
                    eTipo: 1,

                })
                novoUsuario.save().then(() => {
                    req.flash("success_msg", "Usuario criado com sucesso!")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao criar o usuário")
                    res.redirect("/usuarios/registro")
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


router.post('/fotoperfiluser/:idfoto', upload.single('img_user'), (req, res) => {
    req.params.idfoto
    res.redirect("/usuarios/perfil/" + req.params.idfoto)
    console.log('ok')
})

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})


router.get("/logout", (req, res) => {

    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")

})


router.get("/registro-vendedor/:id", eAdmin, async (req, res) => { // perfil do usuário
    try {
        let usuario = await Usuario.findById({ _id: req.params.id }).lean()
        res.render('./vendedores/registro-vendedor', { usuario: usuario })
        //Verifica se não existe
    } catch (err) {

    }
})


router.get("/perfil/:id", eAdmin, async (req, res) => { // perfil do usuário
    try {
        const dir = 'public/assets/images/users/' + req.params.id;
        if (!fs.existsSync(dir)) {
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
        res.render('./usuarios/perfil', { usuario: usuario })
        //Verifica se não existe
    } catch (err) {

    }
})

router.get("/perfil-vendedor/:idvendedor", eAdmin, async (req, res) => { // perfil do usuário
    try {
        let usuario = await Usuario.findById({ _id: req.params.idvendedor }).lean()
        res.render('./vendedores/perfil-vendedor', { usuario: usuario })
        //Verifica se não existe
    } catch (err) {

    }
})

router.post('/reset-senha', async (req, res) => {
    try {
        const user = await Usuario.findOne({ email: req.body.emailtroca })
            .select('+senhaResetToken senhaResetExpires')
        const now = new Date();
        if (req.body.token !== user.senhaResetToken || now > user.senhaResetExpires) {
            req.flash("error_msg", "Chave inválida!")
        } else {
            user.senha = req.body.senhanova
            console.log('ok')
            user.save().then(() => {

            }).catch((erro) => {
                console.log(erro)
            })



        }
    } catch (err) {

    }
})

router.post('/mail-senha', async (req, res) => {

    try {
        const user = await Usuario.findOne({ email: req.body.emailtroca });

        if (!user){
            res.send({responseid:100})
        }else{
            const token = crypto.randomBytes(5).toString('hex')
            const now = new Date();
            now.setHours(now.getHours() + 1)

            Usuario.findByIdAndUpdate(user._id, {
                '$set': {
                    senhaResetToken: token,
                    senhaResetExpires: now,
                }
            }).then(() => {

                mailer.sendMail({
                    to: req.body.emailtroca,
                    from: 'mateusfpsgamex@gmail.com',
                    template: '/forgot_password',
                    context: { token },
    
                }, (err) => {
                    if (err)
                    res.send({responseid:100})

                })
                
                console.log(token, now)
                res.send({responseid:200})

            }).catch(err => {
                res.send({responseid:100})
            })
        }

    } catch (err) {
        console.log(err)
        res.render('/404')
    }
})


router.post('/trocar-senha', async (req, res) => { // rota para edicao do perfil, apenas o dados

    Usuario.findById({ _id: req.body.valueid }).then(usuario => {

        usuario.senha = req.body.senha2

        usuario.save().then(() => {
            console.log('ok')
            req.flash('success_msg', 'Dados editado com sucesso')
            res.redirect('/usuarios/perfil/' + usuario._id)
        }).catch(err => {
            req.flash('error_msg', 'Error ao editar dados' + err)
            res.redirect('/')
            console.log(err)
        })

    })
})




router.post('/salvarperfil', async (req, res) => { // rota para edicao do perfil, apenas o dados
    Usuario.findById({ _id: req.body.id }).then(usuario => {

        usuario.email = req.body.email,
            usuario.nome = req.body.nome,
            usuario.celular = req.body.celular,
            usuario.cep = req.body.cep,
            usuario.endereco = req.body.logradouro,
            usuario.bairro = req.body.bairro,
            usuario.cidade = req.body.localidade,
            usuario.uf = req.body.uf


        usuario.save().then(() => {
            console.log('ok')
            req.flash('success_msg', 'Dados editado com sucesso')
            res.redirect('/usuarios/perfil/' + usuario._id)
        }).catch(err => {
            req.flash('error_msg', 'Error ao editar dados' + err)
            res.redirect('/')
        })

    })
})

router.post('/ativar-vendedor', async (req, res) => { // rota para edicao do perfil, apenas o dados
    Usuario.findById({ _id: req.body.idvendedor }).then(usuario => {

        usuario.cpf_cnpj = req.body.cpfcnpj,
            usuario.nomeemp = req.body.nomeempresa,
            usuario.razaosoc = req.body.razaosocial,
            usuario.telefoneemp = req.body.telcomercial,
            usuario.celularemp = req.body.telcelular,
            usuario.eTipo = 2

        usuario.save().then(() => {
            console.log('ok')
            req.flash('success_msg', 'Cadastro alterado para vendedor')
            res.redirect('/')
        }).catch(err => {
            req.flash('error_msg', 'Error ao editar dados' + err)
            res.redirect('/')
        })

    })
})




module.exports = router