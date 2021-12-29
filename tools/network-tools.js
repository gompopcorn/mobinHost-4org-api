// node_modules
const { Wallets } = require('fabric-network');
const shell = require('shelljs');
const colors = require('colors');
const path = require('path');

// tools & paths
const bashFilesDir = path.join(process.cwd(), 'bash-files');
const gTools = require(path.join(process.cwd(), 'tools/general-tools.js'));


// register and enroll the user
async function registerUser(username, userOrg, res)
{
    const walletPath = await gTools.getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // *****************************************************
    //                check user existence
    // *****************************************************

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet of ${userOrg}`);
        return res.status(409).send({
            success: false,
            message: `${username} already exists in ${userOrg}`,
        });
    }


    // *****************************************************
    //             Register and Enroll the User
    // *****************************************************

    let orgName = userOrg.toLowerCase();
    let orgNumber = orgName.match(/\d/g).join("");


    let shellResult = shell.exec(`${bashFilesDir}/userActions.sh ${username} ${orgName} ${orgNumber} client`, {silent: true});

    if (shellResult.code !== 0) {
        let shellError = shellResult.stderr;
        console.log(colors.bgRed("Error in userActions.sh"));
        console.log(colors.red(shellError));
        return res.status(500).send("Error in registering/enrolling the user");
    }

    let orgDir = gTools.getOrgDir(orgName);    // path of the org directory

    let certificate_file = path.join(orgDir, `users/${username}@${orgName}.example.com/msp/signcerts/cert.pem`);
    let privateKey_path = path.join(orgDir, `users/${username}@${orgName}.example.com/msp/keystore`);

    let certificate = await gTools.getUserCertificate(certificate_file);
    let privateKey = await gTools.getUserPrivateKey(privateKey_path);

    let x509Identity = {
        credentials: { certificate, privateKey },
        mspId: `${orgName}MSP`,
        type: 'X.509',
    };
    

    // import the identity into the wallet
    await wallet.put(username, x509Identity);
    console.log(colors.green(`Successfully registered and enrolled user '${username}' and imported into the wallet.`));

    return res.send({
        success: true,
        message: `${username} enrolled Successfully in ${orgName}`,
    })
}


// invoke transaction
async function invokeTransaction(username, orgName, orgNumber, args, res)
{
    console.log(colors.blue(`*** Chaincode invoke for adding asset with key: ${args[0]} ***`));

    // let channelName = process.env.channelName;
    // let chaincodeName = process.env.chaincodeName;


    shell.exec(`${bashFilesDir}/createCar.sh ${username} ${orgName.toLowerCase()} ${orgNumber} \
    ${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]}`, {silent: true, async: true}, (code, stdout, stderr) =>
    {
        if (code !== 0) {
            console.log(colors.bgRed("Error in createCar.sh"));
            console.log(colors.red(stderr));
            return res.status(500).send(`Error in adding asset with key: ${args[0]}`);
        }
    
        else {
            console.log(colors.green(`* Successfully added the asset with key: ${args[0]}`));
            return res.send(`Successfully added the asset with key: ${args[0]}`);
        }
    });
}


// invoke transaction intervally
async function invokeTransactionBatch(startFrom, numOfAssets, username, orgName, orgNumber, res)
{
    shell.exec(`${bashFilesDir}/createCarBatch.sh ${startFrom} ${numOfAssets} ${username} ${orgName.toLowerCase()} ${orgNumber}`, 
    {silent: true, async: true}, (code, stdout, stderr) =>
    {
        let successCounter = 0;
        let errorCounter = 0;

        // split each output
        let outputs = stderr.split('\n');

        // count the outputs that have a meaning of failure
        outputs.forEach(output =>
        {
            if (output.search("successful") != -1 || output.search("Successful") != -1) {
                successCounter++;
            }

            else if(output.search("error") != -1 || output.search("Error") != -1) {
                errorCounter++;
            }
            else if(output.search("no") != -1 || output.search("No") != -1) {
                errorCounter++;
            }
            else if(output.search("not") != -1 || output.search("Not") != -1) {
                errorCounter++;
            }
        });


        if (code !== 0 || errorCounter) {
            // console.log("Errors: " + errorCounter);
            console.log(colors.bgRed("Error in createCarBatch.sh"));
            console.log(colors.red(stderr));
            return res.status(500).send(`* ${errorCounter} assets failed.`);
        }
    
        else if (successCounter) {
            // console.log("Successses: " + successCounter);
            console.log(colors.green(`* Successfully added ${numOfAssets} assets - from "${startFrom}" to "${startFrom + numOfAssets -1}"`));
            return res.status(200).send(`* Successfully added ${successCounter} assets from Number:${startFrom} to Number:${(startFrom-1) + numOfAssets}`);
        }

        else {
            console.log(colors.bgRed("Some Error occured."));
            return res.status(500).send("Some Error occured.")
        }
    });
}


// invoke transaction intervally in separate files
async function invokeTransactionBatch_MultiFile(startFrom, numOfAssets, username, orgName, orgNumber, res)
{
    let numOfFilesForMultiFileAdd = +process.env.numOfFilesForMultiFileAdd

    // check the minimum assets needed for multiFile add asset
    if (numOfAssets < numOfFilesForMultiFileAdd) {
        return res.status(400).send(`At least ${numOfFilesForMultiFileAdd} assets are needed for this type of invokation.`)
    }


    let assetsEachFile = parseInt(numOfAssets / numOfFilesForMultiFileAdd);
    let partialAssets = parseInt(numOfAssets % numOfFilesForMultiFileAdd);    // assets which could not be in equal parts
    let partialStartFrom;   // startFrom parameter for each file

    let doneFiles = 0;    // number of files which added all assets
    let successCounter = 0;
    let errorCounter = 0;
    

    console.log(colors.blue(`*** Adding ${numOfAssets} assets - from "${startFrom}" to "${startFrom + numOfAssets -1}" ***`));


    for (let i = 0; i < numOfFilesForMultiFileAdd ; i++)
    {
        partialStartFrom = startFrom + (i * numOfFilesForMultiFileAdd);
        
        if (i === numOfFilesForMultiFileAdd - 1) {
            assetsEachFile += partialAssets;
        }

        // peer to use
        let selectedPeer;
        if (i < numOfFilesForMultiFileAdd/2) selectedPeer = 0;
        else selectedPeer = 1;

        shell.exec(`${bashFilesDir}/createCarBatch.sh ${partialStartFrom} ${assetsEachFile} ${username} ${orgName.toLowerCase()} ${orgNumber} ${selectedPeer}`, 
        {silent: true, async: false}, (code, stdout, stderr) =>
        {
            // split each output
            let outputs = stderr.split('\n');
    
            // count the outputs that have a meaning of failure
            outputs.forEach(output =>
            {
                if (output.search("successful") != -1 || output.search("Successful") != -1) {
                    successCounter++;
                }
    
                else if(output.search("error") != -1 || output.search("Error") != -1) {
                    errorCounter++;
                }
                else if(output.search("no") != -1 || output.search("No") != -1) {
                    errorCounter++;
                }
                else if(output.search("not") != -1 || output.search("Not") != -1) {
                    errorCounter++;
                }
            });
    
    
            if (code !== 0 || errorCounter) 
            {
                console.log(colors.bgRed("Error in createCarBatch.sh"));
                console.log(colors.red(stderr));

                doneFiles++;
                if (doneFiles === numOfFilesForMultiFileAdd) {
                    return res.send(`* Some of the assets added but there are ${errorCounter} erros.`)
                }
            }
        
            else if (successCounter) 
            {
                doneFiles++;

                if (doneFiles === numOfFilesForMultiFileAdd) 
                {
                    if (!errorCounter) {
                        console.log(colors.green(`* Successfully added ${numOfAssets} assets - from "${startFrom}" to "${startFrom + numOfAssets -1}"`));
                        return res.send(`* Successfully added ${numOfAssets} assets - from "${startFrom}" to "${startFrom + numOfAssets -1}"`);
                    }

                    else return res.send(`* Some of the assets added but there are ${errorCounter} erros.`)
                }
            }
    
            else {
                console.log(colors.bgRed("Some Error occured."));
                console.log(colors.red(stderr));

                doneFiles++;
                if (doneFiles === numOfFilesForMultiFileAdd) {
                    return res.send(`* Some of the assets added but there are ${errorCounter} erros.`)
                }
            }
        });
    }


}


// check user existence
async function checkUserExistence(username, orgName) 
{
    const walletPath = await gTools.getWalletPath(orgName)
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const userIdentity = await wallet.get(username);
    if (userIdentity) return true;
    return false;
}




module.exports = {
    registerUser,
    invokeTransaction,
    invokeTransactionBatch,
    invokeTransactionBatch_MultiFile,
    checkUserExistence
}