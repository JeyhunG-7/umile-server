const router = require('express').Router();
const password = require('../models/Authentication').passport;

router.get('/test', password.authenticate('jwt', { session: false, failureRedirect: "/" }), async function (req, res) {
    return res.send("hello");
});

router.post('/login', password.authenticate('local', { session: false, failureRedirect: "/login" }), async function (req, res) {
    return res.send(req.user.token);
});

module.exports = router;