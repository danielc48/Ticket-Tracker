const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Ticket = require('./models/ticket');
const tickets = require('./seeds/tickets');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/ticket_tracker');
}

const app = express();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req,res) => {
    res.send('AT THE HOME PAGE')
})

app.get('/tickets', async (req,res) => {
  const tickets = await Ticket.find({});
  res.render('tickets/index', {tickets})
})

app.get('/tickets/new', (req,res) => {
  res.render('tickets/new')
})

app.post('/tickets', async (req,res) => {
  const ticket = new Ticket(req.body.ticket)
  await ticket.save();
  res.redirect('/tickets')
})

app.get('/tickets/:id', async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  res.render('tickets/show', {ticket})
})

app.get('/tickets/:id/edit', async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  res.render('tickets/edit', {ticket})
})

app.put('/tickets/:id', async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findByIdAndUpdate(id, {...req.body.ticket})
  res.redirect(`/tickets/${ticket.id}`)
})

app.delete('/tickets/:id', async (req,res) => {
  const { id } = req.params
  await Ticket.findByIdAndDelete(id);
  res.redirect('/tickets')
})



app.listen(3000, () => {
    console.log('Listening on port 3000!')
})