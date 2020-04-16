const { Schema, model } = require("mongoose");

module.exports = model(
  "Loc",
  new Schema(
    {
        name: {type: String, required: true},
        dictionary: {type: Object, required: true}
    }
  )
);
