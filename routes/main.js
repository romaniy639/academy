const {Router} = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')

const router = new Router()

router.get('/', (req,res)=> {
    res.render('index', {
        isTeacher: req.session.isAuthenticatedTeacher,
        isAdmin: req.session.isAdmin,
        isAuth: req.session.isAuth,
        title: "Academy"
    })
})

router.get('/login', (req,res)=> {
    if (!req.session.isAuth) {
        res.render('login', {
            title: "Login",
            isTeacher: req.session.isAuthenticatedTeacher,
            isAdmin: req.session.isAdmin,
            isAuth: req.session.isAuth  
        })
    }
})

router.get('/register', authMiddleware, (req,res)=> {
    if (req.session.isAdmin) {
        res.render('register', {
            title: "Add teacher",
            isAdmin: req.session.isAdmin,
            isAuth: req.session.isAuth,
            isTeacher: req.session.isAuthenticatedTeacher
        })
    } else {
        if (req.session.isAuthenticatedTeacher) {
            res.render('register', {
                title: "Add student",
                isAdmin: req.session.isAdmin,
                isAuth: req.session.isAuth,
                isTeacher: req.session.isAuthenticatedTeacher
            })
        }
    }
})

router.get('/logout', async (req,res)=> {
    if (req.session.isAuth) {
    req.session.destroy(() => {
        res.redirect('/login')
    })
    }
})

router.get('/profile', authMiddleware, async (req,res)=> {
    res.render('profile', {
        title: "My profile",
        isAdmin: req.session.isAdmin,
        isAuth: req.session.isAuth,
        isTeacher: req.session.isAuthenticatedTeacher,
        name: req.session.user.name,
        email: req.session.user.email,
        password: req.session.user.password
    })
})

router.get('/add_avertisement', authMiddleware, (req,res)=> {
    res.render('advertisement', {
        title: "Advirtisement",
        isAdmin: req.session.isAdmin,
        isAuth: req.session.isAuth,
        isTeacher: req.session.isAuthenticatedTeacher
    })

})

router.post('/change_password', authMiddleware, async (req,res)=> {
    try {
        if (await bcrypt.compare(req.body.old_password, req.session.user.password)) {
            const hashPassword = bcrypt.hash(req.body.new_password,10)
            await User.findOneAndUpdate({name: req.session.user.name}, {password: (await hashPassword).toString()})
            req.flash('success', 'Password has been changed...')
            res.redirect('/profile')
        } else {
            req.flash('error', 'Invalid old password')
            res.redirect('/profile')
        }
        
    } catch (e) {
        console.log(e)
    }
})


router.post('/login', async (req,res)=> {
    try {
    const name = req.body.username
    const password = req.body.password
    const candidate = await User.findOne({name})
    if (candidate) {
        if (await bcrypt.compare(req.body.password, candidate.password)) {
            req.session.isAuth = true
            if (candidate.isAdmin) {
                req.session.isAdmin = true
            } else if (candidate.isTeacher){
                req.session.isAuthenticatedTeacher = true
            } else {
                req.session.isAuthenticatedStudent = true
            } 
            req.session.user = candidate 
            res.redirect('/')
         } else {
            req.flash('error', 'Invalid password or username')
            res.redirect('/login')
         }
    } else {
        req.flash('error', 'Invalid password or username')
        res.redirect('/login')
    }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', async (req,res)=> {
    try {
    const name = req.body.username
    const password = req.body.password
    const email = req.body.email
    if (req.session.isAdmin) {
    const hashPassword = bcrypt.hash(req.body.password,10)
    const user = new User({
        name: name,
        password: (await hashPassword).toString(),
        email: email,
        isTeacher: true
    })
    await user.save()
    } else {
        if (req.session.isAuthenticatedTeacher) {
            const hashPassword = bcrypt.hash(req.body.password,10)
            const user = new User({
                name: name,
                password: (await hashPassword).toString(),
                email: email,
                isTeacher: false
            })
            await user.save() 
        }
    }
    res.redirect('/')
    } catch (e) {
        console.log(e)
    }

})


module.exports = router