# Start local MongoDB replica set (required for Prisma writes on Windows)
$mongoBin = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"

if (-not (Test-Path $mongoBin)) {
  Write-Error "mongod not found at $mongoBin. Install MongoDB or update scripts/start-mongo.ps1"
  exit 1
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$dataPath = Join-Path $projectRoot ".mongo-data"

if (-not (Test-Path $dataPath)) {
  New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
}

Write-Host "Starting MongoDB replica set on mongodb://localhost:27018 ..."
Write-Host "Data path: $dataPath"
Write-Host "(First time? Run: mongosh --port 27018 --eval `"rs.initiate()`")"

& $mongoBin --replSet rs0 --port 27018 --dbpath $dataPath --bind_ip 127.0.0.1
