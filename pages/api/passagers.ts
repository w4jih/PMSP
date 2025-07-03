import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import { withAuthorization } from "@/lib/withAuthorization";


const prisma = new PrismaClient();

const handler= async(
    req:NextApiRequest,
    res:NextApiResponse
) =>{
     if( req.method=== "GET"){
        const passagers = await prisma.passager.findMany();
        return res.status(200).json(passagers)
     }
     
     if (req.method ==="POST"){
        const { name, lastname, Cin,email,password}= req.body
        if(!name || !lastname || !Cin || !email ||!password){
            return res.status(400).json({error: "Missing name or lastname or cin"})

        }
        const hashedpassword=bcrypt.hashSync(password,10)
        const newpassager =await prisma.passager.create({
            data: {name, lastname , Cin,email, password:hashedpassword}
        } )

        return res.status(201).json(newpassager)
     }

    
}

export default withAuthorization(['admin', 'passager'], handler);