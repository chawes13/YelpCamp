var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var middleware = require('../middleware');


//REGISTER Routes
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", middleware.caseInsensitiveLogin, function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
       if(err){
           req.flash("error", err.message);
           res.redirect("/register");
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds");
       });
    });
});

//LOGIN Routes
router.get("/login", middleware.rememberLocation, function(req, res){
   res.render("login");
});

router.post("/login", middleware.caseInsensitiveLogin, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){
    var redirect_to = req.session.backURL;
    delete req.session.backURL;
    res.redirect(redirect_to);
});

//LOGOUT Route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/");
});

module.exports = router;