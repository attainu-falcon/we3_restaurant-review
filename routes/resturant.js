const express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' })
const router  = express.Router();
const autoIncrement = require("mongodb-autoincrement");
const bcrypt = require('bcrypt');
var cloudinary = require("cloudinary").v2;
require("dotenv").config();
const saltRounds = 10;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

var before=[
    {
        name:'Sign up',
        link:'signup'
    },
    {
        name:'Login',
        link:'login'
    }
];
var after=[
    {
        name:'Home',
        link:'home'
    },
    {
        name:'Add Resturant',
        link:'addresturant'
    },
    {
        name:'Delete Resturant',
        link:'delresturant'
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

router.get('/reset_password', function(req, res ){
    if(req.session.rest==true){
        res.render('rest_password_reset',{title:"password reset",nav:after}) 
      }
    else res.redirect('/resturant/login')
});




router.get('/delresturant', function(req, res ){
    if(req.session.rest==true){
       

        var db = req.app.locals.db; 
        db.collection("resturant_details").find({res_id:req.session.rest_id}).toArray(function(err, result) {
        res.render('res_del',{title:" Login",data:result,nav:after})
        });

      }
    else res.redirect('/resturant/login')
});


router.get('/login', function(req, res ){
    if(req.session.rest!=true)
    res.render('rest_login',{title:" Login",nav:before})
    else res.redirect('home')

});

router.get('/signup', function(req, res ){
    if(req.session.rest!=true)
    res.render('rest_signup',{title:"signup",nav:before})
    else res.redirect('home')


});
router.get('/addresturant', function(req, res ){
    
    if(req.session.rest==true){
       
    res.render('rest_add',{title:"Add Resturant",nav:after})
      }
    else res.redirect('/resturant/login')
});
router.get('/home', function(req, res ){
    if(req.session.rest==true){
       

        var db = req.app.locals.db; 
        db.collection("resturant_details").find({res_id:req.session.rest_id}).toArray(function(err, result) {
        res.render('rest',{title:" Login",data:result,nav:after})
        });

      }
    else res.redirect('/resturant/login')
});

router.get('/delete/:id', function(req, res ){
    if(req.session.rest==true){
       

        var db = req.app.locals.db; 
        db.collection("resturant_details").deleteOne({res_branch_id:req.params.id}, function(err, result) {
        res.redirect('/resturant/delresturant');
        });

      }
    else res.redirect('/resturant/login')
});





router.post('/reset_password', function(req, res ){
    var db = req.app.locals.db; 
    
    db.collection("rest_owner_details").findOne({id:req.session.rest_id}, function(err, result) {
        var current_pwd=result.password;
        bcrypt.compare(req.body.current_password, current_pwd, function(err, pwd_check) {
           
            if(!pwd_check)  res.render('password_reset',{error:"please enter the old password correctly",nav:after,title:"password reset"})
            else{

                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    db.collection("rest_owner_details").updateOne({email:result.email},{ $set: {password: hash } } , function(err, updated) {
                        if (err) throw err;
                       else{
                        req.session.destroy();
                        res.render('rest_login',{sucess:'password updated sucessfully',title:"Login",nav:after});
                     }    
                    });
                });
            }
        });
    });
});



router.post('/auth', function(req, res ){
    var db = req.app.locals.db; 
    db.collection("rest_owner_details").findOne({email:req.body.email}, function(err, result) {
        if(result==null)  res.render('rest_login',{nav:before,error:'Please check the email id or write us cs@mail.com',title:"Login"}); 
        else {
            bcrypt.compare(req.body.password, result.password, function(err, auth) {
               if(auth)
               {
                req.session.rest = true;
                req.session.rest_id=result.id;
                res.redirect("/resturant/home")
               }
               else res.render('rest_login',{nav:before,error:'Please check passord or write us cs@mail.com',title:"Login"}); 
            });
        }
     });
});



router.post("/addresturant", upload.single("img"), function(req, res, next) {
  var db = req.app.locals.db;
  console.log(req.file.path);
  autoIncrement.getNextSequence(db, "resturant_details", function(
    err,
    autoIndex
  ) {
    var updatedobj = req.body;
    updatedobj.res_branch_id = "rest_id20" + autoIndex;
    updatedobj.res_id = req.session.rest_id;
    cloudinary.uploader.upload(
      req.file.path,
      { resource_type: "auto" },
      function(error, result) {
        if (error) {
          return res.send("error uploading..");
        }
        if (result) {
          updatedobj.rest_img = result.secure_url;
          db.collection("resturant_details").insertOne(updatedobj);
          res.redirect("/resturant/home");
        }
      }
    );
  });
});



router.post('/signup',function(req,res){
    var db = req.app.locals.db; 
    var pwd="";
        db.collection("rest_owner_details").findOne({email:req.body.email}, function(err, result) {
            if (err) throw err;
           
            if(result!=null){
                res.render('rest_login',{nav:before,error:'you have already an acount please login',title:"login"}); 
               }
           else{
                 bcrypt.genSalt(saltRounds, function(err, salt) {
                     bcrypt.hash(req.body.password, salt, function(err, hash) {
                     pwd=hash;
                        autoIncrement.getNextSequence(db, 'rest_owner_details', function (err, autoIndex) {
                            var updatedobj=req.body;
                            delete updatedobj.password;
                            delete updatedobj.password1;
                            updatedobj.password=hash;
                            updatedobj.id="rest_ownm10"+autoIndex;
         
                        db.collection('rest_owner_details').insertOne(updatedobj);
                        res.render('rest_login',{nav:before,sucess:'Account created sucessfully please login',title:"Login"}); 
                     });
                 });
             });
         }
    });
 });




router.get('/logout', function(req, res){
    req.session.destroy();
    res.render('rest_login',{nav:before,sucess:'logout sucessfully',title:"Login"});  
  });
  










module.exports = router;