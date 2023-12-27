'use strict';
const axios = require('axios');
var models = require('../models');
var entregable = models.entregable;
const path = require('path');
const fs = require('fs/promises');
const { Console } = require('console');
class EntregableController {
    async listar(req, res) {
        var listar = await entregable.findAll({
            include: { model: models.practica, foreignKey: 'id_practica', attributes: ['titulo', 'external_id', 'descripcion'] },
            attributes: ['nombre', 'external_id', 'descripcion', 'trabajo', 'estado', 'persona', 'createdAt']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async obtenerExter(req, res) {
        const external = req.params.id;
        const iden = req.params.identi;
        /// algo que encontere==----------------------------------------------------------------------YTovin MIrara'
        /*
         where: {  [sequelize.Op.or]: [
                            { id_practica: external },
                            { external_id: external }
                          ]  },
        ?*/
        try {
            var lista = await entregable.findOne({
                where: {
                    id_practica: external,
                    persona: iden
                },
                attributes: ['trabajo', 'persona', 'calificacion', 'calificado', 'documentacion', 'id_practica', 'external_id', 'updatedAt']
            });
            console.log(lista);
            if (lista == null) {
                res.status(400);
                res.json({ msg: "No fount asd", code: 400, info: [] });
            } else {
                res.status(200);
                res.json({ msg: "OK!", code: 200, info: lista });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la practica solicitada' });
        }
    }

    async obtenerDEPreac(req, res) {
        const iden = req.params.external_id;
    
        try {
            let pract = await models.practica.findOne({
                where: { external_id: iden }
            });
    
            if (!pract) {
                res.status(404).json({ msg: "Práctica no encontrada", code: 404 });
                return;
            }
    
            let entregables = await models.entregable.findAll({
                where: { id_practica: pract.id },
                attributes: ['trabajo', 'persona', 'calificacion', 'calificado', 'documentacion', 'id_practica', 'external_id', 'updatedAt']
            });
    
            if (entregables.length === 0) {
                res.status(200).json({ msg: "No se encontraron entregables", code: 200, info: [] });
                return;
            }
    
            for (let index = 0; index < entregables.length; index++) {
                let persona = await models.persona.findOne({ where: { identificacion: entregables[index].persona } });
                entregables[index].persona = persona; // Aquí asignamos la información de la persona al objeto entregable
            }
    
            res.status(200).json({ msg: "OK", code: 200, info: entregables });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la información', code: 500 });
        }
    }
    
    async guardar(req, res) {
        try {
        
        const archivo = req.file;
        console.log(req.body.identificacion + '---------a');
        let rperAux = await models.persona.findOne({ where: { identificacion: req.body.identificacion } });

        let pract = await models.practica.findOne({ where: { external_id: req.body.external_id } });
        //     console.log('----as----------');
        let transaction = await models.sequelize.transaction();
        if (rperAux && (archivo || (req.body.trabajo !== null))) {
            try {
                const data = {
                    "trabajo": req.body.trabajo,
                    "persona": req.body.identificacion,
                    "documentacion": null, // Comprobar si hay un archivo cargado
                    "id_practica": pract.id
                }
                if (req.file) {
                    data.documentacion = req.file.filename;
                }
                //    console.log(data + '-----------------------------------');
                await models.entregable.create(data, transaction);
                await transaction.commit();error.message
                res.json({
                    msg: "PRACTICA ENTREGADA",
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
            
    } catch (error) {
        res.json({ msg: 'Error al obtener al guardar', code: 500 });
    }
    }
    async listarCodigos(req, res) {
        try {
            // Realizar la solicitud GET al servidor externo
            console.log();
            //  const response = await axios.get('http://10.20.202.161/console?comando=' + req.params.comando);
            console.log('**-*****vvv**-------');
            console.log('http://10.20.201.36/console?comando=' + req.params.comando);
            //    console.log(response);
            // Si el servidor responde con éxito
            //       console.log(response);
             if (response.data.code === 200) {
         //   if (true) {
                // Obtener los datos de la respuesta del servidor
                // const listar = response.data.info;
                   const auxBase64 = listar.Respuesta;
                 const auxTexto = Buffer.from(auxBase64, 'base64').toString('utf-8');
             // const auxTexto= "show running-config\rBuilding configuration...\r\rCurrent configuration : 682 bytes\r!\rversion 12.4\rservice timestamps debug datetime msec\rservice timestamps log datetime msec\rno service password-encryption\r!\rhostname Router\r!\rboot-start-marker\rboot-end-marker\r!\r!\rno aaa new-model\r!\rresource policy\r!\rip subnet-zero\r!\r!\rip cef\r!\r --More-- \b\b\b\b\b\b\b\b\b        \b\b\b\b\b\b\b\b\b!\r!\r!\r!\r!\rinterface FastEthernet0/0\r no ip address\r shutdown\r duplex auto\r speed auto\r!\rinterface FastEthernet0/1\r no ip address\r shutdown\r duplex auto\r speed auto\r!\rinterface Serial0/2/0\r no ip address\r shutdown\r clock rate 2000000\r!\rinterface Serial0/2/1\r --More-- \b\b\b\b\b\b\b\b\b        \b\b\b\b\b\b\b\b\b no ip address\r shutdown\r clock rate 2000000\r!\rip classless\r!\rip http server\r!\r!\rcontrol-plane\r!\r!\rline con 0\rline aux 0\rline vty 0 4\r login\r!\rscheduler allocate 20000 1000\r!\rend\r\rRouter#";
                // Responder con los datos obtenidos
                //    console.log('**-*******-------' + auxTexto);
                // "show running-config\rBuilding configuration...\r\rCurrent configuration : 682 bytes\r!\rversion 12.4\rservice timestamps debug datetime msec\rservice timestamps log datetime msec\rno service password-encryption\r!\rhostname Router\r!\rboot-start-marker\rboot-end-marker\r!\r!\rno aaa new-model\r!\rresource policy\r!\rip subnet-zero\r!\r!\rip cef\r!\r --More-- \b\b\b\b\b\b\b\b\b        \b\b\b\b\b\b\b\b\b!\r!\r!\r!\r!\rinterface FastEthernet0/0\r no ip address\r shutdown\r duplex auto\r speed auto\r!\rinterface FastEthernet0/1\r no ip address\r shutdown\r duplex auto\r speed auto\r!\rinterface Serial0/2/0\r no ip address\r shutdown\r clock rate 2000000\r!\rinterface Serial0/2/1\r --More-- \b\b\b\b\b\b\b\b\b        \b\b\b\b\b\b\b\b\b no ip address\r shutdown\r clock rate 2000000\r!\rip classless\r!\rip http server\r!\r!\rcontrol-plane\r!\r!\rline con 0\rline aux 0\rline vty 0 4\r login\r!\rscheduler allocate 20000 1000\r!\rend\r\rRouter#"
               res.json({ msg: 'OK!', code: 200, info: auxTexto, time: listar.Tiempo });
               // res.json({ msg: 'OK!', code: 200, info: "asda da", time: 3360 });

            } else {
                // Si la respuesta del servidor no es 200
                res.json({ msg: "Error al realizar la solicitud al servidor externo 1", code: response.status, info: [] });
            }
        } catch (error) {
            // Resto del código para manejar errores...
            console.log(error);
            res.json({ msg: "Error al realizar la solicitud al servidor externo", code: 400, error: error, info: [] });
        }
    }

    async modificar(req, res) {
        try {
            
     
        var pract = await entregable.findOne({ where: { external_id: req.body.external } });
        if (pract === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            pract.trabajo = req.body.trabajo;
            if (req.file) {
                if (pract.documentacion) {
                    try {
                        await fs.unlink(path.join(__dirname, '..', 'public', 'archivos', 'practicas', pract.documentacion));
                        //    console.log(path.join(__dirname, '..', 'public', 'archivos', 'practicas', pract.documentacion));
                        pract.documentacion = req.file.filename;
                    } catch (error) {
                        await fs.unlink(path.join(__dirname, '..', 'public', 'archivos', 'practicas', req.file.filename));
                        console.error("Error al eliminar archivo anterior:", error);
                        res.status(400);
                        res.json({
                            msg: "NO SE HAN MODIFICADO SUS DATOS",
                            code: 400
                        });
                    }
                } else {
                    pract.documentacion = req.file.filename;
                }
            }
            pract.external_id = uuid.v4();
            var result = await pract.save();
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
        await fs.unlink(path.join(__dirname, '..', 'public', 'archivos', 'practicas', req.file.filename));
        res.json({ msg: 'Error al obtener al modificar', code: 500 });
    }
    }

    async calificar(req, res) {
        try {
            
        var pract = await entregable.findOne({ where: { external_id: req.body.external_id } });
        console.log(req.body.calificacion);
        if (pract === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            pract.calificacion = req.body.calificacion;
            pract.calificado = true;
            var result = await pract.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HA CALIFICADO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HA CALIFICADO",
                    code: 200
                });
            }
        }
    
} catch (error) {
    res.json({ msg: 'Error al obtener al calificar', code: 500 });
}}
}

module.exports = EntregableController;