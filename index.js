//imports
require('dotenv').config();
const express=require('express')
const app=express();
const cors=require('cors')
const authRoutes=require('./routes/auth')
const adminRoutes=require('./routes/adminauth')
const itemsRoutes=require('./routes/items')
const cartsRoutes=require('./routes/carts')
const pagesRoutes=require('./routes/pages')
const reviewsRoutes=require('./routes/reviews')
const adminStatsRoutes=require('./routes/adminstats')
const contactRoutes=require('./routes/contact')
const purchaseRoutes=require('./routes/purchase')
const path = require('path');
const connection=require('./connection/connection')

//middlewares
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ extended: true, limit: "25mb" }))
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//routes
app.use('/api/auth',authRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/items',itemsRoutes)
app.use('/api/carts',cartsRoutes)
app.use('/api/pages',pagesRoutes)
app.use('/api/reviews',reviewsRoutes)
app.use('/api/dashboard',adminStatsRoutes)
app.use('/api/contact',contactRoutes)
app.use('/api/purchase',purchaseRoutes)


connection



app.listen(process.env.PORT,()=>{
    console.log(`Listening to ${process.env.PORT}`)
})