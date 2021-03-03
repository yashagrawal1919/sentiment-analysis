const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const rp = require("request-promise");
const $ = require("cheerio");
const cors = require("cors");
let User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/minor", { useNewUrlParser: true });

app.use(
  require("express-session")({
    secret: "is it necessary",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;

  next();
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/register", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, User) => {
      if (err) {
        console.log("something went wrong");
        return res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/home");
        });
      }
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/home");
});

app.get("/", (req, res) => {
  res.render("landing");
});

app.get("/news", (req, res) => {
  let news = [];
  rp("https://www.ndtv.com/top-stories?pfrom=home-topstories")
    .then(function (html) {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < 15; i++) {
          news[i] = {};
          news[i].heading = $(
            ".new_storylising  .new_storylising_img picture img ",
            html
          )[i].attribs.title;
          news[i].description = $(
            ".new_storylising .new_storylising_contentwrap .nstory_intro ",
            html
          )[i].children[0].data;
          news[i].imageurl = $(
            ".new_storylising  .new_storylising_img picture img ",
            html
          )[i].attribs.src;
          news[i].url = $(".new_storylising  .new_storylising_img a ", html)[
            i
          ].attribs.href;
          // console.log(news[i].url);
        }
        for (let i = 0; i < 15; i++) {
          for (let j = 0; j < news[i].url.length; j++) {
            if (news[i].url[j] === "/") {
              news[i].url =
                news[i].url.substr(0, j) + "`" + news[i].url.substr(j + 1);
            }
          }
          // console.log(news[i].url);
        }
        resolve(news);
      });
    })
    .then((news) => {
      res.render("news", { news: news });
    })
    .catch(function (err) {
      console.log("Something went wrong");
    });
});

app.get("/news/:link", (req, res) => {
  let url = req.params.link;
  for (let i = 0; i < url.length; i++) {
    if (url[i] === "`") {
      url = url.substr(0, i) + "/" + url.substr(i + 1);
    }
  }

  app.get("/showResult", (req, res) => {
    let spawn = require("child_process").spawn;
    let process = spawn("python", ["./hello.py", req.query.firstname]);
    process.stdout.on("data", function (data) {
      res.write(data.toString());
    });
  });

  rp(url).then((data) => {
    // console.log(data);
    let newsData = {};
    let para = [];
    return new Promise((resolve, reject) => {
      for (let j = 0; j < $("#ins_storybody p", data).length - 1; j++) {
        let k = 0;
        for (
          let i = 0;
          i < $("#ins_storybody p", data)[j].children.length;
          i++
        ) {
          if ($("#ins_storybody p", data)[j].children[i].type == "tag") {
            break;
          } else {
            k++;
          }
          if (k == $("#ins_storybody p", data)[j].children.length) {
            for (
              let i = 0;
              i < $("#ins_storybody p", data)[j].children.length;
              i++
            ) {
              if ($("#ins_storybody p", data)[j].children[i].type == "text") {
                para.push($("#ins_storybody p", data)[j].children[i].data);
              }
            }
          }
        }
      }
      newsData["imageurl"] = $("#story_image_main", data)[0].attribs.src;
      newsData["imageCaption"] = $(
        ".mainimage_caption",
        data
      )[0].children[0].data;

      newsData["content"] = para;

      console.log($(".ins_headline h1 span", data)[0].children[0].data);
      newsData["headline"] = $(
        ".ins_headline h1 span",
        data
      )[0].children[0].data;
      // imageCaption = $('.mainimage_caption' , data)[0].children[0].data;
      // console.log(imageCaption);
      resolve(newsData);
      // console.log(`newsData : \n ${newsData}`);
    }).then((newsData) => {
      //  console.log(`newsData : \n ${newsData}`);
      res.render("newsStory", { newsData: newsData });
    });

    // console.log($('#ins_storybody p',data)[3].children[0].children[0].data);
  });

  console.log(url);
});

app.get("/search", (req, res) => {
  res.render("search.ejs");
});

