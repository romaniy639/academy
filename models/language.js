const { Schema, model } = require("mongoose");

module.exports = model(
  "Localization",
  new Schema(
    {
      dictionary: { type: Object, required: true }
    },
    { versionKey: false }
  )
);
