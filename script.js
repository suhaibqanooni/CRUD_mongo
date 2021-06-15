const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const faculties = require('./routes/faculty')
const app = express();
const bodyparser =require('body-parser');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const MONGODB_URL = "mongodb+srv://suhaibqanooni:humtum804@students.7tcmb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URL || 'mongodb://localhost/faculty',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('connect to MongoDB'))
    .catch(err => console.error('Could not Connect to MongoDB...'));

app.use(bodyparser.urlencoded({
    extended: true
}))
app.use(bodyparser.json());

app.set('views', path.join(__dirname,'/views/'));
app.engine('hbs',exphbs({extname: 'hbs', defaultLayout: 'mainLayout',handlebars: allowInsecurePrototypeAccess(Handlebars),layoutsDir: __dirname + '/views/layouts/'}))
app.set('view engine', 'hbs');

app.use(express.json());
app.use('/api/faculty', faculties);

const port = process.env.PORT || 3000;
app.listen(port,()=> console.log(`listening on port ${port}...`));