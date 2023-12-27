'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models/');
var persona = models.persona;
var rol = models.rol;
var persona_rol = models.persona_rol;
var cuenta = models.cuenta;
var matricula = models.matricula;
const bcrypt = require('bcrypt');
const saltRounds = 8;

class PersonaController {

    async listar(req, res) {
        try {
            var listar = await persona.findAll({
                attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion'],
                include: {
                    model: cuenta,
                    as: 'cuenta',
                    attributes: ['correo']
                }
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error', code: 400, info: error });
        }
    }

    async asignarRol(req, res) {
        try {
            const extPersona = req.params.external_persona;
            const extRol = req.params.external_rol;
            var idPersona = await persona.findOne({
                where: { external_id: extPersona },
                attributes: ['nombres', 'apellidos', 'identificacion', 'id']
            });
            var idRol = await persona.findOne({
                where: { external_id: extRol },
                attributes: ['nombre', 'id']
            });
            if (idPersona === null || idRol === null) {
                res.status(400);
                res.json({ msg: "Datos no encontrados", code: 400 });
            } else {
                var data = {
                    "id_persona": idPersona.id,
                    "id_rol": idRol.id
                }
                let transaction = await models.sequelize.transaction();
                await persona_rol.create(data, transaction);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO EL ROL DE LA PERSONA",
                    code: 200
                });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }

    async asignarMatricula(req, res) {
        try {
            const extPersona = req.params.external_persona;
            var idPersona = await persona.findOne({
                where: { external_id: extPersona },
                attributes: ['nombres', 'apellidos', 'identificacion', 'id']
            });
            if (idPersona === null) {
                res.status(400);
                res.json({ msg: "Datos no encontrados", code: 400 });
            } else {
                var data = {
                    "id_persona": idPersona.id
                }
                let transaction = await models.sequelize.transaction();
                await matricula.create(data, transaction);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO LA MATRICULA",
                    code: 200
                });
            }

        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }
    async obtener(req, res) {
        try {
            const external = req.params.external;
            var listar = await persona.findOne({
                where: { external_id: external },
                include: {
                    model: cuenta,
                    as: 'cuenta',
                    attributes: ['correo']
                },
                attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion'],
            });
            if (listar === null) {

                listar = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(400);
            res.json({ msg: 'ERROR', code: 400, info: error });
        }
    }

    async obtenerExt(req, res) {
        try {
            const external = req.params.iden;
            var listar = await persona.findOne({
                where: { identificacion: external },
                attributes: ['external_id'],
            });
            if (listar === null) {

                listar = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(400);
            res.json({ msg: 'ERROR!', code: 400, info: error });
        }
    }


    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            let rol_id = req.body.external_rol;
            if (rol_id != undefined) {
                let rolAux = await rol.findOne({ where: { external_id: rol_id } });
                if (rolAux) {
                    var claveHash = function (clave) {
                        return bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds), null);
                    };
                    console.log(claveHash(req.body.clave));
                    var data = {
                        identificacion: req.body.identificacion,
                        tipo_identificacion: req.body.tipo_identificacion,
                        apellidos: req.body.apellidos,
                        nombres: req.body.nombres,
                        direccion: req.body.direccion,
                        cuenta: {
                            correo: req.body.correo,
                            clave: claveHash(req.body.clave)
                        },
                        persona_rol: {
                            id_rol: rolAux.id
                        }
                    };
                    res.status(200);
                    let transaction = await models.sequelize.transaction();

                    try {
                        await persona.create(data, { include: [{ model: models.cuenta, as: "cuenta" }, { model: models.persona_rol, as: "persona_rol" }], transaction });
                        console.log('guardado');
                        await transaction.commit();
                        res.json({ msg: "Se han regiustrado sus datos", code: 200 });
                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.error && error.error[0].message) {
                            res.json({ msg: error.error[0].message, code: 200 });
                        } else {
                            res.json({ msg: error.message, code: 200 });
                        }
                    }
                    //podemos poner persona . create o save
                    // console.log(personaAux);

                } else {
                    res.status(400);
                    res.json({ msg: "Datos no encontrados", code: 400 });
                }

            } else {
                res.status(400);
                res.json({ msg: "Datos Faltantes", code: 400, errors: errors });
            }

        } else {
            res.status(400);
            res.json({ msg: "Datos Faltantes", code: 400, errors: errors });
        }

    }

    async modificar(req, res) {
        try {
            var person = await persona.findOne({ where: { external_id: req.body.external } });
            if (person === null) {
                res.status(400);
                res.json({
                    msg: "NO EXISTEN REGISTROS",
                    code: 400
                });
            } else {
                var uuid = require('uuid');
                person.identificacion = req.body.identificacion;
                person.tipo_identificacion = req.body.dni_tipo;
                person.nombres = req.body.nombres;
                person.apellidos = req.body.apellidos;
                person.direccion = req.body.direccion;
                person.external_id = uuid.v4();
                var result = await person.save();
                if (result === null) {
                    res.status(400);
                    res.json({
                        msg: "NO SE HAN MODIFICADO SUS DATOS",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: "SE HAN MODIFICADO SUS DATOS CORRECTAMENTE",
                        code: 200
                    });
                }
            }
        } catch (error) {
            res.status(400);
            res.json({
                msg: "Hubo un error al modificar" + error,
                code: 400
            });
        }
    }
}
module.exports = PersonaController;