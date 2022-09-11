const mongoose = require('mongoose')
const Comment = require('./comment')
const Schema = mongoose.Schema;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/ticket_tracker');
}

const ticketSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reproduceBug: {
        type: String,
        required: true,
    },
    status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open'
        },
    classification: {
            type: String,
            enum: ['unclassified', 'approved', 'unapproved', 'duplicate'],
            default: 'unclassified'
        },
        date: {
            type: Date,
            default: Date.now
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ]
})

ticketSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Ticket', ticketSchema)