#!/usr/bin/env pwsh
<#
.SYNOPSIS
    WhatsApp Bot for Homey - Release Automation Script
    Automates the process of staging changes, creating commits, tags, and pushing to remote

.DESCRIPTION
    This script simplifies the release process by:
    1. Prompting for the release version tag (e.g., v1.0.0)
    2. Prompting for the commit message
    3. Staging all changes
    4. Creating a git commit with your message
    5. Creating an annotated git tag
    6. Pushing both commit and tag to the remote repository

.EXAMPLE
    .\release.ps1
    
    Version tag: v1.0.0
    Commit message: feat: add support for new triggers

.NOTES
    Requires: Git installed and configured
#>

param(
    [string]$Version,
    [string]$CommitMessage
)

# ========================================
# Helper Functions
# ========================================

<#
.SYNOPSIS
    Prints a success message in green. (Private)

.PARAMETER Message
    The message to display.
#>
function _PrintSuccess {
    param([string]$Message)
    Write-Host ("[OK] {0}" -f $Message) -ForegroundColor Green
}

<#
.SYNOPSIS
    Prints a warning message in yellow. (Private)

.PARAMETER Message
    The message to display.
#>
function _PrintWarning {
    param([string]$Message)
    Write-Host ("[WARNING] {0}" -f $Message) -ForegroundColor Yellow
}

<#
.SYNOPSIS
    Prints an error message in red. (Private)

.PARAMETER Message
    The message to display.
#>
function _PrintError {
    param([string]$Message)
    Write-Host ("[ERROR] {0}" -f $Message) -ForegroundColor Red
}

<#
.SYNOPSIS
    Prints an info message in cyan. (Private)

.PARAMETER Message
    The message to display.
#>
function _PrintInfo {
    param([string]$Message)
    Write-Host ("[INFO] {0}" -f $Message) -ForegroundColor Cyan
}

<#
.SYNOPSIS
    Prints a header block in magenta. (Private)

.PARAMETER Title
    The title of the header.
#>
function _WriteHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host $Title -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host ""
}

# ========================================
# Project Configuration
# ========================================

# Try to get project info from app.json or .homeycompose/app.json
$projectName = "Homey App"
$defaultVersion = ""

$appJsonPath = ""
if (Test-Path ".homeycompose/app.json") {
    $appJsonPath = ".homeycompose/app.json"
}
elseif (Test-Path "app.json") {
    $appJsonPath = "app.json"
}

if ($appJsonPath) {
    try {
        $appJson = Get-Content -Raw $appJsonPath | ConvertFrom-Json
        $projectName = $appJson.name.en
        if ($null -eq $projectName -and $null -ne $appJson.name) {
            $projectName = $appJson.name
        }
        $defaultVersion = "v" + $appJson.version
    }
    catch {
        # Fallback to defaults
    }
}

# ========================================
# Validation & Setup
# ========================================

# Check if git is available
$gitExists = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitExists) {
    _PrintError "Git is not installed or not in PATH"
    exit 1
}

# ========================================
# Git Initialization & Remote Setup
# ========================================

# Check if we are inside a git repository
& git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    _PrintInfo "Current directory is not a Git repository."
    $initGit = Read-Host "Do you want to initialize Git? [Y/n]"
    if ([string]::IsNullOrWhiteSpace($initGit)) { $initGit = 'y' }
    
    if ($initGit -eq 'y' -or $initGit -eq 'Y') {
        & git init 2>&1 | Out-Null
        & git checkout -b main 2>&1 | Out-Null
        _PrintSuccess "Git repository initialized with branch 'main'."
    }
    else {
        _PrintError "Script requires a Git repository to proceed."
        exit 1
    }
}

# Check if 'origin' remote exists
$remoteExists = & git remote | Select-String -Pattern "^origin$"
if (-not $remoteExists) {
    _PrintInfo "Remote 'origin' not found."
    $addRemote = Read-Host "Do you want to add a remote origin? [Y/n]"
    if ([string]::IsNullOrWhiteSpace($addRemote)) { $addRemote = 'y' }
    
    if ($addRemote -eq 'y' -or $addRemote -eq 'Y') {
        $remoteUrl = Read-Host "Enter GitHub repository URL (e.g., https://github.com/user/repo.git)"
        if (-not [string]::IsNullOrWhiteSpace($remoteUrl)) {
            & git remote add origin $remoteUrl
            _PrintSuccess "Remote 'origin' added: $remoteUrl"
        }
        else {
            _PrintError "Remote URL cannot be empty."
            exit 1
        }
    }
    else {
        _PrintWarning "Pushing to remote will fail if 'origin' is not set up."
    }
}

_WriteHeader "$projectName Release Automation"

# Prompt for version if not provided
if (-not $Version) {
    if ($defaultVersion) {
        _PrintInfo "Enter the release version tag (default: $defaultVersion)"
        $Version = Read-Host "Version tag"
        if ([string]::IsNullOrWhiteSpace($Version)) { $Version = $defaultVersion }
    }
    else {
        _PrintInfo "Enter the release version tag (e.g., v1.0.0)"
        $Version = Read-Host "Version tag"
    }
}

# Validate version format
if ($Version -notmatch '^v\d+\.\d+\.\d+$') {
    _PrintError "Invalid version format. Use format: vX.Y.Z (e.g., v1.0.0)"
    exit 1
}

