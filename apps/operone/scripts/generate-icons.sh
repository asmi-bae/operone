#!/bin/bash

# Icon Generation Script for Operone
# Creates platform-specific icons from the source favicon

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎨 Generating platform-specific icons...${NC}"

BUILD_DIR="build"
SOURCE_ICON="src/assets/favicon.ico"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo -e "${RED}❌ Source icon not found: $SOURCE_ICON${NC}"
    exit 1
fi

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy ICO for Windows
echo -e "${YELLOW}📋 Creating Windows icon...${NC}"
cp "$SOURCE_ICON" "$BUILD_DIR/icon.ico"

# Create PNG for Linux (convert from ICO if needed)
echo -e "${YELLOW}🐧 Creating Linux icon...${NC}"
if command -v convert &> /dev/null; then
    # Use ImageMagick if available
    convert "$SOURCE_ICON" "$BUILD_DIR/icon.png"
else
    # Fallback: copy as PNG (may not work perfectly but better than nothing)
    cp "$SOURCE_ICON" "$BUILD_DIR/icon.png"
fi

# Create ICNS for macOS
echo -e "${YELLOW}🍎 Creating macOS icon...${NC}"
if command -v iconutil &> /dev/null; then
    # Use iconutil on macOS
    mkdir -p "$BUILD_DIR/icon.iconset"
    
    # Convert to different sizes (using sips if available, or ImageMagick)
    if command -v sips &> /dev/null; then
        sips -z 16 16 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_16x16.png" 2>/dev/null || true
        sips -z 32 32 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_16x16@2x.png" 2>/dev/null || true
        sips -z 32 32 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_32x32.png" 2>/dev/null || true
        sips -z 64 64 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_32x32@2x.png" 2>/dev/null || true
        sips -z 128 128 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_128x128.png" 2>/dev/null || true
        sips -z 256 256 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_128x128@2x.png" 2>/dev/null || true
        sips -z 256 256 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_256x256.png" 2>/dev/null || true
        sips -z 512 512 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_256x256@2x.png" 2>/dev/null || true
        sips -z 512 512 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_512x512.png" 2>/dev/null || true
        sips -z 1024 1024 "$SOURCE_ICON" --out "$BUILD_DIR/icon.iconset/icon_512x512@2x.png" 2>/dev/null || true
    elif command -v convert &> /dev/null; then
        # Fallback to ImageMagick
        convert "$SOURCE_ICON" -resize 16x16 "$BUILD_DIR/icon.iconset/icon_16x16.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 32x32 "$BUILD_DIR/icon.iconset/icon_16x16@2x.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 32x32 "$BUILD_DIR/icon.iconset/icon_32x32.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 64x64 "$BUILD_DIR/icon.iconset/icon_32x32@2x.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 128x128 "$BUILD_DIR/icon.iconset/icon_128x128.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 256x256 "$BUILD_DIR/icon.iconset/icon_128x128@2x.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 256x256 "$BUILD_DIR/icon.iconset/icon_256x256.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 512x512 "$BUILD_DIR/icon.iconset/icon_256x256@2x.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 512x512 "$BUILD_DIR/icon.iconset/icon_512x512.png" 2>/dev/null || true
        convert "$SOURCE_ICON" -resize 1024x1024 "$BUILD_DIR/icon.iconset/icon_512x512@2x.png" 2>/dev/null || true
    fi
    
    # Create ICNS file
    iconutil -c icns "$BUILD_DIR/icon.iconset" -o "$BUILD_DIR/icon.icns" 2>/dev/null || {
        echo -e "${YELLOW}⚠️ iconutil failed, creating fallback ICNS${NC}"
        cp "$SOURCE_ICON" "$BUILD_DIR/icon.icns"
    }
else
    echo -e "${YELLOW}⚠️ iconutil not available, using fallback ICNS${NC}"
    cp "$SOURCE_ICON" "$BUILD_DIR/icon.icns"
fi

# List created files
echo -e "${GREEN}✅ Icons created in $BUILD_DIR/:${NC}"
ls -la "$BUILD_DIR"/icon.*

echo -e "${GREEN}🎉 Icon generation complete!${NC}"
echo -e "${YELLOW}💡 Note: For best results, create proper high-resolution icons and replace the generated files${NC}"
