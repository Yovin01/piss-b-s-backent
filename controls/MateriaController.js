'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
var materia = models.materia;
var cursa = models.cursa;
var persona_rol = models.persona_rol;
var persona = models.persona;
var matricula = models.matricula;

class MateriaContoller {
    async listar(req, res) {
        try {
            var lista = await materia.findAll({
                attributes: ['external_id', 'nombre', 'estado']
            });
            res.json({ msg: "OK!", code: 200, info: lista });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async participantes(req, res) {
        try {
            const external_materia = req.params.external_materia;
            var materiaAux = await materia.findOne({ where: { external_id: external_materia } });
            console.log(materiaAux)
            if (materiaAux != undefined) {
                var lista = await cursa.findAll({
                    where: { id_materia: materiaAux.id },
                    include: { model: models.matricula, attributes: ['id_persona'], include: { model: models.persona, attributes: ['id', 'nombres', 'apellidos'] } },
                    attributes: ['id_matricula', 'id_materia']
                });

                const resultados = [];

                for (const item of lista) {
                    const persona_id = item.matricula.persona.id;
                    var personarol = await persona_rol.findOne({
                        where: { id_persona: persona_id },
                        include: { model: models.rol, attributes: ['nombre'] }
                    });
                    const rol = personarol.rol.nombre;
                    const nombre = item.matricula.persona.nombres;
                    const apellido = item.matricula.persona.apellidos;
                    resultados.push({ nombre, apellido, rol });
                }

                res.json({ msg: "OK!", code: 200, info: resultados });
            } else {
                res.status(400);
                res.json({ msg: "Materia no encontrada", code: 400 });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async materias(req, res) {
        try {
            const external_estudiante = req.params.external_estudiante;
            var estudianteAux = await persona.findOne({ where: { external_id: external_estudiante } });
            if (estudianteAux != undefined) {
                const estudiante_id = estudianteAux.id;
                var matriculaAux = await matricula.findOne({ where: { id_persona: estudiante_id } });
                if (matriculaAux != undefined) {
                    var lista = await cursa.findAll({
                        where: { id_matricula: matriculaAux.id },
                        include: { model: models.materia, attributes: ['nombre', 'external_id'] },
                        attributes: []
                    });

                    const resultados = [];

                    for (const item of lista) {
                        const nombre = item.materium.nombre;
                        const external_id = item.materium.external_id;
                        resultados.push({ nombre, external_id });
                    }

                    console.log(lista);

                    res.json({ msg: "OK!", code: 200, info: resultados });
                } else {
                    res.status(400);
                    res.json({ msg: "Estudiante no matriculado", code: 400 });
                }
            } else {
                res.status(400);
                res.json({ msg: "Estudiante no encontrado", code: 400 });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async obtener(req, res) {
        try {
            const external = req.params.external;
            var lista = await materia.findOne({
                where: { external_id: external },
                attributes: ['external_id', 'nombre', 'estado']
            });
            if (lista == null) {
                lista = {};
            }
            res.status(200);
            res.json({ msg: "OK!", code: 200, info: lista });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async cantMaterias(req, res) {
        try {
            var cant = await materia.count();
            res.json({ msg: "OK!", code: 200, info: cant });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async guardar(req, res) {
        try {
            let errors = validationResult(req);
            if (errors.isEmpty()) {
                var data = {
                    nombre: req.body.nombre
                };
                res.status(200);
                //let transaction = await models.sequelize.transaction();
                try {
                    await materia.create(data);
                    //await transaction.commit();
                    res.json({ msg: "Se ha registrado sus datos", code: 200 });
                } catch (error) {
                    if (transaction) await transaction.rollback();
                    if (error.errors && error.errors[0].message) {
                        res.json({ msg: error.errors[0].message, code: 200 });
                    } else {
                        res.json({ msg: error.message, code: 200 });
                    }
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }

    async modificar(req, res) {
        try {
            var materiaAux = await materia.findOne({ where: { external_id: req.body.external_materia } });
            if (materiaAux === null) {
                res.status(400);
                res.json({ msg: "No existe el registro", code: 400 });
            } else {
                var uuid = require('uuid');
                materiaAux.nombre = req.body.nombre;
                materiaAux.external_id = uuid.v4();
                var result = await materiaAux.save();
                if (result === null) {
                    res.status(400);
                    res.json({ msg: "No se ha modificado sus datos", code: 400 });
                } else {
                    res.status(200);
                    res.json({ msg: "Se ha modificado sus datos", code: 200 });
                }

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }
}

module.exports = MateriaContoller;