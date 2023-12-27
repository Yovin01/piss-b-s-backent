'use strict'
module.exports = (sequalize, DataTypes) => {
  const practica = sequalize.define('practica', {
    titulo: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    external_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    documentacion: {
      type: DataTypes.STRING(70)
    },
    actividad: {
      type: DataTypes.ENUM('PENDIENTE', 'EN-REVISIOM', 'REVISADO'),
      allowNull: false,
      defaultValue: 'PENDIENTE'
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    freezeTableName: true
  });
  practica.associate = function (models) {
    practica.belongsTo(models.materia, { foreignKey: 'id_materia' });
    practica.hasOne(models.entregable, { foreignKey: 'id_practica', as: 'entregable' });
  }
  return practica;
}