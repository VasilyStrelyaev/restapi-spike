const express = require('express');
const cors  = require('cors');
const users = require('../data/users.json');
const posts = require('../data/posts.json');
const reactions = require('../data/reactions.json');

const app = express();
const PORT = 3005;

app.use(cors());

app.use('/users', (req, res)=> {
    res.json(users);
});

app.use('/user/:userId/posts', (req, res)=> {
    res.json(posts.filter(post => post.AuthorID === req.params.userId));
});

app.use('/user/:userId/reactions', (req, res)=> {
    res.json(reactions.filter(reaction => reaction.AuthorID === req.params.userId));
});

app.listen(PORT, err => {
    err ? console.log(err) : console.log('server started!')
})