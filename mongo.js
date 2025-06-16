
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/authenticaation")
    .then(() => console.log("MongoDB connected"))
    .catch(() => console.log("MongoDB connection error"));

// ---------------------
// Auth Collection Schema
// ---------------------
const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

const AuthCollection = mongoose.model("AuthCollection", authSchema);

// ---------------------
// Rental Property Schema
// ---------------------
const rentalPropertySchema = new mongoose.Schema({
     propertyName: String,
    address: String,
    emailid:String,
    phone:String,
    monthlyRent: Number,
    rentHistory: [
        {
            month: String, // e.g., "June"
            year: Number,  // e.g., 2025
            status: {
                type: String,
                enum: ["Paid", "Unpaid"],
                default: "Unpaid"
            }
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    }
});


// Dynamic Collection Creator

function createUserCollection(username) {
    const modelName = `rents_${username}`;
    
    // Avoid model overwrite errors in Mongoose
    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    return mongoose.model(modelName, rentalPropertySchema);
}

// Export both
module.exports = {
    AuthCollection,
    createUserCollection
};


