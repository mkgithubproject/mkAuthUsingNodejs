const mongoose=require('mongoose')
//mongoose.connect(`mongodb://localhost/${process.env.db}` || process.env.MONGODB_URI);
mongoose.connect(process.env.DB_URI || `mongodb://localhost/${process.env.db}`);
const db=mongoose.connection;
db.on('error',console.error.bind(console,"Error connecting to MongoDB"));
db.once('open',function(){
    console.log('Connected to Database:: MongoDB');
});
module.exports=db;
