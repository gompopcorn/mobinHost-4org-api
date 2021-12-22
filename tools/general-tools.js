// node_modules
const colors = require('colors');
const fs = require('fs');
const path = require('path');



// get user's certificate
async function getUserCertificate(certificate_file)
{
    let certificate = await new Promise((resolve, reject) => {
        fs.readFile(certificate_file, 'utf8', async (err, userCertificate) => {
            if (err) return reject(err);
            resolve(userCertificate);
        });

    }).catch(err => {
       console.log(colors.bgRed(`Error in reading user's certificate file in path: "${certificate_file}"`));
       console.log(colors.red(err));
    });


    return certificate;
}


// get user's certificate pricateKey
async function getUserPrivateKey(privateKey_path)
{
    let privateKeyFiles = await getListOfFilesAndDirs(privateKey_path);
    let privateKeyFile = await getOldestFilebyDate(privateKey_path, privateKeyFiles);

    let privateKey = await new Promise((resolve, reject) => {
        fs.readFile(`${privateKey_path}/${privateKeyFile}`, 'utf8', async (err, userPrivateKey) => {
            if (err) return reject(err);
            resolve(userPrivateKey);
        });

    }).catch(err => {
       console.log(colors.bgRed(`Error in reading user's privateKey file in path: "${privateKey_path}/${privateKeyFile}"`));
       console.log(colors.red(err));
    });


    return privateKey;
}


// get the list of the files/directories in a path
async function getListOfFilesAndDirs(path) 
{
    let filesList = await new Promise((resolve, reject) => {
        fs.readdir(path, 'utf8', async (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });

    }).catch(err => {
       console.log(colors.bgRed(`Error in getting files list of the path: "${path}"`));
       console.log(colors.red(err));
    });
    

    return filesList;
}


// get the last created privateKey file
async function getOldestFilebyDate(path, files)
{
    let oldestFileInfo = {date: 0, name: ""};
    let errorFlag = false;

    for (let i = 0; i < files.length; i++)
    {
        let fileStat = await new Promise((resolve, reject) =>
        {
            fs.stat(`${path}/${files[i]}`, "utf8", (err, fileStat) => {
                if (err) return reject(err);
                if (fileStat.isFile()) resolve(fileStat);
                else resolve();
            });

        }).catch(err => {
            errorFlag = true;
            console.log(colors.bgRed(`Error in getting stats of the file: '${files[i]}'`));
            console.log(colors.red(err));
        });
        

        if (errorFlag) break;

        else if (fileStat.birthtimeMs > oldestFileInfo.date) {
            oldestFileInfo.date = fileStat.birthtimeMs;
            oldestFileInfo.name = files[i];
        }
    }
    

    if (!errorFlag) return oldestFileInfo.name;
    return false;
}


// get the path of the org's wallet
function getWalletPath(org) {
    let orgNumber = org.match(/\d/g).join("");
    let walletPath = path.join(process.cwd(), `wallets/org${orgNumber}-wallet`);
    return walletPath;
}


// get the path of the org's wallet
function getOrgDir(orgName) {
    let orgNumber = orgName.match(/\d/g).join("");
    let orgPath = path.join(process.env.vms_dir, `vm${orgNumber}/crypto-config/peerOrganizations/${orgName}.example.com`);
    return orgPath;
}



module.exports = {
    getUserCertificate,
    getUserPrivateKey,
    getListOfFilesAndDirs,
    getOldestFilebyDate,
    getWalletPath,
    getOrgDir
}