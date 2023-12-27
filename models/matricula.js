'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const matricula = sequelize.define('matricula', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });

    matricula.associate = function (models){
        matricula.belongsTo(models.persona, {foreignKey: 'id_persona'});
        matricula.hasOne(models.periodo, { foreignKey: 'id_matricula', as: 'periodo'});
        matricula.hasMany(models.cursa, { foreignKey: 'id_matricula', as: 'cursa'});
    }
    return matricula;
};