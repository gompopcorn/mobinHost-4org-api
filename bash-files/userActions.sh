#!/bin/bash

# export environment variables from .env file
export $(xargs < ../.env)

##########################################################
#                    Input Variables
##########################################################

username=$1
orgName=$2  # MUST be in lowerCase
orgNumber=$3
role=$4
userPass="${username}pw"
caName="ca.${orgName}.example.com"
if [ $orgNumber == 4 ]
then
    caName="ca_orderer"
fi

selectCaPort="caPortOrg${orgNumber}"  # select proper $caPort from environment variables based on Organization name
caPort=${!selectCaPort}


##########################################################
#                         Paths
##########################################################

fabric_samples_dir=$fabric_samples_dir

# root org directory
cd $vms_dir/vm${orgNumber}

org_dir="${PWD}/crypto-config/peerOrganizations/$orgName.example.com"
orgCertFile="${PWD}/create-certificate-with-ca/fabric-ca/$orgName/tls-cert.pem"
userMSPfolder="$org_dir/users/$username@$orgName.example.com/msp"
orgConfigFile="$org_dir/msp/config.yaml"


# export fabric paths
export PATH=$fabric_samples_dir/bin:$PATH
export FABRIC_CFG_PATH=$fabric_samples_dir/config/
export FABRIC_CA_CLIENT_HOME=$org_dir


##########################################################
#                   Register & Enroll
##########################################################

# register the user
fabric-ca-client register --caname $caName --id.name $username --id.secret $userPass --id.type $role \
--tls.certfiles "$orgCertFile"

# enroll the user
fabric-ca-client enroll -u https://$username:$userPass@localhost:$caPort --caname $caName \
-M "$userMSPfolder" --tls.certfiles "$orgCertFile"

# copy the Node OU configuration file into the user MSP folder
cp "$orgConfigFile" "$userMSPfolder/config.yaml"
