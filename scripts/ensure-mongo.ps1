# Thin wrapper - delegates to cross-platform Node script
$scriptDir = Split-Path $PSScriptRoot -Parent
node (Join-Path $PSScriptRoot "ensure-mongo.mjs")
exit $LASTEXITCODE
