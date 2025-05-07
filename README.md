# Onedosh Web

A simple web page that redirects to https://comingsoon.onedosh.com.

## Docker Deployment

### Build the Docker image

```bash
docker build -t onedosh-web .
```

### Run the Docker container

```bash
docker run -d -p 80:80 onedosh-web
```

This will start the container in detached mode and map port 80 of your host to port 80 in the container.

### Access the website

Open your browser and navigate to http://localhost:80 