var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

//INDEX route
router.get("/", function(req, res){
   Campground.find({}, function(err, allCampgrounds){
       if(err){
            console.log(err);
       } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
       }
   });
});

//CREATE route
router.post("/", middleware.isLoggedIn, function(req, res){
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var campground = {
        name: req.body.name, 
        image: req.body.image, 
        price: req.body.price, 
        author: author, 
        description: req.body.description
    };
    Campground.create(campground, function(err, campground){
        if(err){
            console.log("Couldn't add campground! Please try again");
        } else {
            console.log("Successfully added " + campground.name);
            res.redirect("/campgrounds");
        }
    });
});

//NEW route
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//SHOW route
//note, this will hit for campgrounds/ANYTHING so needs to come after new
router.get("/:id", function(req, res){
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
            console.log(err);
            req.flash("error", "This campground does not exist")
            res.redirect("/campgrounds");
       } else {
            res.render("campgrounds/show", {campground: foundCampground}); 
       }
   });
});

//EDIT route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
            res.render("campgrounds/edit", {campground: foundCampground}); 
       }
    });
});

//UPDATE route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    var updatedCampground = {
            name: req.body.name,
            image: req.body.image,
            price: req.body.price,
            description: req.body.description
        };
    Campground.findByIdAndUpdate(req.params.id, updatedCampground, function(err, foundCampground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
          res.redirect("/campgrounds/" + foundCampground._id); 
       }
   });
});

//DESTROY route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds/" +req.params.id);
        } else {
            console.log(deletedCampground.name + " successfully deleted");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;