FROM rust:1.92.0-alpine3.22 AS build

RUN apk add --no-cache musl-dev

WORKDIR /usr/src/app

RUN addgroup -S -g 10001 test-prism && \
    adduser -S -u 10001 -G test-prism test-prism

COPY ./src ./src
COPY ./Cargo.toml .
COPY ./Cargo.lock .

RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch

WORKDIR /usr/local/bin

COPY --from=build /etc/passwd /etc/passwd
COPY --from=build /etc/group /etc/group

COPY --from=build --chown=test-prism:test-prism /usr/src/app/target/x86_64-unknown-linux-musl/release/parser .

USER test-prism

ENTRYPOINT ["./parser"]
