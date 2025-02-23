fn main() {
    let mut config = prost_build::Config::new();
    config.protoc_arg("--experimental_allow_proto3_optional");
    config
        .compile_protos(
            &[
                "src/proto/action.proto",
                "src/proto/card.proto",
                "src/proto/game.proto",
                "src/proto/playmat.proto",
                "src/proto/ws.proto",
                "src/proto/zone.proto",
            ],
            &["."],
        )
        .unwrap();
}
