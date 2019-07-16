const express = require('express');
var dateTime = require('node-datetime');
const router  = express.Router();
const autoIncrement = require("mongodb-autoincrement");
const bcrypt = require('bcrypt');
var cloudinary = require("cloudinary").v2;
require("dotenv").config();
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' })
const saltRounds = 10;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

var beforelogin=[
    {
        name:'Home',
        link:'home'
    },
    {
        name:'Sign up',
        link:'signup'
    },
    {
        name:'Login',
        link:'login'
    }
];

var afterlogin=[
    {
        name:'Home',
        link:'home'
    },
    {
        name:'Change Password',
        link:'reset_password'
    },
    {
        name:'Logout',
        link:'logout'
    }

];
var beforelogin1=[
    {
        name:'Home',
        link:'../home'
    },
    {
        name:'Sign up',
        link:'../signup'
    },
    {
        name:'Login',
        link:'../login'
    }
];

var afterlogin1=[
    {
        name:'Home',
        link:'../home'
    },
    {
        name:'Change Password',
        link:'../reset_password'
    },
    {
        name:'Logout',
        link:'../logout'
    }

];
/*
router.get('/home', function(req, res ){
   
    var db = req.app.locals.db; 
    db.collection("resturant_details").find({}).toArray(function(err, result) {   
        if(req.session.user==true)
        res.render('user',{title:" Login",data:result,nav:afterlogin})
        else
    res.render('user',{title:" Login",data:result,nav:beforelogin})
    });
});
*/

router.get('', function(req, res ){
    if(req.session.user==true)
        res.render('welcome',{title:"welcome",nav:afterlogin,search:"/"}) 
        else
        res.render('welcome',{title:" welcome",nav:beforelogin,search:"/"}) 

      
});
router.get('/reset_password', function(req, res ){
    if(req.session.user==true){
        res.render('password_reset',{title:"password reset",nav:afterlogin,search:"/"}) 
      }
    else res.redirect('/home')
});
router.get('/login', function(req, res ){
    if(req.session.user!=true)
    res.render('login',{title:" Login",nav:beforelogin,search:"/"})
    else
    res.redirect('/home')
 
});

router.get('/signup', function(req, res ){
    if(req.session.user!=true)
    res.render('signup',{title:"signup",nav:beforelogin,search:"/"})
    else
    res.redirect('/home')
});
router.get('/home/:id', function(req, res ){
        var db = req.app.locals.db; 
      db.collection("user_reviews").find({branch_id:req.params.id}).toArray(function(err, reviews) {
   
        db.collection("user_reviews").aggregate([{$match:{branch_id:req.params.id}},{$count: "total"} ]).toArray(function(err, count) {

        db.collection("user_reviews").aggregate([{$match:{branch_id:req.params.id}},{$group : {_id : "$branch_id", rate : {$avg : "$ratings"}}}]).toArray(function(err, avg) {

   
      db.collection("resturant_details").findOne({res_branch_id:req.params.id}, function(err, result) {
        if(avg.length==1)
        {
        avg=avg[0].rate.toFixed(1)
        }
        if(req.session.user==true)
        res.render('user_resturant',{title:"Home",data:result,cuisines:result.cuisines,rest_id:req.params.id, comment:reviews,avg:avg,count:count[0],nav:afterlogin1,search:"../"});
        else
        res.render('user_resturant',{title:"Home",data:result,cuisines:result.cuisines,rest_id:req.params.id, comment:reviews,avg:avg,count:count[0],nav:beforelogin1,search:"../"});
    
    });
});
    });
});
      
});


router.post("/review", upload.single("img"), function(req, res, next) {
  console.log(req.file.path);
  if (req.session.user == true) {
    var dt = dateTime.create();
    var date = dt.format("d/m/Y");
    var updatedobj = req.body;
    updatedobj.user_id = req.session.user_id;
    updatedobj.username = req.session.username;
    updatedobj.date = date;
    updatedobj.ratings = parseInt(req.body.rating);
    delete updatedobj.rating;
    var db = req.app.locals.db;
    console.log(req.file.path);
    cloudinary.uploader.upload(
      req.file.path,
      { resource_type: "auto" },
      function(error, result) {
        if (error) {
          return res.send("error uploading..");
        }
        if (result) {
          updatedobj.img = result.secure_url;
          db.collection("user_reviews").insertOne(updatedobj, function(
            err,
            ress
          ) {
            res.redirect("/home/" + req.body.branch_id);
          });
        }
      }
    );
  } else {
    res.render("reviewlogin", {
      title: " Login",
      id: req.body.branch_id,
      error: "please login for before reviewing",
      nav: beforelogin
    });
  }
});



