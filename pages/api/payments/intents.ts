import { withAuthorization } from "../../../lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest,NextApiResponse } from "next";
import Stripe from "stripe";






import prisma from "../../../lib/prisma"; 
const stripe =new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2025-06-30.basil'
})


const  handler=async(req:NextApiRequest, res:NextApiResponse)=>{
    console.log("🔵 API HIT: /api/payments/intent");
    if(req.method!=='POST') return res.status(405).json({error:"method not allowed"})
    const admin= await prisma.admin.findUnique({where:{id:1}})
    const {distance,reservationid}=req.body
     if (!distance || isNaN(Number(distance))) {
      return res.status(400).json({
        error: "Invalid Input",
        message: "Distance must be a valid number",
      });
    }

    if (!reservationid) {
      return res.status(400).json({
        error: "Invalid Input",
        message: "Reservation ID is required",
      });
    }
    if(admin == null || typeof admin.kmprice === "undefined") {
        return res.status(500).json({ error: "Admin or kmprice not found" });
    }
    const real_amount=distance*admin.kmprice
    try {
  const payementIntent = await stripe.paymentIntents.create({
    amount: real_amount,
    currency: 'usd',
  });

  const existing = await prisma.reservation.findUnique({
    where: { id: reservationid },
  });

  if (!existing) {
    throw new Error('Reservation not found');
  }

  // Update reservation status
  await prisma.reservation.update({
    where: { id: reservationid },
    data: { status: 'paid' },
  });

  // ✅ Create PaymentIntent in DB
  await prisma.paymentIntent.create({
    data: {
      stripeId: payementIntent.id,
      amount: real_amount,
      currency: 'usd',
      status: payementIntent.status,
      reservationId: reservationid,
    }
  });

  return res.status(200).json({ clientsecret: payementIntent.client_secret });
}
  catch (error){
    return res.status(500).json({
      error:"Internal server error"
    })
  }

}

export default withAuthorization(['admin', 'passager'], handler);
