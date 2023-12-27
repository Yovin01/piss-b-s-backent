'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const periodo = sequelize.define('periodo', {
        anioLectivo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        freezeTableName: true
    });
    periodo.associate = function (models){
        periodo.belongsTo(models.matricula, {foreignKey: 'id_matricula'});
    }
    return periodo;
};