const {Router} = require('express')
const {validationResult} = require('express-validator')
const User = require('../models/user')
const {authMiddleware, authNotMiddleware} = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const {loginValidators, registerValidators, changePasswordValidators, resetValidators, setPasswordValidators} = require('../utils/validators')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resEmail = require('../emails/reset')

const router = new Router()
const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/', authMiddleware , async (req,res)=> {
    const user = await User.findById(req.session.userId)
    let notifications = []
    if (user.role === 'student') {
        notifications = user.notification
    }
    res.render('index', {
        title: 'Academy',
        isTeacher: user.role === 'teacher',
        isAdmin: user.role === 'admin',
        isAuth: req.session.isAuth,
        notifications
    })
    await User.findByIdAndUpdate(req.session.userId, {$unset: {notification: ''}})
})

router.get('/login', authNotMiddleware, async (req,res)=> {
    res.render('auth/login', {
        title: 'Login',
        isAuth: req.session.isAuth
    })
})

router.get('/register', authMiddleware, async (req,res)=> {
    const userRole = (await User.findById(req.session.userId)).role
    if (userRole === 'admin' || userRole === 'teacher') {
        res.render('auth/register', {
            title: userRole === 'admin' ? 'Add teacher' : 'Add student',
            isTeacher: userRole === 'teacher',
            isAdmin: userRole === 'admin',
            isAuth: req.session.isAuth
        })
    }
})

router.get('/logout', authMiddleware, async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})

router.get('/profile', authMiddleware, async (req,res)=> {
    const user = await User.findById(req.session.userId)
    res.render('profile', {
        title: 'My profile',
        isTeacher: user.role === 'teacher',
        isAdmin: user.role === 'admin',
        isAuth: req.session.isAuth,
        name: user.name,
        email: user.email,
        password: user.password
    })
})

router.get('/reset', authNotMiddleware, (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?'
    })
})

router.patch('/reset', authNotMiddleware, resetValidators, (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/reset')
        }

        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Oops! Something went wrong...')
                return res.redirect('/reset')
            }
            await User.findOneAndUpdate({email: req.body.email}, {resetToken: buffer.toString('hex'), resetTokenExp: Date.now() + 3600000})
            await transporter.sendMail(resEmail(req.body.email, buffer.toString('hex')))
            res.redirect('/login')
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', authNotMiddleware, async (req, res) => {
    try {
        if (!req.params.token) res.redirect('/login')

        const user = await User.findOne({resetToken: req.params.token, resetTokenExp: {$gt: Date.now()}})
        if (!user) {
            return res.redirect('/login')
        } else {
            res.render('auth/password', {
                title: 'Update password',
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.patch('/password', authNotMiddleware, setPasswordValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/password/' + req.body.token)
        }
        await User.findOneAndUpdate({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        }, {
            password: await bcrypt.hash(req.body.password, 10), 
            $unset: {resetToken: "", resetTokenExp: ""}
        })
        res.redirect('/login')
    } catch (e) {
        console.log(e)
    }
})

router.patch('/change_password', authMiddleware, changePasswordValidators, async (req,res)=> {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/profile')
        }
        const oldUserPassword = (await User.findById(req.session.userId)).password
        if (await bcrypt.compare(req.body.oldPassword, oldUserPassword)) {
            await User.findByIdAndUpdate(req.session.userId, {password: (await bcrypt.hash(req.body.newPassword, 10)).toString()})
            req.flash('success', 'Password has been changed...')
        } else {
            req.flash('error', 'Invalid old password')
        }
        res.redirect('/profile') 
    } catch (e) {
        console.log(e)
    }
})

router.post('/login', loginValidators, async (req,res)=> {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/login')
        }
        res.redirect('/')
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', authMiddleware, registerValidators, async (req,res)=> {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/register')
        }

        const {username, password, email} = req.body
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
        }
        res.redirect('/')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router