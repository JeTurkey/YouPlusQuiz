var express               = require("express"),
    expressSanitizer      = require("express-sanitizer"),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    User                  = require("./models/users"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    courseDescription     = require("./models/courseDescriptionDB"),
    weekly                = require("./models/weeklyDB"),
    questions             = require("./models/questionDB")

mongoose.connect("mongodb://localhost/youplusquiz", { useNewUrlParser: true})

var app = express();
app.use(require("express-session")({
    secret: "Hello",
    resave: false,
    saveUninitialized: false
}))

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    
    next();
})


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 登陆首页 
app.get("/", function(req, res){
    res.render('index')
})

app.post("/", passport.authenticate("local", {
    successRedirect: "/userHomePage",
    failureRedirect: "/"
}))

// 注册页面
app.get("/register", function(req, res){
    res.render("registerPage")
})
// 注册POST
app.post("/register", function(req, res){
    User.register(new User({
        username: req.body.username,
        email: req.body.email,
        class: req.body.class,
        tutor: req.body.tutor
    }), req.body.password, function(err, user){
        if(err){
            return res.render("register")
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/userHomePage")
            })
        }
    })
})

// 主界面
app.get("/userHomePage", isLoggedIn, function(req, res){
    User.find({username: req.user.username}).exec(function(err, result){
        res.render("userHomePage", {data: result})
    })
    
})

// quiz的weekly页面
app.get("/userHomePage/:id", isLoggedIn, function(req, res){
    weekly.find({classcode: req.params.id}, function(err, rst){
        if(err){
            return err
        }else{
            console.log(rst)
            res.render("quizPage", {data: rst})
        }
    })
    
})

// Quiz的weekly题目界面
app.get('/userHomePage/:currentPage/:id', isLoggedIn, function(req, res){
    
    questions.find({week: req.params.id, class: req.params.currentPage}, function(err, rst){
        if(err){
            return err
        }else{
            console.log(rst)
            res.render("doQuiz", {data: rst})
        }
    })
})

app.post("/submitQuiz", isLoggedIn, function(req, res){
    var answers = req.body.answerSelection;
    console.log(answers)
    res.redirect('/userHomePage')

})

// middleWare
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

// Launching server

app.listen(8080, function(){
    console.log("Server is Running")
})