import { TUserDetails } from "@/types";
import { createContext } from "react";

export const UserDetailsContext = createContext<{
  userDetails: TUserDetails | null;
  setUserDetails: React.Dispatch<React.SetStateAction<TUserDetails | null>>;
}>({
  userDetails: null,
  setUserDetails: () => {},
});
