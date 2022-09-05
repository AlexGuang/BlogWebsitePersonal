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
const { min } = require('lodash');

const homeStartingContent = "";
const aboutContent = "I am Jingyao (Olivia), thank you for visiting my first blog post!  I am so excited to be writing this right now. As a beginner for programmer. I finally have my personal site being able to share ideas. That's a milestone, so fun and exciting to me. For my blog, this space will be a little bit of everything on my learning journey.  From HTML, CSS, Javascript, databasese such as MYSQL, MongoDB, and personal life perspectives. If you think Olivia's blog is good, you can share the link to your friends or give it a star! It means a lot to me HAHA. I just wanted to say thank you so much for just being here and reading my first blog. Hope you continue to follow along! Thanks again, friends!";
const contactContent = "Email: oliviachen797@gmail.com";

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
  subject:String,
  starUser:[String],  
  comment:[{
    name:String,
    content:String,
    time:String
  }]
});
const topblog = new mongoose.Schema({
  title:String,
  star:String
})

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
 level:String,
 username:{
  type:String,


 },
 fname:String,
gname:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User =  mongoose.model("User",userSchema);


const Blog = mongoose.model("Blog",blog);
const Message = mongoose.model("Message",messageSchema);
const Topblog = mongoose.model("Topblog",topblog);
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
  console.log(profile);
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
            googleid:profile.id,
            fname:profile.name.familyName,
            gname:profile.name.givenName
            
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




