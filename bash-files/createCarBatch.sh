#!/bin/bash

# set high priority for this process
pid=$$
renice -n 19 -p $pid

# export environment variables from .env file
export $(xargs < ../.env)

##########################################################
#                    Input Variables
##########################################################

carNumber=$1
numOfAdds=$2
counter=1

username=$3
orgName=$4  # MUST be in lowerCase
orgNumber=$5


##########################################################
#               Paths, Addresses and Ports
##########################################################

cd $vms_dir

path_orderer_tls_ca="$vms_dir/vm4/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
org_dir="${PWD}/vm${orgNumber}/crypto-config/peerOrganizations/$orgName.example.com"

# # select proper $addr_peer0 from environment variables
# select_addr_peer0="addr_${orgName}_peer0"  
# peer0_addr=${!select_addr_peer0}

# # select proper $peer0_port from environment variables
# selectPeer0Port="port_${orgName}_peer0"  
# peer0_port=${!selectPeer0Port}

# # select proper $path_org_users_in_cli from environment variables
# select_path_org_users="path_${orgName}_users"  
# path_org_users=${!select_path_org_users}


export FABRIC_CFG_PATH=$fabric_samples_dir/config
export CORE_PEER_LOCALMSPID="Org${orgNumber}MSP"
export CORE_PEER_MSPCONFIGPATH=$org_dir/users/$username@$orgName.example.com/msp
# export CORE_PEER_ADDRESS=$peer0_addr:$peer0_port
export ORDERER_CA=$path_orderer_tls_ca
export VERSION="1"


##########################################################
#               Add the asset to the Ledger
##########################################################

while [ $counter -le $numOfAdds ]
do

    peer chaincode invoke -o $ip_orderer_server:$port_orderer1 --ordererTLSHostnameOverride $addr_orderer1 \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $channelName -n $chaincodeName \
    --peerAddresses localhost:$port_org1_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org1 \
    -c '{"function": "createCar", "Args":["ali_car_'$counter'", "Ford", "Mustang", "Black", "Alireza_'$counter'"]}' &


    carNumber=$((carNumber + 1))
    counter=$((counter + 1))

    # sleep $delay

done