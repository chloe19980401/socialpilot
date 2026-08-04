@echo off
chcp 65001 >nul
title 社媒管理系统 · 项目终端
cd /d "E:\ai\ai项目\社媒管理系统新"

:menu
cls
echo ============================================================
echo    SocialPilot AI  ·  社媒管理系统   项目终端
echo    目录: %CD%
echo ============================================================
echo.
echo    登录:   用户名 chloelee    密码 chloe123
echo    线上:   https://socialwonly.foreverdoodle.com
echo    仓库:   github.com/chloe19980401/socialpilot
echo    Supabase ref:  grogrigybgimvuuunxef  （名字「众筹和kol」）
echo    提示:   AI 对话在 Claude / Cowork 里单独打开；本终端只恢复项目工作环境
echo.
echo    -------------------- 最近 6 条提交 --------------------
git log --oneline -6 2>nul
echo    ------------------------------------------------------
echo.
echo      [1] 启动开发服务器   npm run dev
echo      [2] 构建             npm run build
echo      [3] 提交并推送       git add / commit / push
echo      [4] 查看改动         git status
echo      [5] 打开命令行（自由输入命令）
echo      [0] 退出
echo.
set /p choice=请输入数字后回车:

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build
if "%choice%"=="3" goto push
if "%choice%"=="4" goto status
if "%choice%"=="5" goto shell
if "%choice%"=="0" exit
goto menu

:dev
echo.
echo 启动开发服务器中…（按 Ctrl+C 停止后自动回到菜单）
call npm run dev
goto menu

:build
echo.
call npm run build
echo.
pause
goto menu

:push
echo.
set /p msg=提交说明（直接回车用 update）:
if "%msg%"=="" set msg=update
git add -A
git commit -m "%msg%"
git push
echo.
pause
goto menu

:status
echo.
git status
echo.
pause
goto menu

:shell
echo.
echo 已进入命令行，可自由输入命令（如 npm run dev）。输入 exit 回到菜单。
cmd /k
goto menu
