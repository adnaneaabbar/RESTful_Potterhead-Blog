//requirements
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//connecting to mongoDB
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser:true});

//ejs formatting + body-parser + method override
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // for the Sanitizer to work it should come after bodyParser
app.use(methodOverride("_method"));


//Schema and model
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()} //default value if the user doesn't enter a value
});
const Blog = mongoose.model("Blog", blogSchema);

//RESTful ROUTES

//Root page
app.get("/", function(req, res){
    res.redirect("/blogs");
});

//INDEX Route
app.get("/blogs", function(req, res){
    //Get all blogs
    Blog.find({}, function(err, allBlogs){
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: allBlogs});
        }
    });
});


//NEW Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE Route
app.post("/blogs", function(req, res){
    //req.body.blog is an object with the same schema of a blog filled with inputs of the form
    //sanitize the inputs 
    req.body.blog.body = req.sanitize(req.body.blog.body); //remove script tags
 
    //Create a new blog and add to the database
    Blog.create(req.body.blog, function(err, createdBlog){
        if (err) {
            res.render("new");
        } else {
            //redirect to blogs page
            res.redirect("/blogs");
        }
    }); 
});


//SHOW Route
app.get("/blogs/:id", function(req, res){ //this route should be declared after the NEW one
    //find the blog with the id
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            //render show template
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT Route
app.get("/blogs/:id/edit", function(req, res){
    //combination between show and new

    //find blog
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            //render edit template
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE Route 
//Method Override dependancy: the form should have a post method not a put
// and we add ?_method=put to the end of the action attribute
//there are other alternatives but we are following the REST pattern
app.put("/blogs/:id", function(req, res){
    
    //req.body.blog is an object with the same schema of a blog filled with inputs of the form
    //sanitize the inputs 
    req.body.blog.body = req.sanitize(req.body.blog.body); //remove script tags

    //update
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            //redirect
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DESTROY Route 
app.delete("/blogs/:id", function(req, res){
    //delete 
    Blog.findByIdAndDelete(req.params.id, function(err, deletedBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            //redirect
            res.redirect("/blogs");
        }
    })
});

//starting the localhost
app.listen("3000", function(){
    console.log("Blog Server has Started!");
});