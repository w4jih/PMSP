import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();

export default async function Conduteurs_Handler(
    req:NextApiRequest,
    res:NextApiResponse
){
     if( req.method=== "GET"){
        const passagers = await prisma.passager.findMany();
        return res.status(200).json(passagers)
     }
     
     if (req.method ==="POST"){
        const { name, lastname, Cin,password}= req.body
        if(!name || !lastname || !Cin || !password){
            return res.status(400).json({error: "Missing name or lastname or cin"})

        }
        const newpassager =await prisma.passager.create({
            data: {name, lastname , Cin, password}
        } )

        return res.status(201).json(newpassager)
     }

    
}