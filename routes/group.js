/* eslint-disable prettier/prettier */
const { Router } = require("express");
const Group = require("../models/group");
const { tokenMiddleware, isTeacherMiddleware } = require("../middleware/auth");
const User = require("../models/user");
const Schedule = require("../models/schedule");
const {
  groupIdRules,
  addStudentRules,
  notificationRules,
  groupNameRules,
  groupEditRules,
  groupDeleteRules,
  deleteStudentsRules
} = require("../utils/validators");

const router = new Router();

router.get("/", tokenMiddleware, async (req, res) => {
  res.status(200).json({ groups: await Group.find() });
});

router.post("/", tokenMiddleware, isTeacherMiddleware, groupNameRules, async (req, res) => {
  try {
    const newGroup = new Group({ name: req.body.name });
    await newGroup.save();
    res.status(200).json({ newGroup });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", tokenMiddleware, groupIdRules, async (req, res) => {
  try {
    res.status(200).json({
      group: await Group.findById(req.params.id),
      groupMembers: (await Group.findById(req.params.id).populate("students", "name").select("name")).students,
      freeStudents: (await User.find({ role: "student" }).select("_id name group")).filter(c => !c.group),
      user: req.user,
    });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", tokenMiddleware, isTeacherMiddleware, groupEditRules, async (req, res) => {
  try {
    await Group.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.status(200).json({ group: await Group.findById(req.params.id) });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", tokenMiddleware, isTeacherMiddleware, groupDeleteRules, async (req, res) => {
  try {
    await User.updateMany({ group: req.params.id }, { $unset: { group: "" } });
    await Schedule.findOneAndDelete({ group: req.params.id });
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    res.status(200).json({ deletedGroup });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/add_student", tokenMiddleware, isTeacherMiddleware, addStudentRules, async (req, res) => {
  try {
    await Group.findByIdAndUpdate(req.params.id, { $push: { students: req.body.studentId } });
    const user = await User.findByIdAndUpdate(req.body.studentId, { group: req.params.id });
    res.status(200).json({
      group: await Group.findById(req.params.id),
      addedStudent: {
        name: user.name,
        email: user.email,
        id: user._id,
        role: user.role
      }
    });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id/delete_students", tokenMiddleware, isTeacherMiddleware, deleteStudentsRules, async (req, res) => {
  try {
    let students_id = (await Group.findById(req.params.id)).students;
    students_id = students_id.filter(st => !req.body.userId.includes(st.toString()));
    await Group.findByIdAndUpdate(req.params.id, { students: students_id });
    await User.updateMany({ _id: req.body.userId }, { $unset: { group: "" } });
    res.status(200).json({ group: await Group.findById(req.params.id) });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/notification", tokenMiddleware, isTeacherMiddleware, notificationRules, async (req, res) => {
  try {
    await User.updateMany({
      group: req.params.id
    }, {
      $push: { notification: { author: req.user.name, message: req.body.message, expiredTime: Date.now() + 172800000 } }
    });
    res.status(200).json({ notifiedUsers: await User.find({ group: req.params.id }).select("_id") });
  } catch (e) {
    next(e);
  }
});

module.exports = router;