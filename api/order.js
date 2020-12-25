const router = require('express').Router();

router.get('/place', async function (req, res) {
    let response = {};

    //more logic here

    return res.send(response);
});

module.exports = router;