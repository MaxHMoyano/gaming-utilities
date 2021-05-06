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
    icon: { type: String, required: [true, 'El icono del rol es obligatorio'] },
  });

  const Rol = model('Roles', RolSchema);
  await Rol.deleteMany({});
  await Rol.create([
    {
      _id: '701194597996429403',
      name: 'Counter Strike: Global Offensive',
      icon: 'csgo',
    },
    {
      _id: '838112805646237717',
      name: 'Factorio',
      icon: 'factorio',
    },
    {
      _id: '724940911783444561',
      name: 'League of Legends',
      icon: 'lol',
    },
    {
      _id: '808143127399497728',
      name: 'Hunt: Showdown',
      icon: 'hunt',
    },
    {
      _id: '826293539742416928',
      name: 'Hearts of Iron IV',
      icon: 'hoi',
    },
    {
      _id: '759234328525275187',
      name: 'Dragon Ball: FighterZ',
      icon: 'fighterZ',
    },
    {
      _id: '815304218998341643',
      name: 'Tabletop Simulator',
      icon: 'tabletop',
    },
    {
      _id: '723336271841460304',
      name: 'Euro Truck Simulator',
      icon: 'euroTruck',
    },
    {
      _id: '719686957889748993',
      name: "Sid Meier's Civilization",
      icon: 'civilization',
    },
    {
      _id: '575141298386894889',
      name: 'Star Wars: Battlefront 2',
      icon: 'starwars',
    },
    {
      _id: '719687372887031851',
      name: 'Fallout',
      icon: 'fallout',
    },
    {
      _id: '753383614963646614',
      name: 'Risk of Rain 2',
      icon: 'riskOfRain',
    },
    {
      _id: '724941063302807554',
      name: 'Smite',
      icon: 'smite',
    },
    {
      _id: '763630163191660545',
      name: 'Rocket League',
      icon: 'rocketLeague',
    },
    {
      _id: '762459028801847297',
      name: 'Genshin Impact',
      icon: 'genshin',
    },
    {
      _id: '719730036520779818',
      name: 'Jackbox',
      icon: 'jackbox',
    },
  ]);
  console.log('Database populated');
  return;
};

connectDB();
