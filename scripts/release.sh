#!/bin/bash

# Release Script for Operone
# This script builds the application for all platforms and creates a GitHub release
#
# USAGE:
#   ./release.sh [platform] [auto-version]
#
# EXAMPLES:
#   ./release.sh mac true     # Build macOS only, auto-bump version
#   ./release.sh all false    # Build all platforms, keep current version (default)
#   ./release.sh linux        # Build Linux only, keep current version (default)
#
# OPTIONS:
#   platform: mac, win, linux, all (default: all)
#   auto-version: true, false (default: false)
#   version: Fixed at 0.0.1

set -e

# Load environment variables from .env file
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="the-shoaib2"
REPO_NAME="operone"
GITHUB_TOKEN=${GITHUB_TOKEN}
PLATFORMS=${1:-"all"} # Options: mac, win, linux, all
AUTO_VERSION=${2:-"false"} # Options: true, false
VERSION="0.0.1" # Fixed version

# Get current version from package.json or use default
get_current_version() {
    echo "$VERSION"
}

# Update all package.json files in the project
update_all_versions() {
    local new_version="$1"
    echo -e "${BLUE}🔄 Updating all package.json files to version $new_version${NC}"
    
    # Update root package.json
    if [ -f "../package.json" ]; then
        sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" ../package.json
        echo -e "${GREEN}✅ Updated root package.json to $new_version${NC}"
    fi
    
    # Update apps/operone package.json
    if [ -f "../apps/operone/package.json" ]; then
        sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" ../apps/operone/package.json
        echo -e "${GREEN}✅ Updated apps/operone/package.json to $new_version${NC}"
    fi
    
    # Update all packages
    find ../packages -name "package.json" -type f | while read -r pkg_file; do
        sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" "$pkg_file"
        pkg_name=$(basename "$(dirname "$pkg_file")")
        echo -e "${GREEN}✅ Updated packages/$pkg_name/package.json to $new_version${NC}"
    done
    
    # Update all apps
    find ../apps -name "package.json" -type f | while read -r app_file; do
        # Skip operone as it's already updated
        if [[ "$app_file" != *"operone/package.json"* ]]; then
            sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" "$app_file"
            app_name=$(basename "$(dirname "$app_file")")
            echo -e "${GREEN}✅ Updated apps/$app_name/package.json to $new_version${NC}"
        fi
    done
    
    echo -e "${GREEN}🎉 All package.json files updated to version $new_version${NC}"
}

# Bump version
bump_version() {
    local current_version="$1"
    local patch=$(echo "$current_version" | cut -d. -f3)
    local minor=$(echo "$current_version" | cut -d. -f2)
    local major=$(echo "$current_version" | cut -d. -f1)
    
    patch=$((patch + 1))
    echo "${major}.${minor}.${patch}"
}

# Initialize VERSION
VERSION=$(get_current_version)

# Auto-bump version if enabled
if [ "$AUTO_VERSION" = "true" ]; then
    NEW_VERSION=$(bump_version "$VERSION")
    echo -e "${YELLOW}🔄 Auto-bumping version: $VERSION → $NEW_VERSION${NC}"
    VERSION="$NEW_VERSION"
    
    # Update all package.json files
    update_all_versions "$VERSION"
else
    echo -e "${BLUE}📋 Using current version: $VERSION${NC}"
fi

echo -e "${GREEN}🚀 Starting Operone Release Process${NC}"
echo "Version: $VERSION"
echo "Platforms: $PLATFORMS"
echo "Auto-version: $AUTO_VERSION"

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Error: GITHUB_TOKEN environment variable is required${NC}"
    echo "Please set: export GITHUB_TOKEN=your_github_token"
    exit 1
fi

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
cd ..

# Build based on platform selection
case $PLATFORMS in
    "mac")
        pnpm --filter @apps/operone run build:mac
        ;;
    "win")
        pnpm --filter @apps/operone run build:win
        ;;
    "linux")
        pnpm --filter @apps/operone run build:linux
        ;;
    "all")
        pnpm --filter @apps/operone run build:all
        ;;
    *)
        echo -e "${RED}❌ Invalid platform: $PLATFORMS${NC}"
        echo "Valid options: mac, win, linux, all"
        exit 1
        ;;
esac

# Check if build was successful
echo -e "${BLUE}📦 Checking build artifacts...${NC}"
ARTIFACTS_FOUND=false

