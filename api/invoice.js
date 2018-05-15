var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
  ammount: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timeIssued: {
    type: String,
    required: true
  },
  timePaid: {
    type: String,
    required: false
  },
  paid: {
    type: Boolean,
    required: false,
    default: false
  }
})

UserSchema.pre('save', function(next) {
    var users = this;

    // only hash the password if it has been modified (or is new)
    if (!users.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(users.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            users.password = hash;
            next();
        });
    });
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
