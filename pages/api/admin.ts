import { withAuthorization } from "../../lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";


const prisma =new PrismaClient()

const handler=async(req:NextApiRequest,res:NextApiResponse)=>{
    if(req.method!=='POST') return res.status(405).json({error:"method not allowed"})

        try {
            const {kmprice,id}=req.body

            const updatedprice =await prisma.admin.update({
                where:{id:id},
                data:{kmprice:kmprice}
            }) 

            return res.status(200).json({messsage: "Price updated successfully", updatedprice: updatedprice.kmprice});
        }

        catch {
             return res.status(500).json({error:"server error"})
        }
}

export default withAuthorization(['admin'],handler);