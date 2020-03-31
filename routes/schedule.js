const { Router } = require("express");
const { tokenMiddleware, isTeacherMiddleware } = require("../middleware/auth");
const { scheduleIdRules, scheduleRules } = require("../utils/validators");
const Schedule = require("../models/schedule");
const Group = require("../models/group");
const util = require("util");

const router = new Router();
function lastIndex(arr) {
  arr.push("");
  let res = arr.length;
  for (let i = 1; i < arr.length; i++)
    if (arr[i - 1].length && !arr[i].length) res = i;
  return res;
}

router.get("/", tokenMiddleware, async (req, res) => {
  res.status(200).json({
    scheduleList: await Schedule.find()
      .populate("group", "name -_id")
      .select("_id"),
    groupList: await Group.find().select("_id name")
  });
});

router.get("/:id", tokenMiddleware, scheduleIdRules, async (req, res) => {
  res.status(200).json({
    schedule: await Schedule.findById(req.params.id)
  });
});

// eslint-disable-next-line prettier/prettier
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
      res.status(200).json({ id: newSchedule._id });
    } catch (e) {
      next(e);
    }
  }
);

router.post("/edit", async (req, res) => {
  // const { id } = req.body;
  // try {
  //   delete req.body.id;
  //   const schedule = await Schedule.findById(id);
  //   Object.assign(schedule, req.body);
  //   await schedule.save();
  //   res.redirect("/schedule");
  // } catch (e) {
  //   console.log(e);
  // }
});

router.post("/delete", async (req, res) => {
  // try {
  //   await Schedule.findByIdAndDelete(req.body.id);
  //   res.redirect("/schedule");
  // } catch (e) {
  //   console.log(e);
  // }
});

module.exports = router;
