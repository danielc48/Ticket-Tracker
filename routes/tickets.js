const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');
const { ticketSchema} = require('../schemas')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')

const validateTicket = (req,res,next) => {
    const {error} = ticketSchema.validate(req.body)
    if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(400,msg)
    } else {
      next()
    }
  }

router.get('/', catchAsync(async (req,res) => {
  const tickets = await Ticket.find({});
  res.render('tickets/index', {tickets})
}))

router.get('/new', (req,res) => {
  res.render('tickets/new')
})

router.post('/', validateTicket, catchAsync(async (req,res) => {
    // if(!req.body.ticket) throw new ExpressError(400, 'Invalid Ticket Data')
    const ticket = new Ticket(req.body.ticket)
    await ticket.save();
    res.redirect('/tickets')
}))

router.get('/:id', catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id).populate('comments');
  res.render('tickets/show', {ticket})
}))

router.get('/:id/edit', catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  res.render('tickets/edit', {ticket})
}))

router.put('/:id', validateTicket, catchAsync(async (req,res) => {
  const { id } = req.params;
  const ticket = await Ticket.findByIdAndUpdate(id, {...req.body.ticket})
  res.redirect(`/tickets/${ticket.id}`)
}))

router.delete('/:id', catchAsync(async (req,res) => {
  const { id } = req.params
  await Ticket.findByIdAndDelete(id);
  res.redirect('/tickets')
}))

module.exports = router;