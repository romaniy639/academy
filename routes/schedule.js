/* eslint-disable prettier/prettier */
const { Router } = require("express");
const { tokenMiddleware, isTeacherMiddleware } = require("../middleware/auth");
const { scheduleEditRules, scheduleIdRules, scheduleRules } = require("../utils/validators");
const Schedule = require("../models/schedule");
const Group = require("../models/group");

const router = new Router();
function lastIndex(arr) {
  arr.push("");
  let res = arr.length;
  for (let i = 1; i < arr.length; i++)
    if (arr[i - 1].length && !arr[i].length) res = i;
  return res;
}

router.get("/", tokenMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      scheduleList: await Schedule.find().populate("group", "name -_id").select("_id"),
      groupList: await Group.find({ schedule: undefined }).select("_id name")
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", tokenMiddleware, isTeacherMiddleware, scheduleRules, async (req, res) => {
  try {
    const { group, week } = req.body;
    Object.keys(week)
      .filter(day => week[day])
      .map(
        day =>
          (week[day] = week[day].slice(
            0,
            lastIndex(week[day].map(lesson => lesson.classroom))
          ))
      );

    const newSchedule = new Schedule({
      group: await Group.findById(group),
      week,
      scheduleAuthor: req.user.id
    });
    await newSchedule.save();
    await Group.findByIdAndUpdate(group, { schedule: newSchedule._id });
    res.status(200).json({ id: newSchedule._id });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", tokenMiddleware, scheduleIdRules, async (req, res) => {
  try {
    const { group, week, scheduleAuthor, date } = await Schedule.findById(req.params.id).populate("group").populate("scheduleAuthor");
    res.status(200).json({ group: group.name, week, scheduleAuthor: scheduleAuthor.name, date });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", tokenMiddleware, isTeacherMiddleware, scheduleEditRules, async (req, res) => {
  try {
    const { week } = req.body;
    Object.keys(week)
      .filter(day => week[day])
      .map(
        day =>
          (week[day] = week[day].slice(
            0,
            lastIndex(week[day].map(lesson => lesson.classroom))
          ))
      );
  
    await Schedule.findByIdAndUpdate(req.params.id, { week, scheduleAuthor: req.user.id, date: Date.now() });
    res.status(200).json({ week, scheduleAuthor: req.user.name, date: Date.now() });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", tokenMiddleware, isTeacherMiddleware, scheduleIdRules, async (req, res) => {
  try {
    await Group.updateOne({ schedule: req.params.id }, { $unset: { schedule: "" } });
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ deletedSchedule });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
