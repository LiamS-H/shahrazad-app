# syntax=docker/dockerfile:1

FROM us-west1-docker.pkg.dev/shahrazad-app/rust-base-builds/base AS planner
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY wasm/ ./wasm/
RUN cargo chef prepare --recipe-path recipe.json

FROM us-west1-docker.pkg.dev/shahrazad-app/rust-base-builds/base AS build
WORKDIR /app

COPY --from=planner /app/recipe.json recipe.json

# Build dependencies - cached until Cargo.toml changes
RUN --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo chef cook --release --recipe-path recipe.json --manifest-path ./backend/Cargo.toml

# Build application - only runs when source changes
COPY Cargo.toml Cargo.lock ./
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY wasm/ ./wasm/

RUN --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo build --manifest-path ./backend/Cargo.toml --locked --release && \
    cp target/release/backend /bin/server

FROM alpine:3.18 AS final
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=build /bin/server /bin/

EXPOSE 5000
ENV CORS_ALLOWED_ORIGINS="https://shahrazad.vercel.app"
CMD ["/bin/server"]
