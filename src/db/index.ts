import mongoose from 'mongoose';
import chalk from 'chalk';

export const connect = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(chalk.bold.underline.blue(`Mongo DB connected ${conn.connection.host}`));
  return;
};

export default { connect };
