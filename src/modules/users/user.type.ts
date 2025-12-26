import { USER_ROLE } from "../../constants/constants";

export type TUsers = {
  name: string;
  email: string;
  password: string;
  role?: (typeof USER_ROLE)[keyof typeof USER_ROLE];
};
