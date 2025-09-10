const Tab = ({ currentTab, setCurrentTab}: {
    currentTab: number;
    setCurrentTab: (value: number) => void
}) => {
    const tabs = [
        {
            id: 1,
            title: 'INCOMING ORDERS',
            total: 2
        },
         {
            id: 2,
            title: 'ACCEPTED ORDERS',
        },
         {
            id: 3,
            title: 'SHIPPED ORDERS',
          
        },
    ]

   
  return (
    <div className="hidden lg:flex items-center justify-center">

        <div className="flex items-center gap-8 ">
            {tabs.map((tab) => (
                <div key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex items-center gap-3 cursor-pointer ${currentTab === tab.id ? 'text-[#27BA5F] font-[700] bg-[#27BA5F1F] ' : 'text-[#03140A4D] font-[700] '} p-3  rounded-[12px] text-sm  `}>
                    <h2 className={` `}>{tab.title}</h2>
                    {tab.total && (
                        <span className="bg-[#ED2525] h-[20px] w-[20px] text-white justify-center items-center text-center rounded-full ">{tab.total}</span>
                    )}
                    
                </div>
            ))}
        </div>
    </div>
  )
}

export default Tab