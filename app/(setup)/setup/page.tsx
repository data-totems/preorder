'use client'
import BussinessDetails from "@/components/manage/BussinessDetails"
import BankDetails from "@/components/setup/BankDetails"
import PersonalDetails from "@/components/setup/PersonalDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft, House, Store, User } from "lucide-react"
import { useState } from "react"


const Setup = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        {
        id: 1,
        title: "Pesonal details",
        Icon: User
        },
        {
        id: 2,
        title: "Business details",
        Icon: Store
        },
         {
        id: 3,
        title: "Business details",
        Icon: House
        },
       
    ]
  return (
    <div className='flex flex-col items-center justify-center max-w-lg '>
        <div className="">
              <div className="flex items-center mt-2 justify-center gap-10 ">
            <Button variant={'ghost'}>
                <ArrowLeft />
            </Button>

            <h2 className="font-bold flex-1 justify-center items-center text-2xl ">Setup Your Account </h2>
        </div>

        <div className="flex items-center justify-center gap-7 mt-4">
            {steps.map((step) => (
                <>
                 <div  key={step.id} className="flex flex-col items-center gap-1 cursor-pointer ">
                <step.Icon className={`${currentStep === step.id ? "text-[#27BA5F]" : "text-[#757575]"}`}
                //  fill={`${currentStep === step.id ? "#27BA5F" : "#757575"}`} 
                 />
                <h2 className={`${currentStep === step.id ? 'text-[#27BA5F]' : 'text-[#B3B9B6]'} text-[10px] `}>{step.title}</h2>
            </div>

            {step.id !== 3  && (
                <div className="w-10 h-0 border border-dashed" />
            )}
            </>
            ))}
           
        </div>


        <div>
            {currentStep === 1 && (
                <PersonalDetails />
            )}

              {currentStep === 2 && (
                <BussinessDetails />
            )}

              {currentStep === 3 && (
                <BankDetails />
            )}
        </div>
        </div>
      
    </div>
  )
}

export default Setup