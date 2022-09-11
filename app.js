const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Ticket = require('./models/ticket');
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const { ticketSchema, commentSchema } = require('./schemas')
const Comment = require('./models/comment')

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

const validateTicket = (req,res,next) => {
  const {error} = ticketSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400,msg)
  } else {
    next()
  }
}

const validateComment = (req,res,next) => {
  const {error} = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400,msg);
  } else {
    next();
  }
}

app.get('/', (req,res) => {
    res.render('tickets/home')
})

app.get('/tickets', catchAsync(async (req,res) => {
  const tickets = await Ticket.find({});
  res.render('tickets/index', {tickets})
}))

app.get('/tickets/new', (req,res) => {
  res.render('tickets/new')
})

app.post('/tickets', validateTicket, catchAsync(async (req,res) => {
    // if(!req.body.ticket) throw new ExpressError(400, 'Invalid Ticket Data')
    const ticket = new Ticket(req.body.ticket)
    await ticket.save();
    res.redirect('/tickets')
}))

app.get('/tickets/:id', catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id).populate('comments');
  res.render('tickets/show', {ticket})
}))

app.get('/tickets/:id/edit', catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  res.render('tickets/edit', {ticket})
}))

app.put('/tickets/:id', validateTicket, catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findByIdAndUpdate(id, {...req.body.ticket})
  res.redirect(`/tickets/${ticket.id}`)
}))

app.delete('/tickets/:id', catchAsync(async (req,res) => {
  const { id } = req.params
  await Ticket.findByIdAndDelete(id);
  res.redirect('/tickets')
}))

app.post('/tickets/:id/comments', validateComment, catchAsync(async(req,res) => {
  const {id} = req.params
  const ticket = await Ticket.findById(id);
  const comment = new Comment(req.body.comment);
  ticket.comments.push(comment);
  await comment.save();
  await ticket.save();
  res.redirect(`/tickets/${id}`);
}))

app.delete('/tickets/:id/comments/:commentId', async(req,res) => {
  const {id, commentId} = req.params;
  await Ticket.findByIdAndUpdate(id, {$pull: {comments: commentId}});
  await Comment.findByIdAndDelete(commentId);
  res.redirect(`/tickets/${id}`)
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