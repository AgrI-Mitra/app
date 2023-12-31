#/bin/bash


echo "<---------------------Cloning the Repository--------------------->"
git clone https://github.com/AgrI-Mitra/app.git ./agri-mitra-turbo
cd ./agri-mitra-turbo 

echo "<---------------------Installing NPM Packages--------------------->"
npm install --legacy-peer-deps

echo "<---------------------Adding jwt key--------------------->"

cd ./apps/agri-mitra
touch jwt.pem
echo '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmPw09w/sAcleZy+A4XJs
ncT2oYZv5I3f4vQ/Pucet1EKrgpxRsZF1KFQLM29+9d29BJvAMevpz8dHoyb/S4/
COurBFSnDkrKTa9Zl9y7K4Udq6dtjCOL+WHaDdeHVHXYI/c8U3eq5YStM/PWjWX5
r3TsQ2OniFrLNMJaNdGg72kj3YrvJYf5AaGyE9JrMrfTxxyLrnERULjvZkHCXthQ
jXld7bpL3gMOlzDDrScIQsEVSAOOSzaxu47tvoBC7JALyOe127YneKTCKuTLd4Mp
BhDJeg9x3UvKydoGmHTc1ckPEW7rJHU3DJ+Llwvgk5QE895fVBOSwTGRzz31YFdD
swIDAQAB
-----END PUBLIC KEY-----' > jwt.pem


echo "<---------------------Running the Servers--------------------->"
npm run dev

echo "<-----Visit http://localhost:3000 to see the running app------>"
