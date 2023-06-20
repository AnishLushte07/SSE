const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const client = [];
const feedUser = {};

app.get('/', (req, res) => {
    res.send('Use /sse endpoint for http sse demo')
});

app.get('/setLike', (req, res) => {
    const { feedId } = req.query;

    setLike(feedId);

    return res.send('hi');
})

app.get('/sse', sseHandler);

function setLike(feedId) {
    try {
        console.log(feedId, feedUser[feedId])
        const userIds = feedUser[feedId];

        userIds.forEach(user => {
            console.log(client[0])
            client[0].write(`data: Feed id liked: ${feedId}\n\n`);
        });
    } catch (err) {
        console.error(err);
    }
}

function sseHandler(req, res) {
    const headers = {
        'Content-type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-control': 'no-cache'
    };

    res.writeHead(200, headers);

    const { userId, feedId } = req.query;

    res.write(`data: Watching feed id: ${feedId}\n\n`);

    if (feedUser[feedId]) {
        feedUser[feedId].push(userId);
    } else {
        feedUser[feedId] = [userId]
    }

    client.push(res);

    req.on('close', () => {
        console.log(`deleting ${userId} ${feedId}`)
        delete client[userId];
        feedUser[feedId] = feedUser[feedId].filter(v => v !== userId)
    })
}

app.listen(4000, () => console.log('server started on 4000'))