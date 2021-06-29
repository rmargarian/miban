##### Routing         : Express
##### ORM Database    : Sequelize
##### Authentication  : Passport, JWT

# PfaNegotiationsApp
## Run MySql at the start with corresponding credentials (root/root by default in app configs)
Create empty table with name corresponding as in config

CONFIG.db_name      = process.env.DB_NAME || 'ne2_profiles';
CONFIG.db_user      = process.env.DB_USER || 'root';
CONFIG.db_password  = process.env.DB_PASSWORD || 'root';

## Configure Environment
All Environment configs are in .env file
Run `npm i`

## Development server
Set `NODE_ENV=development` in .env file
Run client:
`npm run start:dev`
This command exequtes db migration => build client
Run server:
`node app.js` or `nodejs app.js` on Unix OS

## Production server
Set `NODE_ENV=production` in .env file
Run client:
`npm run start:prod`
This command exequtes db migration => build client
Run server:
`node app.js` or `nodejs app.js` on Unix OS

## QA server
Set `NODE_ENV=testing` in .env file
Run client:
`npm run start:qa`
This command exequtes db migration => build client
Run server:
`node app.js` or `nodejs app.js` on Unix OS

## MIGRATIONS
On all envs but the 'production'/'live' each deploy creates a new empty DB.
All new migrations must be created in 'app/migrations' dir.
They will be executed only on 'production' env (see .sequelizerc file).
For other envs will be executed only one migration from 'migrations-not-prod' dir.
So to apply new migration for e.g. 'development' env next steps should be done on 'live'/'production' env:
- Push new migration on 'live'/'production' env.
- Build the env.
- Get/Export DB dump file (ask sysadmin for support)
- Put exported dump file ('ne2_profiles.sql') into the root folder.
- Commit and push it.
- Start the deploy on env (use Jenkins).
## db migration commands
At first migration connect to mysql server and create empty database with name 'ne2_profiles'
Run migration `npm run db-migrate`
Revert last migration `npm run db-undo`
Clear db `npm run db-clear`
Dump file ne2_profiles.sql is in root dir

## Unsubscribes IMAP server
Set in .env file IMAP_SERVICE_PORT (view example.env file)
Run in new terminal:
`node unsub-imap.server.js` or `nodejs unsub-imap.server.js` on Unix OS
######
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of client's the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
