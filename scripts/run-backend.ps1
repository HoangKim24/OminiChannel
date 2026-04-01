$ErrorActionPreference = 'Stop'

Set-Location -Path $PSScriptRoot\..

$maxAttempts = 3

for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
	powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-omnichannel.ps1

	& dotnet build .\Omnichannel.csproj /p:SkipFrontendBuild=true
	$buildExitCode = $LASTEXITCODE

	if ($buildExitCode -eq 0) {
		break
	}

	if ($attempt -lt $maxAttempts) {
		Write-Warning "Build failed before run. Retrying (attempt $($attempt + 1)/$maxAttempts)..."
		Start-Sleep -Seconds 1
		continue
	}

	Write-Error "dotnet build failed after $maxAttempts attempts."
	exit $buildExitCode
}

dotnet run --project .\Omnichannel.csproj
