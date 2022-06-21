import mongoose from "mongoose";

const connect = async () => {
  const connect = await mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(
    `Connection to database established with`,
    connect.connection.host
  );
};

export default { connect };
