import Layout from "@/components/Layout";
import { ProductsContext } from "@/components/ProductsContext";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import {useForm} from "react-hook-form";
import axios from "axios";

export default function CheckoutPage(){
    const {selectedProducts, setSelectedProducts} = useContext(ProductsContext);
    const [productsInfos, setProductsInfos] = useState([]);
    const {register, handleSubmit, formState: {errors}} = useForm();
    
    async function onSubmit(values){

        try{
            const response = await axios({
                withCredentials: true,
                url:"/api/checkout",
                method:"POST",
                data : values
            })
            console.log("Response back", response)
            window.location.assign(response.data)
        } catch (error){
            console.log(error)
        }
    }

    useEffect(() => {
        const uniqIds = [...new Set(selectedProducts)]
        fetch('https://my-ecommerce-alpha.vercel.app/api/products?ids='+uniqIds.join(','))
            .then(response => response.json())
            .then(json => setProductsInfos(json));
            console.log("product changed!")
            return() => {}
    }, [selectedProducts])

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
            {subtotal === 0 && (
                <div>No products in your shopping cart.</div>
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
            {subtotal != 0 && (<form onSubmit={handleSubmit(onSubmit)} >
                <div className="mt-4">
                    {errors.address && <span className="text-sm text-red-700">Adress is required</span>}
                    <input 
                        className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Street address, number"
                        {...register("address", {required:true})}
                    />
                    {errors.city && <span className="text-sm text-red-700">City is required</span>}
                    <input 
                        className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="City and postal code"
                        {...register("city", {required:true})}
                    />
                    {errors.name && <span className="text-sm text-red-700">Name is required</span>}
                    <input 
                        className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Your name"
                        {...register("name", {required:true})}
                    />
                    {errors.email && <span className="text-sm text-red-700">Email is required</span>}
                    <input 
                        className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="email" placeholder="Email address"
                        {...register("email", {required:true})}
                    />
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
                <input type="hidden" name='products' value={selectedProducts.join(',')} {...register("products")} />
                <button type="submit" role="link" className="bg-emerald-500 px-5 py-2 rounded-xl text-white w-full my-4 shadow-emerald-300 shadow-lg">Pay ${total}</button>
            </form>)}
        </Layout>
    )
}