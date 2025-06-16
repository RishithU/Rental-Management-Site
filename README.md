# Rental-Management-Site
A full-stack rental property income tracker web application for landlords and property managers to securely manage their rental properties, track monthly rent collection status, and view real-time analytics for rent received and pending.

# Problem Statement :
Managing rental properties manually can be inefficient and error-prone. Property owners need a simple, secure way to track rent payments, view due or received rent, and manage multiple properties—month by month—all in one place.

The system supports multi-user authentication, and each user gets a dedicated MongoDB collection to store their property and rent data. 

# Features :

  User Authentication : Secure sign-up and login using JWT tokens

  Add/Edit/Delete Properties : Add property name, address, monthly rent, tenant email, and phone

  Rent Tracking (Month-wise) : Automatically initialize each property’s rent history with the current month

  Rent Analytics : Shows total rent received and total pending (for the current month only)

  Rent History Persistence : Maintains rent payment history with month and year for long-term tracking

  Session Management : Users remain logged in until token expires or logout is clicked

  Password Security : Passwords are hashed using bcryptjs

# Tech Stack
Node.js	-	Runtime Environment

Express.js -	Web Framework

MongoDB	-	NoSQL Database

Mongoose	-	MongoDB ORM

Handlebars (HBS)	-Templating Engine

JWT	-	User Authentication

Bcryptjs	-	Password Hashing

# Screenshots

![image](https://github.com/user-attachments/assets/a10c885a-c897-4a4f-84dc-2baacc253d3c)

![image](https://github.com/user-attachments/assets/49d073d9-33bf-49a4-bdd4-fb64001e09b6)

# Contributors
[Rishith Ummenthala](https://github.com/RishithU)

[Bishal Paul](https://github.com/BishalPaul1740)

We welcome all contributions/Suggestions to this project. If you have any ideas, suggestions, or bug reports, please feel free to contact.
