const express = require('express');
const router = express.Router({mergeParams: true});

const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const { commentSchema } = require('../schemas')
const Comment = require('../models/comment')
const Ticket = require('../models/ticket')

const validateComment = (req,res,next) => {
    const {error} = commentSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(400,msg);
    } else {
      next();
    }
  }

router.post('/', validateComment, catchAsync(async(req,res) => {
  const {id} = req.params
  const ticket = await Ticket.findById(id);
  const comment = new Comment(req.body.comment);
  ticket.comments.push(comment);
  await comment.save();
  await ticket.save();
  res.redirect(`/tickets/${id}`);
}))

router.delete('/:commentId', async(req,res) => {
  const {id, commentId} = req.params;
  await Ticket.findByIdAndUpdate(id, {$pull: {comments: commentId}});
  await Comment.findByIdAndDelete(commentId);
  res.redirect(`/tickets/${id}`)
})

module.exports = router;