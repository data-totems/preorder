import Image from "next/image"

const ProductCard = ({name, image, price, type, onPress}: ProductProps) => {
  return (
    <div className="flex flex-col gap-4 cursor-pointer" 
    onClick={onPress}
    >
        <div className={` bg-white flex flex-col items-center justify-center ${type === 'market' ? 'lg:w-[227px] lg:h-[264px] ' : ' lg:w-[110px] lg:h-[128px]'}  w-full `}>
            <Image src={image} alt="Product image" width={200} height={200} />
        </div>

        <div className="flex flex-col gap-2.5">
            <h2 className={` ${type === 'market' ? 'lg:w-[227px] ' : 'lg:w-[130px] '} w-full text-[12px] font-[500] `}>{name}</h2>
            {price && (
                <div className="text-[#F48614] flex gap-0.5 ">
                <span className="text-[8px] ">NGN</span>
            <h2 className="text-[15px] font-[600] ">{price}</h2>
            </div>
            )}
          
        </div>
    </div>
  )
}

export default ProductCard