@echo off
cd /d "%~dp0..\.."
python -m tools.tracker.tracker --web %*
if errorlevel 1 pause
