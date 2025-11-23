# Script to move client code to root for simple Vercel deployment
Write-Host "Moving client code to root..."

# Backup current structure
Write-Host "Creating backup..."
if (Test-Path "client-backup") {
    Remove-Item -Recurse -Force "client-backup"
}
Copy-Item -Path "client" -Destination "client-backup" -Recurse

# Move files from client to root
Write-Host "Moving files..."
$clientFiles = Get-ChildItem -Path "client" -Exclude "node_modules",".next",".git"
foreach ($file in $clientFiles) {
    $destPath = Join-Path "." $file.Name
    if (Test-Path $destPath) {
        Write-Host "Skipping $($file.Name) - already exists in root"
    } else {
        Move-Item -Path $file.FullName -Destination $destPath
        Write-Host "Moved $($file.Name)"
    }
}

Write-Host "Done! Now you can deploy directly from root."
Write-Host "Note: Keep client-backup folder for reference."


