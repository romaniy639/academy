const {Router} = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const bcrypt = require('bcryptjs')

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
         } else {
             res.redirect('/login')
         }
         res.redirect('/')
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