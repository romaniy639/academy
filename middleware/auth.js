module.exports = function(req,res,next){
    if (!(req.session.isAuthenticatedTeacher || req.session.isAuthenticatedStudent)) {
        return res.redirect('/login')
    } 

    next()
}