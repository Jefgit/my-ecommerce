import { initMongoose } from "@/lib/mongoose";
import Order from "@/models/Order";
import {buffer} from 'micro'; 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    await initMongoose();
    const signingSecret = 'whsec_d0a8f5fe8a10b203d30721364d18f0574ac70b4a60923ce343fbe19b80ce635d';
    const payload = await buffer(req);
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(payload ,signature ,signingSecret);
    console.log(req)
    if(event?.type === 'checkout.session.completed'){
        
        const metadata = event.data?.object?.metadata;
        const paymentStatus = event.data?.object?.payment_status;
        if(metadata?.orderId && paymentStatus === 'paid'){
            await Order.findByIdAndUpdate(metadata.orderId, {paid:1});
        } 
    }
    res.json('ok');
}

export const config = {
    api: {
        bodyParser: false,
    }
}