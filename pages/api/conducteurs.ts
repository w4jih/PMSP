import { withAuthorization } from "@/lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";



const prisma = new PrismaClient();

const handler= async (
    req:NextApiRequest,
    res:NextApiResponse
) =>{
     if( req.method=== "GET"){
        const conducteurs = await prisma.conducteur.findMany();
        return res.status(200).json(conducteurs)
     }
     
     if (req.method ==="POST"){
        const { name, lastname, Cin,email,password}= req.body
        if(!name || !lastname || !Cin || !password|| !email){
            return res.status(400).json({error: "Missing name or lastname or cin"})

        }
        const hashedpassword=bcrypt.hashSync(password,10)
        const newConducteur =await prisma.conducteur.create({
            data: {name, lastname , Cin,email, password:hashedpassword}
        } )

        return res.status(201).json({message: "conducteur created seccessfully"})
     }

    
}
export default withAuthorization(['admin', 'conducteur'], handler);