'use strict';

var models = require('../models/');
var peticion = models.peticion;

class PeticionController{
    async listar(req,res){
        try {
            var listar = await peticion.findAll({
                include: { model: models.cuenta, foreignKey: 'id_cuenta', attributes: ['correo'], 
                include: { model: models.persona, foreignKey: 'id_persona', attributes: ['nombres', 'apellidos','institucion'] } },
                attributes: ['peticion', 'external_id', 'createdAt']
            });
    
            res.json({msg:'OK!',code:200,info:listar});
        } catch (error) {
            res.json({msg:'Algo salio mal en listar peticiones',code:500,info:error});
        }
    }

    async guardar(req, res){
        try {
            const data = {
                "nombre": req.body.nombre,
            }
            let transaction = await models.sequelize.transaction();
            await peticion.create(data, transaction);
            await transaction.commit();
            res.json({
                msg: "SE HAN REGISTRADO SUS DATOS",
                code: 200
            });

        } catch (error) {
            if (transaction) await transaction.peticionlback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200});
            }
        }
    }
}

module.exports = PeticionController;