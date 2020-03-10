exports.authMiddleware = function(req,res,next) {
    if (!req.session.isAuth) {
        return res.redirect('/login')
    } 
    next()
}

exports.authNotMiddleware = function(req,res,next) {
    if (req.session.isAuth) {
        return res.redirect('/')
    } 
    next()
}