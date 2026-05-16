import React from "react";

type StatusCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
};

const StatusCard = ({ title, value, icon, bgColor }: StatusCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
      </div>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatusCard;
