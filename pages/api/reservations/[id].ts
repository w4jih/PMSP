import { withAuthorization } from "@/lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";





const prisma= new PrismaClient()

const handler=async(req:NextApiRequest,res:NextApiResponse)=>{
    const id =parseInt(req.query.id as string)
    if(req.method =='GET') {
     try{
        const getreservations= prisma.reservation.findUnique({
            where:{id:id}
        })
        return res.status(200).json({message:"the reservation is ",reservation:getreservations})
    }
    catch(err){
        return res.status(500).json({error:"server error"})
    }}

if(req.method=='DELETE'){
    try{
        const deletereservation=prisma.reservation.delete({
            where: {id:id}
        })
    }
    catch(err){
        return res.status(500).json({error:"reservation not found"})
    }
}

if(req.method=='PUT'){
    try{
        const {startTime,endTime}=req.body
        if( !startTime || !endTime ){
                    return res.status(400).json({error: "Missing parameter"})
        
                }


        // Check for overlapping reservations
            const overlap = await prisma.reservation.findFirst({
              where: {
                
                
                   startTime: { lte: new Date(endTime) },
                    endTime: { gte: new Date(startTime) } ,
                
              },
            });
        
            if (overlap) {
              return res.status(409).json({ error: 'Vehicle already reserved in this time window' });
            }
        const updatedreservation =await prisma.reservation.update({
            where:{id:id},
            data:{
                startTime:startTime,
                endTime:endTime
            }
        })
    }
    catch(err){
        return res.status(500).json({error:"reservation not found"})
    }
}
}

export default withAuthorization(['admin','passager'],handler);