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
       self.conn = psycopg2.connect("host=localhost dbname=IE-database user=postgres")
       self.cur = self.conn.cursor()
       self.isWandering = True
        
        
    def findTenCylingPaths(self,coordinates):
        try:
            if "source" and "target" in coordinates.keys():
                self.isWandering = False
                print("inside False")
                query = """
                    select v.id, v.the_geom
                    from public."CyclePath_copy_noded_vertices_pgr" as v,
                    public."CyclePath_copy_noded" as e
                    where
                    v.id = (
                    select id from public."CyclePath_copy_noded_vertices_pgr"
                    order by the_geom <-> ST_SetSRID(ST_GeogFromText(%s),4326) limit 1) and (e.source=v.id or e.target=v.id)
                    group by v.id,v.the_geom;"""
                
                coord_source = 'POINT(%s %s)' % (coordinates["source"]["lat"],coordinates["source"]["long"])
                self.cur.execute(query,[coord_source])
                source_id = self.get_nearest_location_ids(self.cur.fetchall())                
 
                coord_target = "POINT(%s %s)" % (coordinates["target"]["lat"],coordinates["target"]["long"])                
                self.cur.execute(query,[coord_target])
                target_id = self.get_nearest_location_ids(self.cur.fetchall())

                path_query = """
                            select 
                            	MIN(r.seq) as seq,
                            	e.old_id as id,
                            	e.geom_data,
                            	e.type,
                            	sum(e.distance) as distance,
                            	ST_Collect(e.the_geom) as geom
                            from
                            	pgr_dijkstra('select id,source,target,distance as cost from public."CyclePath_copy_noded"',%s,%s,false) as r,
                            	public."CyclePath_copy_noded" as e
                            	where r.edge=e.id
                            	group by e.old_id,e.geom_data,e.type;
                        """
                self.cur.execute(path_query,[source_id,target_id])
                response = self.cur.fetchall()
                responseArray = self.frontEndCompatibleData(response,self.isWandering)
                self.close_connection()
                return responseArray
            else:
                self.isWandering = True
                query = """
                SELECT id,geom_path,type,direction,geom_data,MIN(ST_Distance(geom_path, ST_SetSRID(ST_GeogFromText(%s),4326),true)) as min_distance
                	FROM public."CyclePath" 
                	group by id,geom_path,type,direction,geom_data order by min_distance 
                	limit 10;"""
                coord = "POINT(%s %s)" % (coordinates["lat"],coordinates["long"])
                self.cur.execute(query,[coord])
                response = self.cur.fetchall()
                responseArray = self.frontEndCompatibleData(response,self.isWandering)
                self.close_connection()
                return responseArray
        except psycopg2.Error as e:
            print(e)
            return {"status":"fail","code":"500"}

            
    def frontEndCompatibleData(self,response,isWandering):
        response_array = []
        if isWandering == True:
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
                toilet_locations = self.getToiletLocation(each[0])
                response_dict["toiletLocations"] = toilet_locations
                response_array.append(response_dict)
            return response_array
        else:
            for each in response:                        
                coordinate_list = []
                response_dict = {}
                response_dict["id"] = each[1]
                response_dict["type"] = each[3]
                response_dict["direction"] = "both directions"
                coord_list = self.getGeomDataFormat(each[2])
                coordinate_list.append(coord_list)
                response_dict["geom_data"] = coordinate_list
                response_dict["distance"] = round(each[4],2)
                parkingBays = self.getParkingBays(each[1])
                response_dict["parkingBays"] = parkingBays
                drinkingFountainLocations = self.getDrinkingFountains(each[1])
                response_dict["drinkingFountains"] = drinkingFountainLocations
                cycle_crash_spots = self.getCrashHotspots(each[1])
                response_dict["cycleCrashHotspots"] = cycle_crash_spots
                toilet_locations = self.getToiletLocation(each[1])
                response_dict["toiletLocations"] = toilet_locations
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
        query = """SELECT public."CycleParkLocation".*
        	FROM public."CycleParkLocation" INNER JOIN public."CyclePath" 
        	ON ST_DWithin(public."CycleParkLocation".geom_location, public."CyclePath".geom_path, 0.01) where public."CyclePath".id = %s limit 20;
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
    
    
    def get_nearest_location_ids(self,response):
        return response[0][0]
        
    def getToiletLocation(self,path_id):
        query = """SELECT tl.*
                    FROM public."ToiletLocation" tl INNER JOIN public."CyclePath" cp 
                    ON ST_DWithin(tl.geom_location, cp.geom_path,0.01) where cp.id = %s limit 10;"""
        self.cur.execute(query,[path_id])
        records = self.cur.fetchall()
        toilet_locations = []
        if len(records) == 0:
            return toilet_locations
        for each in records:
            toilDict = {}
            toilLocation = []
            toilDict["id"] = each[0]
            toilDict["name"] = each[1]
            toilDict["male"] = each[2]
            toilDict["female"] = each[3]
            toilLocation.append(each[4])
            toilLocation.append(each[5])
            toilDict["coordinates"] = toilLocation
            toilet_locations.append(toilDict)
        return toilet_locations
    
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