router.post('/reset_password', function(req, res ){
    var db = req.app.locals.db; 
    
    db.collection("user_details").findOne({id:req.session.user_id}, function(err, result) {
        var current_pwd=result.password;
        bcrypt.compare(req.body.current_password, current_pwd, function(err, pwd_check) {
           
            if(!pwd_check)  res.render('password_reset',{error:"please enter the old password correctly",title:"password reset",nav:afterlogin,search:"/"})
            else{

                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    db.collection("user_details").updateOne({email:result.email},{ $set: {password: hash } } , function(err, updated) {
                        if (err) throw err;
                       else{
                        req.session.destroy();
                        res.render('login',{sucess:'password updated sucessfully',title:"Login",nav:beforelogin,search:"/"});
                     }    
                    });
                });
            }
        });
    });
});

router.post('/auth', function(req, res ){
    var db = req.app.locals.db; 
    db.collection("user_details").findOne({email:req.body.email}, function(err, result) {
        if(result==null)  res.render('login',{error:'Please check the email id or write us cs@mail.com',title:"Login",nav:beforelogin,search:"/"}); 
        else {
            bcrypt.compare(req.body.password, result.password, function(err, auth) {
               if(auth)
               {
                req.session.user = true;
                req.session.user_id=result.id;
                req.session.username=result.name;
                res.redirect("/")
                console.log("hello")
               }
               else res.render('login',{error:'Please check passord or write us cs@mail.com',title:"Login",nav:beforelogin,search:"/"}); 
            });
        }
     });
});

router.post('/reviewauth', function(req, res ){
    var db = req.app.locals.db; 
    db.collection("user_details").findOne({email:req.body.email}, function(err, result) {
        if(result==null)  res.render('login',{error:'Please check the email id or write us cs@mail.com',title:"Login",nav:beforelogin,search:"/"}); 
        else {
            bcrypt.compare(req.body.password, result.password, function(err, auth) {
               if(auth)
               {
                req.session.user = true;
                req.session.user_id=result.id;
                req.session.username=result.name;
                res.redirect("/home/"+req.body.id)
               }
               else res.render('reviewlogin',{error:'Please check passord or write us cs@mail.com',title:"Login",nav:beforelogin,search:"/"}); 
            });
        }
     });
});

router.post('/signup',function(req,res){
    var db = req.app.locals.db; 
    var pwd="";
        db.collection("user_details").findOne({email:req.body.email}, function(err, result) {
            if (err) throw err;
           
            if(result!=null){
                res.render('login',{error:'you have already an acount please login',title:"login",nav:beforelogin,search:"/"}); 
               }
           else{
                 bcrypt.genSalt(saltRounds, function(err, salt) {
                     bcrypt.hash(req.body.password, salt, function(err, hash) {
                     pwd=hash;
                        autoIncrement.getNextSequence(db, 'user_details', function (err, autoIndex) {
                        db.collection('user_details').insertOne({id:"usr10"+autoIndex,name:req.body.name, email:req.body.email,password:pwd});
                        res.render('login',{sucess:'Account created sucessfully please login',title:"Login",nav:beforelogin,search:"/"}); 
                     });
                 });
             });
         }
    });
 });




 router.get('/home', function(req, res){
if(req.query.city)
{
    req.session.city=req.query;
}


    var db = req.app.locals.db; 

    db.collection('user_reviews').aggregate( [ {  
        $group : { _id : "$branch_id",
         avg: { $avg: "$ratings" },
}
}
] ).toArray(function(err, rating) {

    db.collection("resturant_details").find(req.session.city).toArray(function(err, details) {   
var resttemp=details;
var ratingtemp=rating;
    
for (var i = 0; i < resttemp.length; i++) {
    for (var j = 0; j < ratingtemp.length; j++) {
      if (resttemp[i]["res_branch_id"] == ratingtemp[j]["_id"])
      {
        resttemp[i].rating = ratingtemp[j].avg.toFixed(1);
      }
      
   }
}

if(req.session.user)
{
res.render('user',{title:" home",data:resttemp,nav:afterlogin,search:"/"})

}
else if(req.session.city)
res.render('user',{title:" home",data:resttemp,nav:beforelogin,city:req.session.city.city,search:"/"})
else
res.render('user',{title:" home",data:resttemp,nav:beforelogin,city:'India',search:"/"})


    });
    
    });

});


router.get('/logout', function(req, res){
    req.session.destroy();
    res.render('login',{sucess:'logout sucessfully',title:"Login",nav:beforelogin,search:"/"});  
  });
  
module.exports = router;