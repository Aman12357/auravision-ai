@echo off
setlocal
set "DIR=%~dp0"
set "PORTABLE_MVN=%DIR%..\tools\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%PORTABLE_MVN%" (
    call "%PORTABLE_MVN%" %*
) else (
    where mvn >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        call mvn %*
    ) else (
        echo [ERROR] Maven is not installed on PATH and portable Maven was not found.
        echo Please wait a moment for portable Maven to finish downloading, or install Maven via:
        echo   winget install Apache.Maven
        exit /b 1
    )
)
