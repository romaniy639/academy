const jwt = require("jsonwebtoken")
const keys = require('../keys/index')
const User = require('../models/user')



exports.tokenMiddleware = async function(req,res,next) {
    const token = req.header('authToken') ? req.header('authToken') : req.cookies.authToken
    if (!token) return res.status(401).json({ message: "Auth Error" })
    try {
        const decoded = jwt.verify(token, keys.SECRET_TOKEN)
        const foundUser = await User.findById(decoded.userId)
        if (!foundUser) {
            return res.status(404).json({message: 'User not found'})
        }
        req.userId = decoded.userId
        next()
    } catch (e) {
        res.status(500).send({ message: "Invalid Token" })
    }
}