Nextjs rewrite of `foodfetchers`, my BS CompSci capstone project.

BEFORE RUNNING, see `.env.local.stub`. This project needs an auth secret to be generated,
and you're not using mine!

There is no such thing as admin accounts (right now). You'll need to do "admin-like" operations by
directly modifying the database using prisma studio. I will change this later by adding an admin page 
and admin accounts.

## setup:

`npx auth` -- generate your own auth secret

`npx prisma db push` -- generate a new prisma db. The DB file will be in the untracked `data` directory

`npx prisma db seed -- --fake` -- (optional) seed the prisma db with test data

`npx next dev` -- run a typical next dev server

## running:

`docker compose build` build the images

`docker compose run foodfetcher` run the image as a container. 
- This single-container compose will expose the site on port 3000 by default. You should probably put this behind a reverse proxy like NGINX. If you do, see the .env.local file for info on trusting forward headers from the reverse proxy. 
