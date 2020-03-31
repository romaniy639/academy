/* eslint-disable prettier/prettier */
const User = require('../models/user')
const Group = require('../models/group')
const Schedule = require('../models/schedule')
const bcrypt = require('bcryptjs')
const { body, param } = require('express-validator')
const { validationResult } = require("express-validator")

function checkErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) next();
  else return res.status(422).json({ errors: errors.array().map(e => e.msg) });
}

exports.loginRules = [
  body('password', 'Incorrect password format')
    .exists()
    .trim()
    .isAlphanumeric(),

  body('email', 'Incorrect e-mail format')
    .exists()
    .trim()
    .isEmail()
    .custom(async (value, { req }) => {
      const candidate = await User.findOne({ email: value })
      if (candidate && (await bcrypt.compare(req.body.password, candidate.password))) {
        return true
      } else throw new Error('Wrong password or user does not exist')
    }),

    (req, res, next) => checkErrors(req, res, next)
]

exports.registerRules = [
  body('username', 'Incorrect username format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric(),

  body('password', 'Incorrect password format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric(),

  body('email', 'Incorrect e-mail format')
    .exists()
    .trim()
    .isEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value })
      if (user) throw new Error('User with current e-mail is already exists')
      return true
    })
    .normalizeEmail(),

  (req, res, next) => checkErrors(req, res, next)
]

exports.changePasswordRules = [
  body('newPassword', 'Incorrect new password format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric(),

  body('oldPassword', 'Incorrect old password format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric(),

  (req, res, next) => checkErrors(req, res, next)
]

exports.groupIdRules = [
  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.addStudentRules = [
  body('studentId')
    .exists().withMessage('Choose student to add')
    .trim()
    .isMongoId().withMessage('Incorrect student id format')
    .custom(async (value, { req }) => {
      const user = await User.findById(value)
      if (!user) throw new Error('User does not exist')
      else if (user.role !== 'student') throw new Error('User role is not student')
      else if (user.group) throw new Error('User is already in group')
      return true
    }),

  param('id')
    .exists()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.notificationRules = [
  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.groupNameRules = [
  body('name')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Group name must be at least 3 and less than 20 characters long')
    .matches(/^[A-Za-z0-9\s-]+$/).withMessage('Incorrect group name format')
    .custom(async (value, { req }) => {
      const group = await Group.findOne({ name: value })
      if (group) throw new Error('Group with this name is already exists...')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.groupEditRules = [
  body('name')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Group name must be at least 3 and less than 20 characters long')
    .matches(/^[A-Za-z0-9\s-]+$/).withMessage('Incorrect group name format')
    .custom(async (value, { req }) => {
      const group = await Group.findOne({ name: value })
      if (group) throw new Error('Group with this name is already exists...')
      return true
    }),

  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.groupDeleteRules = [
  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.resetRules = [
  body('email', 'Incorrect e-mail format')
    .exists()
    .trim()
    .isEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value })
      if (!user) throw new Error('User does not exist')
      return true
    })
    .normalizeEmail(),

  (req, res, next) => checkErrors(req, res, next)
]

exports.setPasswordRules = [
  body('password', 'Incorrect password format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric(),

  body('cpassword', 'Incorrect confirm password format')
    .exists()
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      if (req.body.password !== value) throw new Error('Passwords mismatch')
      return true
    }),

  body('userId', 'Incorrect user id format')
    .exists()
    .trim()
    .isMongoId(),

  (req, res, next) => checkErrors(req, res, next)
]

exports.deleteStudentsRules = [
  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
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
    .custom(async (value, { req }) => {
      const user = await User.findById(value)
      if (!user) throw new Error('User does not exist')
      else if (!user.group) throw new Error('User is not in group')
      else if (user.group.toString() !== req.params.id) throw new Error('User is not in current group')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.scheduleRules = [
  body('group')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect group id format')
    .custom(async (value, { req }) => {
      const group = await Group.findById(value)
      if (!group) throw new Error('Group does not exist')
      else if (await Schedule.findOne({ group })) throw new Error('Schedule for this group is already exists...')
      return true
    }),

  body('week')
    .exists()
    .custom(async (value, { req }) => {
      const week = Object.keys(value);
      
      if (JSON.stringify(week.sort()) !== '["friday","monday","thursday","tuesday","wednesday"]')
        throw new Error('Incorrect week format')
         
      if (week.some(day => !(Array.isArray(value[day]) || value[day] === null)))
        throw new Error('Incorrect day format')

      if (week.every(day => !value[day]))
        throw new Error('Empty week found')

      if (
        week
          .filter(day => value[day])
          .map(day => value[day])
          .some(day =>
            day.some(
              lesson =>
                !(
                  typeof lesson.courseName === "string" &&
                  typeof lesson.courseTeacher === "string" &&
                  typeof lesson.classroom === "string"
                )
            )
          )
      ) throw new Error('Incorrect lesson format')

      if (
        week
          .filter(day => value[day])
          .map(day => value[day])
          .some(day =>
            day.some(
              lesson =>
                !(
                  (lesson.courseName.trim().length === 0 &&
                    lesson.courseTeacher.trim().length === 0 &&
                    lesson.classroom.trim().length === 0) ||
                  (lesson.courseName.trim().length > 2 &&
                    lesson.courseTeacher.trim().length > 2 &&
                    lesson.classroom.trim().length > 2 &&
                    lesson.courseName.trim().length < 21 &&
                    lesson.courseTeacher.trim().length < 21 &&
                    lesson.classroom.trim().length < 21)
                )
            )
          )
      ) throw new Error('Incomplete lesson found')

      if (
        week
          .filter(day => value[day])
          .map(day => value[day])
          .some(day =>
            day.every(
              lesson =>
                lesson.courseName.trim().length === 0 &&
                lesson.courseTeacher.trim().length === 0 &&
                lesson.classroom.trim().length === 0
            )
          )
      ) throw new Error('Empty day found')

      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]

exports.scheduleIdRules = [
  param('id')
    .exists()
    .trim()
    .isMongoId().withMessage('Incorrect schedule id format')
    .custom(async (value, { req }) => {
      const schedule = await Schedule.findById(value)
      if (!schedule) throw new Error('Schedule does not exist')
      return true
    }),

  (req, res, next) => checkErrors(req, res, next)
]