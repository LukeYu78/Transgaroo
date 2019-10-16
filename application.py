#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Aug 26 14:37:18 2019

@author: girishbhatta
"""

# importing the dependences to run the application
from flask import Flask,render_template,url_for
from controllers.ModelController import CycleDB,ParkingDB,HotspotDB,ToiletDB
from controllers.QueryController import WanderingRoute
import json
from flask import request


app = Flask(__name__)

@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404

@app.route("/")
def go_home():
    return render_template("index.html")

@app.route("/events")
def events():
    return render_template("Events.html")

@app.route("/rules")
def rules():
    return render_template("Safety.html")

@app.route("/equipment")
def equipment():
    return render_template("Equipment.html")

@app.route("/signs")
def signs():
    return render_template("Signs.html")

@app.route("/hand_signals")
def hand_signs():
    return render_template("Hand.html")

@app.route("/lanes")
def lanes():
    return render_template("Lanes.html")

@app.route("/speed")
def speed():
    return render_template("Speed.html")

@app.route("/parking")
def parking():
    return render_template("Parking.html")

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
    res.append(ToiletDB().migrate_data_to_db())
    return json.dumps(res)
    
    
@app.route("/clear_table_content",methods=['GET'])
def clear_data():
    res = []
    print("Clearing all the content cycle path data ....")
    res.append(CycleDB().clear_table())
    res.append(ParkingDB().clear_table())
    res.append(HotspotDB().clear_table())
    res.append(ToiletDB().clear_table())
    return json.dumps(res)


@app.route("/getAllCyclePaths",methods=['POST'])
def query_data():
    coordinates = request.get_json().get('coordinates')
    reponsefromDB = WanderingRoute().findTenCylingPaths(coordinates)
    return json.dumps(reponsefromDB)

# need to change the server address to 0.0.0.0 for production.
if __name__ == "__main__":
    app.run(host= '0.0.0.0',port=80)