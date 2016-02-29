#
# CSV To JSON Converson Script
#
# @author Michael Andrew (michael.andrew@gladeye.co.nz)
# @usage python csv-to-json.py PATH_TO_CSV_FILE PATH_TO_JSON_FILE
#

import csv
import json
import sys

import urllib2

csvFilePath = sys.argv[0] #destination path of downloaded csv file
jsonFilePath = sys.argv[1] #destination path of converted json file

with open(csvFilePath,'wb') as f:
    f.write(urllib2.urlopen("https://github.com/astronexus/HYG-Database/raw/master/hygdata_v3.csv").read())
    f.close()

csvfile = open(csvFilePath, 'r')
jsonfile = open(jsonFilePath, 'w')

fieldnames = ("id","proper","IDNumber","Message")
reader = csv.DictReader( csvfile, fieldnames)
for row in reader:
    json.dump(row, jsonfile)
    jsonfile.write('\n')