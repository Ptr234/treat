<#
.SYNOPSIS
    Installs the OSC ASP.NET backend as an auto-starting Windows Service.

.DESCRIPTION
    Run this ONCE, in an ELEVATED (Administrator) PowerShell, to register the
    backend as a proper Windows Service that starts at boot and restarts on
    failure — replacing the development watchdog loop.

    Prerequisites:
      * The backend has been published/built in Release
        (dotnet build -c Release, or dotnet publish -c Release).
      * The app enables service mode via builder.Host.UseWindowsService().

.EXAMPLE
    # From an elevated PowerShell:
    .\scripts\install-backend-service.ps1
#>

param(
    [string]$ServiceName = 'OscApi',
    [string]$DisplayName = 'Uganda OSC Backend API',
    [string]$Url         = 'http://localhost:5082',
    [string]$DllPath     = 'E:\treat\backend\src\OscApi\bin\Release\net8.0\OscApi.dll',
    [string]$Environment = 'Production'
)

$ErrorActionPreference = 'Stop'

# Must run elevated.
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error 'Please run this script in an elevated (Administrator) PowerShell.'
    return
}

if (-not (Test-Path $DllPath)) {
    Write-Error "Backend DLL not found at $DllPath. Build it first: dotnet build -c Release"
    return
}

$dotnet = (Get-Command dotnet).Source
$binPath = "`"$dotnet`" `"$DllPath`" --urls $Url"

# Remove any existing service with the same name.
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Stopping and removing existing '$ServiceName' service..."
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

Write-Host "Creating service '$ServiceName'..."
New-Service -Name $ServiceName -BinaryPathName $binPath -DisplayName $DisplayName -StartupType Automatic | Out-Null

# Set the ASPNETCORE_ENVIRONMENT for the service and auto-restart on failure.
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName" `
    -Name Environment -Value @("ASPNETCORE_ENVIRONMENT=$Environment") -Type MultiString
sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/5000/restart/10000 | Out-Null

Write-Host "Starting service..."
Start-Service -Name $ServiceName
Get-Service -Name $ServiceName | Format-Table -AutoSize

Write-Host "`nDone. The backend now starts automatically at boot and restarts on failure."
Write-Host "Manage it with:  Start-Service $ServiceName | Stop-Service $ServiceName | Get-Service $ServiceName"
