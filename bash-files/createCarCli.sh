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
# numOfAdds=$2
# counter=1

username=$3
orgName=$4  # MUST be in lowerCase
orgNumber=$5


##########################################################
#               Paths, Addresses and Ports
##########################################################

# select proper $addr_peer0 from environment variables
select_addr_peer0="addr_${orgName}_peer0"  
peer0_addr=${!select_addr_peer0}

# select proper $peer0_port from environment variables
selectPeer0Port="port_${orgName}_peer0"  
peer0_port=${!selectPeer0Port}

# select proper $path_org_users_in_cli from environment variables
select_path_org_users_in_cli="path_${orgName}_users_in_cli"  
path_org_users_in_cli=${!select_path_org_users_in_cli}


CORE_PEER_MSPCONFIGPATH="$path_org_users_in_cli/$username@$orgName.example.com/msp"
CORE_PEER_ADDRESS=$peer0_addr:$peer0_port
VERSION="1"
numOfAdds=10
counter=1


##########################################################
#               Add the asset to the Ledger
##########################################################

# export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH; export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS; export ORDERER_CA=$path_orderer_tls_ca; export VERSION=$VERSION; peer chaincode invoke -o $addr_orderer1:$port_orderer1 --ordererTLSHostnameOverride $addr_orderer1 --tls --cafile $path_orderer_msp_ca -C $channelName -n $chaincodeName --peerAddresses $addr_org1_peer0:$port_org1_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org1 --peerAddresses $addr_org2_peer0:$port_org2_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org2 --peerAddresses $addr_org3_peer0:$port_org3_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org3 -c '{"function": "createCar", "Args":["$id", "$make", "$model", "$colour", "$owner"]}'





# cat << EOF | docker exec --interactive cli bash

#     export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH;
#     export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
#     export ORDERER_CA=$path_orderer_tls_ca
#     export VERSION=$VERSION


    
#     echo
#     echo num : $counter
#     echo


# EOF


# cat << EOF | docker exec --interactive cli bash

#     export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
#     export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
#     export ORDERER_CA=$path_orderer_tls_ca
#     export VERSION=$VERSION

#     peer chaincode invoke -o $addr_orderer1:$port_orderer1 --ordererTLSHostnameOverride $addr_orderer1 \
#     --tls --cafile $path_orderer_msp_ca -C $channelName -n $chaincodeName \
#     --peerAddresses $addr_org1_peer0:$port_org1_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org1 \
#     --peerAddresses $addr_org2_peer0:$port_org2_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org2 \
#     --peerAddresses $addr_org3_peer0:$port_org3_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org3 \
#     -c '{"function": "createCar", "Args":["$id", "$make", "$model", "$colour", "$owner"]}'

# EOF


# i=1; 
# while printf '%d' "$((i++))"; (( i <= 4)); 
# do printf ','; 

# done; printf '\n'

# counter=1; while docker exec cli bash -c 'counter=1; while export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH; export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS; export ORDERER_CA=$path_orderer_tls_ca; export VERSION=$VERSION; peer chaincode invoke -o $addr_orderer1:$port_orderer1 --ordererTLSHostnameOverride $addr_orderer1 --tls --cafile $path_orderer_msp_ca -C $channelName -n $chaincodeName --peerAddresses $addr_org1_peer0:$port_org1_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org1 --peerAddresses $addr_org2_peer0:$port_org2_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org2 --peerAddresses $addr_org3_peer0:$port_org3_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org3 -c {"function": "createCar", "Args":["ali_car_'$counter'", "Ford", "Mustang", "Black", "Alireza_'$counter'"]}'' "$((counter++))"; (( counter <= 2)); do printf '$counter'; done; printf '\n'' "$((counter++))"; (( counter <= 2)); do printf $counter; printf '\n' done; 