import { DataTypes, Model, Sequelize } from "sequelize";
import sequelizeInstance from "./index";
import User from "./user";

class Auth extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public unique_id_key!: string;
  public refreshToken!: string;
}

Auth.init(
  {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    unique_id_key: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
  },
  {
    sequelize: sequelizeInstance,
    modelName: "auth",
    tableName: "auths",
  }
);

Auth.hasOne(User, {
  foreignKey: "id",
  sourceKey: "unique_id_key",
  as: "user", // Alias for the associated user
});

User.belongsTo(Auth, {
  foreignKey: "id",
  targetKey: "unique_id_key",
  as: "auth", // Alias for the associated auth
});

export default Auth;
