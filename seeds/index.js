const mongoose = require('mongoose');
const seedData = require('./tickets');

const Ticket = require('../models/ticket');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/ticket_tracker');
}

const seedDB = async() => {
    await Ticket.deleteMany({});
    for (let data of seedData) {
        const ticket = new Ticket(data);
        await ticket.save();
    }
}

seedDB().then(()=> {
    mongoose.connection.close();
})