'use strict';

var models = require('../models/');
var peticion = models.peticion;

class PeticionController {
    async listar(req, res) {
        try {
            var listar = await peticion.findAll({
                where: { estado: 'ES' },
                include: {
                    model: models.cuenta, foreignKey: 'id_cuenta', attributes: ['correo'],
                    include: { model: models.persona, foreignKey: 'id_persona', attributes: ['nombres', 'apellidos', 'institucion'] }
                },
                attributes: ['peticion', 'external_id', 'createdAt']
            });
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en listar peticiones', code: 500, info: error });
        }
    }

    async aceptarRechazar(req, res) {
        try {
            var peticionNew = await peticion.findOne({ where: { external_id: req.params.external } });
            if (peticionNew === null) {
                res.status(400);
                res.json({ msg: 'Peticion no encontarda', code: 400 });
            } else {
                var cuentaAc = await models.cuenta.findOne({ where: { id: peticionNew.id_cuenta } });
                var person = await models.persona.findOne({where: {id: cuentaAc.id_persona}});
                if (req.params.estado == '1') {
                    peticionNew.estado = 'AC';
                    cuentaAc.estado = 'ACEPTADO';
                    person.estado=1;
                } else {
                    peticionNew.estado = 'RE';
                    cuentaAc.estado = 'DENEGADO';
                    person.estado=0;
                }
                var uuid = require('uuid');
                peticionNew.external_id = uuid.v4();
                cuentaAc.external_id = uuid.v4();
                person.external_id = uuid.v4();
                var result = await peticionNew.save();
                var resultCuenta = await cuentaAc.save();
                var resultPerson = await person.save();
                if (result === null || resultCuenta === null || resultPerson === null) {
                    res.status(400);
                    res.json({
                        msg: "No se guardado la informacion de la peticion",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: ((req.params.estado === '1') ? 'Se ha aceptado la petición' : 'Se ha rechazado la petición'),
                        code: 200
                    });
                }
            }

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en peticiones', code: 500, info: error });
        }

    }

}

module.exports = PeticionController;