const User = require('../models/user')
const Group = require('../models/group')
const bcrypt = require('bcryptjs')
const {body, param} = require('express-validator')

exports.loginValidators = [
    body('password', 'Invalid username or password')
        .exists()
        .trim()
        .isAlphanumeric(),

    body('username', 'Invalid username or password')
        .exists()
        .trim()
        .isAlphanumeric()
        .custom(async (value, {req}) => {
            const candidate = await User.findOne({name: value})

            if (candidate && (await bcrypt.compare(req.body.password, candidate.password))) {
                return true
            } else throw new Error('Wrong password or user does not exist')
        })
]

exports.registerValidators = [
    body('username', 'Incorrect username format')
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),

    body('password', 'Incorrect password format')
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),

    body('email', 'Incorrect e-mail format')
        .exists()
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
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),
    
    body('oldPassword', 'Incorrect old password format')
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric()
]

exports.groupIdValidator = [
    param('id')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        })
]

exports.addStudentValidator = [
    body('studentId')
        .exists().withMessage('Choose student to add')
        .trim()
        .isMongoId().withMessage('Incorrect student id format')
        .custom(async (value, {req}) => {
            const user = await User.findById(value)
            if (!user) throw new Error('User does not exist')
            else if (user.role !== 'student') throw new Error('User role is not student')
            else if (user.group) throw new Error('User is already in group')
            return true
        }),

    param('groupId')
        .exists()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        })
]

exports.notificationValidator = [
    body('group')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        })
]

exports.groupNameValidator = [
    body('name')
        .exists()
        .trim()
        .isLength({min: 3, max: 20}).withMessage('Group name must be at least 3 and less than 20 characters long')
        .matches(/^[A-Za-z0-9\s-]+$/).withMessage('Incorrect group name format')
        .custom(async (value, {req}) => {
            const group = await Group.findOne({name: value})
            if (group) throw new Error('Group with this name is already exist...')
            return true
        })
]

exports.groupEditValidator = [
    body('name')
        .exists()
        .trim()
        .isLength({min: 3, max: 20}).withMessage('Group name must be at least 3 and less than 20 characters long')
        .matches(/^[A-Za-z0-9\s-]+$/).withMessage('Incorrect group name format')
        .custom(async (value, {req}) => {
            const group = await Group.findOne({name: value})
            if (group) throw new Error('Group with this name is already exist...')
            return true
        }),

    param('id')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        })
]

exports.groupDeleteValidator = [
    param('id')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        })
]

exports.resetValidators = [
    body('email', 'Incorrect e-mail format')
        .exists()
        .trim()
        .isEmail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value})
            if (!user) throw new Error('User does not exist')
            return true
        })
        .normalizeEmail()
]

exports.setPasswordValidators = [
    body('password', 'Incorrect password format')
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric(),

    body('cpassword', 'Incorrect confirm password format')
        .exists()
        .trim()
        .isLength({min: 3, max: 20})
        .isAlphanumeric()
        .custom(async (value, {req}) => {
            if (req.body.password !== value) throw new Error('Passwords mismatch')
            return true
        }),

    body('userId', 'Incorrect user id format')
        .exists()
        .trim()
        .isMongoId()
]

exports.deleteStudentsValidators = [
    param('groupId')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect group id format')
        .custom(async (value, {req}) => {
            const group = await Group.findById(value)
            if (!group) throw new Error('Group does not exist')
            return true
        }),

    body('userId', 'Incorrect variable format')
        .isArray(),

    body('userId.*')
        .exists()
        .trim()
        .isMongoId().withMessage('Incorrect student id format')
        .custom(async (value, {req}) => {
            const user = await User.findById(value)
            if (!user) throw new Error('User does not exist')
            else if (user.group.toString() !== req.body.groupId) throw new Error('User is not in current group')
            return true
        })
]