import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();

export default async function Conduteurs_Handler(
    req:NextApiRequest,
    res:NextApiResponse
){
     if( req.method=== "GET"){
        const conducteurs = await prisma.conducteur.findMany();
        return res.status(200).json(conducteurs)
     }
     
     if (req.method ==="POST"){
        const { name, lastname, Cin,password}= req.body
        if(!name || !lastname || !Cin || !password){
            return res.status(400).json({error: "Missing name or lastname or cin"})

        }
        const newConducteur =await prisma.conducteur.create({
            data: {name, lastname , Cin, password}
        } )

        return res.status(201).json({message: "conducteur created seccessfully"})
     }

    
}