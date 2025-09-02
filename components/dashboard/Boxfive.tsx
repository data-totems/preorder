import Image from "next/image"

const Boxfive = () => {
  return (
    <div className="flex flex-col gap-5 ">
          <h3 className="text-[16px] font-[700] ">
                INCOMING ORDERS
            </h3>

            <div className="flex flex-col gap-7 ">
                {[1,2].map((i) => (
                    <div className="" key={i}>
                        <div className="flex items-center gap-4 ">
                            <Image src={'/product1.jpg'} alt="product image" width={45} height={48} />

                            <div className=" ">
                                <h2 className="text-[16px] text-[700] ">Payment was made for XIAOMI Redmi 14C</h2>

                                <div className=" flex items-center gap-6 ">
                                    <span className="text-[#03140A80]  ">Amount paid</span>
                                    <h2 className="font-[500]  ">NGN134,320</h2>
                                </div>

                                 <div className=" flex items-center gap-6 ">
                                    <span className="text-[#03140A80]  ">Transaction code</span>
                                    <h2 className="font-[500] ">SFJRW3000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-end  pt-5  ">
                            <div className="flex items-center gap-5 ">
                                  <div className="cursor-pointer">
                                <h1 className="text-[#ED2525] font-[700] ">Decline</h1>
                            </div>

                              <div className="cursor-pointer bg-green-500 rounded-full w-[81px] h-[30px] items-center justify-center flex flex-col  ">
                                <h1 className="text-white font-[700] ">Accept</h1>
                            </div>
                            </div>
                          
                        </div>
                    </div>
                ))}
            </div>
    </div>
  )
}

export default Boxfive