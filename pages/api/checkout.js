import { initMongoose } from "@/lib/mongoose";
import Order from "@/models/Order";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import Product from "@/models/Product";

export default async function handler(req,res) {
    await initMongoose();

    if(req.method !== 'POST'){
        res.status(405).end('Method Not Allowed');
        return;
    }

    console.log(req.body)
    const {email, name, address, city} = req.body;
    const productsIds = req.body.products.split(',');
    const uniqIds = [...new Set(productsIds)];
    const products = await Product.find({_id:{$in:uniqIds}}).exec();    

    let line_items = [];
    for(let productId of uniqIds){
        const quantity = productsIds.filter(id => id === productId).length;
        const product = products.find(p => p._id.toString() === productId);
       line_items.push({
            quantity,
            price_data:{
                currency:'USD',
                product_data:{name:product.name},
                unit_amount: product.price * 100,
            },

        });
    }

    const order = await Order.create({
        products:line_items,
        name,
        email,
        address,
        city,
        paid:0,
      });

    const session = await stripe.checkout.sessions.create({
        
        line_items: line_items,
        mode: 'payment',
        customer_email: email,
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
        metadata: {orderId:order._id.toString()},
    });
      res.status(200).json(session.url)
} 