# Prompt for commit message if not provided
if (-not $CommitMessage) {
    _PrintInfo "Enter the commit message (type multiple lines, press Enter twice to finish)"
    _PrintInfo "Example:"
    _PrintInfo "  feat: add support for new triggers"
    _PrintInfo ""
    _PrintInfo "  - Implement whatsapp_message_received trigger"
    _PrintInfo "  - Add sender_number token to flow cards"
    _PrintInfo "  - Update API documentation"
    Write-Host ""
    
    $lines = @()
    $emptyLineCount = 0
    
    while ($true) {
        $line = Read-Host
        
        if ([string]::IsNullOrWhiteSpace($line)) {
            $emptyLineCount++
            if ($emptyLineCount -ge 1) {
                # Remove trailing empty line if any
                if ($lines.Count -gt 0 -and [string]::IsNullOrWhiteSpace($lines[-1])) {
                    $lines = $lines[0..($lines.Count - 2)]
                }
                break
            }
        }
        else {
            $emptyLineCount = 0
            $lines += $line
        }
    }
    
    $CommitMessage = $lines -join "`n"
}

if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    _PrintError "Commit message cannot be empty"
    exit 1
}

# Display summary
$indentedCommitMessage = $CommitMessage -replace "`n", "`n                  "
Write-Host ""
Write-Host "Release Configuration:" -ForegroundColor Yellow
Write-Host "  Project Name:   $projectName" -ForegroundColor White
Write-Host "  Version Tag:    $Version" -ForegroundColor White
Write-Host "  Commit Message: $indentedCommitMessage" -ForegroundColor White
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "Proceed with release? [Y/n]"
if ([string]::IsNullOrWhiteSpace($confirm)) { $confirm = 'y' }

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    _PrintInfo "Release cancelled"
    exit 0
}


# ========================================
# Step 1: Check Git Status
# ========================================

_WriteHeader "Step 1: Checking Git Status"
$status = & git status --porcelain 2>&1
if ($status) {
    _PrintInfo "Found uncommitted changes:"
    Write-Host $status
}
else {
    _PrintInfo "Working tree is clean"
}

# ========================================
# Step 2: Stage Changes
# ========================================

_WriteHeader "Step 2: Staging Changes"
try {
    & git add -A 2>&1 | Out-Null
    _PrintSuccess "All changes staged"
}
catch {
    _PrintError "Failed to stage changes: $_"
    exit 1
}

# ========================================
# Step 3: Create Commit
# ========================================

_WriteHeader "Step 3: Creating Commit"
$fullMessage = "{0}: {1}" -f $Version, $CommitMessage
try {
    $commitOutput = & git commit -m "$fullMessage" 2>&1
    if ($LASTEXITCODE -eq 0) {
        _PrintSuccess "Commit created: '$fullMessage'"
    }
    elseif ($commitOutput -like "*nothing to commit*") {
        _PrintInfo "No changes to commit (working tree clean)"
    }
    else {
        _PrintError "Failed to create commit"
        Write-Host $commitOutput -ForegroundColor Gray
        exit 1
    }
}
catch {
    _PrintError "Failed to create commit: $_"
    exit 1
}

# ========================================
# Step 4: Create Annotated Tag
# ========================================

_WriteHeader "Step 4: Creating Annotated Tag"
$tagMessage = "Release {0}: {1}" -f $Version, $CommitMessage
try {
    $tagOutput = & git tag -a $Version -m "$tagMessage" 2>&1
    if ($LASTEXITCODE -eq 0) {
        _PrintSuccess "Tag created: '$Version'"
    }
    else {
        _PrintError "Failed to create tag"
        Write-Host $tagOutput -ForegroundColor Gray
        exit 1
    }
}
catch {
    _PrintError "Failed to create tag: $_"
    exit 1
}

# ========================================
# Step 5: Push Commit
# ========================================

_WriteHeader "Step 5: Pushing Commit to Remote"
try {
    $pushOutput = & git push origin HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        _PrintSuccess "Commit pushed to origin"
    }
    else {
        _PrintError "Failed to push commit"
        Write-Host $pushOutput -ForegroundColor Gray
        exit 1
    }
}
catch {
    _PrintError "Failed to push commit: $_"
    exit 1
}

# ========================================
# Step 6: Push Tag
# ========================================

_WriteHeader "Step 6: Pushing Tag to Remote"
try {
    $pushTagOutput = & git push origin $Version 2>&1
    if ($LASTEXITCODE -eq 0) {
        _PrintSuccess "Tag pushed to origin"
    }
    else {
        _PrintError "Failed to push tag"
        Write-Host $pushTagOutput -ForegroundColor Gray
        exit 1
    }
}
catch {
    _PrintError "Failed to push tag: $_"
    exit 1
}

# ========================================
# Final Summary
# ========================================

_WriteHeader "Release Complete"
$finalIndentedMessage = $CommitMessage -replace "`n", "`n           "
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Project: $projectName" -ForegroundColor Green
Write-Host "  Version: $Version" -ForegroundColor Green
Write-Host "  Message: $finalIndentedMessage" -ForegroundColor Green
Write-Host "  Status:  Successfully released" -ForegroundColor Green
Write-Host ""
_PrintInfo "Your release is now live on the remote repository!"
Write-Host ""
