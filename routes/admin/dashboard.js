const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")

require("../../models/Usuario")
const Usuario = mongoose.model("usuarios")

router.get("/", (req, res) => {
    res.render("admin/dashboard")
})


module.exports = router