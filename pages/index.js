import Product from "@/components/product";
// import { initMongoose } from "@/lib/mongoose";
import { useEffect, useState } from "react"
// import { findAllProducts } from "./api/products";
import Layout from "@/components/Layout";

export default function Home() {
  const [productsInfo, setProductsInfo] = useState([]);
  const [phrase, setPhrase] = useState('')
  const categoriesNames = [...new Set(productsInfo.map(p => p.category))];
  useEffect(() => {
    fetch('https://my-ecommerce-alpha.vercel.app/api/products')
    .then(response => response.json())
    .then(json => setProductsInfo(json))
    return() => {}
  }, []);

  console.log(productsInfo)

  let products;
  if(phrase){
    products =  productsInfo.filter(p => p.name.toLowerCase().includes(phrase));
  } else {
    products = productsInfo;
  }

  return (
   <Layout>
      <input 
        value={phrase}
        type="text" 
        placeholder="Search for products..." 
        className="bg-gray-100 w-full py-2 px-4 rounded-xl"
        onChange={e => setPhrase(e.target.value)}
      />
      <article>
        {categoriesNames.map(categoryName =>(
          <div key={categoryName}>
            {products.find(p => p.category === categoryName) && (
              <div>
                <h2 className="text-2xl capitalize py-5">{categoryName}</h2>
                <div className="flex -mx-5 overflow-x-scroll snap-x scrollbar-hide">
                  {products.filter(p => p.category === categoryName).map(productInfo =>(
                    <div key={productInfo._id} className="px-5 snap-start">
                      <Product {...productInfo}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </article>
    </Layout>
  )
}

// export async function getServerSideProps(){
//   await initMongoose();
//   const products = await findAllProducts();
//   return{
//     props: {
//       products:JSON.parse(JSON.stringify(products)),
//     },
//   }
// }
