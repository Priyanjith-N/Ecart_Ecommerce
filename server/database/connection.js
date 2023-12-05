const mongodb = require('mongoose');

const connectDB = async (req, res) => {
    try {
        const con = await mongodb.connect(process.env.MONGO_URL);

        console.log(`Server connected to host ${con.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;