
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


ANNOTATE
--------

The human is now ready to declare his/her rating on the performance of
Watson taken from the mandatory quetsion/answer input pairs.  The human
will be presented with the

* Query as typed by the user

if the query response is mapped to an answer that has a cluster
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

2. Get a local copy of the annotation assist code
    * clone git repo https://github.com/cognitive-catalyst/annotation-assist


3. Change the properties.ini (username and password will be the credentials for the application)

4. Modify the manifest.yml to uniquely name the service you want to create (change the hostname and name)

5. Login to your bluemix accound from the command line
    cf api https://api.ng.bluemix.net
    cf login -u <ibmer>@us.ibm.com -o <ibmer>@us.ibm.com -s dev

6. Add the sqldb service
    cf create-service sqldb sqldb_free my_database


7. Build and push the annotation assist app to your bluemix space
    npm install && npm run build
    cf push

**Note**
If you do not have npm installed on your local machine as a global module, you need
to install that first before you can build the app. You can install the latest node package
at the node website: https://nodejs.org/en/


8. Now that your app is deployed you can:
* load your data in the database using the UI
* Annotate, annotate, annotate!
* Look at metrics (this screen takes ~30 seconds to load depending on your database size)
* Download human judgements results

# Things we plan on working toward in the future/ aka possible extensions

* Integrate a way to export inputs to Rank and Retrieve system from annotations in database
* Add user IDs, and authorized only access to database upload screen

# licence

see License.txt

