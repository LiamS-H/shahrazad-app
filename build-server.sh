docker build . -t shahrazad-server
docker tag shahrazad-server us-west1-docker.pkg.dev/shahrazad-app/rust-backend-images/shahrazad-server:latest
docker push us-west1-docker.pkg.dev/shahrazad-app/rust-backend-images/shahrazad-server:latest