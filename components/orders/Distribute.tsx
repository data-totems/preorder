'use client'

import { ArrowRight, Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";


const Distribute = ({ currentStep, setCurrentStep, setOpen, openCompleted, setOpenCompleted, setDispatchModal  }: {
    currentStep: number;
    setCurrentStep: (value: number) => void;
    setOpen: (value: boolean) => void;
    setOpenCompleted: (value: boolean) => void;
    openCompleted: boolean;
    setDispatchModal: (value: boolean) => void
}) => {
  const [selectedrider, setSelectedrider] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<number[]>([]);


   const toggleProduct = (index: number) => {
    setSelectedProduct((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index) // remove if already selected
        : [...prev, index] // add if not selected
    );
  };

  return (
    <div>
        <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-[700] ">
                Select {currentStep === 1 ? 'Dispatch' : 'Product'}
            </h2>

            {currentStep === 1 && (
                <div onClick={() => {
                    setDispatchModal(true)
                    setOpen(false)
                }} className="flex items-center gap-3 cursor-pointer ">
                    <Plus color="#27BA5F" size={16} />
                    <span className="text-[12px] text-[#27BA5F] font-[500] ">Add one-time dispatch</span>
                </div>
            )}
        </div>

        {currentStep === 1 && (
            <div className="flex flex-col gap-5 pt-4 ">
                {[1,2].map((_, index) => (
                    <div onClick={() => setSelectedrider(index)} 
                    className={`flex justify-between items-center  cursor-pointer ${selectedrider === index ? 'bg-[#27BA5F1F] ' : ''} p-3 rounded-[12px] `}
                     key={index}>
                        <div className="flex items-center gap-4 ">
                            <div className={` rounded-full flex flex-col justify-center items-center font-[700] w-[40px] h-[40px] ${selectedrider === index ? 'bg-[#27BA5F1F] text-[#27BA5F] ' : 'bg-[#03140A1F] text-black'} `}>
                                <span>D</span>
                            </div>

                            <div className="">
                                <h2 className="text-[14px] font-[500] ">Dispatch rider I</h2>
                                <h3 className="text-[#03140A80] text-[12px] ">090235623....</h3>
                            </div>
                        </div>
                        <div className={`border-2 flex flex-col items-center justify-center rounded-full ${selectedrider === index ? 'border-[#27BA5F] ' : ''} w-[16px] h-[16px] `}>
                            {selectedrider === index && (
                                <div className="bg-[#27BA5F] h-[10px] w-[10px] rounded-full " />
                            )}
                        </div>
                    </div>
                ))}

                <Button onClick={() => setCurrentStep(2)} className="w-full bg-[#27BA5F] hover:bg-green-400 rounded-[12px]  ">
                    <h2 className="">Select Product</h2>
                    <ArrowRight className="text-end" />
                </Button>
            </div>
        )}

        {currentStep === 2 && (
            <div className="pt-5 flex flex-col gap-5 ">
                <h2 className="text-[#03140A80] ">Monday, 14th July, 2025</h2>

                <div className="flex flex-col gap-6   ">
                    {[1,2,3].map((_,index) => (
                        <div className="flex cursor-pointer" onClick={() => toggleProduct(index)} key={index}>
                            <div className={` cursor-pointer rounded-[4px] border w-[16px] h-[16px] ${selectedProduct.includes(index) ? 'border-[#27BA5F] bg-[#27BA5F] ' : 'border-[#03140A33] '} flex flex-col items-center justify-center `}>
                                {selectedProduct.includes(index) && (
                                    <div className="">
                                        <Check size={10} color="white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-5 ">
                                <Image src={'/product1.jpg'} alt="product" width={45} height={45} />
                                <div className="">
                                    <div className="flex items-cennter gap-3 text-[14px] ">
                                        <h2 className="text-[#03140A80] ">Buyer name:</h2>
                                        <span className="font-[500]">Akinsanmi Adeleke</span>
                                    </div>
                                    <div className="flex items-cennter gap-3  ">
                                        <h2 className="text-[#03140A80] ">Transaction code:</h2>
                                        <span className="font-[500] ">SFJRW3000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                 <Button onClick={() => {
                    setOpen(false)
                    setOpenCompleted(true)

                    setCurrentStep(1)
                  
                    
                 }} className="w-full bg-[#27BA5F] hover:bg-green-400 rounded-[12px]  ">
                    <h2 className="">Finish</h2>
                    
                </Button>
            </div>
        )}


       
    </div>
  )
}

export default Distribute