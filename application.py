#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Aug 26 14:37:18 2019

@author: girishbhatta
"""

# importing the dependences to run the application
from flask import Flask,render_template,url_for
from controllers.ModelController import CycleDB,ParkingDB,HotspotDB
from controllers.QueryController import WanderingRoute
import json
from flask import request


app = Flask(__name__)

@app.route("/")
def go_home():
    return render_template("index.html")

@app.route("/about_us")
def go_about_us():
    return render_template("About.html")

@app.route("/rules")
def rules():
    return render_template("Rules.html")

@app.route("/contact")
def contacts():
    return render_template("Contact.html")

@app.route("/cycling_map")
def cycling_map():
    return render_template("CycleMap.html")



@app.route("/migrate_data",methods=['GET'])
def create_infra():
    res = []
    print("Migrating cycle path data ....")
    res.append(CycleDB().migrate_data_to_db())
    res.append(ParkingDB().migrate_data_to_db())
    res.append(HotspotDB().migrate_data_to_db())
    return json.dumps(res)
    
    

@app.route("/clear_table_content",methods=['GET'])
def migrate_data():
    res = []
    print("Clearing all the content cycle path data ....")
    res.append(CycleDB().clear_table())
    res.append(ParkingDB().clear_table())
    res.append(HotspotDB().clear_table())
    return json.dumps(res)


@app.route("/getAllCyclePaths",methods=['POST'])
def query_data():
    coordinates = request.get_json().get('coordinates')
    reponsefromDB = WanderingRoute().findTenCylingPaths(coordinates)
    return json.dumps(reponsefromDB)

# need to change the server address to 0.0.0.0 for production.
if __name__ == "__main__":
    app.run(host= '0.0.0.0',port=80)