$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$routingDirectory = Join-Path $repositoryRoot 'routing'
$mapFile = Join-Path $routingDirectory 'chad-latest.osm.pbf'
$mapUrl = 'https://download.geofabrik.de/africa/chad-latest.osm.pbf'

Set-Location $repositoryRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker is not installed. Install Docker Desktop, then run this script again.'
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw 'Docker Desktop is not running. Start it, then run this script again.'
}

New-Item -ItemType Directory -Path $routingDirectory -Force | Out-Null

if (-not (Test-Path $mapFile)) {
  Write-Host 'Downloading OpenStreetMap road data for Chad. This may take a while...'
  $temporaryMapFile = "$mapFile.download"
  try {
    Invoke-WebRequest -Uri $mapUrl -OutFile $temporaryMapFile -UseBasicParsing
    if ((Get-Item $temporaryMapFile).Length -eq 0) {
      throw 'The downloaded OpenStreetMap file is empty.'
    }
    Move-Item -Path $temporaryMapFile -Destination $mapFile -Force
  } finally {
    if (Test-Path $temporaryMapFile) {
      Remove-Item -Path $temporaryMapFile
    }
  }
}

if ((Get-Item $mapFile).Length -eq 0) {
  throw "The map download is empty: $mapFile"
}

$processingSteps = @(
  @{ Name = 'osrm-extract'; Arguments = @('-p', '/opt/car.lua', '/data/chad-latest.osm.pbf') },
  @{ Name = 'osrm-partition'; Arguments = @('/data/chad-latest.osrm') },
  @{ Name = 'osrm-customize'; Arguments = @('/data/chad-latest.osrm') }
)

foreach ($step in $processingSteps) {
  Write-Host "Preparing routing data: $($step.Name)"
  $stepArguments = $step.Arguments
  docker compose --profile routing run --rm --no-deps --entrypoint $step.Name osrm @stepArguments
  if ($LASTEXITCODE -ne 0) {
    throw "OSRM data preparation failed at $($step.Name)."
  }
}

Write-Host 'OSRM data is ready. Set ROUTING_BASE_URL=http://osrm:5000 in .env.'
Write-Host 'Then start the project with: docker compose --profile routing up --build'
