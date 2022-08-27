const mongoose = require('mongoose')
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
        }
})

module.exports = mongoose.model('Ticket', ticketSchema)