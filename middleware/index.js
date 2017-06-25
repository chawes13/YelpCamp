var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               console.log(err);
               req.flash("error", "Campground not found");
               res.redirect("back");
           } else {
                //author id is a mongoose object, not a string
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                     req.flash("error", "You cannot change a campground that you did not create");
                     res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
   if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               console.log(err);
               res.redirect("back");
           } else {
            //author id is a mongoose object, not a string
            if(foundComment.author.id.equals(req.user._id)){
                next();
            } else {
                  req.flash("error", "You cannot change a comment that you did not create")
                  res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("back");
    } 
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please log in first");
    res.redirect("/login");
};

middlewareObj.caseInsensitiveLogin = function(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    next();
};

middlewareObj.rememberLocation = function(req, res, next){
    var previousLocation = req.header('Referer');
    if(!previousLocation){
        req.session.backURL = "/campgrounds";
    } else if(previousLocation.indexOf("login") === -1) {
        req.session.backURL = previousLocation;
    }
    next();
};

module.exports = middlewareObj;