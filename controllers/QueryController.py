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
        if coordinates["isParkingBay"] == "True":
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
                response_array.append(response_dict)
            print(response_array)    
            return response_array
        else:                
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
    
    
    def close_connection(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()
