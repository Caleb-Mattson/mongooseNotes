var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var db = require("./models");

var PORT = 3000;

var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoArticles", { useNewUrlParser: true });

app.get("/", (req, res) => {
    db.Article.find({})
        .then(dbArticle => {
            console.log(dbArticle)
            var articlesArr = [];
            for (var i = 0; i < 10; i++){
                articlesArr.push({
                    _id: dbArticle[i]._id,
                    title: dbArticle[i].title,
                    link: dbArticle[i].link,
                    summary: dbArticle[i].summary
                })
            }
            // var articles = res.json(dbArticle);
            res.render("index", {articles : articlesArr});
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/article/comments/:id", (req, res) => {
    var id = req.params.id;

    db.Article.findOne({_id: id}).populate("note").then( result => {
        var noteArr = [];
        if(result.note){
            for (var i = 0; i < result.note.length; i++){
                noteArr.push({
                    title: result.note[i].title,
                    body: result.note[i].body
                });
            };
        }
        
        res.render("notes", {
            title: result.title,
            summary: result.summary,
            id: result._id,
            note: noteArr
        });
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.gameinformer.com/news?_wrapper_format=html&page=1").then(function (response) {
        var $ = cheerio.load(response.data);

        $("div.teaser-right-wrapper").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .children("h2.page-title")
                .find("a")
                .text();
            result.link = $(this)
                .children("h2.page-title")
                .find("a")
                .attr("href");
            result.summary = $(this)
                .find("div.field--name-field-promo-summary")
                .text();

            console.log(result);

            db.Article.create(result)
              .then(function (dbArticle) {
                console.log(dbArticle);
              })
              .catch(function (err) {
                console.log(err);
              });
        });

        res.send("Scrape Complete");
    });
});

app.get("/api/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/api/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/api/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});