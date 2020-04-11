var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  },
  summary: {
    type: String,
    unique: true
  }
});



var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;