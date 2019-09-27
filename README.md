## Express server
For the Jolly Lube React client side app. Found at https://www.https://jollylube.gatesjrichard.now.sh/

## Endpoints

Base URL = 'https://cryptic-brook-57150.herokuapp.com'

### Users

POST /api/users

Requires a password, user name and full name, creates a new user account.

### Authorization

POST /api/auth/login

Requires a valid user name and password, returns an authorization token.

### For Appointment Times

GET /api/times

Requires a valid authorization header, returns all appointment times.

POST /api/times

Requires a valid authorization header and a date/timestamp of the appointment being created.

PATCH /api/times/:apptId

Requires a valid authorization header, updates the specified apptointment (apptId) with the user's userId.

PATCH /api/times/cancelAppt/:apptId

Requires a valid authorization header, updates the specified appointment (apptId) to not include the user's userId. It undoes what PATCH api/times/:apptId does.

GET /api/userappts

Requires a valid authorization header, returns all of a users appointments.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