app.get("/", function(req, res){
  res.redirect("/home/1");
  // let currentUserName ="Guest";
  // if(req.isAuthenticated()){
  //   const _id = ObjectID(req.session.passport.user);
  //   console.log("id:"+_id);
  //   User.findOne({_id:_id},(err,doc)=>{
  //     if (err){
  //       console.log(err);
  //     }else{
  //       console.log(doc);
  //       currentUserName = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
  //       givenName= doc.gname.charAt(0).toUpperCase() + doc.gname.slice(1);
  //       console.log("?#?#?#?#?#?#?#??#?#?#?#?#?#?#?#??#?#?#?#?#")
  //   Blog.find({},function(err,doc){
  //     if(err){
  //       console.log(err);
  
  //     }else{
  //             Message.find({},function(err,mess){
  //               if(err){
  //                 console.log(err)
  //               }else{

  //                 Topblog.find({},function(err,topblog){
  //                   if(err){
  //                     console.log(err)
  //                   }else{
  //                     let topsblog = [];
  //                     let blogtop = topblog.reverse();
  //                     for(let i =0 ;i< Math.min(10,blogtop.length);i++){
  //                       topsblog.push(blogtop[i]);

  //                     }
  //                     console.log("打印出来")
  //               console.log(topsblog)
  //                     res.render("home", {
      
  //                       startingContent: homeStartingContent,
  //                       posts: doc.reverse(),
  //                       userName: currentUserName,
  //                       messages:mess,
  //                       islogin:true,
  //                       topssblog:topsblog,
  //                       givenname:givenName
  //                       });
  //                   }
  //                 })

                 

  //               }

  //             })
        
        
  //     }
  //   })
  //     }
  //     ;

  //   })
    
  // }else{
    
  //   console.log("///////////////////////")
  //   Blog.find({},function(err,doc){
  //     if(err){
  //       console.log(err);
  
  //     }else{
              
        
  //       Message.find({},function(err,mess){
  //         if(err){
  //           console.log(err)
  //         }else{
  //           Topblog.find({},function(err,topblog){
  //             if(err){
  //               console.log(err)
  //             }else{
  //               let topsblog = [];
  //               let blogtop = topblog.reverse();
  //               for(let i =0 ;i< Math.min(10,blogtop.length);i++){
  //                 topsblog.push(blogtop[i]);

  //               }
  //               console.log("打印出来")
  //               console.log(topsblog)
  //               res.render("home", {

  //                 startingContent: homeStartingContent,
  //                 posts: doc.reverse(),
  //                 userName: currentUserName,
  //                 messages:mess,
  //                 islogin:false,
  //                 topssblog:topsblog
  //                 });
  //             }
  //           })
  //         }

  //       })
  //     }
  //   })

  // }
  
 
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/blogs", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  });

app.get("/about", function(req, res){
  let islog= false;
  let given = "Guest"
  if(req.isAuthenticated()){
   const userid = req.session.passport.user;
   User.findOne({_id:userid},function(err,user){
     if(err){
       console.log(err)
     }else{
       given = user.gname;
       islog= true;
       res.render("about", {aboutContent: aboutContent,givenname:given,islogin:islog});
  
     }
   })
  }else{
    res.render("about", {aboutContent: aboutContent,givenname:given,islogin:islog});

  }
    



});

app.get("/contact", function(req, res){
  let given = "Guest";
  let islog= false;
 if(req.isAuthenticated()){
  const userid = req.session.passport.user;
  User.findOne({_id:userid},function(err,user){
    if(err){
      console.log(err)
    }else{
      islog= true;
      given = user.gname;
      res.render("contact", {contactContent: contactContent,givenname:given,islogin:islog});
 
    }
  })
 }else{
  res.render("contact", {contactContent: contactContent,givenname:given,islogin:islog});

 }
    
 

  
});


app.get("/home",function(req,res){
  if(req.isAuthenticated()){
    const user = req.session.passport.user;
    User.findOne({_id:user},function(err,user){
      if(err){
        console.log(err)
      }else{
        if(user.level === "1"){
          res.redirect("/compose")
        }else{
          res.redirect("/");
        }
      }
    })
  }else{
    res.redirect("/");
  }

})

app.get("/compose", function(req, res){
  if(req.isAuthenticated()){
    const user = req.session.passport.user;
    User.findOne({_id:user},function(err,user){
      if(err){
        console.log(err)
      }else{
        if(user.level === "1"){
          res.render("compose",{islogin:true,userName:user.name})
        }else{
          res.redirect("/");
        }
      }
    })
  }else{
    res.redirect("/");
  }
  
});

app.post("/compose", function(req, res){
   console.log("para:"+req.params);
   console.log("bodytitle"+ req.body.postTitle); 
   console.log("body content"+ req.body.postBody); 
   const monthsInEng=["January","February","March","April","May","Junne","July","August","September","October","November","December"]
   const postTitle = req.body.postTitle;
   const postBody = req.body.postBody;
   const postsub = req.body.subject;
   const date = new Date();
   const year = date.getFullYear();
   const month =  monthsInEng[date.getMonth()] ;
   const day = date.getDate();
   const time = day+", "+month+", "+year;
   Blog.insertMany({
    title:postTitle,
    content:postBody,
    time: time,
    subject:postsub,
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
  


  res.redirect("/");

});
app.get("/subjects/:subjectName", function(req, res){
  
  const subjects = req.params.subjectName;
  console.log(subjects);
  let client = "Guest";
  let given ="Guest";
  if(req.isAuthenticated()){
    const userid = req.session.passport.user;
    User.findOne({_id:userid},function(err,user){
      if(err){
        console.log(err)
      }else{
        client = user.name;
        given = user.gname;
        Blog.find({subject:subjects},function(err,blogs){
          if(err){
            console.log(err)
          }else{
            const posts = blogs;
            console.log("打印科目");
            console.log(posts);
            Message.find({},function(err,mess){
              if(err){
                console.log(err)
              }else{

                Topblog.find({},function(err,topblog){
                  if(err){
                    console.log(err)
                  }else{
                    let topsblog = [];
                    let blogtop = topblog.reverse();
                    for(let i =0 ;i< Math.min(10,blogtop.length);i++){
                      topsblog.push(blogtop[i]);

                    }
                    console.log("打印出来")
            //  console.log(topsblog)
                    res.render("home", {
    
                      startingContent: homeStartingContent,
                      posts: posts,
                      userName: client,
                      messages:mess,
                      islogin:true,
                      topssblog:topsblog,
                      subject:subjects,
                      givenname:given
            
                      });
                  }
                })

               

              }

            })


          }
        })
      }
    })
  }else{
    Blog.find({subject:subjects},function(err,blogs){
      if(err){
        console.log(err)
      }else{
        const posts = blogs;
        console.log("打印科目");
        console.log(posts);
        Message.find({},function(err,mess){
          if(err){
            console.log(err)
          }else{

            Topblog.find({},function(err,topblog){
              if(err){
                console.log(err)
              }else{
                let topsblog = [];
                let blogtop = topblog.reverse();
                for(let i =0 ;i< Math.min(10,blogtop.length);i++){
                  topsblog.push(blogtop[i]);

                }
                console.log("打印出来")
         // console.log(topsblog)
                res.render("home", {

                  startingContent: homeStartingContent,
                  posts: posts,
                  userName: client,
                  messages:mess,
                  islogin:false,
                  topssblog:topsblog,
                  subject:subjects,
                  givenname:given
        
                  });
              }
            })

           

          }

        })


      }
    })

  }
})

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  if(req.isAuthenticated()){
    const userid= req.session.passport.user;
    User.findOne({
      _id:userid
    },function(err,user){
      if(err){
        console.log(err)
      }else{
       const islevel = user.level;
        Blog.find({},function(err,docs){
          if(err){
            console.log(err);
          }else if(docs){
            docs.forEach(function(doc){
              const storedTitle = _.lowerCase(doc.title);
          
              if (storedTitle === requestedTitle) {
                res.render("post", {
                  post:doc,
                  islogin :true,
                  level:islevel
                });
              }
            });
          }
        })
      }
    })

  }else{
  
  Blog.find({},function(err,docs){
    if(err){
      console.log(err);
    }else if(docs){
      docs.forEach(function(doc){
        const storedTitle = _.lowerCase(doc.title);
    
        if (storedTitle === requestedTitle) {
          res.render("post", {
            post:doc,
            islogin :false,
            level:"2"
          });
        }
      });
    }
  })}

  

});


app.post("/blogMessages",function(req,res){
  if(req.isAuthenticated()){
    const userid = ObjectID(req.session.passport.user);
    const blogId = req.body.id.trim();
    const blogtitle = req.body.title;
    console.log("打印标题："+blogtitle);
    function getCurrentTime(){
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', "December"];
      let currentYear = new Date().getFullYear();
      let currentMonth = months[ new Date().getMonth()];
      let currentDay = new Date().getDate();
      let currentHour = new Date().getHours();
      let currentMinute = new Date().getMinutes();
      let currentTime = currentDay+","+currentMonth+","+currentYear+ ", "+currentHour+":"+currentMinute
      return currentTime;
    }

    Blog.findOne({_id:blogId},function(err,blog){
      console.log("我进来了")
      if(err){
        console.log(err);
      }else{
        console.log("dayin"+ blog);       
        
          User.findOne({_id:userid},function(err,thisuser){
            if(err){
              console.log(err)
            }else{     
              
              const oldcomment = blog.comment;     
              
              console.log("再看一遍你是谁"+blog._id);
              console.log("再看一遍你是谁"+blog.title);
              
              
              
              if(oldcomment.length===0){
              const usersname=  thisuser.name;
              const ctime = getCurrentTime();
              console.log("进入函数了！"+usersname+"hahaha"+req.body.text+"时间"+ctime);
              const newCooment = {
                name:usersname,
                content:req.body.text,
                time:ctime    
              };
              Blog.updateOne({_id:blogId},{comment:newCooment},function(err,result){
                if(err){
                  console.log(err);
                }else{
                  res.redirect("/posts/:"+req.body.tittle)
                }
              });
              console.log("kankan qingkuang")
            }else{
              let conmments = blog.comment;
              const usersname=  thisuser.name;
              const ctime = getCurrentTime();
              const newCooment = {
                name:usersname,
                content:req.body.text,
                time:ctime    
              };
              conmments.push(newCooment);
              Blog.updateOne({_id:blogId},{comment:conmments},function(err,result){
                if(err){
                  console.log(err);
                }else{
                  console.log(result);
                  setTimeout(function(){
                    res.redirect("/posts/:"+blogtitle);
                    console.log("刷新啦");
                  },500);
                 // res.redirect("/posts/:"+req.body.tittle)
                }
              });



            }

        }})
       
      
        
      
      }
    })
  }else{
    res.redirect("/login");
  }
  
})

app.post("/topartical",function(req,res){
  if(req.isAuthenticated()){
    const userid = req.session.passport.user;
    const newtitle = req.body.title;
    const starcount = req.body.starcount;
    User.findOne({_id:userid},function(err,user){
      if(err){
        console.log(err)
      }else{
        const userlevel = user.level;
        if(userlevel === "1"){
          Topblog.deleteOne({title:newtitle},function(err,result){
            if(err){
              console.log(err)
            }else{
              console.log(result);
              Topblog.insertMany([{title:newtitle,star:starcount}],function(err,doc){
                if(err){
                  console.log(err)
                }else{
                  console.log(doc);
                    res.redirect("/");
                  }
                })
              }})
            }else{
              res.redirect("/");
            }
          }})


        } else{
          res.redirect("/");
        }
      }
    );
 



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

app.post("/starclick",function(req,res){
  if(req.isAuthenticated()){
const user = req.session.passport.user;
const blogid = req.body.postid;
console.log(user);
console.log(blogid);
Blog.findOne({_id:blogid},function(err,blog){
  if(err){
    console.log(err)
  }else if(blog){
    if(blog.starUser.length ===0){
      Blog.updateOne({
        _id:blogid
      },{starUser:[user]},function(err,result){
        if (err){
          console.log(err)
        }else{
          res.redirect("/");
        }
      })
    }else{
      let starUser = blog.starUser;
      if(starUser.includes(user)){
       const  newstarUser = starUser.filter((num)=>num!==user);
       Blog.updateOne({_id:blogid},{starUser:newstarUser},function(err,resul){
        if(err){
          console.log(err);
        }else{
          res.redirect("/");
        }
       })
      }else{
        starUser.push(user);
        Blog.updateOne({_id:blogid},{starUser:starUser},function(err,resul){
          if(err){
            console.log(err);
          }else{
            res.redirect("/");
          }
         });
      }
    }
  }
})
  }else{
    res.redirect("/login");
  }
})

app.post("/starclicks",function(req,res){
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  if(req.isAuthenticated()){
const user = req.session.passport.user;
const blogid = req.body.postid;

console.log(user);
console.log(blogid);
Blog.findOne({_id:blogid},function(err,blog){
  if(err){
    console.log(err)
  }else if(blog){
    const blogtitle = blog.title;
    if(blog.starUser.length ===0){
      Blog.updateOne({
        _id:blogid
      },{starUser:[user]},function(err,result){
        if (err){
          console.log(err)
        }else{
          res.redirect("/posts/:"+blogtitle);
        }
      })
    }else{
      let starUser = blog.starUser;
      
      if(starUser.includes(user)){
       const  newstarUser = starUser.filter((num)=>num!==user);
       Blog.updateOne({_id:blogid},{starUser:newstarUser},function(err,resul){
        if(err){
          console.log(err);
        }else{
          res.redirect("/posts/:"+blogtitle);
        }
       })
      }else{
        starUser.push(user);
        Blog.updateOne({_id:blogid},{starUser:starUser},function(err,resul){
          if(err){
            console.log(err);
          }else{
            res.redirect("/posts/:"+blogtitle);
          }
         });
      }
    }
  }
})
  }else{
    res.redirect("/login");
  }
})


app.get("/home/:number",function(req,res){
  console.log("***********************************************")
  
  const pageNum = req.params.number;
   function getuser(callback){
    let currentUserName ="Guest";
    let login = false;
    let givenName = "Guest";
    if(req.isAuthenticated()){
      
       
      const _id = ObjectID(req.session.passport.user);
      console.log("id:"+_id);
       User.findOne({_id:_id},(err,doc)=>{
        if (err){
          console.log(err);
        }else{
          console.log("显示用户信息："+doc);
          currentUserName = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
          givenName= doc.gname.charAt(0).toUpperCase() + doc.gname.slice(1);
          console.log("确认一下这个人名："+currentUserName);
          login = true;
          callback(currentUserName,login,givenName);
        }});
    }else{
      callback(currentUserName,login,givenName);
    }
   

  }
  getuser(getblog);
 
    
  function getblog(username,login,givenName){
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


         Message.find({},function(err,mess){
          if(err){
            console.log(err)
          }else{
            Topblog.find({},function(err,topblog){
              if(err){
                console.log(err)
              }else{
                let topsblog = [];
                let blogtop = topblog.reverse();
                for(let i =0 ;i< Math.min(10,blogtop.length);i++){
                  topsblog.push(blogtop[i]);

                }
                console.log("打印出来");
          console.log(topsblog);
         
         res.render("homePages", {
       
           startingContent: homeStartingContent,
           posts: pagePost, 
           pageshowNum:intpageNum,
           maxPage:maxPageNum,
           userName:username,
           messages:mess,
           islogin:login,
           givenname:givenName,
           topssblog:topsblog
})}})
   
           }});

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
   
         Message.find({},function(err,mess){
          if(err){
            console.log(err)
          }else{
            Topblog.find({},function(err,topblog){
              if(err){
                console.log(err)
              }else{
                let topsblog = [];
                let blogtop = topblog.reverse();
                for(let i =0 ;i< Math.min(10,blogtop.length);i++){
                  topsblog.push(blogtop[i]);

                }
                console.log("打印出来");
          console.log(topsblog);
         
         res.render("homePages", {
       
           startingContent: homeStartingContent,
           posts: pagePost, 
           pageshowNum:intpageNum,
           maxPage:maxPageNum,
           userName:username,
           messages:mess,
           islogin:login,
           givenname:givenName,
           topssblog:topsblog})
   
           }});

      }



     
    })}
  }

  })}});
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
      res.redirect("/login");

     }
    else{
      console.log("else");
      passport.authenticate('local',{ failureRedirect: '/unauthorized', failureMessage: true })(req,res,function(){
        
        res.redirect("/");
      });
       
    }
  })
  });
app.get("/unauthorized",function(req,res){
  res.render("unauthorized");
});

app.post("/homeMessages",function(req,res){
  if(req.isAuthenticated()){
    const usersid = ObjectID(req.session.passport.user);
  User.findOne({_id:usersid},function(err,doc){
    if(err){
      console.log(err)

    }else{
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', "December"];
          const usersname=  doc.name;
          let currentYear = new Date().getFullYear();
          let currentMonth = months[ new Date().getMonth()];
          let currentDay = new Date().getDate();
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

  res.redirect("/");

  }else{
    res.redirect("/login");
  }
  
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
