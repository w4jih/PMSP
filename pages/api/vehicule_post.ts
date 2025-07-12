import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";




const prisma =new PrismaClient()


export default async function handler(req:NextApiRequest,res:NextApiResponse){

    if(req.method=='POST'){
        try{
            const {name,type,conducteurId}=req.body
            if(!name || !type || !conducteurId){
                return res.status(400).json({error:"Missing name, type or conducteurId"})
            }
            const newvehicule= await prisma.vehicule.create({
                data:{
                    name:name,
                    type:type,
                    conducteurId:conducteurId
                }
            })
            return res.status(201).json({message:"vehicule created successfuly"})
        }
        catch(err){
            return res.status(500).json({err})
        }
    }
}