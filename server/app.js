const express = require('express');
const cors  = require('cors');
const contacts = require('../data/contacts.json');
const tasks = require('../data/tasks.json');
const messages = require('../data/messages.json');

const app = express();
const PORT = 3005;

const messagesByUser = messages.reduce((hash, message) => {
    const userMessages = hash[message.contactId];

    if (userMessages)
        userMessages.push(message);
    else
        hash[message.contactId] = [message];

    return hash;
}, {});

const tasksByUser = tasks.reduce((hash, task) => {
    const userTasks = hash[task.contactId];

    if (userTasks)
        userTasks.push(task);
    else
        hash[task.contactId] = [task];

    return hash;
}, {});

app.use(cors());

app.use('/contacts', (req, res)=> {
    res.json(contacts);
});

app.use('/contact/:contactId/tasks', (req, res)=> {
    res.json(tasksByUser[req.params.contactId] || []);
});

app.use('/contact/:contactId/messages', (req, res)=> {
    res.json(messagesByUser[req.params.contactId] || []);
});

app.listen(PORT, err => {
    err ? console.log(err) : console.log('server started!')
})