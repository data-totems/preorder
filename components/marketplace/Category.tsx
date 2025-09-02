'use client'
import { useState } from "react";

const Category = () => {
    const categories = [
        "Phones", "Tablets", "Laptops"
    ];

    const [currentCategory, setCurrentCategory] = useState("Phones")
  return (
    <div className="p-3 ">
        <h2 className="font-[700] text-[#03140A80] ">Category</h2>

        <div className=" flex flex-col gap-7 mt-5 ">
            {categories.map((category, index) => (
                <div onClick={() => setCurrentCategory(category)} key={index} className={` cursor-pointer ${currentCategory === category ? 'bg-[#27BA5F1F] text-[#27BA5F] font-semibold ' : ' text-[#03140A4D] ' } w-[138px] h-[38px] flex flex-col justify-center pl-4 rounded-[12px]  `}>
                    <h2>{category}</h2>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Category