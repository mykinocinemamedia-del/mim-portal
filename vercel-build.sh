#!/bin/bash
# Build script for Vercel deployment
# Schema is already postgresql, just generate client and build

set -e

echo "🚀 Starting Vercel build for MIM Portal..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bunx prisma generate
echo "✓ Prisma client generated"

# Build Next.js
echo "🏗️  Building Next.js..."
bunx next build
echo "✅ Build complete!"
