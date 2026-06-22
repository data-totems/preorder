'use client'
import BussinessDetails from "@/components/setup/BussinessDetails"
import BankDetails from "@/components/setup/BankDetails"
import PersonalDetails from "@/components/setup/PersonalDetails"
import React, { useEffect, useState } from "react"
import LoadingModal from "@/components/shared/LoadingModal"
import ProgressBar from "@/components/setup/ProgressBar"
import { Eyebrow } from "@/components/ui/eyebrow"
import { getAllbanks } from "@/actions/storage.actions"
import type { FlutterwaveBank } from "@/types/api"

const stepCopy = {
  1: { eyebrow: "STEP 1 OF 3", title: "Tell us about you", desc: "We use this to set up your merchant account." },
  2: { eyebrow: "STEP 2 OF 3", title: "Your store identity", desc: "How customers will find and recognize you." },
  3: { eyebrow: "STEP 3 OF 3", title: "Bank details", desc: "So you can receive payments from your orders." },
}

const Setup = () => {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
     const [isLoading, setIsLoading] = useState(false);
     const [banks, setBanks] = useState<FlutterwaveBank[]>([]);

      useEffect(() => {
        const getData = async () => {
          const response = await getAllbanks();

          if(response.status === 'success') {
            setBanks(response.data)
          }
        }

        getData();


      }, [])

      if(isLoading) return <LoadingModal message="Setting up for you..." />

      const copy = stepCopy[currentStep]

  return (
    <>
      <ProgressBar current={currentStep} />

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 pb-32">
        <Eyebrow className="block mb-2">{copy.eyebrow}</Eyebrow>
        <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
          {copy.title}
        </h1>
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground">{copy.desc}</p>

        <div className="mt-8 flex flex-col gap-8">
          {currentStep === 1 && (
              <PersonalDetails setCurrentStep={setCurrentStep} />
          )}

            {currentStep === 2 && (
              <BussinessDetails setCurrentStep={setCurrentStep} />
          )}

            {currentStep === 3 && (
              <BankDetails banks={banks} isLoading={isLoading} setIsLoading={setIsLoading} setCurrentStep={setCurrentStep} />
          )}
        </div>
      </div>
    </>
  )
}

export default Setup
