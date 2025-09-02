import Boxfive from "@/components/dashboard/Boxfive"
import Boxfour from "@/components/dashboard/Boxfour"
import BoxOne from "@/components/dashboard/BoxOne"
import Boxthree from "@/components/dashboard/Boxthree"
import Boxtwo from "@/components/dashboard/Boxtwo"
import Navbar from "@/components/shared/Navbar"

const Home = () => {
  return (
    <div className="flex flex-col gap-8">

      <Navbar
        leftType="head"
        title="Hello, Akinsanmi !"
        showIcon
        primarybtn="Create Product"
        width="168px"
        height="40px"
      />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-5 lg:justify-between">

        {/* Left Column */}
        <div className="flex flex-col gap-5 flex-1">
          <div className="bg-[#F0F0F0] w-full h-[220px] rounded-[12px] p-3">
            <BoxOne />
          </div>
          <div className="bg-[#F0F0F0] w-full h-[168px] rounded-[12px] p-3">
            <Boxtwo />
          </div>
          <div className="bg-[#F0F0F0] w-full h-[284px] rounded-[12px] p-3">
            <Boxthree />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5 flex-1">
          <div className="bg-[#F0F0F0] w-full rounded-[12px] p-3">
            <Boxfour />
          </div>
          <div className="bg-[#F0F0F0] w-full rounded-[12px] p-3">
            <Boxfive />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
