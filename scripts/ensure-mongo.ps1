# Ensure MongoDB is running before Next.js starts
$port = 27018
$projectRoot = Split-Path $PSScriptRoot -Parent

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
  node (Join-Path $PSScriptRoot "mongo-memory.mjs") | Out-Null
  exit 0
}

# Try installed MongoDB (common Windows paths)
$mongoCandidates = @(
  "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe",
  "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
  "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
)

foreach ($mongoBin in $mongoCandidates) {
  if (-not (Test-Path $mongoBin)) { continue }

  $dataPath = Join-Path $projectRoot ".mongo-data"
  if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
  }

  Write-Host "Starting MongoDB from $mongoBin ..."
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
}

# Try Docker Compose if available
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Write-Host "Starting MongoDB via Docker..."
  Push-Location $projectRoot
  docker compose up -d 2>$null
  Pop-Location

  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline) {
    if (Test-MongoPort) {
      Write-Host "MongoDB ready via Docker on port $port"
      exit 0
    }
    Start-Sleep -Milliseconds 500
  }
}

# Fallback: bundled in-memory MongoDB (no install required)
Write-Host "Starting in-memory MongoDB (npm package)..."
$memoryScript = Join-Path $PSScriptRoot "mongo-memory.mjs"
Start-Process -FilePath "node" -ArgumentList @($memoryScript) -WindowStyle Minimized -WorkingDirectory $projectRoot

$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
  if (Test-MongoPort) {
    Write-Host "In-memory MongoDB ready on port $port"
    exit 0
  }
  Start-Sleep -Milliseconds 500
}

Write-Warning "MongoDB did not start. Run 'npm run db:mongo' in another terminal, then restart dev server."
