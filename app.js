//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
const ObjectID = require("mongodb").ObjectId;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret: 'Mylittlescretscannottellyouhaha',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

let posts = [];


mongoose.connect('mongodb://localhost:27017/myblogNew');

const blog = new mongoose.Schema({
  title:String,
  content:String,
  time: String,
  starUser:[String],  
  comment:[{
    name:String,
    content:String,
    time:String
  }]
});

const messageSchema = new mongoose.Schema({
  name:String,
  content:String,
  time:String
})
const userSchema = new mongoose.Schema({
 email:String,
 password:String,
 googleid:String,
 name:String,
 username:{
  type:String,


 }
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User =  mongoose.model("User",userSchema);


const Blog = mongoose.model("Blog",blog);
const Message = mongoose.model("Message",messageSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_KEY,
  callbackURL: "http://localhost:3000/auth/google/blogs"
},
function(accessToken, refreshToken, profile, done) {
  User.findOne({
    "googleid": profile.id 
}, function(err, user) {
    if (err) {
        return done(err);
    }
    //No user was found... so create a new user with values from Facebook (all the profile. stuff)
    if (!user) {
        user = new User({
             name: profile.displayName,
            // email: profile.emails[0].value,
            // username: profile.username,
            // provider: 'facebook',
            // //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
            // facebook: profile._json
            googleid:profile.id
            
        });
        user.save(function(err) {
            if (err) console.log(err);
            return done(err, user);
        });
    } else {
        //found user. Return
        return done(err, user);
    }
});
}
));


// User.register({username:'Olivia@olivia.com', active: false}, 'ZanderXiaoaoHao', function(err, user) {
//   if (err) { 
//     console.log(err)
//   }});

//   const authenticate = User.authenticate();
//   authenticate('Olivia', 'ZanderXiaoaoHao', function(err, result) {
//     if (err) { console.log(err) }
//     else {
//       console.log( "Registered!");
//     }});

app.get("/", function(req, res){
  let currentUserName ="Guest";
  if(req.isAuthenticated()){
    const _id = ObjectID(req.session.passport.user);
    console.log("id:"+_id);
    User.findOne({_id:_id},(err,doc)=>{
      if (err){
        console.log(err);
      }else{
        console.log(doc);
        currentUserName = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
        console.log("///////////////////////")
    Blog.find({},function(err,doc){
      if(err){
        console.log(err);
  
      }else{
              Message.find({},function(err,mess){
                if(err){
                  console.log(err)
                }else{
                  res.render("home", {
      
                    startingContent: homeStartingContent,
                    posts: doc.reverse(),
                    userName: currentUserName,
                    messages:mess
                    });

                }

              })
        
        
      }
    })
      }
      ;

    })
    
  }else{
    
    console.log("///////////////////////")
    Blog.find({},function(err,doc){
      if(err){
        console.log(err);
  
      }else{
              
        
        Message.find({},function(err,mess){
          if(err){
            console.log(err)
          }else{
            res.render("home", {

              startingContent: homeStartingContent,
              posts: doc.reverse(),
              userName: currentUserName,
              messages:mess
              });

          }

        })
      }
    })

  }
  
 
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/blogs", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/compose");
  });

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  console.log("contact");
  if(req.isAuthenticated()){
    res.render("contact", {contactContent: contactContent});
  }else{
    res.redirect("/about");
  }

  
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
   console.log("para:"+req.params);
   console.log("bodytitle"+ req.body.postTitle); 
   console.log("body content"+ req.body.postBody); 
   const monthsInEng=["January","February","March","April","May","Junne","July","August","September","October","November","December"]
   const postTitle = req.body.postTitle;
   const postBody = req.body.postBody;
   const date = new Date();
   const year = date.getFullYear();
   const month =  monthsInEng[date.getMonth()] ;
   const day = date.getDate();
   const time = day+" "+month+", "+year;
   Blog.insertMany({
    title:postTitle,
    content:postBody,
    time: time,
    starUser:[],
    comment:[]

   },function(error,docs){
    if(error){
      console.log(error)
    }
    else{
      console.log(docs)
      console.log(time)
      console.log("Insert successfully!")
    }
   })
  
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };

  posts.push(post);

  res.redirect("/");

});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  Blog.find({},function(err,docs){
    if(err){
      console.log(err);
    }else if(docs){
      docs.forEach(function(post){
        const storedTitle = _.lowerCase(post.title);
    
        if (storedTitle === requestedTitle) {
          res.render("post", {
            title: post.title,
            content: post.content
          });
        }
      });
    }
  })
  

});
app.get("/update/:postName",function(req,res){
  const requestedTitle = _.lowerCase(req.params.postName);
  Blog.find({},function(err,docs){
    if(err){
      console.log(err);
    }else if(docs){
      docs.forEach(function(post){
        const storedTitle = _.lowerCase(post.title);
    
        if (storedTitle === requestedTitle) {
          res.render("update", {
            title: post.title,
            content: post.content,
            id:post._id
          });
        }
      });
    }
  })
});
app.post("/confirm",function(req,res){
  const idUpdate = req.body.id.trim();
  const titleUpdate = req.body.postTitle;
  const contentUpdate = req.body.postBody;
  const ytitle= req.body.ytitle;
  res.render("confirmUpdate",{title:titleUpdate,content:contentUpdate, name:ytitle,id:idUpdate})
});




