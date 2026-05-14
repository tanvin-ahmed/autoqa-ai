"use client";

import { UserDetailsContext } from "@/context/userDetailsContext";
import { TUserDetails } from "@/types";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, userId } = useAuth();
  const [userDetails, setUserDetails] = useState<TUserDetails | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    axios
      .post("/api/users", {})
      .then((data) => {
        setUserDetails(data.data.user);
      })
      .catch(() => {
        /* logged server-side; avoid noisy console in prod */
      });
  }, [isLoaded, userId]);

  return (
    <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export default Provider;
