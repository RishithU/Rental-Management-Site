
const express = require("express");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const { AuthCollection, createUserCollection } = require("./mongo");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Paths 
const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

//for checking paid status toggle function
const hbs = require('hbs');
hbs.registerHelper('eq', (a, b) => a === b);


// --- Utility Functions ---
const JWT_SECRET = "hellomynameisbishalpaulwhatisyournamewouldyouliketodrinktea";

async function hashPassword(password) {
    return await bcryptjs.hash(password, 10);
}

async function comparePasswords(userPass, hashedPass) {
    return await bcryptjs.compare(userPass, hashedPass);
}

// --- Routes ---

// Landing or Login Page
app.get("/", (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const verify = jwt.verify(token, JWT_SECRET);
            return res.redirect("/dashboard");
        }
        res.render("login");
    } catch (err) {
        res.clearCookie("jwt");
        res.render("login");
    }
});

// Signup Page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup Handler
app.post("/signup", async (req, res) => {
    try {
        const existingUser = await AuthCollection.findOne({ name: req.body.name });
        if (existingUser) return res.send("User already exists");

        const hashedPassword = await hashPassword(req.body.password);
        const token = jwt.sign({ name: req.body.name }, JWT_SECRET);

        // Save Auth User
        const user = new AuthCollection({
            name: req.body.name,
            password: hashedPassword,
            token: token
        });

        await user.save();

        // Initialize user collection (no need to save now)
        createUserCollection(req.body.name);

        res.cookie("jwt", token, { maxAge: 600000, httpOnly: true });
        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});

// Login Handler
app.post("/login", async (req, res) => {
    try {
        const user = await AuthCollection.findOne({ name: req.body.name });
        if (!user) return res.send("User not found");

        const isMatch = await comparePasswords(req.body.password, user.password);
        if (!isMatch) return res.send("Wrong password");

        res.cookie("jwt", user.token, { maxAge: 600000, httpOnly: true });
        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});

// Dashboard

    app.get("/dashboard", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, JWT_SECRET);

        const UserCollection = createUserCollection(decoded.name);
        const allProps = await UserCollection.find();

        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();

        let totalReceived = 0;
        let totalPending = 0;

        allProps.forEach((prop) => {
            const history = prop.rentHistory || [];
            const match = history.find(entry => entry.month === currentMonth && entry.year === currentYear);

            if (match) {
                if (match.status === "Paid") {
                    totalReceived += Number(prop.monthlyRent);
                } else {
                    totalPending += Number(prop.monthlyRent);
                }
            } else {
                totalPending += Number(prop.monthlyRent);
            }
        });

        res.render("dashboard", {
            name: decoded.name,
            properties: allProps,
            totalReceived,
            totalPending,
            currentMonth
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});



// Add Property Handler
//get form 
app.get("/add-property-form", (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.redirect("/");
        const decoded = jwt.verify(token, JWT_SECRET);
        res.render("addProperty", { name: decoded.name });
    } catch (err) {
        res.clearCookie("jwt");
        res.redirect("/");
    }
});
//post 
app.post("/add-property", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, "hellomynameisbishalpaulwhatisyournamewouldyouliketodrinktea");

        const UserCollection = createUserCollection(decoded.name);

        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();

        await UserCollection.create({
            propertyName: req.body.propertyName,
            address: req.body.address,
            emailid:req.body.emailid,
            phone:req.body.phone,
            monthlyRent: req.body.monthlyRent,
            rentHistory: [{ month: currentMonth, year: currentYear, status: "Unpaid" }]
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Add Property Error:", err);
        res.status(500).send("Failed to add property");
    }
});


//Update RENT Status
app.post("/update-status", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, "hellomynameisbishalpaulwhatisyournamewouldyouliketodrinktea");

        const UserCollection = createUserCollection(decoded.name);

        const { id, month, year, status } = req.body;

        const property = await UserCollection.findById(id);
        const existingMonth = property.rentHistory.find(
            (entry) => entry.month === month && entry.year === parseInt(year)
        );

        if (existingMonth) {
            existingMonth.status = status;
        } else {
            property.rentHistory.push({ month, year: parseInt(year), status });
        }

        await property.save();

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Update Rent Status Error:", err);
        res.status(500).send("Could not update rent status");
    }
});



// Show Edit Form
app.get("/edit-property/:id", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, JWT_SECRET);
        const UserCollection = createUserCollection(decoded.name);
        const property = await UserCollection.findById(req.params.id);
        res.render("editProperty", { name: decoded.name, property });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// Handle Edit Form Submission
app.post("/edit-property/:id", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, JWT_SECRET);
        const UserCollection = createUserCollection(decoded.name);

        await UserCollection.findByIdAndUpdate(req.params.id, {
            propertyName: req.body.propertyName,
            address: req.body.address,
            emailid:req.body.emailid,
            phone:req.body.phone,
            monthlyRent: req.body.monthlyRent,
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// Handle Delete Property
app.post("/delete-property/:id", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, JWT_SECRET);
        const UserCollection = createUserCollection(decoded.name);

        await UserCollection.findByIdAndDelete(req.params.id);

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

//toggle paid button
app.post("/toggle-rent-status/:id", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, JWT_SECRET);
        const UserCollection = createUserCollection(decoded.name);

        const property = await UserCollection.findById(req.params.id);

        const newStatus = property.rentStatus === "Paid" ? "Unpaid" : "Paid";

        await UserCollection.findByIdAndUpdate(req.params.id, {
            rentStatus: newStatus
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});


// Logout
app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

// Start Server
app.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});

