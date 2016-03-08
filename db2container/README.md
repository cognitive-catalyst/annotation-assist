# Creating a DB2 instance in a Bluemix Container

If you do not have a db2 instance, these instructions should help you create one in a container on Bluemix. Make sure you have installed the stated dependencies before starting.

##Dependencies 
- Cloud Foundry CLI  ([Install here](http://docs.cloudfoundry.org/cf-cli/install-go-cli.html)  )  
- Docker ([Install here](https://docs.docker.com/engine/installation/))

## Install Cloud Foundry Container plugin
**OS X**  
`cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-mac`  
**Linux 64-bit**  
`cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-linux_x64`  
**Linux 32-bit**  
`cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-linux_x86`  
**Windows 64-bit**  
`cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-windows_x64.exe`  
**Windows 32-bit**  
`cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-windows_x86.exe`  

##Instructions
Run the following command to login to Bluemix containers.  
`cf ic login`

Create a namespace for your registry (I recommend using your username as registry-name).  
`cf ic namespace set <registry-name>`

Push the [DB2 Express-c image](https://hub.docker.com/r/ibmcom/db2express-c/) to your registry. This step will take approximately 15 minutes.  
`cf ic cpi ibmcom/db2express-c amblock/db2:latest`


Start a bluemix container (named container). **Note: The password requirements are *extremely* strict. I recommend using a random character string (make sure to write it down as you will need it later)**   
`cf ic run -it -p 50000:50000 -m 256 -e DB2INST1_PASSWORD=<password> -e LICENSE=accept --name container registry.ng.bluemix.net/<registry-name>/db2:latest bash`

Periodically run the following command until you see the Status of your container is running. This should only take a minute or two.  
`cf ic ps -a`


Run the following command to check the public IP's assigned to your bluemix org.  
`cf ic ip list`

If the ID of your container is listed next to one of the IP's, then skip the following command. Otherwise, choose one of the IP Addresses in the list to bind to your container.  
`cf ic ip bind <ip-address> container`

Run the following script to initialize the database  
`db2container/create_database.sh`

Update config/properties.ini for annotation-assist:  
hostname = the public ip address you bound your container to
username = db2inst1  
password = the password you specified in the `cf ic run...` command
port = 50000
db = aa_db