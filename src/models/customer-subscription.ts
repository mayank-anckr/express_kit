import { DataTypes, Model } from "sequelize";
import sequelizeInstance from "./index";
import Auth from "./subscription";
import Subscriptions from "./subscription";

class CustomerSubscription extends Model {
  public id!: number;
  public display_name!: string;
  public email!: string;
}

CustomerSubscription.init(
  {
    customer_id: { type: DataTypes.STRING, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Auth,
        key: "unique_id_key",
      },
    },
    subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Subscriptions,
        key: "id",
      },
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "customer-subscriptions",
  }
);

Auth.hasMany(CustomerSubscription, { foreignKey: "user_id" });
CustomerSubscription.belongsTo(Auth, { foreignKey: "unique_id_key" });

Subscriptions.hasMany(CustomerSubscription, { foreignKey: "subscription_id" });
CustomerSubscription.belongsTo(Subscriptions, {
  foreignKey: "id",
});

export default CustomerSubscription;
