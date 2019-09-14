#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Aug 27 12:37:20 2019

@author: girishbhatta
"""



import psycopg2


class WanderingRoute:
    cur = None
    conn = None
    
    def __init__(self):
       self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres port=5433")
       self.cur = self.conn.cursor()
        
        
    def findTenCylingPaths(self,coordinates):
        try:
            query = """
            SELECT id,geom_path,type,direction,geom_data,MIN(ST_Distance(geom_path, ST_SetSRID(ST_GeogFromText(%s),4326),true)) as min_distance
            	FROM public."CyclePath" 
            	group by id,geom_path,type,direction,geom_data order by min_distance 
            	limit 10;"""
            coord = "POINT(%s %s)" % (coordinates["lat"],coordinates["long"])
            self.cur.execute(query,[coord])
            response = self.cur.fetchall()
            responseArray = self.frontEndCompatibleData(response,coordinates)
            self.close_connection()
            return responseArray
        except:
            return {"status":"fail","code":"500"}

            
    def frontEndCompatibleData(self,response,coordinates):
        response_array = []
        for each in response:                        
            coordinate_list = []
            response_dict = {}
            response_dict["id"] = each[0]
            response_dict["type"] = each[2]
            response_dict["direction"] = each[3]
            coord_list = self.getGeomDataFormat(each[4])
            coordinate_list.append(coord_list)
            response_dict["geom_data"] = coordinate_list
            response_dict["distance"] = each[5]
            parkingBays = self.getParkingBays(each[0])
            response_dict["parkingBays"] = parkingBays
            drinkingFountainLocations = self.getDrinkingFountains(each[0])
            response_dict["drinkingFountains"] = drinkingFountainLocations
            cycle_crash_spots = self.getCrashHotspots(each[0])
            response_dict["cycleCrashHotspots"] = cycle_crash_spots
            response_array.append(response_dict)
        return response_array
            
    
    def getGeomDataFormat(self,stringData):        
        coord_list = []
        for each in stringData[15:len(stringData)].replace("((",'').replace("))",'').strip().split(","):
            temp = each.strip().split(" ")
            temp[0] = float(temp[0])
            temp[1] = float(temp[1])
            coord_list.append(temp)
        return coord_list


    def getParkingBays(self,path_id):
        query = """SELECT cl.*
                FROM public."CycleParkLocation" cl INNER JOIN public."CyclePath" cp 
                ON ST_DWithin(cl.geom_location, cp.geom_path, 0.01) where cp.id = %s and cl.asset_type='Bicycle Rails' limit 20;
        """
        self.cur.execute(query,[path_id])
        records = self.cur.fetchall()
        parkingBays = []
        for each in records:
            parkingDict = {}
            parkinglocation = []
            parkingDict["GS_ID"] = each[0]
            parkingDict["type"] = each[1]
            parkinglocation.append(each[2])
            parkinglocation.append(each[3])
            parkingDict["coordinates"] = parkinglocation
            parkingBays.append(parkingDict)
        return parkingBays
    
    
    def getDrinkingFountains(self,path_id):
        query = """SELECT cl.*
                FROM public."CycleParkLocation" cl INNER JOIN public."CyclePath" cp 
                ON ST_DWithin(cl.geom_location, cp.geom_path, 0.01) where cp.id = %s and cl.asset_type='Drinking Fountain' limit 10;"""
        self.cur.execute(query,[path_id])
        records = self.cur.fetchall()
        drinkingFountains = []
        for each in records:
            drinkingDict = {}
            drinkingLocation = []
            drinkingDict["GS_ID"] = each[0]
            drinkingDict["type"] = each[1]
            drinkingLocation.append(each[2])
            drinkingLocation.append(each[3])
            drinkingDict["coordinates"] = drinkingLocation
            drinkingFountains.append(drinkingDict)
        return drinkingFountains
    
    
    
    def getCrashHotspots(self,path_id):
        query = """SELECT chp.*
                FROM public."CrashHotspots" chp INNER JOIN public."CyclePath" cp 
                ON ST_DWithin(chp.geom_location, cp.geom_path,0.0001) where cp.id = %s limit 20;"""
        self.cur.execute(query,[path_id])
        records = self.cur.fetchall()
        crash_hotspots = []
        if len(records) == 0:
            return crash_hotspots
        for each in records:
            crashDict = {}
            crashLocation = []
            crashDict["objectId"] = each[0]
            crashDict["accident_time"] = each[3]
            crashDict["bicyclist"] = each[5]
            crashLocation.append(each[1])
            crashLocation.append(each[2])
            crashDict["coordinates"] = crashLocation
            crash_hotspots.append(crashDict)
        return crash_hotspots
    
    
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
