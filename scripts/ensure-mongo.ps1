# Ensure MongoDB replica set is running on port 27018 before Next.js starts
$mongoBin = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
$port = 27018

function Test-MongoPort {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", $port)
    $tcp.Close()
    return $true
  } catch {
    return $false
  }
}

if (Test-MongoPort) {
  Write-Host "MongoDB already running on port $port"
  exit 0
}

if (-not (Test-Path $mongoBin)) {
  Write-Warning "MongoDB not found. Run 'npm run dev:mongo' in another terminal first."
  exit 0
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$dataPath = Join-Path $projectRoot ".mongo-data"
if (-not (Test-Path $dataPath)) {
  New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
}

Write-Host "Starting MongoDB on port $port..."
Start-Process -FilePath $mongoBin -ArgumentList @(
  "--replSet", "rs0",
  "--port", "$port",
  "--dbpath", $dataPath,
  "--bind_ip", "127.0.0.1"
) -WindowStyle Minimized

$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline) {
  if (Test-MongoPort) {
    Start-Sleep -Seconds 2
    try {
      & mongosh --port $port --quiet --eval "try { rs.status() } catch(e) { rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27018' }] }) }" 2>$null
    } catch {}
    Write-Host "MongoDB ready on mongodb://localhost:$port"
    exit 0
  }
  Start-Sleep -Milliseconds 500
}

Write-Warning "MongoDB did not start in time. Run 'npm run dev:mongo' manually."
