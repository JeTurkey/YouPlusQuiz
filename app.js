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
    var units = req.body.unitSelected
    console.log(units)
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        tutor: req.body.tutor
    })
    
    units.forEach(function(item){
        newUser.class.push({
            unitcode: item
        })
    })
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(user)
            return res.render("registerPage")
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
    weekly.find({unitcode: req.params.id}, function(err, rst){
        if(err){
            return err
        }else{
            console.log(rst)
            res.render("quizPage", {data: rst})
        }
    })
    
})

// Quiz的weekly题目界面
app.get('/userHomePage/:currentPage/week-:id', isLoggedIn, function(req, res){
    
    questions.find({week: req.params.id, unitcode: req.params.currentPage}, function(err, rst){
        if(err){
            return err
        }else{
            console.log(rst)
            res.render("doQuiz", {data: rst})
        }
    })
})
// Quiz 交作业
app.post("/submitQuiz", isLoggedIn, function(req, res){
    var answers = req.body.answerSelection;
    console.log(answers)
    res.redirect('/userHomePage')

})

app.get('/tutorAddQuestions', isLoggedIn, function(req, res){
    res.render('tutorAddQuestion')
})

app.post('/tutorAddQuestions', isLoggedIn, function(req, res){
    var question = req.body.question
    var options = req.body.options
    var answers = req.body.answers

    var newQuestion = new questions({
        classtype: req.body.classType,
        unitcode: req.body.classCode,
        week: req.body.week,
        question: req.body.question,
        correctanswer: req.body.answers
    })
    options.forEach(function(item){
        newQuestion.options.push({
            option: item
        })
    })
    questions.create(newQuestion, function(err, rst){
        if (req.body.directButton == "1"){
            console.log(rst)
            res.redirect('/tutorAddQuestions')
        }else{
            console.log(rst)
            res.redirect('/userHomePage')
        }
    })
    
})

app.get('/tutorAddWeeks', isLoggedIn, function(req, res){
    res.render("tutorAddWeek")
})

app.post('/tutorAddWeeks', isLoggedIn, function(req, res){
    var newWeek = new weekly({
        unitcode: req.body.classCode,
        week: req.body.weekCount,
        weeklycontent: req.body.weeklyContent,
        weeklytitle: req.body.weeklyTitle
    })

    weekly.create(newWeek, function(err, rst){
        console.log(rst)
        res.redirect('/userHomePage')
    })

})

app.get('/addUnit', isLoggedIn, function(req, res){
    res.render('addUnit')
})

app.post('/addUnit', isLoggedIn, function(req, res){
    var newUnit = new courseDescription({
        unitcode: req.body.unitcode,
        unitname: req.body.unitname,
        unittutor: req.body.unittutor
    })
    courseDescription.create(newUnit, function(err, rst){
        console.log(rst)
        res.redirect('/userHomePage')
    })
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