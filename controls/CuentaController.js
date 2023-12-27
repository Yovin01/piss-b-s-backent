'use strict';
var models = require('../models/');
var cuenta = models.cuenta;
var persona = models.persona;
var controlAcces = models.controlAcces;
const { body, validationResult, check } = require('express-validator');
const bcypt = require('bcrypt');
const salRounds = 8;
let jwt = require('jsonwebtoken');

class CuentaController {
    async sesion(req, res) {
        try {
            let errors = validationResult(req);
        if (errors.isEmpty()) {
            var login = await cuenta.findOne({
                where: { correo: req.body.correo }, include: [{
                    model: models.persona, as: 'persona',
                    attributes: ['nombres', 'apellidos', 'identificacion', 'id', 'external_id'],
                }]
            });

            const query = `
            SELECT persona.id, persona_rol.id_persona, persona_rol.id_rol, rol.id, rol.nombre
            FROM persona_rol
            INNER JOIN persona ON persona_rol.id_persona = persona.id
            INNER JOIN rol ON persona_rol.id_rol = rol.id
            WHERE persona.id = :id
          `;
          console.log(login)
            
            if (login === null) {
                res.status(400);
                res.json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                });
            } else {
                var lista = await models.sequelize
                .query(query, {
                    replacements: { id: login.id_persona },
                    type: models.Sequelize.QueryTypes.SELECT,
                });
                res.status(200);
                var isClavaValida = function (clave, claveUs) {
                    return bcypt.compareSync(claveUs, clave);
                };


                if (login.estado) {
                    if (isClavaValida(login.clave, req.body.clave)) {
                        const tokenData = {
                            external: login.external_id,
                            usuario: login.correo,
                            rol_id: lista[0].id_rol,
                            rol_nombre: lista[0].nombre,
                            check: true
                        };
                        require('dotenv').config();
                        const llave = process.env.KEY;
                        const token = jwt.sign(tokenData, llave, { expiresIn: "0.5h" });
                        const cambios = {
                            "Descripcion": "Inicio de sesion"
                        }
                        const datos = {
                            "tipo_consulta": "LEER",
                            "id_persona": login.id,
                            "data": cambios
                        }
                        //await controlAcces.create(datos);              <----pendiente
                        var nombreRol = Buffer(lista[0].nombre);
                        nombreRol = nombreRol.toString('base64');
                        console.log('kkkkkkkkkkkkkkkk');
                        console.log(login.persona.external_id);
                        res.json({ msg: 'OK!', token: token, user: login.persona.nombres + ' ' + login.persona.apellidos, code: 200, correo: login.correo, iden: login.persona.identificacion, rol: nombreRol, external: login.persona.external_id});

                    } else {
                        res.json({
                            msg: "CLAVE INCORRECTA",
                            code: 400
                        });
                    }
                } else {
                    res.json({
                        msg: "CUENTA DESACTIVADA",
                        code: 400
                    });
                }
            }
        } else {
            res.status(400);
            res.json({ msg: "Faltan datos", code: 400 });
        }
        } catch (error) {
            res.status(200);
            res.json({ msg: "Error", code: 400, info: error });
        }
    }
}
module.exports = CuentaController;
