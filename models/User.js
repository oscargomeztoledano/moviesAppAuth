var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//Para la encriptación del password
var bcrypt = require("bcryptjs");

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    fullname: String,
    email: {
        type: String,
        required: true
    },
    creationdate: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("save", function (next) {
    var user = this;
    // solo aplica una función hash al password si ha sido modificado (o es nuevo)
    if (!user.isModified("password")) return next();
    // genera la salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        // aplica una función hash al password usando la nueva salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // sobrescribe el password escrito con el “hasheado”
            user.password = hash;
            next();
        });
    });
});
module.exports = mongoose.model('User', UserSchema);