# Creating a Postgres instance in a Bluemix Container

If you do not have a postgres instance, these instructions should help you create one in a container on Bluemix. Make sure you have installed the stated dependencies before starting.

## Dependencies
- Cloud Foundry CLI version 6.12.0 or later ([Install here](http://docs.cloudfoundry.org/cf-cli/install-go-cli.html))  
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

## Instructions
Make sure that you have set your cloud foundry api correctly, and login.  For example:
- `cf api https://api.ng.bluemix.net`
- `cf login -u <ibm_id> -o <ibm_id> -s dev`

Create a namespace for your registry (I recommend using your username as registry-name).  
`cf ic namespace set <registry-name>`

Run the following command to login to Bluemix containers.  
`cf ic login`

Copy the image for the postgres container to your registry.  
`cf ic cpi postgres <registry-name>/postgres:latest`

Start a bluemix container (named container).  
`cf ic run --name postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=aa_db -d <registry-name>/postgres`

Periodically run the following command until you see the Status of your container is running. This should only take a minute or two.  
`cf ic ps -a`


Run the following command to check the public IP's assigned to your bluemix org.  
`cf ic ip list`

If the ID of your container is listed next to one of the IP's, then skip the following command. Otherwise, choose one of the IP Addresses in the list to bind to your container.  
`cf ic ip bind <ip-address> container`

Update config/properties.ini for annotation-assist:  
hostname = the public ip address you bound your container to  
username = postgres  
password = the password you specified in the `cf ic run...` command  
port = 5432  
db = aa_db

##Possible Issues
If you have issues installing the Cloud Foundry Container plugin, please reinstall/upgrade the [Cloud Foundry CLI](http://docs.cloudfoundry.org/cf-cli/install-go-cli.html). Please follow the instructions in the link as the homebrew `cf` version is too old to be compatible with the plugin.
