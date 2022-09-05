const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	email : {
		type     : String,
		required : true,
		unique   : true
	}
});

//This will add onto our schema a username, a field for password,
//make sure usernames are unique, give us additional methods to use
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
