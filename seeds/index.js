const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const cities = require('./cities');
const apiKeys = require('../API_Keys');
const { places, descriptors, adjectives, anecdotes, pastimes } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect(
	'mongodb://localhost:27017/yelp-camp',
	{
		/* THESE OPTIONS ARE TRUE BY DEFAULT IN MONGOOSE 6+
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true */
	}
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImgs() {
	try {
		const res = await axios.get('https://api.unsplash.com/photos/random', {
			params : {
				client_id   : apiKeys.unsplashKey,
				collections : 'PHh1QTPf2ts',
				count       : 30 //max count allowed by unsplash API
			}
		});
		return res.data.map((a) => a.urls.small);
	} catch (err) {
		console.error(err);
	}
}

const seedDB = async () => {
	await Campground.deleteMany({});
	const imgs = await seedImgs();
	for (let i = 0; i < 50; i++) {
		const price = Math.ceil(Math.random() * 6) * 10 - 0.01;
		const random1000 = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			author      : '631543c9b2a78cef65e4cae1',
			image       : sample(imgs),
			location    : `${cities[random1000].city}, ${cities[random1000].state}`,
			title       : `${sample(descriptors)} ${sample(places)}`,
			price,
			description :
				`This campground is a ${sample(adjectives)} little place. ` +
				`My family stayed there for ${Math.ceil(Math.random() * 7) + 1} nights. ` +
				`It made me think of when ${sample(anecdotes)}. I would really like to go back ` +
				`with my friends and ${sample(pastimes)}.`
		});
		await camp.save();
	}
};

seedDB().then(() => {
	console.log('Database has been cleared and (re-)seeded.');
	console.log('Closing database connection.');
	mongoose.connection.close();
});
