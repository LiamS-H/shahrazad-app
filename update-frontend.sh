SHARED_CRATE_DIR="shared"
FRONTEND_DIR="frontend/src/types"
BINDING_NAME="bindings"

echo "Generating TypeScript definitions..."

rm -rf "$SHARED_CRATE_DIR/$BINDING_NAME"
mkdir -p "$SHARED_CRATE_DIR/$BINDING_NAME"

cd shared
cargo run export_all || { echo "Rust export failed"; exit 1; }
cd ..

GENERATED_FOLDER="$SHARED_CRATE_DIR/$BINDING_NAME"
if [ ! -d "$GENERATED_FOLDER" ]; then
    echo "TypeScript definitions not found at: $GENERATED_FOLDER"
    exit 1
fi

rm -rf "$FRONTEND_DIR/$BINDING_NAME"

echo "Copying generated TypeScript definitions: $FRONTEND_DIR"
cp -r "$GENERATED_FOLDER" "$FRONTEND_DIR" || { echo "Failed to copy folder"; exit 1; }

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Failed to copy definitions at: $GENERATED_FOLDER $FRONTEND_DIR"
    exit 1
fi

echo "TypeScript definitions successfully copied to frontend!"

echo "Building wasm..."

cd wasm
wasm-pack build --target "web" || { echo "wasm build failed"; exit 1;}
cd ..

echo "Copying wasm to frontend..."

mkdir -p frontend/node_modules/shahrazad-wasm
cp -r wasm/pkg/* frontend/node_modules/shahrazad-wasm || { echo "failed to copy wasm"; exit 1;}

echo "wasm successfully copied to frontend!"

echo "\nFrontend updated 😎"