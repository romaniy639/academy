const { Router } = require('express')
const { validationResult } = require('express-validator')
const User = require('../models/user')
const { authMiddleware, authNotMiddleware } = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const { loginValidators, registerValidators, changePasswordValidators, resetValidators, setPasswordValidators } = require('../utils/validators')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resEmail = require('../emails/reset')

const router = new Router()
const transporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY }
}))

router.delete('/logout', authMiddleware, async (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({message: "Session deleted..."})
    })
})

router.get('/password/:token', authNotMiddleware, async (req, res) => {
    try {
        if (!req.params.token) res.redirect('/login')

        const user = await User.findOne({ resetToken: req.params.token, resetTokenExp: { $gt: Date.now() } })
        if (!user) {
            return res.status(404).json({message: "User not found..."})
        } else {
            return res.status(200).json({
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.session.userId)
    res.status(200).json({
        isAuth: req.session.isAuth,
        user: await User.findById(req.session.userId).select("name email _id role")
    })
})

router.put('/reset', authNotMiddleware, resetValidators, (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //req.flash('error', errors.array()[0].msg)
            return res.status(422).json({message: `${errors.array()[0].msg}`})
        }

        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                //req.flash('error', 'Oops! Something went wrong...')
                return res.status(422).json({message: "Oops! Something went wrong..."})
            }
            const user = await User.findOneAndUpdate({ email: req.body.email }, { resetToken: buffer.toString('hex'), resetTokenExp: Date.now() + 3600000 })
            await transporter.sendMail(resEmail(req.body.email, buffer.toString('hex')))
            res.status(200).json({user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                role: user.role
            }})
        })
    } catch (e) {
        console.log(e)
    }
})


router.put('/password', authNotMiddleware, setPasswordValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //req.flash('error', errors.array()[0].msg)
            return res.status(422).json({message: `${errors.array()[0].msg}`})
        }
        const user = await User.findOneAndUpdate({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        }, {
            password: await bcrypt.hash(req.body.password, 10),
            $unset: { resetToken: "", resetTokenExp: "" }
        })
        res.status(200).json({user: {
            name: user.name,
            email: user.email,
            _id: user._id,
            role: user.role
        }})
    } catch (e) {
        console.log(e)
    }
})

router.put('/change_password', authMiddleware, changePasswordValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //req.flash('error', errors.array()[0].msg)
            return res.status(422).json({message: `${errors.array()[0].msg}`})
        }
        const oldUserPassword = (await User.findById(req.session.userId)).password
        if (await bcrypt.compare(req.body.oldPassword, oldUserPassword)) {
            const user = await User.findByIdAndUpdate(req.session.userId, { password: (await bcrypt.hash(req.body.newPassword, 10)).toString() })
            //req.flash('success', 'Password has been changed...')
            res.status(200).json({user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                role: user.role
            }})
        } else {
            //req.flash('error', 'Invalid old password')
            res.status(422).json({message: "Invalid old password..."})
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //req.flash('error', errors.array()[0].msg)
            return res.status(422).json({message: `${errors.array()[0].msg}`})
        }
        const user = await User.findById(req.session.userId).select("name email _id role")
        res.status(200).json({user})
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', authMiddleware, registerValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //req.flash('error', errors.array()[0].msg)
            return res.status(422).json({message: `${errors.array()[0].msg}`})
        }

        const { username, password, email } = req.body
        const userRole = (await User.findById(req.session.userId)).role

        if (userRole === 'admin' || userRole === 'teacher') {
            const user = new User({
                name: username,
                password: (await bcrypt.hash(password, 10)).toString(),
                email,
                role: userRole === 'admin' ? 'teacher' : 'student'
            })
            await user.save()
            await transporter.sendMail(regEmail(username, email, password))
            res.status(200).json({user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                role: user.role
            }})
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router