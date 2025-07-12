import { withAuthorization } from "@/lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";




const prisma =new PrismaClient();


const  viheculehandler=async(req:NextApiRequest,res:NextApiResponse)=>{

     if(req.method=='GET'){
        try{
            const getvehicule= await prisma.vehicule.findMany()
            return res.status(200).json(getvehicule)
        
        }
        catch(err){
            return res.status(500).json({err})
        }
     }


     

}

export default withAuthorization(['admin'],viheculehandler);