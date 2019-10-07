#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Aug 26 17:18:00 2019

@author: girishbhatta
"""


import pandas as pd
import psycopg2
import numpy as np


class CycleDB:
    cur = None
    conn = None
    
    def __init__(self):
        self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres")
        self.cur = self.conn.cursor()
        
        
    def migrate_data_to_db(self):
        try:
            data_to_migrate = self.read_data()
            query = """INSERT INTO public."CyclePath"(id, geom_path, type, direction, geom_data)
                        VALUES (%s,ST_GeomFromText(%s,4326) ,%s, %s, %s)"""
            self.cur.executemany(query,data_to_migrate)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}

    def read_data(self):
        cycle_path_data = pd.read_csv("./data/com_bike_routes.csv")
        cycle_path_data["id"] = np.arange(len(cycle_path_data))            
        tuple_cycle_data = list(tuple(zip(cycle_path_data["id"],cycle_path_data["the_geom"],cycle_path_data["direction"],cycle_path_data["type"],cycle_path_data["the_geom"])))            
        return tuple_cycle_data
    
    def clear_table(self):
        try: 
            query = 'DELETE FROM public."CyclePath"'
            self.cur.execute(query)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}
        
        
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
        


class ParkingDB:
    cur = None
    conn = None
    
    def __init__(self):
        self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres")
        self.cur = self.conn.cursor()
        
        
    def migrate_data_to_db(self):
        try:            
            data_to_migrate = self.read_data()
    
            query = """INSERT INTO public."CycleParkLocation"(gs_id, asset_type, latitude, longitude, geom_location)
                        VALUES (%s, %s ,%s, %s, ST_GeomFromText(%s,4326))"""
            self.cur.executemany(query,data_to_migrate)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}
        

    def read_data(self):
        cycle_park_data = pd.read_csv("./data/Cycle_Parking_spots.csv")
        required_columns_df = cycle_park_data[['GIS_ID','ASSET_TYPE','CoordinateLocation']]
        required_columns_df = required_columns_df[required_columns_df['ASSET_TYPE'] == 'Bicycle Rails']
        lat = []
        long = []
        coordlocation = []
        required_columns_df['lat'] = np.nan
        required_columns_df['long'] = np.nan
        
        for each in required_columns_df['CoordinateLocation']:
            coord = each.split(",")
            lat.append(float(coord[1].strip().replace(')','')))
            long.append(float(coord[0].strip().replace('(','')))
            coordlocation.append("POINT(%s %s)" % (float(coord[1].strip().replace(')','')),float(coord[0].strip().replace('(',''))))
        required_columns_df['lat'] = lat
        required_columns_df['long'] = long
        
        required_columns_df['CoordinateLocation'] = coordlocation
        tuple_cycle_park_data = list(tuple(zip(required_columns_df["GIS_ID"],required_columns_df["ASSET_TYPE"],required_columns_df["lat"],required_columns_df["long"],required_columns_df["CoordinateLocation"])))            
        return tuple_cycle_park_data
    
    
    def clear_table(self):
        try: 
            query = 'DELETE FROM public."CycleParkLocation"'
            self.cur.execute(query)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}

        
        
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
        
        
class HotspotDB:
    cur = None
    conn = None
    
    def __init__(self):
        self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres")
        self.cur = self.conn.cursor()
        
        
    def migrate_data_to_db(self):
        try:            
            data_to_migrate = self.read_data()
                
            query = """
            INSERT INTO public."CrashHotspots"(
	"objectId", longitude, latitude, accident_time, lga_name, bicylist, geom_location)
	VALUES (%s, %s, %s, %s, %s, %s, ST_GeomFromText(%s,4326))"""
    
            self.cur.executemany(query,data_to_migrate)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}
        

    def read_data(self):
        df = pd.read_csv("./data/Crashes_Last_Five_Years.csv")
        req_df = df[["OBJECTID","LONGITUDE","LATITUDE","ACCIDENT_TIME","LGA_NAME","BICYCLIST"]]
        final_df = req_df[(req_df["LGA_NAME"]=='MELBOURNE') & (req_df["BICYCLIST"] > 0)]
        coordlocation = []
        final_df['geom_location'] = np.nan

        
        for index,row in final_df.iterrows():
            coordlocation.append("POINT(%s %s)" % (row["LONGITUDE"],row["LATITUDE"]))
        
        final_df['geom_location']  = coordlocation
        tuple_cycle_park_data = list(tuple(zip(final_df["OBJECTID"],final_df["LONGITUDE"],final_df["LATITUDE"],final_df["ACCIDENT_TIME"],final_df["LGA_NAME"],final_df["BICYCLIST"],final_df['geom_location'])))
        return tuple_cycle_park_data
    
    
    def clear_table(self):
        try: 
            query = 'DELETE FROM public."CrashHotspots"'
            self.cur.execute(query)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}

        
        
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
        
        
        
        
class ToiletDB:
    cur = None
    conn = None
    
    def __init__(self):
        self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres port=5433")
        self.cur = self.conn.cursor()
        
        
    def migrate_data_to_db(self):
        try:            
            data_to_migrate = self.read_data()
                
            query = """
           INSERT INTO public."ToiletLocation"(
	id, name, male, female, lon, lat, geom_location)
	VALUES (%s, %s, %s, %s, %s, %s, ST_GeomFromText(%s,4326));"""
    
            self.cur.executemany(query,data_to_migrate)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}
        

    def read_data(self):
        df = pd.read_csv("./data/Public_toilets.csv")
        req_df = df[["name","male","female","lat","lon"]]
        coordlocation = []
        req_df['geom_location'] = np.nan

        
        for index,row in req_df.iterrows():
            coordlocation.append("POINT(%s %s)" % (row["lon"],row["lat"]))
        
        req_df['geom_location']  = coordlocation
        req_df["id"] = np.arange(len(req_df))
        tuple_cycle_park_data = list(tuple(zip(req_df["id"],req_df["name"],req_df["male"],req_df["female"],req_df["lon"],req_df["lat"],req_df['geom_location'])))
        return tuple_cycle_park_data
    
    
    def clear_table(self):
        try: 
            query = 'DELETE FROM public."ToiletLocation";'
            self.cur.execute(query)
            self.close_connection()
            return {"status":"success"}
        except:
            return {"status":"fail","code":"500"}

        
        
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
        

        




