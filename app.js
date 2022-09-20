const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')


const tickets = require('./routes/tickets')
const comments = require('./routes/comments')

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/ticket_tracker');
}

const app = express();

app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7
  }
}

app.use(session(sessionConfig))
app.use(flash())

app.use((req,res,next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next();
})

app.use('/tickets', tickets)
app.use('/tickets/:id/comments', comments)

app.get('/', (req,res) => {
    res.render('tickets/home')
})

app.all('*', (req,res,next) => {
  next(new ExpressError(404, 'Page Not Found'))
})

app.use((err,req,res,next) => {
  const {statusCode = 500} = err;
  if(!err.message) err.message = 'Oh No, something went wrong!'
  res.status(statusCode).render('error', {err})
})

app.listen(3000, () => {
    console.log('Listening on port 3000!')
})