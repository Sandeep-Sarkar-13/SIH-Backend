const express=require("express")
const app=express();
const authRoutes = require('./routes/userauth');
const farmerRoutes = require('./routes/usercrud');
const pesticideRoutes = require('./routes/pesticideRoutes');
const nutrientsRoutes =require('./routes/nutrientsroute.js');


require("dotenv").config();
require("./connection/conn.js")
const cors = require('cors');
app.use(express.json());
//creating the port of the app
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/nutrients', nutrientsRoutes);

app.use('/api/farmers', farmerRoutes);
app.use('/api/pesticides', pesticideRoutes);
app.listen(process.env.PORT,()=>{
    console.log(`SERVER STARTED at port ${process.env.PORT}`)
})