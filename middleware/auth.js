module.exports = function(req,res,next){
    if (!(req.session.isAuthenticatedTeacher || req.session.isAuthenticatedStudent || req.session.isAdmin)) {
        return res.redirect('/login')
    } 

    next()
}