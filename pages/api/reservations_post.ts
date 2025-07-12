import { verifyToken } from "@/lib/auth";
import { withAuthorization } from "@/lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



const prisma= new PrismaClient()

const handler=async (req:NextApiRequest,res:NextApiResponse)=>{
    if(req.method =='POST') {
           
    
            
                try{
                    const user=verifyToken(req)
                    const {vehicleId,startTime,endTime,source,destination}=req.body
        
                    // Check vehicle availability
                    const vehicul = await prisma.vehicule.findUnique({  where: { id: vehicleId }
                })
                if (!vehicul || !vehicul.available) {
              return res.status(400).json({ error: 'Vehicle not available' });
            }
        
            // Check for overlapping reservations
            const overlap = await prisma.reservation.findFirst({
              where: {
                vehicleId: vehicleId,
                OR: [
                  { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(startTime) } },
                ],
              },
            });
        
            if (overlap) {
              return res.status(409).json({ error: 'Vehicle already reserved in this time window' });
            }
        
            // Find or create trajectory
            let trajectory = await prisma.trajectory.findFirst({
                 where: { source, destination }
                });
    
            if (!trajectory) {
                 trajectory = await prisma.trajectory.create({
                   data: {
                          source,
                          destination
                              }
                           });
                           }
     
            // Create reservation
            const reservation = await prisma.reservation.create({
                     data: {
                     userId: user.id,
                    vehicleId: vehicleId,
                    trajectoryId: trajectory.id,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                         },
                              });
                              return res.status(201).json({message:"reservation created successfuly"})
                          }
            catch(err){
                return res.status(500).json({err})
            }
    
    }
}
export default withAuthorization(['admin', 'passager'], handler);
