#!/bin/bash
cd /home/fobas/walletfobas_git
git pull origin main
npm install
pm2 restart walletfobas --update-env
