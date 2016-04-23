how to use:

npm install
npm start


Features:

User Interaction:

1. User can register and login to see their personal information and past orders
2. Username must be email address and password must be at least 7 characters
3. User login status can be remembered even reopen the web page
4. After logout, the user profile page are set to private
5. Accessing the profile url when the user is not logged in will redirect the user to the login page
6. User password is encrypted, and is hide even in the database (using a hashed token)
7. The user can only retrieve his or her own user information

Technologies:

Front-end:  AnugularJS (Angular UI Router, Angular UI Bootstrap), JQuery, HTML5 and CSS3
<br>
Back-end: NodeJS (Library: Underscore, Bcrypt, Express, Sequelize, Body-parser and JsonWebtoken), Sqlite3 database
<br>
CSS: Blured Menu effect
