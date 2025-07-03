import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();
export default async function Conduteurs_Handler(
    req:NextApiRequest,
    res:NextApiResponse
){
     if( req.method=== "GET"){
        const id = parseInt(req.query.id as string);
        const conducteurs = await prisma.conducteur.findMany({where : { id}});
        return res.status(200).json(conducteurs)
     }
     
    
     if (req.method === "DELETE"){
        const id = parseInt(req.query.id as string);
        if(!id){
            return res.status(400).json({error:"missing id"})
        }
        try{
        const deletedConducteur =await prisma.conducteur.delete({
            where:{ id }

        })
        return res.status(200).json({message:`Conducteur with the ID ${id} was seccessfuly deleted` })}
        catch (error){
            res.status(500).json({error: "AN error aoccured while deleting the conduteur"})
        }
     }

     if (req.method === "PUT"){
        const id = parseInt(req.query.id as string);
        const { name, lastname, Cin}= req.body
        if(!id){
            return res.status(400).json({error:"missing id"})
        }
        try{
        const updatedConducteur =await prisma.conducteur.update({
            where:{ id },
             data: { name, lastname, Cin },

        })
        return res.status(200).json({message:`Conducteur with the ID ${id} was seccessfuly updated` })}
        catch (error){
            res.status(500).json({error: "AN error aoccured while updating the conduteur"})
        }
     }
}