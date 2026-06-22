"use client";
import { useState } from "react";
import Account from "@/components/manage/Account";
import BussinessDetails from "@/components/manage/BussinessDetails";
import Category from "@/components/manage/Category";
import Dispatch from "@/components/manage/Dispatch";
import Payment from "@/components/manage/Payment";
import StoreLink from "@/components/manage/StoreLink";
import PageHeader from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";

const Manage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="MANAGE"
        title="Settings"
        description="Your account, business, payment, and dispatch settings."
      />

      <div className="px-6 md:px-10 pb-12 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 mt-2">
        <aside>
          <Category currentTab={currentTab} setCurrentTab={setCurrentTab} />
        </aside>
        <Card variant="flat" padding="none" className="p-6 md:p-8">
          {currentTab === 0 && <Account />}
          {currentTab === 1 && <BussinessDetails />}
          {currentTab === 2 && <Payment />}
          {currentTab === 3 && <Dispatch />}
          {currentTab === 4 && <StoreLink />}
        </Card>
      </div>
    </div>
  );
};

export default Manage;
