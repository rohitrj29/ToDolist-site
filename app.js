const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");
const app=express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
const itemsSchema={
  name:String
};
const listSchema={
  name: String,
  items: [itemsSchema]
};
const Item= mongoose.model("Item",itemsSchema);
const List= mongoose.model("List",listSchema);
const item1=new Item({name:"Welcome to your todolist."});
const item2=new Item({name:"Hit the + icon to add the list."});
const item3=new Item({name:"Hit this to delete an item."});
const defaultItems=[item1,item2,item3];


app.get("/",function(req,res){

  var today = new Date();
  var options={
    weekday:"long",
    day:"numeric",
    month:"long"
  };
  var day=today.toLocaleDateString("en-US",options);

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully saved to database");
      }
     });
    res.redirect("/");
    }
    else{
   res.render("list",{listTitle: day, newListItem :foundItems});
   }
 });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList)
      {
        const list =new List({name: customListName,
        item:defaultItems
      });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItem :foundList.items});
      }
    }
  });

});

app.post("/",function(req,res){

  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});
app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err)
{
console.log("Successfully deleted the id");
res.redirect("/");
}
});
} else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    res.redirect("/"+listName);
  });
}
});
app.listen(3000,function(){
  console.log("server is running on port 3000");
});
app.post("/work",function(req,res){
  var item=req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});
app.get("/work",function(req,res){
  res.render("list",{listTitle: "Work List", newListItem :workItems});

})
