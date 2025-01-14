const express = require('express');

const app = express();

app.get('/ICMS', (req, res) => {
    return res.json({ message: 'Hello World' });
});

app.get('/ICMS/api', (req, res) => {
    return res.json({ message: 'Hello API' });
});

function startServer (){
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}

startServer();