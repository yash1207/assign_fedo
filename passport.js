var LocalStrategy=require('passport-local').Strategy;
var express = require("express");
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
var mysql=require('mysql');
var passport = require('passport');
var flash = require('connect-flash');
app.use(flash());
app.use(passport.session());
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

module.exports = function(passport) {
	var ob=new DB();

passport.serializeUser(function(user, done) {
done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function(id, done){ 
ob.query("select * from users where id = "+id,function(err,rows){  
done(err, rows[0]);
});
});

passport.use('local-login',new LocalStrategy({
// by default, local strategy uses username and password, we will override with email
usernameField : 'username',
passwordField : 'password',
passReqToCallback : true
// passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req,username, password, done) { // callback with email and password from our form
//console.log("----"+username+"-----");
ob.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
	//console.log("--1---");
	//console.log("Error:",err,"  Result:",rows);
if (err){
	//console.log("--2---");
return done(err);
}
if (!rows.length) {
	//console.log("--3---");
return done(null, false,req.flash('loginMessage', 'No user found with this username, try again.')); // req.flash is the way to set flashdata using connect-flash
}
// if the user is found but the password is wrong
if (password != rows[0].password)
return done(null, false,req.flash('loginMessage', 'Oops! Wrong password, try again.')); // create the loginMessage and save it to session as flashdata
// all is well, return successful user
return done(null, rows[0]);
});
}));
passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            //console.log("name--1",req.body.first_name+req.body.last_name);
			ob.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err){
                    //console.log("////error");
					return done(err);
				
				}
                if (rows.length) {
                    //console.log("user found already");
					return done(null, false, req.flash('signupMessage', 'This username already exists, please try with another username'));
                } else {
                    // if there is no user with that username
                    // create the user
					//console.log("name--2",req.body.first_name+req.body.last_name);
                    var newUserMysql = {
						firstname:req.body.first_name,
						lastname:req.body.last_name,
						email:req.body.email,
                        username: username,
                        password: password  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( first_name,last_name, username, password,email ) values (?,?,?,?,?)";

                    ob.query(insertQuery,[newUserMysql.firstname,newUserMysql.lastname,newUserMysql.username, newUserMysql.password,newUserMysql.email],function(err, rows) {
                        newUserMysql.id = rows.insertId;
                         //console.log("Done!!!!");
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );


};
///////////////////////

