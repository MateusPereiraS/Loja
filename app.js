// Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const path = require("path")
const app = express()

// Rotas "routes" puxando elas
const usuarios = require("./routes/usuario")

//Banco de dados
const mongoose = require("mongoose")
//Middleware
const session = require("express-session")
const flash = require("connect-flash")
//Colections
require("./models/Usuario")
const Usuario = mongoose.model("usuarios")

const passport = require("passport")
require("./config/auth")(passport)

const {eAdmin} = require("./helpers/eAdmin")



// Configuração
// Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))


    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
// Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next();
    })
    //Pegar informações do usuário logado
        app.use(function (req, res, next) {
            if (req.user) {
            res.locals.usuarioLogado = req.user.toObject();
            app.locals.userL = req.user.toObject();
            }
            next();
        });
        
// Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
// Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
// Mongoose
    mongoose.Promise = global.Promise;
    // Conexão com a umbler: mongodb://delconsemobi:del10123@mongo_delconsemobi:27017/delconsemobi
    // Conexão com o localhot: mongodb://localhost/blogapp
    mongoose.connect("mongodb://localhost/del", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Conectado ao mongo")
    }).catch((err) => {
        console.log("Erro ao se conectar: "+err)
    })
// Public
    app.use(express.static(path.join(__dirname,"public")))


// Partes de funcionamento




// Rotas

app.get("/404", (req, res) =>{
res.render("404")
})

app.get("/teste", (req, res) => {
    res.render("teste")
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get("/registro", (req, res) => {
    res.render('./usuarios/registro')
    
})

app.get("/login", (req, res) => {
    res.render('./usuarios/login')
    
})

app.get("/perfil", (req, res) => {
    res.render('./usuarios/perfil')
    
})

app.get("/produtos-detalhes", (req, res) => {
    res.render('produtos-detalhes')
    
})

app.get("/privacy", (req, res)=>{
res.render("./usuarios/privacy")

})

// Rotas "Ficam em outros arquivos, ocupam menos espaço"
app.use('/usuarios', usuarios)





// Outros
const PORT = 3000
app.listen(PORT,() => {
console.log("Servidor rodando! ")
})

// Enviar dados do meu mongoDb para a umbler:
// mongorestore -h geonosis.mongodb.umbler.com:42476 -d blogapp -u blogapp -p root10123 --drop c:\data\db\blogapp