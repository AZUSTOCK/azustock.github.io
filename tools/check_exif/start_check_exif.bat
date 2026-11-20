@echo off
setlocal
cd /d "%~dp0..\.."
python "tools\check_exif.py" --web %*
if errorlevel 1 pause
endlocal
