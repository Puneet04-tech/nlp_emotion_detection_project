#!/bin/bash
# PowerShell version of ngrok setup

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "    🌐 NGROK SETUP FOR GLOBAL ACCESS" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Adding ngrok to PATH..." -ForegroundColor Green
$env:PATH = $env:PATH + ";C:\Users\$env:USERNAME\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe"

Write-Host "2. Checking ngrok installation..." -ForegroundColor Green
ngrok --version
Write-Host ""

Write-Host "3. Setup Instructions:" -ForegroundColor Yellow
Write-Host "   a) Go to: https://ngrok.com/signup" -ForegroundColor White
Write-Host "   b) Sign up for a FREE account" -ForegroundColor White
Write-Host "   c) Copy your authtoken from dashboard" -ForegroundColor White
Write-Host "   d) Run: ngrok config add-authtoken YOUR_TOKEN_HERE" -ForegroundColor White
Write-Host ""

Write-Host "4. To start global tunnel for your laptop:" -ForegroundColor Yellow
Write-Host "   ngrok http 4000" -ForegroundColor White
Write-Host ""

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "    🚀 Ready for Global Data Collection!" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan

Read-Host "Press Enter to continue"
