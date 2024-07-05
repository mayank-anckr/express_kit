import { DataTypes, Model } from "sequelize";
import sequelizeInstance from "./index";
import Auth from "./auth";

class Subscriptions extends Model {
  public id!: number;
  public display_name!: string;
  public email!: string;
}

Subscriptions.init(
  {
    price_id: { type: DataTypes.STRING, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Auth,
        key: "unique_id_key",
      },
    },
    status: { type: DataTypes.ENUM, allowNull: true, defaultValue: null },
    cancel_at_period_end: { type: DataTypes.BOOLEAN, allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: true },
    interval: { type: DataTypes.STRING, allowNull: true },
    interval_count: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "subscriptions",
  }
);

Auth.hasMany(Subscriptions, { foreignKey: "user_id" });
Subscriptions.belongsTo(Auth, { foreignKey: "unique_id_key" });

export default Subscriptions;
