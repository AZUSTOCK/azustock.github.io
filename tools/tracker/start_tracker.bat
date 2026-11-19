@echo off
cd /d "%~dp0..\.."
python "tools\tracker\tracker.py" --web %*
if errorlevel 1 pause
