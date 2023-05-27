import Layout from "@/components/Layout";
import { ProductsContext } from "@/components/ProductsContext";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";

export default function CheckoutPage(){
    const {selectedProducts, setSelectedProducts} = useContext(ProductsContext);
    const [productsInfos, setProductsInfos] = useState([]);
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    useEffect(() => {
        const uniqIds = [...new Set(selectedProducts)]
        fetch('https://my-ecommerce-3vfps61k9-jefgit.vercel.app/api/products?ids='+uniqIds.join(','))
            .then(response => response.json())
            .then(json => setProductsInfos(json));
            console.log("product changed!")
    }, [selectedProducts])
    // console.log(productsInfos)
    function addItem(id){
        setSelectedProducts(prev => [...prev,id]);
    }

    function lessItem(id){
        const pos = selectedProducts.indexOf(id);
        if(pos !== -1){
            
            setSelectedProducts( prev => {
                return prev.filter((value,index) => index !== pos); 
            });
        }
    }

    let subtotal = 0;
    const shippingfee = 5;

    if(selectedProducts?.length){
        for(let id of selectedProducts){
            const price = productsInfos.find(p => p._id === id)?.price || 0;
            subtotal += price;
        }
    }

    const total = subtotal + shippingfee;

    return(
        <Layout>
            {!productsInfos.length && (
                <div>no products in your shopping cart</div>
            )}
            
            {productsInfos.length && productsInfos.map(productInfo => {
                const amount = selectedProducts.filter(id => id === productInfo._id).length;
                if(amount === 0) return;
                return(
                <div className="flex mb-5" key={productInfo._id}>
                    <div className="bg-gray-100 p-3 rounded-xl shrink-0">
                        <Image className="w-24" src={productInfo.picture} alt="" width={100} height={100} />
                    </div>
                    <div className="pl-4">
                        <h3 className="font-bold text-lg">{productInfo.name}</h3>
                        <p className="text-sm leading-4 text-gray-500">{productInfo.description}</p>
                        <div className="flex">
                            <div className="grow">${productInfo.price}</div>
                            <div>
                                <button 
                                onClick={() => lessItem(productInfo._id)}
                                className="border border-emerald-500 px-2 rounded-lg text-emerald-500">-</button>
                                <span className="px-2">
                                    {selectedProducts.filter(id => id === productInfo._id).length}
                                </span>
                                <button 
                                    onClick={() => addItem(productInfo._id)}
                                    className="bg-emerald-500 px-2 rounded-lg text-white"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )})}
            <form action="/api/checkout" method="POST">
                <div className="mt-4">
                    <input name="address" value={address} onChange={e => setAddress(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Street address, number"/>
                    <input name="city" value={city} onChange={e => setCity(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="City and postal code"/>
                    <input name="name" value={name} onChange={e => setName(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Your name"/>
                    <input name="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="email" placeholder="Email address"/>
                </div>
                <div className="mt-4">
                    <div className="flex my-3">
                        <h3 className="grow font-bold text-gray-400">Subtotal:</h3>
                        <h3 className="font-bold">${subtotal}</h3>
                    </div>
                    <div className="flex my-3">
                        <h3 className="grow font-bold text-gray-400">Shipping fee:</h3>
                        <h3 className="font-bold">${shippingfee}</h3>
                    </div>
                    <div className="flex my-3 border-t pt-3 border-dashed border-emerald-500">
                        <h3 className="grow font-bold text-gray-400">Total:</h3>
                        <h3 className="font-bold">${total}</h3>
                    </div>  
                </div>         
                <input type="hidden" name='products' value={selectedProducts.join(',')} />
                <button type="submit" role="link" className="bg-emerald-500 px-5 py-2 rounded-xl text-white w-full my-4 shadow-emerald-300 shadow-lg">Pay ${total}</button>
                </form>
        </Layout>
    )
}