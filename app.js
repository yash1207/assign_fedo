var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
var mysql=require('mysql');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
app.use(express.static(__dirname + '/public'));

app.use(session({
secret: 'vidyapathaisalwaysrunning',
resave: true,
saveUninitialized: true
} )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

    

require('./passport')(passport);


function DB(){
var connection =mysql.createConnection({
		host:'127.0.0.1',
	 user:'root',
	 password:'root',
	 database:'fedo'
});
connection.connect();
return connection;
}
///////////////////////////
app.get("/",function (req,res)
    {   
	if(req.user){
		 res.render('weather_rss.ejs',{usernam:req.user.username});
	}
	else
	res.render('login.ejs', { message: req.flash('loginMessage'),message1:req.flash('signupMessage') });
         
    });


app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/weather_rss', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


app.post('/login', passport.authenticate('local-login', {
successRedirect : '/weather_rss', // redirect to the secure profile section
failureRedirect : '/', // redirect back to the signup page if there is an error
failureFlash : true // allow flash messages
}));

 app.get("/weather_rss",function(req,res){
       if(req.user){
       res.render('weather_rss.ejs',{usernam:req.user.username});
	   console.log(req.user);
	   }
       else res.render('login.ejs', { message: req.flash('loginMessage'),message1:req.flash('signupMessage') });
 });
 
  app.get("/signup",function(req,res){
	   if(req.user){
       res.render('weather_rss.ejs',{usernam:req.user.username});
	   console.log(req.user);
	   }
       else res.render('signup.ejs', {message:req.flash('signupMessage') });
       
 });
   app.get("/login",function(req,res){
        if(req.user){
       res.render('weather_rss.ejs',{usernam:req.user.username});
	   console.log(req.user);
	   }
       else res.render('login.ejs', { message: req.flash('loginMessage'),message1:req.flash('signupMessage') });
 });


app.get('/logout', function(req, res) {
req.session.destroy();

res.redirect('/');

});

app.listen(8080);

