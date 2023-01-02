const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to database.");
  })
  .catch((err) => {
    console.log("An error occurred during connection.");
    console.log(err);
  });

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "TodoList items need names!"]
  }
});

const todoItems = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  let day = date.getDate();

  res.render("list", {
    listTitle: day,
    newListItem: todoItems
  })

});

app.post("/", function(req, res) {
  let item = req.body.todo;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    todoItems.push(item);
    res.redirect("/");
  }
})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItem: workItems
  })
})

app.post("/work", function(req, res) {
  let item = req.body.todo;
  res.redirect("/work");
})

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
