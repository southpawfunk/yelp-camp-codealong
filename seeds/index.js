require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const cities = require('./cities');
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
const sampleAndPop = (array) => array.pop(Math.floor(Math.random() * array.length));

async function seedImgs() {
	try {
		const res = await axios.get('https://api.unsplash.com/photos/random', {
			params: {
				client_id: process.env.UNSPLASH_KEY,
				topics: 'outdoors,camping,nature',
				count: 30 //max count allowed by unsplash API
			}
		});
		return res.data.map(({ id, urls }) => ({
			filename: `SEEDED-IMG${id}`,
			url: urls.small
		}));
	} catch (err) {
		console.error(err);
	}
}

const seedDB = async () => {
	await Campground.deleteMany({});
	let imgSamples = await seedImgs();
	for (let i = 0; i < 39; i++) {
		imgSamples = imgSamples.concat(await seedImgs());
	}

	for (let i = 0; i < 400; i++) {
		const price = Math.ceil(Math.random() * 6) * 10 - 0.01;
		const random1000 = Math.floor(Math.random() * 1000);
		const randomImgCount = Math.ceil(Math.random() * 4);
		let images = [];
		for (let i = 0; i < randomImgCount; i++) {
			images.push(sampleAndPop(imgSamples));
		}
		const camp = new Campground({
			author: '631543c9b2a78cef65e4cae1',
			images,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude]
			},
			title: `${sample(descriptors)} ${sample(places)}`,
			price,
			description:
				`This campground is a ${sample(adjectives)} little place. ` +
				`My family stayed there for ${Math.ceil(Math.random() * 7) + 1} nights. ` +
				`It made me think of when ${sample(anecdotes)}. I would really like to go back ` +
				`with my friends and ${sample(pastimes)}.`
		});
		await camp.save();
	}
	console.log(`Used ${1200 - imgSamples.length} images sampled randomly from unsplash matching outdoors, camping, and nature.`);
};

seedDB().then(() => {
	console.log('Database has been cleared and (re-)seeded.');
	console.log('Closing database connection.');
	mongoose.connection.close();
});
