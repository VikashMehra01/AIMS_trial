const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const facultyMembers = [
    {
        name: "Severus Snape",
        email: "snape@iitrpr.ac.in",
        password: "password123",
        department: "Chemical Engineering", // Potions -> Chemical Eng?
        degree: "PhD",
        yearOfEntry: "2010"
    },
    {
        name: "Minerva McGonagall",
        email: "mcgonagall@iitrpr.ac.in",
        password: "password123",
        department: "Computer Science", // Transfiguration -> CS (transforming data)?
        degree: "PhD",
        yearOfEntry: "2005"
    },
    {
        name: "Albus Dumbledore",
        email: "dumbledore@iitrpr.ac.in",
        password: "password123",
        department: "Administration",
        degree: "PhD",
        yearOfEntry: "1990"
    },
    {
        name: "Faculty Advisor",
        email: "facultyadvisor@iitrpr.ac.in",
        password: "password123",
        department: "Office of Academics",
        degree: "PhD",
        yearOfEntry: "2015"
    }
];

async function seedFaculty() {
    console.log('🌱 Starting Faculty Seeding...');

    for (const faculty of facultyMembers) {
        try {
            console.log(`Adding ${faculty.name} (${faculty.email})...`);
            await axios.post(`${API_URL}/register`, faculty);
            console.log(`✅ Registered: ${faculty.name}`);
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.msg === 'User already exists') {
                console.log(`ℹ️ User ${faculty.name} already exists. Skipping.`);
            } else {
                console.error(`❌ Failed to register ${faculty.name}:`, error.message);
                if (error.response) {
                    console.error('   Response:', error.response.data);
                }
            }
        }
    }

    console.log('✨ Seeding complete!');
}

seedFaculty();
