const randomize         = require('randomatic');
const path              = require('path');
const express           = require('express');
const router            = express.Router();
const StudentHelper     = require('../helpers/StudentHelper');

router.get('/', (req, res) => {
    return res.sendFile(path.resolve('views/index.html'));
});

router.post('/api/calculate', (req, res) => {
    let student = req.body;

    if (student.name === undefined) {
        return res.send({
            error: 'Specify student name'
        })
    }

    let formula = student.formula || '[0.20 * assignment + 0.25 * exam + 0.25 * paper]';

    if (StudentHelper.isDumb(student.name) || !StudentHelper.hasPassed(student, formula)) {
        return res.send({
            'pass': 'n' + randomize('?', 10, {chars: 'o0'}) + 'pe'
        });
    }

    return res.send({
        'pass': 'Passed'
    });
});

module.exports = router;