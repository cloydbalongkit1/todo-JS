const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));



const data = "todoDataBase";
mongoose.connect('mongodb://127.0.0.1:27017/' + data);

const todoSchema = new mongoose.Schema({
    name: String,
});

const TodoItem = mongoose.model("Item", todoSchema);

const item1 = new TodoItem({
    name: "Welcome to your Todo List - Instructions.",
});

const item2 = new TodoItem({
    name: "Input your reminders bellow."
})

const item3 = new TodoItem({
    name: "Press the -Add Post- butoon. Check the box if want to delete. Thanks!",
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [todoSchema],
};

const List = mongoose.model("List", listSchema);

day = date.dateToday();

app.get("/", (req, res) =>{
    TodoItem.find({}).then((items) => {
        if (items.length === 0) {
            TodoItem.insertMany(defaultItems).then( () => {
                console.log("Append Success!");
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: day,
                newListItems: items,
            });
        };
    });
});



app.get("/:customListName", (req, res) => {
    const customListName = _.upperFirst(req.params.customListName);
    List.findOne({name: customListName}).then((foundList) => {
        if (!foundList) {
            // Create a new list.
            const list = new List({
                name: customListName,
                items: defaultItems,
            });
            list.save();
            console.log("List add successfully!");
            res.redirect("/" + customListName);  
        } else {
            // Show an existing list.
            res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items,
            });
        }
    });
});



app.get("/about", (req, res) =>{
    res.render("about");
});



app.post("/", (req, res) =>{
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const item = new TodoItem({
        name: itemName,
    });
    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});



app.post("/delete", (req, res) =>{
    const checkedID = req.body.checkbox;
    TodoItem.findOneAndDelete({ _id: checkedID }).then(function() {
        console.log("Removed successfully!");
      }).catch(function(err) {
        console.log(err);
      });

      setTimeout(() => {
        res.redirect("/");
      }, 500 );
});



app.listen(port, () =>{
    console.log("Server is running at port: " + port);
});

