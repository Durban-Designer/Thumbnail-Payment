var express = require("express");
var stripe = require("stripe")("sk_test_aCYXyKYCN5iDhqBDn5PZ5CUY");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var passport = require("passport");
var passportJWT = require("passport-jwt");
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var app = express();
var router = express.Router();
var mongoose = require("mongoose");
var Invoice = mongoose.model("Invoice");
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

router.post("/", passport.authenticate('jwt', { session: false }), (req,res) => {
  var newInvoice = new Invoice({
    amount: req.body.amount,
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
      Invoice.findOne({"customerEmail": req.body.customerEmail, "timeIssued": req.body.timeIssued}, function (err, invoices) {
        var transporter = nodemailer.createTransport({
              host: 'smtp.office365.com', // Office 365 server
              port: 587,     // secure SMTP
              ignoreTLS: false,
              requireTLS: true,
              auth: {
                  user: '',
                  pass: ''
              },
              tls: {
                  ciphers: 'SSLv3'
              }
          });

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Thumbnail Consulting" <royce.birnbaum@thumbnailconsulting.com>', // sender address
            to: invoices.customerEmail, // recipient
            subject: 'Invoice from Thumbnail Consulting', // Subject line
            text: `Thank you for your business, plese click the below link to view/pay this invoice;
            https://payment.thumbnailconsulting.com/payment/${ invoices._id }`, // plaintext body
            html: `<h2 style="color: red">Thank you for your business, plese click the below link to view/pay this invoice</h2>
            <h4> https://payment.thumbnailconsulting.com/payment/${ invoices._id }</h4>` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
                Invoice.find({_id: invoices._id}).remove().then(() => {
                  res.send(error);
                })
                res.send(error);
            }
            res.send('success')
        });
      })
    }
  })
})

router.post("/pay", (req, res) => {
  const token = req.body.stripeToken;
  Invoice.find({"_id": req.body.invoiceid},function (err, invoice) {
    if (err) {
        res.status(500).send(err);
    } else {
        var invoice = invoice[0];
        const charge = stripe.charges.create({
          amount: invoice.amount,
          currency: 'usd',
          description: 'Thumbnail Consulting Invoice',
          source: token,
        });
        invoice.timePaid = req.body.timePaid;
        invoice.paid = true;

        invoice.save(function (err, invoice) {
            if (err) {
              res.status(500).send(err)
            }
            res.send('success')
        });
      }
  });
})

router.get("/all/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
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

router.get("/:id",(req, res) => {
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
        invoice.amount = req.body.amount || invoice.amount;
        invoice.customerEmail = req.body.customerEmail || invoice.customerEmail;
        invoice.customerName = req.body.customerName || invoice.customerName;
        invoice.description = req.body.description || invoice.description;
        invoice.timeIssued = req.body.timeIssued || invoice.timeIssued;
        invoice.timePaid = req.body.timePaid || invoice.timePaid;
        invoice.paid = req.body.paid || invoice.paid;

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
