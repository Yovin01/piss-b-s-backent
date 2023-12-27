'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
var materia = models.materia;
var persona = models.persona;
var matricula = models.matricula;

class MatriculaContoller {
    async guardar(req, res) {
        let PersonaAux = await models.persona.findOne({ where: { external_id: req.body.external_persona} });
        let transaction = await models.sequelize.transaction();
        console.log(PersonaAux)
        
        if (req.body.external_persona !== null) {
            try {
                const data = {
                    "id_persona" : PersonaAux.id
                }
                await models.matricula.create(data, transaction);
                await transaction.commit();
                res.json({
                    msg: "Agregada matricula",
                    code: 200
                });
            } catch (error) {
                res.status(400);
                if (transaction) await transaction.rollback();
                if (error.errors && error.errors[0].message) {
                    res.json({ msg: error.errors[0].message, code: 400 });
                } else {
                    res.json({ msg: error.message, code: 400 });
                }
            }
        } else {
            res.json({ msg: 'Persona no econtrada', code: 400 });
        }
    }
    async obtenerPorPersona(req, res) {
        
        try {
            const external = req.params.external_persona;
        console.log(external);
        let AuxPersona = await models.persona.findOne({ where: { external_id: external} });
        console.log(AuxPersona.nombres);
        var listar = await matricula.findOne({
            where: { id_persona: AuxPersona.id }, 
            attributes: ['external_id'],
        });
        if (listar === null) {

            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(400);
        res.json({ msg: 'ERROR', code: 400, info: listar });
        }
    }
    async listarNoMatriculadas(req, res) {
        try {
            const personasConMatricula = await matricula.findAll({
                attributes: ['id_persona'],
            });
            const personasConMatriculaIds = personasConMatricula.map((matricula) => matricula.id_persona);
            console.log(personasConMatriculaIds)
            const personasSinMatricula = await persona.findAll({
                where: {
                    id: { [models.Sequelize.Op.notIn]: personasConMatriculaIds },
                },
                attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion']
            });
    
            res.status(200).json({ msg: 'OK!', code: 200, info: personasSinMatricula });
        } catch (error) {
            console.log(error);
            res.status(400).json({ msg: 'ERROR', code: 400, info: error });
        }
    }

    async AsignarCurso(req, res) {
        let AuxPersona = await models.persona.findOne({ where: { external_id: req.body.external_persona} });
        let matAux = await models.matricula.findOne({ where: { id_persona: AuxPersona.id} });
        if (matAux === null) {
            let transaction = await models.sequelize.transaction();
            const data = {
                "id_persona" : AuxPersona.id
            }
            await models.matricula.create(data, transaction);
            await transaction.commit();
        }
        let matriculaAux = await models.matricula.findOne({ where: { id_persona: AuxPersona.id} });
        let materiaAux = await models.materia.findOne({ where: { external_id: req.body.external_materia} });
        let transaction = await models.sequelize.transaction();
        if (req.body.external_persona !== null) {
            try {
                const data = {
                    "id_matricula" : matriculaAux.id,
                    "id_materia" : materiaAux.id, 
                }
                await models.cursa.create(data, transaction);
                await transaction.commit();
                res.json({
                    msg: "Agregado curso a matrícula",
                    code: 200
                });
            } catch (error) {
                if (transaction) await transaction.rollback();
                if (error.errors && error.errors[0].message) {
                    res.json({ msg: error.errors[0].message, code: 400 });
                } else {
                    res.json({ msg: error.message, code: 400 });
                }
            }
        } else {
            res.json({ msg: 'Persona no econtrada', code: 400 });
        }
    }
}

module.exports = MatriculaContoller;