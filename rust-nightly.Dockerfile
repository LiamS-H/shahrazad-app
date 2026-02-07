FROM rust:1.83.0-alpine
RUN rustup install nightly-2025-01-01 && rustup default nightly-2025-01-01
RUN apk add --no-cache clang lld musl-dev git protoc
RUN cargo install cargo-chef