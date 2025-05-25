
## Development

Run the development server:

```bash
# Create a new .env file from the example env file
cp .env.example .env
# Populate the .env file

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Deployment

### Hosting directly on server

```bash
# Create a new .env file from the example env file
cp .env.example .env
# Populate the .env file

# Build and run the Docker container
docker compose up -d --build
```
