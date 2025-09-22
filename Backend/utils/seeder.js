const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Chef = require('../models/Chef.model');

dotenv.config();
mongoose.connect(process.env.MONGODB_URI);

const cuisines = ['Italian', 'French', 'Asian', 'Mexican', 'Indian', 'Mediterranean'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco'];
const states = ['NY', 'CA', 'IL', 'TX', 'FL', 'CA'];

const seedChefs = async () => {
    try {
        // Clear existing data
        await User.deleteMany({ role: 'chef' });
        await Chef.deleteMany({});

        const chefs = [];

        for (let i = 0; i < 30; i++) {
            const password = await bcrypt.hash('password123', 10);
            const user = await User.create({
                firstName: `Chef${i + 1}`,
                lastName: `Demo`,
                email: `chef${i + 1}@demo.com`,
                password,
                role: 'chef'
            });

            const cityIndex = Math.floor(Math.random() * cities.length);

            const chef = await Chef.create({
                user: user._id,
                bio: `Professional chef with ${5 + Math.floor(Math.random() * 15)} years of experience in ${cuisines[i % cuisines.length]} cuisine.`,
                experience: 5 + Math.floor(Math.random() * 15),
                cuisineSpecialization: cuisines[i % cuisines.length],
                hourlyRate: 100 + Math.floor(Math.random() * 150),
                serviceLocation: {
                    city: cities[cityIndex],
                    state: states[cityIndex],
                    maxTravelDistance: 25
                },
                rating: {
                    average: 3.5 + Math.random() * 1.5,
                    count: Math.floor(Math.random() * 50)
                },
                isVerified: true,
                isActive: true
            });

            chefs.push(chef);
        }

        console.log('Chefs seeded successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await User.deleteMany({ role: 'chef' });
        await Chef.deleteMany({});
        console.log('Data deleted successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    seedChefs();
}