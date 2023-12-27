'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const cursa = sequelize.define('cursa', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    }, {
        freezeTableName: true
    });

    cursa.associate = function (models){
        cursa.belongsTo(models.materia, {foreignKey: 'id_materia'});
        cursa.belongsTo(models.matricula, {foreignKey: 'id_matricula'});
    }
    return cursa;
};
