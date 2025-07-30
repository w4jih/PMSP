import { verifyToken } from "../../lib/auth";
import { withAuthorization } from "../../lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";






const handler =async(req:NextApiRequest,res:NextApiResponse)=>{
    if(req.method =='GET') {
     try{
        const getreservations= await prisma.reservation.findMany()
        return res.status(200).json({message:"the reservations are",reservations:getreservations})
    }
    catch(err){
        return res.status(500).json({error:"server error"})
    }
  }


    
}
export default withAuthorization(['admin', 'passager'], handler);
    
