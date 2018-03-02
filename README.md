# DevWars Live
watch.devwars.tv portion of the DevWars site, used by both players and viewers during the broadcasts.

## Development
1. Install Node.js v8.9.x or greater.
2. Copy the `.env.example` file to `.env` and configure your environment variables.
3. Generate your Firebase `serviceAccountKey.json` and place it in the `./config` directory.
4. Run `npm run install` to install dependencies.
5. Run `npm run watch` to continuously build the client and serve the site on `http://localhost:8000`.

_Please run `npm run lint` before committing any code to the repository._

## Production
1. Build the client in production mode with `npm run build`.
2. Make sure to set the `NODE_ENV` environment variable to `production`.

## License
Licensed under [The MIT License (MIT)](https://opensource.org/licenses/MIT) - Copyright &copy; 2018 Kim Simonsen.
