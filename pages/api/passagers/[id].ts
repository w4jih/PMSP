import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();
export default async function Conduteurs_Handler(
    req:NextApiRequest,
    res:NextApiResponse
){
     if( req.method=== "GET"){
        const id = parseInt(req.query.id as string);
        const passagers = await prisma.passager.findMany({where : { id}});
        return res.status(200).json(passagers)
     }
     
    
     if (req.method === "DELETE"){
        const id = parseInt(req.query.id as string);
        if(!id){
            return res.status(400).json({error:"missing id"})
        }
        try{
        const deletedpassager =await prisma.passager.delete({
            where:{ id }

        })
        return res.status(200).json({message:`Conducteur with the ID ${id} was seccessfuly deleted` })}
        catch (error){
            res.status(500).json({error: "AN error aoccured while deleting the conduteur"})
        }
     }

     if (req.method === "PUT"){
        const id = parseInt(req.query.id as string);
        const { name, lastname, Cin,password}= req.body
        if(!id){
            return res.status(400).json({error:"missing id"})
        }
        try{
        const updatedpassagers =await prisma.passager.update({
            where:{ id },
             data: { name, lastname, Cin,password },

        })
        return res.status(200).json({message:`Conducteur with the ID ${id} was seccessfuly updated` })}
        catch (error){
            res.status(500).json({error: "AN error aoccured while updating the conduteur"})
        }
     }
}