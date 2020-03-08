const {Router} = require('express')
const {validationResult} = require('express-validator/check')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const {loginValidators, registerValidators, changePasswordValidators} = require('../utils/validators')

const router = new Router()

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

router.get('/login', async (req,res)=> {
    if (!req.session.isAuth) {
        res.render('auth/login', {
            title: 'Login',
            isAuth: req.session.isAuth
        })
    } else {
        res.redirect('/')
    }
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

router.post('/change_password', authMiddleware, changePasswordValidators, async (req,res)=> {
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
        }
        res.redirect('/')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router