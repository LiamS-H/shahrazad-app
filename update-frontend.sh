SHARED_CRATE_DIR="shared"
FRONTEND_TYPE_DIR="frontend/src/types"
FRONTEND_BINDING_DIR="bindings"

WASM_PKG_DIR="wasm/pkg"
FRONTEND_MODULES_DIR="frontend/src/lib"
FRONTEND_WASM_DIR="shahrazad-wasm"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo "Generating TypeScript definitions..."

rm -rf "$SHARED_CRATE_DIR/$FRONTEND_BINDING_DIR"
mkdir -p "$SHARED_CRATE_DIR/$FRONTEND_BINDING_DIR"

cd shared
cargo run export_all || { echo "${RED}❌Rust export failed"; exit 1; }
cd ..

GENERATED_FOLDER="$SHARED_CRATE_DIR/$FRONTEND_BINDING_DIR"
if [ ! -d "$GENERATED_FOLDER" ]; then
    echo "${RED}❌TypeScript definitions not found at: $GENERATED_FOLDER"
    exit 1
fi

rm -rf "$FRONTEND_TYPE_DIR/$FRONTEND_BINDING_DIR"

echo "Copying generated TypeScript definitions: $FRONTEND_TYPE_DIR"
cp -r "$GENERATED_FOLDER" "$FRONTEND_TYPE_DIR" || { echo "${RED}❌Failed to copy folder"; exit 1; }

if [ ! -d "$FRONTEND_TYPE_DIR" ]; then
    echo "Failed to copy definitions at: $GENERATED_FOLDER $FRONTEND_TYPE_DIR"
    exit 1
fi

echo "${GREEN}TypeScript definitions successfully copied to frontend!"

echo "${RESET}\nBuilding wasm..."

cd wasm
wasm-pack build --target "web" || { echo "${RED}❌wasm build failed"; exit 1;}
cd ..

echo "Copying wasm to frontend..."

rm -rf "$FRONTEND_MODULES_DIR/$FRONTEND_WASM_DIR/*" 

mkdir -p "$FRONTEND_MODULES_DIR/$FRONTEND_WASM_DIR"
cp -r $WASM_PKG_DIR/* "$FRONTEND_MODULES_DIR/$FRONTEND_WASM_DIR" || { echo "${RED}❌failed to copy wasm"; exit 1;}

echo  "${GREEN}wasm module successfully copied to frontend!"


echo  "${RESET}installing wasm..."

cd frontend
bun install
cd ..

echo  "${BLUE}\nFrontend updated 😎"