app.get("/showResults", (req, res) => {
  console.log(req.query.search);
  let spawn = require("child_process").spawn;
  let process = spawn("python", ["./project1.py", req.query.search]);
  process.stdout.on("data", function (data) {
    res.render("displayResult", { data: data.toString() });
  });
});

app.get("/trends", (req, res) => {
  console.log(1);
  let trends = [];
  rp("https://trends24.in/india/")
    .then((data) => {
      return new Promise((resolve, reject) => {
        console.log(2);
        for (let i = 0; i < 24; i++) {
          trends[i] = [];
          for (let j = 0; j < 10; j++) {
            trends[i][j] = $(
              "#trend-list > .trend-card > .trend-card__list",
              data
            )[i].children[j].children[0].children[0].data;
          }
        }
        for (let i = 0; i < 24; i++) {
          for (let j = 0; j < 10; j++) {
            console.log(trends[i][j]);
            for (let k = 0; k < trends[i][j].length; k++) {
              if (trends[i][j].charAt(k) == "#") {
                trends[i][j] =
                  trends[i][j].substr(0, k) + "`" + trends[i][j].substr(k + 1);
              }
            }
          }

          console.log();
          console.log();
          console.log();
        }
        console.log(3);
        resolve(trends);
      });
      //  console.log(3);
      //  resolve(trends);
    })
    .then((trends) => {
      //  console.log('it ran');
      //  console.log(trends);
      res.render("trends", { trends: trends });
    });
});

app.get("/trends/:name", (req, res) => {
  let name = req.params.name;
  for (let i = 0; i < name.length; i++) {
    if (name[i] == "`") {
      name = name.substr(0, i) + "#" + name.substr(i + 1);
    }
  }
  let spawn = require("child_process").spawn;
  let process = spawn("python", ["./project1.py", name]);
  process.stdout.on("data", function (data) {
    // res.write(data.toString());
    // console.log(data.toString());
    res.render("displayResult", { data: data.toString() });
  });
});

app.get("/home", (req, res) => {
  let trends = [];
  rp("https://trends24.in/india/")
    .then((data) => {
      return new Promise((resolve, reject) => {
        console.log(2);
        for (let i = 0; i < 24; i++) {
          trends[i] = [];
          for (let j = 0; j < 10; j++) {
            trends[i][j] = $(
              "#trend-list > .trend-card > .trend-card__list",
              data
            )[i].children[j].children[0].children[0].data;
          }
        }
        for (let i = 0; i < 24; i++) {
          for (let j = 0; j < 10; j++) {
            console.log(trends[i][j]);
            for (let k = 0; k < trends[i][j].length; k++) {
              if (trends[i][j].charAt(k) == "#") {
                trends[i][j] =
                  trends[i][j].substr(0, k) + "`" + trends[i][j].substr(k + 1);
              }
            }
          }

          console.log();
          console.log();
          console.log();
        }
        console.log(3);
        resolve(trends);
      });
      //  console.log(3);
      //  resolve(trends);
    })
    .then((trends) => {
      //  console.log('it ran');
      //  console.log(trends);
      res.render("home", { trends: trends });
    });
});

app.get("/showResultsYoutube", (req, res) => {
  console.log(req.query.search);
  let spawn = require("child_process").spawn;
  let process = spawn("python", ["./driver.py", req.query.search]);
  process.stdout.on("data", function (data) {
    res.render("displayResult", { data: data.toString() });
  });
});

app.get("/youtube", (req, res) => {
  //   let spawn = require("child_process").spawn;
  //   let process = spawn('python',["./driver.py", 'abc']);
  //   process.stdout.on('data', function(data) {
  //     res.write(data.toString());
  //     console.log(data.toString());
  // })

  res.render("youtubeSearch");
});

app.post("/postdata", (req, res) => {
  console.log(req.body);
  res.json("Message recieved").status(200);
});

app.listen(7000, () => {
  console.log("Magic happens on port 7000");
});
