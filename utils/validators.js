const User = require('../models/user')
const bcrypt = require('bcryptjs')
const {body} = require('express-validator')

exports.loginValidators = [
    body('password', 'Invalid username or password')
        .trim()
        .isAlphanumeric(),

    body('username', 'Invalid username or password')
        .trim()
        .isAlphanumeric()
        .custom(async (value, {req}) => {
            const candidate = await User.findOne({name: value})

            if (candidate && (await bcrypt.compare(req.body.password, candidate.password))) {
                req.session.isAuth = true
                req.session.userId = candidate._id 
                req.session.save(err => {
                    if (err) throw new Error(err)
                })
                return true
            } else throw new Error('Wrong password or user does not exist')
        })
]

exports.registerValidators = [
    body('username', 'Incorrect username format')
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),

    body('password', 'Incorrect password format')
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),

    body('email', 'Incorrect e-mail format')
        .trim()
        .isEmail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value})
            if (user) throw new Error('User with current e-mail is already exists')
            return true
        })
        .normalizeEmail()
]

exports.changePasswordValidators = [
    body('newPassword', 'Incorrect new password format')
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),
    
    body('oldPassword', 'Incorrect old password format')
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric()
]