import { withAuthorization } from "@/lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();
const handler= async (
    req:NextApiRequest,
    res:NextApiResponse
) =>{
     const id = parseInt(req.query.id as string);
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
        const hashedpassword=bcrypt.hashSync(password,10)
        const updatedpassagers =await prisma.passager.update({
            where:{ id },
             data: { name, lastname, Cin,password:hashedpassword },

        })
        return res.status(200).json({message:`Conducteur with the ID ${id} was seccessfuly updated` })}
        catch (error){
            res.status(500).json({error: "AN error aoccured while updating the conduteur"})
        }
     }
}

export default withAuthorization(['admin', 'passager'], handler);