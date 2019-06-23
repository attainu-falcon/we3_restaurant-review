const express = require('express');
const router  = express.Router();
const autoIncrement = require("mongodb-autoincrement");
const bcrypt = require('bcrypt');
const saltRounds = 10;



router.get('/reset_password', function(req, res ){
    if(req.session.user==true){
        res.render('password_reset',{title:"password reset"}) 
      }
    else res.redirect('/')
});
router.get('/login', function(req, res ){
    res.render('login',{title:" Login"})
 
});

router.get('/signup', function(req, res ){
    res.render('signup',{title:"signup"})
});
router.get('/home', function(req, res ){
    if(req.session.user==true){
        res.render('user',{title:"Home"});
      }
      else{  console.log("user fghdgh")
     res.redirect('/login')}
});




router.post('/reset_password', function(req, res ){
    var db = req.app.locals.db; 
    
    db.collection("user_details").findOne({id:req.session.user_id}, function(err, result) {
        var current_pwd=result.password;
        bcrypt.compare(req.body.current_password, current_pwd, function(err, pwd_check) {
           
            if(!pwd_check)  res.render('password_reset',{error:"please enter the old password correctly",title:"password reset"})
            else{

                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    db.collection("user_details").updateOne({email:result.email},{ $set: {password: hash } } , function(err, updated) {
                        if (err) throw err;
                       else{
                        req.session.destroy();
                        res.render('login',{sucess:'password updated sucessfully',title:"Login"});
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
        if(result==null)  res.render('login',{error:'Please check the email id or write us cs@mail.com',title:"Login"}); 
        else {
            bcrypt.compare(req.body.password, result.password, function(err, auth) {
               if(auth)
               {
                req.session.user = true;
                req.session.user_id=result.id;
                res.redirect("/home")
               }
               else res.render('login',{error:'Please check passord or write us cs@mail.com',title:"Login"}); 
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
                res.render('login',{error:'you have already an acount please login',title:"login"}); 
               }
           else{
                 bcrypt.genSalt(saltRounds, function(err, salt) {
                     bcrypt.hash(req.body.password, salt, function(err, hash) {
                     pwd=hash;
                        autoIncrement.getNextSequence(db, 'user_details', function (err, autoIndex) {
                        db.collection('user_details').insertOne({id:"usr10"+autoIndex,name:req.body.name, email:req.body.email,password:pwd});
                        res.render('login',{sucess:'Account created sucessfully please login',title:"Login"}); 
                     });
                 });
             });
         }
    });
 });




router.get('/logout', function(req, res){
    req.session.destroy();
    res.render('login',{sucess:'logout sucessfully',title:"Login"});  
  });

/*
This route will allow user to see comments and reviews of the customer. 
Note: Since we have no data available currently I am using stubs for 
current review.
Later when we will be able to get data from database as user starts reviewing 
then we will replace the stub with real data.
*/

router.get("/review_comment_view", (req, res)=>{
    res.render('review_comment_view', {title: 'View Reviews and Comments'});
});
  











module.exports = router;