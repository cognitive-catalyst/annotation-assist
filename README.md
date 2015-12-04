
# SUMMARY

INTRODUCTION
------------

Welcome to the Annotation Assist program! This project provides Watson
products the feedback neccessary to learn and grow as cognitive systems.

The basics: any Watson system that has a component of supervised machine
learning to train a system can learn from a "human approved" question / 
answer pair.  The more "human approved" data a system has in its so called
"ground truth" (GT), the more data the supervised machine learning system
has to learn from, and the greater potential for accuracy on the broad
corpus which defines the system purview.  

This system is a tool to grade the output any type of question/answering 
system, but has special accomodations currently built in to export the
annotations to the "Watson Engagement Advisor" (WEA). Therefore it can 
be used in one of two ways:

1. To collect human feedback from any q/a system (imported via csv),
   display analytics on the feedback, and export the results to a csv file.
2. To collect human feedback on system log files of a WEA instance, 
   associate the answer with all of the possible answers in that WEA
   instance, and export the annotations via the administrator ID XMGR 
   for your specific WEA instance.    


INITIALIZE
----------

### Mandatory
The system needs a csv file with question / answer pairs with the following
headers (please match exact string):
* DateTime  
* QuestionText   
* TopAnswerText  
* TopAnswerConfidence 
Please note that the "TopAnswer" string is an artifact of the WEA 
export column names, and 

### Optional
If you are using the optional WEA integration, you must also load in the
following files (before the system log files that contain the q/a pairs):
* json format of all the Possible Answer Units (pau.json).  This export
  requires a tool developed by the Ecosystem team, please get in touch
  with your IBM owner of your WEA instance to get this export file.
* ground truth of the WEA instance, exported as a csv file with the 
  following cols:
    * QUESTION_ID  
    * QUESTION   
    * ANS_LONG   
    * IS_ON_TOPIC


ANNOTATE
--------

The human is now ready to declare his/her rating on the performance of 
Watson taken from the mandatory quetsion/answer input pairs.  The human
will be presented with the

* Query as typed by the user

then, if the query and answer is already contained in the approved 
annotation list (aka Ground Truth)

* Query and answer is silently marked as a "perfect" answer

or, if the query response is mapped to an answer that has a cluster
associated with ground truth, and the confidence is above x% the human
will be presented with

* The query, along with a list of the cluster questions that have
  the same answer the query, human can then select "question is equivalent
  to question on list", which will add the question/answer pair 
  to the approved annotation. 

or, the default display if none of the conditions are met, the human
will be presented with

 * The query, along with the answer given by the system, along with 
   the following decision:
    "in purview of the system"
   or 
    "out of purview of the system"
   If in-purview is selected then will prompt for a 0-100 ranking of the
   given answer.

  The purview, and rating (if applicable) are then added to the approved
  annotation  


FEEDBACK
--------

The rating/judgement data can be exported from the database used
to store the human annotation back to the WEA to be used to augment
the ground truth.

The data can also be exported in a format to chart system performance
on the deployed system, the utimate metic of technical accuracy for
a machine learning system.


# Steps to deploy your own copy of the Annotation Assist 


1. Create a bluemix account

2. Create your app: 
    * Go to your bluemix dashboard and Create Cloud Foundry app
    * choose web    
    * choose python / .py
    * select continue
    * name your app something unique to your project, this will 
      be part of the URL to access the service on bluemix
      <uname>

    * your app now has the URL http://<uname>.mybluemix.net

3. Add your own database to the project to store your data
    * Go to the <uname> app overview page in your bluemix account
    * Select + Add service or API
    * Under 'Data and Analytics', select the Cloundant noSQL DB 
    * On the right, there should be a "Add Service" pane, 
      copy the service name, eg, 
        Cloudant NoSQL DB-xx
      for use in the manifest.yml file in the next steps
    * Select "Use"
    * You can now view the cloudant noSQL db credentials on your 
      bluemix project <uname> overview page
    * Select the Cloudant service from the overview page, and then select "Launch"
    * You are now in the Cloudant dashboard.  Select "+ Add new Database" from 
      the upper right hand corner, and call it "questionstore"

5. Get a local copy of the annotation assist code 
    * clone git repo https://github.com/cognitive-catalyst/annotation-assist


6. Change the properties.ini

### Mandatory

    cloudant_auth_url
    
to the URL in the cloudant noSQL db credentials 


### Optional

    wea_url (eg https://watson.ihost.com/instance/115/predeploy/$14a5358a85f/wcea/api/GroundTruth/paus/)

to reflect your instance number (115 in this example) and project id ($14a5358a85f in this example)

    wea_username
    wea_password 

to match the wea username and password you use to login to your xmgr

7. Modify the manifest.yml to use the name of the service you want to create 
   host: <uname>
   name: <uname>
and the edit db name you bound to your bluemix app
   services:
       - Cloudant NoSQL DB-<xx>

4. Build and push the annotation assit app to your bluemix space
    
**Note**
If you do not have npm installed on your local machine as a global module, you need
to install that first before you can build the app. You can install the latest node package 
at the node website: https://nodejs.org/en/

Once that is installed, navigate to the root directory of the project and run:
        
    npm install && npm run build

To upload the app, follow instructions at: https://www.ng.bluemix.net/docs/#starters/upload\_app.html

Optionally, if you have the cf environment installed on your local machine, from the terminal/command prompt run:

    cf api https://api.ng.bluemix.net
    cf login -u <ibmer>@us.ibm.com -o <ibmer>@us.ibm.com -s dev
    cf push <uname> -m 512m

wait while bluemix preps your environment, this may take ~15 mins
(note: I had to run this command twice before it worked)

5. Now that your app is deployed you can:
* load your data in the database using the UI
* Annotate, annotate, annotate!
* Look at metrics (this screen takes ~30 seconds to load depending on your database size)
* Download human judgements results

# Things we plan on working toward in the future/ aka possible extensions

* Intergrate a way to export inputs to Rank and Retrieve system from annotations in database
* Add user IDs, and authorized only access to database upload screen

# licence

see License.txt