# Check for macOS artifacts
if [ -f "apps/operone/release/Operone-$VERSION-arm64.dmg" ]; then
    echo -e "${GREEN}✅ macOS DMG found: Operone-$VERSION-arm64.dmg${NC}"
    ARTIFACTS_FOUND=true
fi

if [ -f "apps/operone/release/Operone-$VERSION.dmg" ]; then
    echo -e "${GREEN}✅ macOS DMG (x64) found: Operone-$VERSION.dmg${NC}"
    ARTIFACTS_FOUND=true
fi

# Check for Windows artifacts
if [ -f "apps/operone/release/Operone-Setup-$VERSION.exe" ]; then
    echo -e "${GREEN}✅ Windows EXE found: Operone-Setup-$VERSION.exe${NC}"
    ARTIFACTS_FOUND=true
fi

# Check for Linux artifacts
if [ -f "apps/operone/release/Operone-$VERSION.AppImage" ]; then
    echo -e "${GREEN}✅ Linux AppImage found: Operone-$VERSION.AppImage${NC}"
    ARTIFACTS_FOUND=true
fi

if [ "$ARTIFACTS_FOUND" = false ]; then
    echo -e "${RED}❌ No build artifacts found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create GitHub release
echo -e "${YELLOW}📤 Creating GitHub release...${NC}"

# Get the current directory
ROOT_DIR=$(pwd)

# Create release using GitHub CLI or curl
RELEASE_DATA=$(cat <<EOF
{
  "tag_name": "v$VERSION",
  "name": "Operone v$VERSION",
  "body": "## 🎉 Operone v$VERSION Release\n\n### ✨ Features:\n- AI-powered desktop automation\n- Multi-platform support (macOS, Windows, Linux)\n- Modern UI with React and Electron\n- SQLite database for local data storage\n- Enhanced performance and stability\n\n### 📦 Installation:\n\n#### macOS (Apple Silicon)\n- 📥 Download: [Operone-$VERSION-arm64.dmg](https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/Operone-$VERSION-arm64.dmg)\n- Requirements: macOS 12.0+\n- Size: ~300MB\n\n#### macOS (Intel)\n- 📥 Download: [Operone-$VERSION.dmg](https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/Operone-$VERSION.dmg)\n- Requirements: macOS 12.0+\n- Size: ~300MB\n\n#### Windows (64-bit)\n- 📥 Download: [Operone-Setup-$VERSION.exe](https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/Operone-Setup-$VERSION.exe)\n- Requirements: Windows 10+\n- Size: ~125MB\n\n#### Linux (AppImage)\n- 📥 Download: [Operone-$VERSION.AppImage](https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/Operone-$VERSION.AppImage)\n- Requirements: Linux distributions with AppImage support\n- Size: ~112MB\n\n#### Linux (ARM64)\n- 📥 Download: [Operone-$VERSION-arm64.AppImage](https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION/Operone-$VERSION-arm64.AppImage)\n- Requirements: ARM64 Linux distributions with AppImage support\n- Size: ~110MB\n\n### 🔧 System Requirements:\n- **macOS**: 12.0+ (Apple Silicon or Intel)\n- **Windows**: 10+ (64-bit)\n- **Linux**: AppImage compatible distributions\n- **Memory**: 4GB RAM minimum\n- **Storage**: 500MB free space\n- **Network**: Internet connection for AI features\n\n### 🚀 What's New in v$VERSION:\n- Updated all package dependencies to latest stable versions\n- Enhanced cross-platform compatibility\n- Improved AI integration and performance\n- Bug fixes and stability improvements\n- Updated user interface components\n- Better error handling and logging\n\n### 🔗 Quick Links:\n- 📄 [Documentation](https://github.com/$REPO_OWNER/$REPO_NAME/blob/main/README.md)\n- 🐛 [Report Issues](https://github.com/$REPO_OWNER/$REPO_NAME/issues)\n- 💬 [Discussions](https://github.com/$REPO_OWNER/$REPO_NAME/discussions)\n- 📖 [Wiki](https://github.com/$REPO_OWNER/$REPO_NAME/wiki)\n\n---\n\n**⚠️ Important Notes:**\n- First-time users may need to allow the application in system settings\n- Windows users may see a security warning - this is normal for unsigned applications\n- Linux users may need to make the AppImage executable: \`chmod +x Operone-$VERSION.AppImage\`\n\n**🙏 Thank you for using Operone!**\n\n**🐛 Bug Reports**: Please report issues on [GitHub Issues](https://github.com/$REPO_OWNER/$REPO_NAME/issues)\n**💬 Feedback**: We welcome your feedback and suggestions!",
  "draft": false,
  "prerelease": false
}
EOF
)

