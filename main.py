#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Aug 26 14:37:18 2019

@author: girishbhatta
"""

# importing the dependences to run the application
from flask import Flask,render_template
from controllers.ModelController import CycleDB,ParkingDB
import json
import pandas as pd
from flask import request


app = Flask(__name__)


@app.route("/migrate_data",methods=['GET'])
def create_infra():
    res = []
    print("Migrating cycle path data ....")
    res.append(CycleDB().migrate_data_to_db())
    res.append(ParkingDB().migrate_data_to_db())
    return json.dumps(res)
    
    


@app.route("/clear_table_content",methods=['GET'])
def migrate_data():
    res = []
    print("Clearing all the content cycle path data ....")
    res.append(CycleDB().clear_table())
    res.append(ParkingDB().clear_table())
    return json.dumps(res)



if __name__ == "__main__":
    app.run(debug=True)