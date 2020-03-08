const User = require('../models/user')

module.exports = async function(req,res,next){
    if ((await User.findById(req.session.userId)).role !== 'teacher') {
        return res.redirect('/')
    }
    next()
}