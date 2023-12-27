var express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const PersonaController = require('../controls/PersonaController');
var personaController = new PersonaController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const PracticaController = require('../controls/PracticaController');
var practicaController = new PracticaController();
let jwt = require('jsonwebtoken');
const EntregableController = require('../controls/EntregableController');
var entregableController = new EntregableController();
const MateriaContoller = require('../controls/MateriaController');
var materiaContoller = new MateriaContoller();
const MatriculaController = require('../controls/MatriculaController');
var matriculaController = new MatriculaController();

const storage_archivo = (dir) => multer.diskStorage({
  destination: path.join(__dirname,'../public/archivos'+dir),
  filename: (req, file, cb) => {
    const partes = file.originalname.split('.');
    const extension = partes[partes.length - 1];
    cb(null, uuid.v4()+"."+extension);
  }
 
});

const extensiones_aceptadas_archivo = (req, file, cb) => {
  const allowedExtensions = ['.pdf','.docx', '.xlsx'];
  const ext = path.extname(file.originalname);
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOCX y XLSX.'));
  }
};

const upload_archivo_practica = multer({ storage: storage_archivo('/practicas'), limits: {
  fileSize: 2 * 1024 * 1024 // 2 MB en bytes
},fileFilter: extensiones_aceptadas_archivo});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  //console.log(req.headers);
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no valido!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
        if (aux) {
          next();
        } else {
          res.status(401);
          res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

//Usar este para modulos de admin
var authAdmin = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  console.log(token);
  
  if (token) {
    
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no validoo!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        if (decoded.rol_nombre == "admin") {
          let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
          if (aux) {
            next();
          } else {
            res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
          }
        } else {
          
          res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ "version": "1.0", "name": "pis-grupo-c-backend" });
});
//Sesion
router.post('/sesion', [
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave valido').exists().not().isEmpty(),
], cuentaController.sesion)

//Get rol
router.get('/rol/listar', rolController.listar);

//Post rol
router.post('/rol/guardar', rolController.guardar);


//Get persona
router.get('/personas', auth, personaController.listar);
router.get('/personas/obtener/:external', personaController.obtener);
router.get('/personas/obtener/iden/:iden', personaController.obtenerExt);
router.get('/persons/obtener/nomatriculado',auth, matriculaController.listarNoMatriculadas);

//post persona
router.post('/personas/guardar',authAdmin , [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardar);
router.post('/personas/modificar', auth ,personaController.modificar);



//get cuenta



//post cuenta


//get practica
router.get('/practicas', auth, practicaController.listar);
router.get('/practicas/obtener/:external',auth, practicaController.obtener);
router.get('/practicas/materia/:external', auth,practicaController.obtenerTodas);
router.get('/practicas/eliminar/:external',auth , practicaController.eliminar);
router.get('/document/:ruta',practicaController.practicaDoc);
//post practicat(
router.post('/pracicas/modificar', auth,upload_archivo_practica.single('file'), practicaController.modificar);
router.post('/practicas/guardar', auth,upload_archivo_practica.single('file'), practicaController.guardar);
//get entregable
router.get('/entregable/listar', auth,entregableController.listar);
router.get('/entregable/:id/:identi', auth,entregableController.obtenerExter);
router.get('/entregabl/obtenerP/:external_id',auth, entregableController.obtenerDEPreac);
//post entregable
router.post('/entregable/guardar', auth,upload_archivo_practica.single('file'), entregableController.guardar);
router.post('/entregable/modificar',auth ,upload_archivo_practica.single('file'), entregableController.modificar);
router.post('/entregable/calificar', auth,entregableController.calificar);
router.get('/codigos/:comando', auth,entregableController.listarCodigos);
//Materia
router.post('/materia/guardar', auth,materiaContoller.guardar);
router.post('/materia/modificar', authAdmin,materiaContoller.modificar);
router.get('/materia/listar', auth,materiaContoller.listar);
router.get('/materia/obtener/:external',auth, materiaContoller.obtener);
router.get('/materia/participantes/:external_materia',auth,materiaContoller.participantes); 
router.get('/materia/cursa/:external_estudiante',auth,materiaContoller.materias); 


//usar para modulos de Materia
//router.get('/materia/listar', materiaContoller.listar);
//router.post('/materia/guardar', materiaContoller.guardar);

//usar para modulos de Matricula
router.post('/matricula/guardar', matriculaController.guardar);
router.get('/matricula/obtener/persona/:external_persona', matriculaController.obtenerPorPersona);
router.post('/matricula/asignar/curso/',auth, matriculaController.AsignarCurso);




module.exports = router;
