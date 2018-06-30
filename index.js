const express = require('express');
const { join } = require('path');

const app = express();
const PORT = 8080;
const DIST_FOLDER = join(process.cwd(),'dist/');

app.get("*.*", express.static(DIST_FOLDER));

app.get('/', (req,res) => {
    res.sendFile(join(DIST_FOLDER, 'index.html'))
});

app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`)
});