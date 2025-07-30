import { withAuthorization } from "../../../lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



import prisma from "../../../lib/prisma"; 
const  handler=async(req:NextApiRequest,res:NextApiResponse)=>{

    if(req.method=='GET'){
        try{
            const {id}=req.query
            if(!id || isNaN(Number(id))){
                return res.status(400).json({error:"Invalid id"})
            }
            const getvehicule=await prisma.vehicule.findUnique({
                where:{id:Number(id)}
            })
            if(!getvehicule){
                return res.status(404).json({error:"vehicule not found"})
            }
            return res.status(200).json(getvehicule)
        }
        catch(err){
            return res.status(500).json({error:"server error"})
        }
    }

    if (req.method == 'DELETE') {
  try {
    const { id } = req.query;
    await prisma.vehicule.delete({  // <-- Add await here
      where: { id: Number(id) },
    });
    return res.status(200).json({ message: 'Vehicule deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'server error' });
  }}

    if(req.method=='PUT'){
        try{
            const { id } = req.query
            const {name,type}=req.body
            if (typeof name !== "string" || typeof type !== "string") {
                return res.status(400).json({ error: "Invalid name or type" });
            }
            const updatedVehicule = await prisma.vehicule.update({
                where: { id: Number(id) },
                data: {
                    name: name,
                    type: type
                }
            })
            return res.status(200).json(updatedVehicule);
        }
        catch(err){
            return res.status(500).json({ error: 'server error' })
        }
    }

}
export default withAuthorization(['admin','conducteur'],handler);

