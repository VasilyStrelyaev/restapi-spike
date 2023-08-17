const express = require('express');
const cors  = require('cors');
const users = require('../data/users.json');
const posts = require('../data/posts.json');
const reactions = require('../data/reactions.json');

const app = express();
const PORT = 3005;

const reactionsByUser = reactions.reduce((hash, reaction) => {
    const userReactions = hash[reaction.AuthorID];

    if (userReactions)
        userReactions.push(reaction);
    else
        hash[reaction.AuthorID] = [reaction];

    return hash;
}, {});

const postsByUser = posts.reduce((hash, post) => {
    const userPosts = hash[post.AuthorID];

    if (userPosts)
        userPosts.push(post);
    else
        hash[post.AuthorID] = [post];

    return hash;
}, {});

app.use(cors());

app.use('/users', (req, res)=> {
    res.json(users);
});

app.use('/user/:userId/posts', (req, res)=> {
    res.json(postsByUser[req.params.userId]);
});

app.use('/user/:userId/reactions', (req, res)=> {
    res.json(reactionsByUser[req.params.userId]);
});

app.listen(PORT, err => {
    err ? console.log(err) : console.log('server started!')
})