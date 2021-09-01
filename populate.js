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
    displayName: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    icon: { type: String, required: [true, 'El icono del rol es obligatorio'] },
  });

  const Rol = model('Roles', RolSchema);
  await Rol.deleteMany({});
  await Rol.create([
    {
      _id: '701194597996429403',
      displayName: 'Counter Strike: Global Offensive',
      icon: 'csgo',
    },
    {
      _id: '838112805646237717',
      displayName: 'Factorio',
      icon: 'factorio',
    },
    {
      _id: '724940911783444561',
      displayName: 'League of Legends',
      icon: 'lol',
    },
    {
      _id: '808143127399497728',
      displayName: 'Hunt: Showdown',
      icon: 'hunt',
    },
    {
      _id: '826293539742416928',
      displayName: 'Hearts of Iron IV',
      icon: 'hoi',
    },
    {
      _id: '759234328525275187',
      displayName: 'Dragon Ball: FighterZ',
      icon: 'fighterZ',
    },
    {
      _id: '815304218998341643',
      displayName: 'Tabletop Simulator',
      icon: 'tabletop',
    },
    {
      _id: '723336271841460304',
      displayName: 'Euro Truck Simulator',
      icon: 'euroTruck',
    },
    {
      _id: '719686957889748993',
      displayName: "Sid Meier's Civilization",
      icon: 'civilization',
    },
    {
      _id: '575141298386894889',
      displayName: 'Star Wars: Battlefront 2',
      icon: 'starwars',
    },
    {
      _id: '719687372887031851',
      displayName: 'Fallout',
      icon: 'fallout',
    },
    {
      _id: '753383614963646614',
      displayName: 'Risk of Rain 2',
      icon: 'riskOfRain',
    },
    {
      _id: '724941063302807554',
      displayName: 'Smite',
      icon: 'smite',
    },
    {
      _id: '763630163191660545',
      displayName: 'Rocket League',
      icon: 'rocketLeague',
    },
    {
      _id: '762459028801847297',
      displayName: 'Genshin Impact',
      icon: 'genshin',
    },
    {
      _id: '719730036520779818',
      displayName: 'Jackbox',
      icon: 'jackbox',
    },
  ]);
  console.log('Database populated');
  return;
};

connectDB();
