const { Schema, model } = require("mongoose");

module.exports = model(
  "Group",
  new Schema(
    {
      name: { type: String, required: true },
      schedule: { type: Schema.Types.ObjectId, ref: "Schedule" },
      students: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { versionKey: false }
  )
);
