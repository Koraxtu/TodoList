const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

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

const Item = mongoose.model("Item", itemsSchema);

const buy = new Item({
  name: "Buy Food"
});

const cook = new Item({
  name: "Cook Food"
});

const eat = new Item({
  name: "Eat Food"
});


const listSchema = {
  name: {
    type: String,
    required: [true, "Every list needs a name!"]
  },
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany([buy, cook, eat], (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("TodoList items added.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItem: foundItems});
      }
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: [buy, cook, eat]
        });
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
      }
    }
    else{
      console.log(err);
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.todo;
  const listName = req.body.list;

  const todo = new Item({
    name: itemName
  });

  if (listName === "Today"){
    todo.save((err) => {
      if (err){
        console.log(err);
      }
      else{
        console.log("New todo added!");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(todo);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndDelete({_id: checkedItemId}, function(err){
      if (err){
        console.log(err);
      }
      else{
        console.log("Entry deleted");
      }
    })
    setTimeout(function() {
      res.redirect("/");
    }, 350);
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, results){
      res.redirect("/" + listName);
    });
  }

});

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
