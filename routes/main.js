const {Router} = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const Group = require('../models/group')

const router = new Router()


router.get('/', async (req,res)=> {
    res.render('index', {
        isAuth: req.session.isAuth,
        isTeacher: (await User.findById(req.session.userId)).role === "teacher",
        isAdmin: (await User.findById(req.session.userId)).role === "admin",
        title: "Academy"
    })
})

router.get('/login', async (req,res)=> {
    if (!req.session.isAuth) {
        res.render('auth/login', {
            title: "Login",
            isAuth: req.session.isAuth
            /*isTeacher: (await User.findById(req.session.userId)).role === "teacher",
            isAdmin: (await User.findById(req.session.userId)).role === "admin",  */
        })
    }
})

router.get('/register', authMiddleware, async (req,res)=> {
    if (req.session.isAdmin) {
        res.render('auth/register', {
            title: "Add teacher",
            isAdmin: (await User.findById(req.session.userId)).role === "admin",
            isAuth: req.session.isAuth,
            isTeacher: (await User.findById(req.session.userId)).role === "teacher"
        })
    } else {
        if (req.session.isAuthenticatedTeacher) {
            res.render('auth/register', {
                title: "Add student",
                isAdmin: (await User.findById(req.session.userId)).role === "admin",
                isAuth: req.session.isAuth,
                isTeacher: (await User.findById(req.session.userId)).role === "teacher"
            })
        }
    }
})

router.get('/logout', async (req, res) => {
    if (req.session.isAuth) {
        req.session.destroy(() => {
            res.redirect('/login')
        })
    }
})

router.get('/profile', authMiddleware, async (req,res)=> {
    res.render('profile', {
        title: "My profile",
        isAdmin: (await User.findById(req.session.userId)).role === "admin",
        isAuth: req.session.isAuth,
        isTeacher: (await User.findById(req.session.userId)).role === "teacher",
        /*name: req.session.user.name,
        email: req.session.user.email,
        password: req.session.user.password*/
    })
})

<<<<<<< HEAD
=======
router.get('/add_avertisement', authMiddleware, async (req,res)=> {
    res.render('advertisement', {
        title: "Advirtisement",
        isAdmin: (await User.findById(req.session.userId)).role === "admin",
        isAuth: req.session.isAuth,
        isTeacher: (await User.findById(req.session.userId)).role === "teacher",
        groups: await Group.find()
    })

})

router.post('/advertisement', authMiddleware, async (req,res)=> {
    try {
        if (req.body.group) {
            await Group.findByIdAndUpdate(req.body.group, {$push: {'advertisement': req.body.message}})
        }
        res.redirect('/add_avertisement')
    } catch (e) {
        console.log(e)
    }
})

>>>>>>> db001c7b4848391ca2da6cc2ccf05732080b3969
router.post('/change_password', authMiddleware, async (req,res)=> {
    try {
        const old_user_password = (await User.findById(ObjectId(req.session.id))).password
        if (await bcrypt.compare(req.body.old_password, old_user_password)) {
            const hashPassword = bcrypt.hash(req.body.new_password,10)
            await User.findOneAndUpdate({_id: ObjectId(req.session.id)}, {password: (await hashPassword).toString()})
            req.flash('success', 'Password has been changed...')
        } else {
            req.flash('error', 'Invalid old password')
        }
        res.redirect('/profile') 
    } catch (e) {
        console.log(e)
    }
})


router.post('/login', async (req,res)=> {
    try {
    const name = req.body.username
    const candidate = await User.findOne({name})
    if (candidate) {
        if (await bcrypt.compare(req.body.password, candidate.password)) {
            req.session.isAuth = true
            req.session.userId = candidate._id
            if (candidate.isAdmin) {
                req.session.isAdmin = true
            } else if (candidate.isTeacher){
                req.session.isAuthenticatedTeacher = true
            } else {
                req.session.isAuthenticatedStudent = true
            } 
            //req.session.user = candidate 
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
    const user_role = (await User.findById(req.session.userId)).role
    if (user_role === "admin") {
    const hashPassword = bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: name,
        password: (await hashPassword).toString(),
        email: email,
        role: "teacher"
    })
    await user.save()
    } else {
        if (user_role === "teacher") {
            const hashPassword = bcrypt.hash(req.body.password,10)
            const user = new User({
                name: name,
                password: (await hashPassword).toString(),
                email: email,
                role: "student"
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