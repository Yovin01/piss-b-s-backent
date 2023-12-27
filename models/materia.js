'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const materia = sequelize.define('materia', {
        nombre: {type: DataTypes.STRING(100), allowNull: false},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        freezeTableName: true
    });

    materia.associate = function (models){
        materia.hasMany(models.cursa, {foreignKey: 'id_materia', as: 'cursa'});
        materia.hasMany(models.practica,{foreignKey:'id_materia', as:'practica'});
    }

    return materia;
};