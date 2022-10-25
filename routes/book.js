var express = require('express');
var router = express.Router();
const DownloadBook = require('../featruens/download_book')
/* GET home page. */
router.get('/download', async function (req, res) {
    const url = req.query.url
    const results = await DownloadBook(url)
    res.send(results)
});



router.get('/downloadBook', async function (req, res) {
    const id = req.query.id
    res.download(`${process.cwd()}/public/book/${id}.txt`)
});

module.exports = router;