# Create release
echo -e "${BLUE}📝 Creating GitHub release...${NC}"
RELEASE_RESPONSE=$(curl -s \
  -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases" \
  -d "$RELEASE_DATA")

# Check if release already exists
if echo "$RELEASE_RESPONSE" | grep -q '"code": "already_exists"'; then
    echo -e "${YELLOW}⚠️ Release v$VERSION already exists${NC}"
    echo -e "${BLUE}📝 Getting existing release...${NC}"
    RELEASE_RESPONSE=$(curl -s \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/tags/v$VERSION")
else
    echo -e "${BLUE}📝 Creating GitHub release...${NC}"
    RELEASE_RESPONSE=$(curl -s \
      -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases" \
      -d "$RELEASE_DATA")
fi

# Check if release already exists
if echo "$RELEASE_RESPONSE" | grep -q '"code": "already_exists"'; then
    echo -e "${YELLOW}⚠️ Release v$VERSION already exists${NC}"
    echo -e "${BLUE}📝 Getting existing release...${NC}"
    RELEASE_RESPONSE=$(curl -s \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/tags/v$VERSION")
fi

# Check if release was created successfully
if echo "$RELEASE_RESPONSE" | grep -q '"id":'; then
    echo -e "${GREEN}✅ Release ready${NC}"
    # Extract upload URL
    UPLOAD_URL=$(echo "$RELEASE_RESPONSE" | grep -o '"upload_url":"[^"]*' | sed 's/"upload_url":"//' | sed 's/{.*//')
else
    echo -e "${RED}❌ Failed to create release${NC}"
    echo "$RELEASE_RESPONSE"
    exit 1
fi

# Upload artifacts
echo -e "${YELLOW}⬆️ Uploading artifacts...${NC}"

# Function to validate download URLs
validate_downloads() {
    local version="$1"
    echo -e "${BLUE}🔍 Validating download URLs for v$VERSION...${NC}"
    
    # List of expected files
    local expected_files=(
        "Operone-$VERSION-arm64.dmg"
        "Operone-$VERSION.dmg"
        "Operone-Setup-$VERSION.exe"
        "Operone-$VERSION.AppImage"
        "Operone-$VERSION-arm64.AppImage"
    )
    
    local base_url="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v$VERSION"
    local all_valid=true
    
    for file in "${expected_files[@]}"; do
        local url="$base_url/$file"
        echo -e "${BLUE}🔍 Checking: $url${NC}"
        
        # Check if file exists in release assets
        local check_response=$(curl -s -I "$url")
        if echo "$check_response" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
            echo -e "${GREEN}✅ $file - Download link valid${NC}"
        else
            echo -e "${YELLOW}⚠️ $file - Download link not yet available (may still be uploading)${NC}"
            all_valid=false
        fi
    done
    
    if [ "$all_valid" = true ]; then
        echo -e "${GREEN}🎉 All download links are working!${NC}"
    else
        echo -e "${YELLOW}⚠️ Some download links may still be processing. Check again in a few minutes.${NC}"
    fi
}

# Function to delete existing release assets
delete_existing_assets() {
    echo -e "${BLUE}🗑️ Checking for existing assets...${NC}"
    
    # Get existing assets
    ASSETS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/tags/v$VERSION" | \
        grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -20)
    
    if [ -n "$ASSETS" ]; then
        for asset_id in $ASSETS; do
            if [ "$asset_id" != "" ] && [ "$asset_id" != "0" ]; then
                echo -e "${YELLOW}🗑️ Deleting existing asset: $asset_id${NC}"
                curl -s -X DELETE \
                    -H "Authorization: token $GITHUB_TOKEN" \
                    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/assets/$asset_id"
            fi
        done
        echo -e "${GREEN}✅ Cleaned up existing assets${NC}"
    else
        echo -e "${BLUE}ℹ️ No existing assets found${NC}"
    fi
}

# Function to upload a file with retry
upload_file() {
    local file_path="$1"
    local file_name="$2"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if [ -f "$file_path" ]; then
            echo -e "${BLUE}📤 Uploading $file_name...${NC}"
            
            UPLOAD_RESPONSE=$(curl -s \
              -X POST \
              -H "Authorization: token $GITHUB_TOKEN" \
              -H "Accept: application/vnd.github.v3+json" \
              -H "Content-Type: application/octet-stream" \
              --data-binary @"$file_path" \
              "$UPLOAD_URL?name=$file_name")
            
            # Check if upload was successful
            if echo "$UPLOAD_RESPONSE" | grep -q '"state":"uploaded"'; then
                DOWNLOAD_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"browser_download_url":"[^"]*' | sed 's/"browser_download_url":"//')
                echo -e "${GREEN}✅ $file_name uploaded successfully${NC}"
                echo "   📥 $DOWNLOAD_URL"
                return 0
            else
                retry_count=$((retry_count + 1))
                echo -e "${YELLOW}⚠️ Upload failed (attempt $retry_count/$max_retries), retrying...${NC}"
                sleep 2
            fi
        else
            echo -e "${YELLOW}⚠️ $file_name not found, skipping${NC}"
            return 1
        fi
    done
    
    echo -e "${RED}❌ Failed to upload $file_name after $max_retries attempts${NC}"
    echo "$UPLOAD_RESPONSE"
    return 1
}

# Clean up existing assets first
delete_existing_assets

# Upload macOS DMG (ARM64)
upload_file "$ROOT_DIR/apps/operone/release/Operone-$VERSION-arm64.dmg" "Operone-$VERSION-arm64.dmg"

# Upload macOS DMG (x64)
upload_file "$ROOT_DIR/apps/operone/release/Operone-$VERSION.dmg" "Operone-$VERSION.dmg"

# Upload Windows EXE
upload_file "$ROOT_DIR/apps/operone/release/Operone-Setup-$VERSION.exe" "Operone-Setup-$VERSION.exe"

# Upload Linux AppImage
upload_file "$ROOT_DIR/apps/operone/release/Operone-$VERSION.AppImage" "Operone-$VERSION.AppImage"

# Upload Linux AppImage (ARM64)
upload_file "$ROOT_DIR/apps/operone/release/Operone-$VERSION-arm64.AppImage" "Operone-$VERSION-arm64.AppImage"

# Validate download links
echo -e "${YELLOW}🔍 Validating all download links...${NC}"
sleep 5  # Wait a moment for GitHub to process uploads
validate_downloads "$VERSION"

# Commit version change if auto-bumped
if [ "$AUTO_VERSION" = "true" ]; then
    echo -e "${BLUE}📝 Committing version change...${NC}"
    cd ..
    
    # Add all package.json files
    git add package.json
    git add apps/*/package.json
    git add packages/*/package.json
    
    # Commit with detailed message
    git commit -m "chore: bump version to $VERSION

- Updated all package.json files across the project
- Root package.json: $VERSION
- Apps: operone, web, docs
- Packages: All workspace packages updated to $VERSION
- Release: v$VERSION"
    
    # Create annotated tag
    git tag -a "v$VERSION" -m "Release v$VERSION

🎉 Operone v$VERSION Release

✨ Features:
- AI-powered desktop automation
- Multi-platform support (macOS, Windows, Linux)
- Modern UI with React and Electron
- SQLite database for local data storage
- Enhanced performance and stability

📦 Installation:
- macOS: Apple Silicon and Intel support
- Windows: 64-bit installer
- Linux: AppImage for x64 and ARM64

🔗 Download: https://github.com/$REPO_OWNER/$REPO_NAME/releases/tag/v$VERSION"
    
    echo -e "${GREEN}✅ Committed and tagged version $VERSION${NC}"
    echo -e "${YELLOW}💡 Run 'git push origin main --tags' to push to GitHub${NC}"
    echo -e "${YELLOW}💡 Run 'git push origin v$VERSION' to push tag specifically${NC}"
    cd scripts
fi

echo -e "${GREEN}🎉 Release completed successfully!${NC}"
echo "📄 Release page: https://github.com/$REPO_OWNER/$REPO_NAME/releases/tag/v$VERSION"
echo "📦 All artifacts uploaded and ready for download"

# Summary
echo -e "${BLUE}📊 Release Summary:${NC}"
echo "   📦 Version: $VERSION"
echo "   🏗️ Platforms: $PLATFORMS"
echo "   🔄 Auto-version: $AUTO_VERSION"
echo "   📁 Artifacts uploaded to GitHub"
if [ "$AUTO_VERSION" = "true" ]; then
    echo "   📝 All package.json files updated to $VERSION"
    echo "   🏷️ Git tag v$VERSION created"
fi
echo -e "${GREEN}✨ Done! Your release is live.${NC}"
