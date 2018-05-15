var express = require("express");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var passport = require("passport");
var passportJWT = require("passport-jwt");
var jwt = require('jsonwebtoken');
var app = express();
var router = express.Router();
var mongoose = require("mongoose");
var Invoice = mongoose.model("invoice");
var User = mongoose.model("User");
var bcrypt = require('bcryptjs');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
jwtOptions.secretOrKey = 'LokisBreath-420';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  User.findOne({"_id": jwt_payload.id}, function(err, user) {
    if (err) {
          return next(err, false);
      }
      if (user) {
          return next(null, user);
      } else {
          return next(null, false);
      }
  });
});

app.use(passport.initialize());
passport.use(strategy);
app.use(bodyParser.json());

router.post("/", (req,res) => {
  var newInvoice = new Invoice({
    ammount: req.body.ammount,
    customerEmail: req.body.customerEmail,
    customerName: req.body.customerName,
    description: req.body.description,
    timeIssued: req.body.timeIssued,
    timePaid: req.body.timePaid,
    paid: req.body.paid
  })

  newInvoice.save((err, result) => {
    if(err) {
      res.send(err);
    } else {
      Invoice.findOne({"customerEmail": req.body.customerEmail}, function (err, invoices) {
        res.status(201).send({id: invoices.id});
      })
    }
  })
})

router.get("/all/:id", passport.authenticate('jwt', { session: false }),(req, res) => {
  var invoiceid = new mongodb.ObjectID(req.params["id"]);
  Invoice.find({},function (err, invoices) {
    if (err) {
      res.send(err);
    } else {
      User.findOne({"_id": invoiceid},function (err, user) {
        if (err) {
          res.send(err);
        } else if (user.admin === true) {
          res.send(invoices);
        } else {
          res.status(401).send('Unauthorized')
        }
      })
    }
  })
})

router.get("/:id", passport.authenticate('jwt', { session: false }),(req, res) => {
  var invoiceid = new mongodb.ObjectID(req.params["id"]);
  Invoice.findOne({"_id": invoiceid},function (err, invoices) {
    if (err) {
      res.send(err);
    } else {
      res.send(invoices);
    }
  })
})

router.put("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  var invoiceid = new mongodb.ObjectID(req.params["id"]);
  Invoice.find({"_id": invoiceid},function (err, invoice) {
    if (err) {
        res.status(500).send(err);
    } else {
        var invoice = invoice[0];
        ammount = req.body.ammount || invoice.ammount;
        customerEmail = req.body.customerEmail || invoice.customerEmail;
        customerName = req.body.customerName || invoice.customerName;
        description = req.body.description || invoice.description;
        timeIssued = req.body.timeIssued || invoice.timeIssued;
        timePaid = req.body.timePaid || invoice.timePaid;
        paid = req.body.paid || invoice.paid;

        invoice.save(function (err, invoice) {
            if (err) {
              res.status(500).send(err)
            }
            res.send(invoice);
        });
      }
  });
})

router.delete("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  var invoiceid = new mongodb.ObjectID(req.params["id"]);
  Invoice.find({_id: invoiceid}).remove().then(() => {
    res.send("success");
  })
})

module.exports = router;
