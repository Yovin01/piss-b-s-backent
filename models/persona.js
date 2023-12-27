'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        nombres: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        identificacion: {type: DataTypes.STRING(15), unique: true},
        tipo_identificacion: {type: DataTypes.ENUM("CEDULA", "PASAPORTE", "RUC"), defaultValue: "CEDULA"},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        direccion: {type: DataTypes.STRING(255), defaultValue: "NO_DATA"},

        estado:{type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        freezeTableName: true
    });
    persona.associate = function (models){
        persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: 'cuenta'});
        persona.hasMany(models.controlAcces, {foreignKey: 'id_persona', as: 'controlAcces'});
        persona.hasOne(models.persona_rol, {foreignKey: 'id_persona', as: 'persona_rol'});
    }
    return persona;
};