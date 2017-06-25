var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//CREATE route
router.post("/", middleware.isLoggedIn, function(req, res){
    //Welcome to callback hell -- refactor this!?
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log("Could not locate campground to add comment to");
        } else {
            Comment.create(req.body.comment, function(err, newComment){
                if(err){
                    console.log("Could not create comment");
                } else {
                    //Add author information to comment
                    newComment.author.username = req.user.username;
                    newComment.author.id = req.user._id;
                    newComment.save();
                    //Add comment to campground
                    campground.comments.push(newComment);
                    //Save and redirect
                    campground.save();
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

//EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           console.log(err);
           res.redirect("back");
       } else {
           res.render("comments/edit", {campgroundID: req.params.id, comment: foundComment});
       }
    });
});

//UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   var comment = {
       text: req.body.comment.text
   };
   Comment.findByIdAndUpdate(req.params.comment_id, comment, function(err, updatedComment){
        if(err){
          console.log(err);
        }
        res.redirect("/campgrounds/"+req.params.id);
   });
});

//DELETE route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment){
      if(err){
          console.log(err);
      }
      req.flash("success", "Comment successfully deleted");
      res.redirect("/campgrounds/"+req.params.id);
   });
});

module.exports = router;