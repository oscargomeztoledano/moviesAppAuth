var express = require("express");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var router = express.Router();
var debug = require("debug")("moviesAppAuth:server");

//Models
var User = require("../models/User.js");

var db = mongoose.connection;

//TOKEN_SECRET=crypto.randomBytes(64).toString('hex');
TOKEN_SECRET="9f26e402586e2faa8da4c98a35f1b20d6b033c60";

//Middleware utilizando "use"
router.use("/secure", function (req, res, next) {
    var retrievedToken = req.headers["authorization"]
    if (!retrievedToken) {
        res.status(401).send({
            ok: false,
            message: "Token inválido"
        })
    }
    retrievedToken = retrievedToken.replace("Bearer ", "")
    jwt.verify(retrievedToken, TOKEN_SECRET, function (err, retrievedToken) {
        if (err) {
            return res.status(401).send({
                ok: false,
                message: "Token inválido"
            });
        } else {
            req.token = retrievedToken;
            next();
        }
    });
});

// GET del listado de usuarios ordenados por fecha de creación
router.get("/", function (req, res, next) {
    User.find().sort("-creationdate").exec(function (err, users) {
        if (err) res.status(500).send(err);
        else res.status(200).json(users);
    });
});

// GET de un único usuario por su Id
router.get("/:id", function (req, res, next) {
    User.findById(req.params.id, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.status(200).json(userinfo);
    });
});

// POST de un nuevo usuario
router.post("/", function (req, res, next) {
    User.create(req.body, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// PUT de un usuario existente identificado por su Id
router.put("/:id", function (req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// DELETE de un usuario existente identificado por su Id
router.delete("/:id", function (req, res, next) {
    User.findByIdAndDelete(req.params.id, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// Comprueba si el usuario existe
//  router.post("/signin", function (req, res, next) {
//     User.findOne({
//         username: req.body.username
//     }, function (err, user) {
//         if (err) res.status(500).send("¡Error comprobando el usuario!");
//         // Si el usuario existe...
//         if (user != null) {
//             user.comparePassword(req.body.password, function (err, isMatch) {
//                 if (err) return next(err);
//                 // Si el password es correcto...
//                 if (isMatch)
//                     res.status(200).send({
//                         message: "ok",
//                         username: user.username,
//                         id: user._id
//                     });
//                 else
//                     res.status(401).send({
//                         message: "ko"
//                     });
//             });
//         } else res.status(401).send({
//             message: "ko"
//         });
//     });
// }); 

router.post("/signin", 
function (req, res, next) {
    debug("login");
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) { //error al consultar la BBDD
                res.status(500).send("¡Error comprobando el usuario!");
            }
            if (user != null) { //El usuario existe (ahora a ver si coincide el password)
                debug("El usuario existe");
                user.comparePassword(req.body.password, 
                     function (err, isMatch) {
                          if (err) res.status(500).send("¡Error comprobando el password!");
                          if (isMatch){  
                                next(); //pasamos a generar el token
                          }else
                                res.status(401).send({
                                   message: "Password no coincide"
                          });    
                    }
                );
            }
            else { //El usuario NO existe en la base de datos
                res.status(401).send({
                    message: "Usuario no existe"
                });
            }
        });
},
function (req, res, next) {
    debug("... generando token");
    // var u = {
    //      username: req.body.userFound.username,
    //      id: req.body.userFound.id
    // };
    var u = {
        username: req.body.username,
   };
    jwt.sign(u, TOKEN_SECRET, {
        expiresIn: 60 * 60 * 24 // expira en 24 horas...
    }, function(err, generatedToken) {
        if (err) res.status(500).send("¡Error generando token de autenticación");
        else res.status(200).send({
            message: generatedToken
       });
    });
});

module.exports = router;