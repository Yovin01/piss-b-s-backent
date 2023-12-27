'use strict';
const models = require('../models/');
var practica = models.practica;
const path = require('path');
const entregable = require('../models/entregable');
const fs = require('fs/promises');
class PracticaController {
    //comnte aqui
    // eliminar pract
    async eliminar(req, res) {
        const external = req.params.external;
        try {
            const pract = await practica.findOne({
                where: { external_id: external }
            });
            const ebtre = await models.entregable.findAll({
                where: { id_practica: pract.id }
            });
            console.log(pract.id);
            console.log(ebtre);
            console.log(pract);
            if (ebtre.length === 0) {
              //  console.error(error);
                if (pract) {
                    await pract.destroy();
                    res.status(200).json({
                        msg: "La práctica ha sido eliminada correctamente",
                        code: 200
                    });
                } else {
                    res.status(404).json({
                        msg: "No se encontró la práctica",
                        code: 404
                    });
                }
            } else {
                res.status(400).json({code: 400,msg: 'Error al eliminar la práctica' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ code: 500,msg: 'Error al eliminar la práctica' });
        }
    }

    //listar todas las practicas disponibles

    async listar(req, res) {
        var lista = await practica.findAll({
            attributes: ['titulo', 'descripcion', 'actividad', 'external_id', 'fechaFin']
        });
        res.json({ msg: "OK!", code: 200, info: lista });
    }

    //listar todas las practicas que esten asociadas con el usuario (Necesaria relacion con)

    //crear y guardar una practica nueva en la base de datos
    async guardar(req, res) {
        try {
    
        let transaction = await models.sequelize.transaction();
        const pract = await models.materia.findOne({
            where: { external_id: req.body.external_id }
        });
        try {
            if (pract=== null) {
                res.json({
                    msg: "No se ha encontrado la amteria",
                    code: 400
                });
            }else{
            console.log(req);
            const data = {
                "titulo": req.body.titulo,
                "descripcion": req.body.descripcion,
                "actividad": req.body.actividad,
                "fechaFin": req.body.fechaFin,
                "documentacion": null,
                "id_materia": pract.id
            }
            if (req.file) {
                data.documentacion = req.file.filename;
            }
            await practica.create(data, transaction);
            await transaction.commit();
            res.json({
                msg: "SE HAN REGISTRADO SUS DATOS",
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
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener al guardar', code: 500 });
    }
    }
    //modificar practica
    async modificar(req, res) {
        try {
         
        var pract = await practica.findOne({ where: { external_id: req.body.external } });
        if (pract === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            
            var uuid = require('uuid');
            pract.titulo = req.body.titulo;
            pract.descripcion = req.body.descripcion;
            pract.fechaFin = req.body.fechaFin;
            pract.actividad = req.body.actividad;
            if (req.file) {
                
                if (pract.documentacion !== null) {
                    console.log(pract.documentacion);
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
                    //console.log('dat');
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
        res.status(500).json({ msg: 'Error  al modificar', code: 500 });
    }
    }
    //eliminar logicamente una practica

    //obtener via external_id
    async obtener(req, res) {
        try {
        const external = req.params.external;
        console.log(external);
        try {
            var lista = await practica.findOne({
                where: { external_id: external },
                attributes: ['titulo', 'descripcion', 'documentacion', 'external_id', 'fechafin', 'id']
            });
            console.log(lista);
            if (lista == null) {
                res.status(400);
                res.json({ msg: "No fount", code: 400, info: [] });
            }
            res.status(200);
            res.json({ msg: "OK!", code: 200, info: lista });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener la practica solicitada' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener al obtener', code: 500 });
    }
    }
    async obtenerTodas(req, res) {
        try {
        const external = req.params.external;
        var mat = await models.materia.findOne({ where: { external_id: external } });
        console.log(external);
        if (mat) {
            try {
                var lista = await practica.findAll({
                    where: { id_materia: mat.id },
                    attributes: ['titulo', 'descripcion', 'documentacion', 'external_id', 'fechafin', 'id', 'id_materia']
                });
                console.log(lista);
                if (lista == null) {
                    res.status(400);
                    res.json({ msg: "No fount", code: 400, info: [] });
                }
                res.status(200);
                res.json({ msg: "OK!", code: 200, info: lista });
            } catch (error) {
                console.error(error);
                res.status(500).json({ msg: 'Error al obtener la practica solicitada' });
            }
        } else {
           // console.error(error);
            res.status(400).json({ msg: 'Materia no encontrada' });
        }} catch (error) {
            res.status(500).json({ msg: 'Error al obtener al obtener', code: 500 });
        }

    }

    async practicaDoc(req, res) {
        try {
            const nombreImagen = req.params.ruta;
            const imagePath = path.join(__dirname, '..', 'public', 'archivos', 'practicas', nombreImagen);
            //  const imagePath = __dirname  , '..', 'public', 'imagen',  + nombreImagen; // Ajusta la ruta según tu estructura de carpetas
            console.log(imagePath);
            res.status(200);
            res.sendFile(imagePath);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener lo solicitado' });
        }
    }
}

module.exports = PracticaController;