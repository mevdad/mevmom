sudo apt-get install gnupg curl && 
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor &&
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list && 
sudo apt-get update && sudo apt upgrade -y &&
sudo apt-get install mongodb-org -y  && sudo systemctl daemon-reload && sudo systemctl enable mongod && sudo systemctl start mongod &&
sudo apt install npm -y && npm i n -g --force && n latest && hash -r && npm i npm@latest -g --force && npm fund &&
sudo apt install nginx -y && sudo systemctl enable nginx && sudo systemctl start nginx && 
cp /pot/linux/nginx.conf /etc/nginx/sites-available/default &&
cp /pot/linux/services/pot.service /etc/systemd/system/pot.service && systemctl daemon-reload &&
sudo systemctl enable pot && sudo systemctl start pot &&
cd /pot && npm i yarn -g && yarn f
