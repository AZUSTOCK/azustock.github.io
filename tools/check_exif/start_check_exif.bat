@echo off
setlocal
cd /d "%~dp0..\.."
python -m tools.check_exif.check_exif --web %*
if errorlevel 1 pause
endlocal
