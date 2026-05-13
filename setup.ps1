#!/usr/bin/env pwsh
# ─── RentHub-MERN Setup Script ────────────────────────────────────────────────
# Run this once from PowerShell to install all dependencies and scaffold the 
# React client inside e:\Work\web_evelopment\RentHub-MERN\
# Usage: .\setup.ps1

$ErrorActionPreference = "Stop"

$root = "e:\Work\web_evelopment\RentHub-MERN"
$server = "$root\server"
$client = "$root\client"

Write-Host "`n📦 [1/3] Installing backend dependencies..." -ForegroundColor Cyan
Set-Location $server
npm install

Write-Host "`n⚛️  [2/3] Scaffolding Vite + React client..." -ForegroundColor Cyan
Set-Location $root
npx -y create-vite@latest client --template react

Write-Host "`n📦 [3/3] Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location $client
npm install
npm install axios react-router-dom react-hot-toast react-map-gl mapbox-gl react-hook-form
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "   Start backend :  cd $server  &&  npm run dev" -ForegroundColor Yellow
Write-Host "   Start frontend:  cd $client  &&  npm run dev" -ForegroundColor Yellow
