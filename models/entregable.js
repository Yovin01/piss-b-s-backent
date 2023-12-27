'use strict'
module.exports = (sequalize, DataTypes) => {
  const entregable = sequalize.define('entregable', {

    external_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    documentacion: {
      type: DataTypes.STRING(70),
    },
    trabajo: {
      type: DataTypes.STRING(65535),
      allowNull: true,
    },
    calificacion: { type: DataTypes.DECIMAL(10,2), defaultValue: null },
    trabajo: {
      type: DataTypes.JSON, allowNull: true,
    },
    calificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    persona: {
      type: DataTypes.STRING(12),
    }
  }, {
    freezeTableName: true
  });
  entregable.associate = function (models) {
    entregable.belongsTo(models.practica, { foreignKey: 'id_practica' });
  }
  return entregable;
}