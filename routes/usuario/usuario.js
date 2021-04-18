const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../../models/Usuario")
const mailer = require('../../node_modules/mailer')
const Usuario = mongoose.model("usuarios")
const bcryptjs = require("bcryptjs")
const passport = require("passport")
var file = require('file-system')
var fs = require('fs')
const { eAdmin } = require("../../helpers/eAdmin")
const multer = require('multer')
const crypto = require('crypto')
const { getMaxListeners } = require('process')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/assets/images/users/${req.params.idfoto}/`)

    },
    filename: (req, file, cb) => {
        cb(null, req.params.tipo)
    }
})
const upload = multer({ storage })


router.get("/registro", (req, res) => {
    res.render("usuarios/registro")

})

router.post("/registro/add", (req, res) => {

    var erros = []

    if (req.body.demo < 16) {
        erros.push({ texto: "Você precisa ser maior de idade para se cadastrar." })
    }

    if (req.body.validacpf == "Inválido") {
        erros.push({ texto: "CPF Inválido." })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida." })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta." })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas digitadas estão divergentes." })
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
                    nick: req.body.nick,
                    email: req.body.email,
                    senha: req.body.senha,
                    cpf_user: req.body.cpf,
                    data_idade: req.body.idade,
                    eAdmin: 1,
                    eTipoconta: 1

                })
                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            res.json(402)
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso!")
                            res.redirect("/login")
                        }).catch((err) => {
                            console.log(err)
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


router.post('/fotoperfiluser02/:idfoto/:tipo', upload.single('img_user'), (req, res) => {
    req.params.idfoto
    res.redirect("/usuarios/perfil-vendedor/" + req.params.idfoto)
    console.log('ok')
})

router.post('/fotoperfiluser/:idfoto/:tipo', upload.single('img_user'), (req, res) => {
    req.params.idfoto
    req.params.tipo
    res.redirect("/usuarios/perfil/" + req.params.idfoto)
    console.log('ok')
})

router.post('/fotoperfiluser03/:idfoto/:tipo', upload.single('img_user'), (req, res) => {
    req.params.idfoto
    req.params.tipo
    res.redirect("/usuarios/perfil-vendedor/" + req.params.idfoto)
    console.log('ok')
})

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: req.flash("error_msg", "E-mail ou senha inválido.")
    })(req, res, next)

})


router.get("/logout", (req, res) => {

    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")

})


router.get("/registro-vendedor/:id", eAdmin, async (req, res) => { // perfil do usuário
    try {
        const dir = 'public/assets/images/users/' + req.params.id;
        if (!fs.existsSync(dir)) {
            //Efetua a criação do diretório
            fs.mkdir(dir, (err) => {
                if (err) {
                    res.redirect
                    return
                }

                console.log("Diretório criado! =)")
            });
        }
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
                    res.render('/404')
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
        const user = await Usuario.findOne({ email: req.body.receberemail })
            .select('+senhaResetToken senhaResetExpires')
        const now = new Date();
        if (req.body.token !== user.senhaResetToken || now > user.senhaResetExpires) {
            res.json({ responseid: 100 })
        } if (req.body.senhanova == null || req.body.senhanova.length < 4) {
            res.json({ responseid: 125 })
        } else {

            res.json({ responseid: 200 })

            user.senha = req.body.senhanova
            bcryptjs.genSalt(10, (erro, salt) => {
                bcryptjs.hash(user.senha, salt, (erro, hash) => {
                    if (erro) {
                    }
                    user.senha = hash
                    user.save().then(() => {

                    }).catch((erro) => {
                        console.log(erro)
                    })
                })
            })

        }
    } catch (err) {
        console.log(err)
    }
})

router.post('/mail-senha', async (req, res) => {

    try {
        const user = await Usuario.findOne({ email: req.body.emailtroca });

        if (!user) {
            res.json({ responseid: 100 })
        } else {

            const token = crypto.randomBytes(2).toString('hex')
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
                    from: 'login123258@gmail.com',
                    template: '/forgot_password',
                    context: { token },

                }, (err) => {
                    if (err)
                        console.log(err)

                })

                console.log(token, now)
                res.json({ responseid: 200 })
            }).catch(err => {
                console.log(err)

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
        bcryptjs.genSalt(10, (erro, salt) => {
            bcryptjs.hash(usuario.senha, salt, (erro, hash) => {
                if (erro) {
                    res.json(402)
                }

                usuario.senha = hash

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

    })
})




router.post('/salvarperfil', async (req, res) => { // rota para edicao do perfil, apenas o dados
    Usuario.findById({ _id: req.body.id }).then(usuario => {

        usuario.nick = req.body.nick,
            usuario.celular_user = req.body.celular,
            usuario.email = req.body.email,
            usuario.cpf_user = req.body.cpf,
            usuario.data_idade = req.body.idade



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

router.post('/salvarperfil-loja', async (req, res) => { // rota para edicao do perfil, apenas o dados
    try {
        const loja = await Usuario.findById({ _id: req.body.id })

        if (req.body.validate == "false") {
            res.json({ responseid: 101 })
        } else {

            res.json({ responseid: 200 })
            loja.nomeloja = req.body.nomeloja,
                loja.eTipopessoa = req.body.Tipopessoa,
                loja.rzsocial = req.body.rzsocial,
                loja.cnpj = req.body.cnpj,
                loja.nomecompleto = req.body.nomecompleto,
                loja.cpf = req.body.cpf,
                loja.telefone_loja = req.body.telcomercial,
                loja.celular_loja = req.body.celcomercial,
                loja.email_loja = req.body.email,
                loja.cep = req.body.cep,
                loja.endereco = req.body.logradouro,
                loja.numero = req.body.numero,
                loja.bairro = req.body.bairro,
                loja.cidade = req.body.localidade,
                loja.uf = req.body.uf,
                loja.instagram = req.body.instagram,
                loja.facebook = req.body.facebook,
                loja.whatsapp = req.body.whatsapp
            loja.save().then(() => {


            }).catch(err => {
                console.log(err)

            })

        }
    } catch (err) {

    }

})

router.post('/ativar-vendedor', async (req, res) => { // rota para edicao do perfil, apenas o dados
    try {
        const ativarloja = await Usuario.findById({ _id: req.body.idvendedor })


            if (req.body.validate == "false") {
                res.json({ responseid: 101 })
            } else {

                res.json({ responseid: 200 })
                    ativarloja.nomeloja = req.body.nomeloja,
                    ativarloja.eTipopessoa = req.body.Tipopessoa,
                    ativarloja.rzsocial = req.body.rzsocial,
                    ativarloja.cnpj = req.body.cnpj,
                    ativarloja.nomecompleto = req.body.nomecompleto,
                    ativarloja.cpf = req.body.cpf,
                    ativarloja.telefone_loja = req.body.telcomercial,
                    ativarloja.celular_loja = req.body.celcomercial,
                    ativarloja.email_loja = req.body.email,
                    ativarloja.cep = req.body.cep,
                    ativarloja.endereco = req.body.logradouro,
                    ativarloja.numero = req.body.numero,
                    ativarloja.bairro = req.body.bairro,
                    ativarloja.cidade = req.body.localidade,
                    ativarloja.uf = req.body.uf,
                    ativarloja.eTipoconta = 2
                ativarloja.save().then(() => {


                }).catch(err => {
                    console.log(err)

                })

            }
        } catch (err) {

        }
    })

        module.exports = router