import { DataTypes, Model, Sequelize } from "sequelize";
import sequelizeInstance from "./index";

class User extends Model {
  public id!: string;
  public username!: string;
  public image!: string;
  public email!: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: DataTypes.STRING,
    image: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  {
    sequelize: sequelizeInstance,
    modelName: "user",
    tableName: "user",
  }
);

export default User;
