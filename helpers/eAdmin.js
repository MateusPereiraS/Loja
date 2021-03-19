module.exports = {
    eAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você não possui permissão de acesso a essa pagina!")
        res.redirect("/404")
    }
}



