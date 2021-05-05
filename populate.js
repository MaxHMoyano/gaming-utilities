const { connect, Schema, model } = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  const conn = await connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(chalk.bold.underline.blue(`Mongo DB connected ${conn.connection.host}`));

  const RolSchema = new Schema({
    _id: { type: String, required: [true, 'El id es obligatorio'] },
    name: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    displayName: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    icon: { type: String, required: [true, 'El icono del rol es obligatorio'] },
  });

  const Rol = model('Roles', RolSchema);
  await Rol.deleteMany({});
  await Rol.create([
    {
      _id: '701194597996429403',
      name: 'Counter Strike: Global Offensive',
      icon: 'csgo',
      displayName: 'Counter Strike Squaddies',
    },
    {
      _id: '838112805646237717',
      name: 'Factorio',
      icon: 'factorio',
      displayName: 'FactoryLovers',
    },
    {
      _id: '724940911783444561',
      name: 'League of Legends',
      icon: 'lol',
      displayName: 'LoL Champions',
    },
    {
      _id: '808143127399497728',
      name: 'Hunt: Showdown',
      icon: 'hunt',
      displayName: 'Cazanovas',
    },
    {
      _id: '826293539742416928',
      name: 'Hearts of Iron IV',
      icon: 'hoi',
      displayName: 'Hearts of Hoi',
    },
  ]);
  console.log('Database populated');
  return;
};

connectDB();