app.post("/update",function(req,res){
  const idUpdate = req.body.id.trim();
  const titleUpdate = req.body.postTitle;
  const contentUpdate = req.body.postBody;
  Blog.updateOne({_id:idUpdate},{title:titleUpdate,content:contentUpdate},function(err,doc){
    if(err){
      console.log(err)
    }
    else{
      console.log("Successfully!")
      res.redirect("/posts/:"+titleUpdate);
    }
  });
});




app.get("/home/:number",function(req,res){
  console.log("***********************************************")
  
  const pageNum = req.params.number;
   function getuser(callback){
    let currentUserName ="Guest";
    if(req.isAuthenticated()){
      
       
      const _id = ObjectID(req.session.passport.user);
      console.log("id:"+_id);
       User.findOne({_id:_id},(err,doc)=>{
        if (err){
          console.log(err);
        }else{
          console.log("显示用户信息："+doc);
          currentUserName = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
          console.log("确认一下这个人名："+currentUserName);
          callback(currentUserName);
        }});
    }
   

  }
  getuser(getblog);
 
    
  function getblog(username){
    console.log("当前是第"+pageNum+"页");
  Blog.find({},function(err,doc){
    if(err){
      console.log(err);

    }else{
      const reversPosts = doc.reverse();
      let pagePost =[];
      let intpageNum = parseInt(pageNum);
      let itemNumPerPage = 2;      
      let maxItemNum =reversPosts.length;
      let maxPageNum =(parseInt(maxItemNum/itemNumPerPage) )+1;
      if(pageNum > maxPageNum){
        res.send("Not found 404");
      }else if(intpageNum === maxPageNum){
        for( let i = itemNumPerPage*(intpageNum-1); i < maxItemNum; i ++){
          pagePost.push( reversPosts[i])
          console.log(i);
         }
         console.log("这页显示的数组是："+pagePost);
         console.log("这页的用户是："+ username);
   
         res.render("homePages", {
       
           startingContent: homeStartingContent,
           posts: pagePost, 
           pageshowNum:intpageNum,
           maxPage:maxPageNum,
           userName:username
   
           });

      }else{
        console.log("itemNumPerpage:"+ itemNumPerPage);
        console.log("intpagenum: " + intpageNum);
        let iori = itemNumPerPage*(intpageNum - 1);
       
        for( let i = itemNumPerPage*(intpageNum-1); i <itemNumPerPage*intpageNum; i ++){
          pagePost.push( reversPosts[i])
          console.log("现在显示"+i);
         }
         console.log("这页显示的数组是："+pagePost);
         console.log("这页的用户是："+ username);
   
         res.render("homePages", {
       
           startingContent: homeStartingContent,
           posts: pagePost, 
           pageshowNum:intpageNum,
           maxPage:maxPageNum,
           userName:username
   
   
           });

      }



     
    }})
  }

  });
app.get("/delete/:postName",function(req,res){
  const requsetedTitle = req.params.postName;
  Blog.deleteOne({title:requsetedTitle},function(err,doc){
    if(err){
      console.log(err);
    }else{
      console.log("Delete sucessfully!");
      res.redirect("/");
    }
  })
})

app.get("/login",function(req,res){
  res.render("login");
});
app.post("/login",function(req,res){
 
 const user = new User({
  username:req.body.username,
  password:req.body.password
 });
  req.login(user, function(err) {
    if (err) {
      //console.log(err)
      res.redirect("/");

     }
    else{
      console.log("else");
      passport.authenticate('local',{ failureRedirect: '/unauthorized', failureMessage: true })(req,res,function(){
        
        res.redirect("/contact");
      });
       
    }
  })
  });
app.get("/unauthorized",function(req,res){
  res.render("unauthorized");
});

app.post("/homeMessages",function(req,res){
  const usersid = req.session.passport.user;
  User.findOne({_id:usersid},function(err,doc){
    if(err){
      console.log(err)

    }else{
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', "December"];
          const usersname=  doc.name;
          let currentYear = new Date().getFullYear();
          let currentMonth = months[ new Date().getMonth()];
          let currentDay = new Date().getDay();
          let currentHour = new Date().getHours();
          let currentMinute = new Date().getMinutes();
          let currentTime = currentDay+","+currentMonth+","+currentYear+ ", "+currentHour+":"+currentMinute
          Message.insertMany({
            name:usersname,
            content:req.body.text,
            time: currentTime
          },function(err,docs){
            if(err){
              console.log(err);
            }else{
              console.log(doc);
            }

          });
    }
  })

  res.redirect("/about");
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
